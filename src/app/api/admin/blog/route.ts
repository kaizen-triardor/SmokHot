import { NextRequest, NextResponse } from 'next/server'
import DOMPurify from 'isomorphic-dompurify'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { handlePrismaError, requireField } from '@/lib/admin-errors'
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

export async function GET(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const posts = await prisma.blogPost.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
    const total = await prisma.blogPost.count({ where: { deletedAt: null } })

    const response = NextResponse.json(posts)
    response.headers.set('X-Total-Count', total.toString())
    return response
  } catch (error) {
    return handlePrismaError(error, 'Blog')
  }
}

export async function POST(request: NextRequest) {
  const adminOrResp = requireAdmin(request)
  if (adminOrResp instanceof NextResponse) return adminOrResp

  try {
    const body = await request.json().catch(() => ({}))
    const title = requireField(body.title, 'title') as string
    const cleanContent = DOMPurify.sanitize(body.content || '', ALLOWED_HTML)

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: body.slug ? slugify(body.slug) : slugify(title),
        content: cleanContent,
        excerpt: body.excerpt || '',
        coverImage: body.coverImage || null,
        published: body.published ?? false,
        author: body.author || 'SmokHot',
        tags: body.tags ? (typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags)) : null,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        seoOgImage: body.seoOgImage || null,
      },
    })

    refreshSnapshotAsync('blog')
    await logAudit(request, adminOrResp, {
      action: 'CREATE',
      resource: 'blog',
      resourceId: post.id,
      summary: `Kreiran post: ${post.title}`,
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return handlePrismaError(error, 'Blog post')
  }
}
