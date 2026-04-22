import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'
import { signAdminToken, buildAdminCookie } from '@/lib/admin-auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit login attempts: 10 per 10 minutes per IP.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const gate = checkRateLimit(`admin-auth:${ip}`, { max: 10, windowMs: 10 * 60_000 })
  if (!gate.allowed) {
    return NextResponse.json(
      { error: `Previše pokušaja prijave. Pokušajte ponovo za ${gate.retryAfterSec}s.` },
      { status: 429, headers: { 'Retry-After': String(gate.retryAfterSec) } },
    )
  }

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Neispravan zahtev' }, { status: 400 })
    }
    const { email, password } = body as { email?: string; password?: string }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email i lozinka su obavezni' },
        { status: 400 },
      )
    }

    const admin = await verifyAdmin(email, password)
    if (!admin) {
      return NextResponse.json(
        { error: 'Neispravni podaci za prijavljivanje' },
        { status: 401 },
      )
    }

    // Record last-login timestamp for audit purposes.
    try {
      await prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
      })
    } catch {
      /* non-fatal */
    }

    const token = signAdminToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    })

    const res = NextResponse.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    })
    // Also set the cookie so our route handlers can read it server-side in
    // Tier C when we migrate off localStorage. Having the cookie live now
    // (alongside the header token) is harmless and paves the migration.
    res.headers.set('Set-Cookie', buildAdminCookie(token))
    return res
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Server greška' }, { status: 500 })
  }
}
