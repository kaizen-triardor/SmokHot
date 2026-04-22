import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { verifyAdmin } from '@/lib/auth'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || ''
if (!JWT_SECRET) {
  console.error('WARNING: NEXTAUTH_SECRET environment variable is not set')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email i lozinka su obavezni' },
        { status: 400 }
      )
    }

    // Verify admin credentials
    const admin = await verifyAdmin(email, password)

    if (!admin) {
      return NextResponse.json(
        { error: 'Neispravni podaci za prijavljivanje' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: admin.id,
        email: admin.email,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Server greška' },
      { status: 500 }
    )
  }
}

