/**
 * audit-log.ts — fire-and-forget recorder for admin actions.
 *
 * Usage from an admin route handler:
 *   await logAudit(request, adminPayload, {
 *     action: 'UPDATE',
 *     resource: 'product',
 *     resourceId: product.id,
 *     summary: `Promenjena cena za "${product.name}"`,
 *   })
 *
 * Never throws — a failed audit write must not block the admin response.
 */
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { AdminTokenPayload } from '@/lib/admin-auth'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'BULK_UPDATE'

export type AuditResource =
  | 'product'
  | 'order'
  | 'blog'
  | 'gallery'
  | 'turneja'
  | 'settings'
  | 'admin'
  | 'upload'

export interface AuditEntry {
  action: AuditAction
  resource: AuditResource
  resourceId?: string | null
  summary?: string
  metadata?: Record<string, unknown> | null
}

export function extractRequestContext(request: NextRequest | Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null
  const userAgent = request.headers.get('user-agent') || null
  return { ip, userAgent }
}

export async function logAudit(
  request: NextRequest | Request,
  admin: Pick<AdminTokenPayload, 'id' | 'email'> | { id: string; email: string } | null,
  entry: AuditEntry,
): Promise<void> {
  const { ip, userAgent } = extractRequestContext(request)
  try {
    await prisma.auditLog.create({
      data: {
        adminId: admin?.id ?? 'anonymous',
        adminEmail: admin?.email ?? 'anonymous',
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId ?? null,
        summary: entry.summary ?? null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        ip,
        userAgent,
      },
    })
  } catch (err) {
    console.error('[audit-log] write failed:', err)
  }
}
