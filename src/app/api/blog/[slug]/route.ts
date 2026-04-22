import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withTimeoutFallback } from '@/lib/with-timeout-fallback'
import { getSnapshot } from '@/lib/snapshot'
import type { PublicBlogPost } from '../route'

function transform(post: any) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    author: post.author,
    tags: post.tags ? JSON.parse(post.tags) : [],
    createdAt: post.createdAt?.toISOString?.() ?? post.createdAt,
    updatedAt: post.updatedAt?.toISOString?.() ?? post.updatedAt,
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  try {
    const result = await withTimeoutFallback(
      async () => {
        const post = await prisma.blogPost.findUnique({ where: { slug } })
        if (!post || !post.published) return null
        return transform(post)
      },
      async () => {
        const list = await getSnapshot<PublicBlogPost[]>('blog')
        if (!list) return null
        return list.find((p) => p.slug === slug) ?? null
      },
    )

    if (result.data === null) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(result.data, {
      headers: {
        'X-Source': result.source,
        'X-Warmup-Ms': String(result.ms),
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Public blog post GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 503 })
  }
}
