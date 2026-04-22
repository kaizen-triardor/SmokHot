import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import DOMPurify from 'isomorphic-dompurify'
import { refreshSnapshotAsync } from '@/lib/refresh-snapshot'
import { logAudit } from '@/lib/audit-log'
import { getAdminFromRequest } from '@/lib/admin-auth'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || ''

function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET)
    return true
  } catch (error) {
    return false
  }
}

async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }
  const token = authHeader.substring(7)
  return verifyToken(token)
}

// GET /api/admin/blog/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const post = await prisma.blogPost.findUnique({
      where: { id: params.id }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)

  } catch (error) {
    console.error('Blog GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT /api/admin/blog/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const cleanContent = DOMPurify.sanitize(body.content || '', {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'p', 'br', 'strong', 'b', 'em', 'i', 'u',
        'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'hr', 'img',
      ],
      ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'target', 'rel'],
      ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/)/i,
    })

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        title: body.title,
        slug: body.slug,
        content: cleanContent,
        excerpt: body.excerpt,
        coverImage: body.coverImage || null,
        published: body.published,
        author: body.author || 'SmokHot',
        tags: body.tags ? (typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags)) : null,
      }
    })

    refreshSnapshotAsync('blog')
    const admin = getAdminFromRequest(request)
    if (admin) {
      await logAudit(request, admin, {
        action: 'UPDATE',
        resource: 'blog',
        resourceId: post.id,
        summary: `Ažuriran post: ${post.title}`,
      })
    }

    return NextResponse.json(post)

  } catch (error) {
    console.error('Blog PUT error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/admin/blog/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.blogPost.delete({
      where: { id: params.id }
    })

    refreshSnapshotAsync('blog')

    return NextResponse.json({ message: 'Post deleted' })

  } catch (error) {
    console.error('Blog DELETE error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
