import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/blog/[slug] - Public: get single published blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const post = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (!post || !post.published) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const transformed = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      author: post.author,
      tags: post.tags ? JSON.parse(post.tags) : [],
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Public blog post GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
