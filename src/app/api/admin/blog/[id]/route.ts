import { NextRequest, NextResponse } from 'next/server'
import DOMPurify from 'isomorphic-dompurify'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireAdminRole } from '@/lib/admin-auth'
import { handlePrismaError } from '@/lib/admin-errors'
import { refreshSnapshotAsync } from '@/lib/refresh-snapshot'
import { logAudit } from '@/lib/audit-log'
import { slugify } from '@/lib/slugify'

const ALLOWED_HTML = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'p', 'br', 'strong', 'b', 'em', 'i', 'u',
    'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'hr', 'img',
  ],
  ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'target', 'rel'],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/)/i,
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const post = await prisma.blogPost.findUnique({ where: { id: params.id } })
    if (!post || post.deletedAt) {
      return NextResponse.json({ error: 'Post nije pronađen.' }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (error) {
    return handlePrismaError(error, 'Post')
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const body = await request.json().catch(() => ({}))
    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title
    if (body.slug !== undefined) data.slug = slugify(body.slug)
    if (body.content !== undefined) data.content = DOMPurify.sanitize(body.content, ALLOWED_HTML)
    if (body.excerpt !== undefined) data.excerpt = body.excerpt
    if (body.coverImage !== undefined) data.coverImage = body.coverImage || null
    if (body.published !== undefined) data.published = body.published
    if (body.author !== undefined) data.author = body.author || 'SmokHot'
    if (body.tags !== undefined) {
      data.tags = typeof body.tags === 'string' ? body.tags : body.tags ? JSON.stringify(body.tags) : null
    }
    if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle || null
    if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription || null
    if (body.seoOgImage !== undefined) data.seoOgImage = body.seoOgImage || null

    const post = await prisma.blogPost.update({ where: { id: params.id }, data })

    refreshSnapshotAsync('blog')
    await logAudit(request, adminOrResp, {
      action: 'UPDATE',
      resource: 'blog',
      resourceId: post.id,
      summary: `Ažuriran post: ${post.title}`,
      metadata: { changedFields: Object.keys(data) },
    })

    return NextResponse.json(post)
  } catch (error) {
    return handlePrismaError(error, 'Post')
  }
}

/**
 * DELETE — soft delete (sets deletedAt). Only super_admin can perform
 * destructive actions. Use ?purge=1 to hard-delete (also super_admin only).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const adminOrResp = requireAdminRole(request, ['super_admin'])
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const { searchParams } = new URL(request.url)
    const purge = searchParams.get('purge') === '1'
    const existing = await prisma.blogPost.findUnique({ where: { id: params.id } })

    if (purge) {
      await prisma.blogPost.delete({ where: { id: params.id } })
    } else {
      await prisma.blogPost.update({
        where: { id: params.id },
        data: { deletedAt: new Date(), published: false },
      })
    }

    refreshSnapshotAsync('blog')
    await logAudit(request, adminOrResp, {
      action: 'DELETE',
      resource: 'blog',
      resourceId: params.id,
      summary: `${purge ? 'Trajno obrisan' : 'Obrisan (soft)'} post: ${existing?.title ?? params.id}`,
    })
    return NextResponse.json({ message: purge ? 'Trajno obrisano.' : 'Obrisano.' })
  } catch (error) {
    return handlePrismaError(error, 'Post')
  }
}
