import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { handlePrismaError, ValidationError } from '@/lib/admin-errors'
import { checkRateLimit } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit-log'

/**
 * POST /api/admin/change-password
 *
 * Body: { currentPassword, newPassword }
 *
 * Rules:
 *  - Must be authenticated admin
 *  - `currentPassword` must match stored bcrypt hash (constant-time compare via bcrypt)
 *  - `newPassword` must meet strength rule (min 8 chars, 1 letter, 1 digit)
 *  - Rate limited by IP (defense in depth)
 */
export async function POST(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp
  const admin = adminOrResp

  // Rate limit: 10 attempts / 10 minutes per IP (in-memory).
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const gate = checkRateLimit(`change-password:${ip}`, { max: 10, windowMs: 10 * 60_000 })
  if (!gate.allowed) {
    return NextResponse.json(
      { error: `Previše pokušaja. Pokušajte ponovo za ${gate.retryAfterSec}s.` },
      { status: 429, headers: { 'Retry-After': String(gate.retryAfterSec) } },
    )
  }

  try {
    const body = await request.json().catch(() => null)
    if (!body) throw new ValidationError('Telo zahteva je neispravno.')

    const { currentPassword, newPassword } = body as {
      currentPassword?: string
      newPassword?: string
    }

    if (!currentPassword || typeof currentPassword !== 'string') {
      throw new ValidationError('Trenutna lozinka je obavezna.', 'currentPassword')
    }
    if (!newPassword || typeof newPassword !== 'string') {
      throw new ValidationError('Nova lozinka je obavezna.', 'newPassword')
    }
    if (newPassword.length < 8) {
      throw new ValidationError('Nova lozinka mora imati najmanje 8 karaktera.', 'newPassword')
    }
    if (!/[A-Za-zšđčćžŠĐČĆŽ]/.test(newPassword) || !/\d/.test(newPassword)) {
      throw new ValidationError(
        'Nova lozinka mora da sadrži bar jedno slovo i jedan broj.',
        'newPassword',
      )
    }
    if (newPassword === currentPassword) {
      throw new ValidationError('Nova lozinka mora biti različita od trenutne.', 'newPassword')
    }

    // Load current hash.
    const record = await prisma.admin.findUnique({ where: { id: admin.id } })
    if (!record) {
      return NextResponse.json({ error: 'Admin nalog nije pronađen.' }, { status: 404 })
    }

    const ok = await bcrypt.compare(currentPassword, record.password)
    if (!ok) {
      return NextResponse.json(
        { error: 'Trenutna lozinka nije ispravna.' },
        { status: 400 },
      )
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: newHash,
        passwordChangedAt: new Date(),
      },
    })

    await logAudit(request, admin, {
      action: 'PASSWORD_CHANGE',
      resource: 'admin',
      resourceId: admin.id,
      summary: 'Lozinka promenjena',
    })

    return NextResponse.json({ ok: true, message: 'Lozinka je uspešno promenjena.' })
  } catch (err) {
    return handlePrismaError(err, 'Admin')
  }
}
