import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Previše zahteva. Pokušajte ponovo za minut.' },
        { status: 429 }
      )
    }

    const { subject, body } = await request.json()

    if (!subject || !body) {
      return NextResponse.json(
        { success: false, error: 'Subject and body are required' },
        { status: 400 }
      )
    }

    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD
    const toAddress = process.env.ORDER_EMAIL || gmailUser || 'info@smokhot.rs'

    const emailData = {
      to: toAddress,
      subject,
      body,
      timestamp: new Date().toISOString(),
    }

    if (!gmailUser || !gmailPass) {
      console.log('[send-email] DEMO MODE — GMAIL_USER or GMAIL_APP_PASSWORD missing')
      console.log('To:', emailData.to, '| Subject:', emailData.subject)
      console.log(emailData.body)
      return NextResponse.json({
        success: true,
        message: 'Email logged (demo mode)',
        data: { ...emailData, mode: 'demo' },
      })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    })

    const info = await transporter.sendMail({
      from: `Smokin' Hot <${gmailUser}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.body,
      html: emailData.body.replace(/\n/g, '<br>'),
    })

    console.log('[send-email] sent:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Email sent',
      data: { to: emailData.to, subject: emailData.subject, timestamp: emailData.timestamp, messageId: info.messageId, mode: 'production' },
    })
  } catch (error) {
    console.error('[send-email] failed:', error)
    const msg = error instanceof Error ? error.message : 'Email sending failed'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
