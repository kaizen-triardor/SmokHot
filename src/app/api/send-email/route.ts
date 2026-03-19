import { NextRequest, NextResponse } from 'next/server'
// import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body } = await request.json()

    const emailData = {
      from: 'SmokHot Website <noreply@smokhot.rs>',
      to: to || 'kaizen.triardor@gmail.com',
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