import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/blog - Public: list all published blog posts
export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    })

    const transformed = posts.map((post) => ({
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
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Public blog GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
