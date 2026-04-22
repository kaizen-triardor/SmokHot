import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withTimeoutFallback } from '@/lib/with-timeout-fallback'
import { getSnapshot, saveSnapshot } from '@/lib/snapshot'

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

export type PublicBlogPost = ReturnType<typeof transform>

export async function GET() {
  try {
    const result = await withTimeoutFallback(
      async () => {
        const posts = await prisma.blogPost.findMany({
          where: { published: true },
          orderBy: { createdAt: 'desc' },
        })
        return posts.map(transform)
      },
      () => getSnapshot<PublicBlogPost[]>('blog'),
    )

    if (result.source === 'live') void saveSnapshot('blog', result.data)

    return NextResponse.json(result.data, {
      headers: {
        'X-Source': result.source,
        'X-Warmup-Ms': String(result.ms),
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Public blog GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 503 })
  }
}
