import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

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

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        content: body.content || '',
        excerpt: body.excerpt || '',
        coverImage: body.coverImage || null,
        published: body.published ?? false,
        author: body.author || 'SmokHot',
        tags: body.tags ? (typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags)) : null,
      }
    })

    return NextResponse.json(post)

  } catch (error) {
    console.error('Blog POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
