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

// GET /api/admin/blog - List blog posts
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' }
    })

    const total = await prisma.blogPost.count()

    const response = NextResponse.json(posts)
    response.headers.set('X-Total-Count', total.toString())
    return response

  } catch (error) {
    console.error('Blog GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/admin/blog - Create blog post
export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAccess(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Sanitize HTML before storing — closes the stored-XSS lane.
    const cleanContent = DOMPurify.sanitize(body.content || '', {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'p', 'br', 'strong', 'b', 'em', 'i', 'u',
        'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'hr', 'img',
      ],
      ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'target', 'rel'],
      ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/)/i,
    })

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        content: cleanContent,
        excerpt: body.excerpt || '',
        coverImage: body.coverImage || null,
        published: body.published ?? false,
        author: body.author || 'SmokHot',
        tags: body.tags ? (typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags)) : null,
      }
    })

    refreshSnapshotAsync('blog')
    const admin = getAdminFromRequest(request)
    if (admin) {
      await logAudit(request, admin, {
        action: 'CREATE',
        resource: 'blog',
        resourceId: post.id,
        summary: `Kreiran post: ${post.title}`,
      })
    }

    return NextResponse.json(post, { status: 201 })

  } catch (error) {
    console.error('Blog POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
