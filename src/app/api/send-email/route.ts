import { NextRequest, NextResponse } from 'next/server'
// import nodemailer from 'nodemailer'

// Simple rate limiter: max 10 requests per minute per IP
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
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Previše zahteva. Pokušajte ponovo za minut.' },
        { status: 429 }
      )
    }

    const { to, subject, body } = await request.json()

    // Validate required fields
    if (!subject || !body) {
      return NextResponse.json(
        { success: false, error: 'Subject and body are required' },
        { status: 400 }
      )
    }

    const emailData = {
      from: 'SmokHot Website <noreply@smokhot.rs>',
      to: process.env.ORDER_EMAIL || 'info@smokhot.rs',
      subject: subject || 'Nova porudžbina',
      body: body,
      timestamp: new Date().toISOString()
    }

    // DEMO MODE: Log to console
    console.log('📧 SENDING EMAIL:')
    console.log('From:', emailData.from)
    console.log('To:', emailData.to)
    console.log('Subject:', emailData.subject)
    console.log('Body:')
    console.log(emailData.body)
    console.log('---END EMAIL---')

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // PRODUCTION MODE: Uncomment below for real email sending
    /*
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    })
    
    const info = await transporter.sendMail({
      from: 'SmokHot Website <' + process.env.GMAIL_USER + '>',
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.body,
      html: emailData.body.replace(/\n/g, '<br>')
    })
    
    console.log('✅ Email sent: ', info.messageId)
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully (demo mode)',
      data: {
        to: emailData.to,
        subject: emailData.subject,
        timestamp: emailData.timestamp,
        mode: 'demo'
      }
    })

  } catch (error) {
    console.error('Email sending failed:', error)
    return NextResponse.json(
      { success: false, error: 'Email sending failed' },
      { status: 500 }
    )
  }
}