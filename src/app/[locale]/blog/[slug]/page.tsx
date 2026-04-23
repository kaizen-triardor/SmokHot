'use client'

import React, { useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { useParams } from 'next/navigation'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: string | null
  author: string
  tags: string[]
  createdAt: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('sr-Latn-RS', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch single post and all posts in parallel
        const [postRes, allPostsRes] = await Promise.all([
          fetch(`/api/blog/${slug}`),
          fetch('/api/blog'),
        ])

        if (!postRes.ok) {
          setNotFound(true)
          setLoading(false)
          return
        }

        const postData: BlogPost = await postRes.json()
        setPost(postData)

        if (allPostsRes.ok) {
          const allPosts: BlogPost[] = await allPostsRes.json()
          setRelatedPosts(allPosts.filter(p => p.slug !== slug).slice(0, 2))
        }
      } catch (err) {
        console.error('Error fetching blog post:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
        <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />
        <div className="relative z-10 flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-ember-500" />
            <p className="text-white/60">Učitavanje...</p>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
        <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />
        <div className="relative z-10 py-32 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Post nije pronađen</h1>
          <Link href="/blog" className="text-ember-500 hover:underline font-bold">
            ← Nazad na blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
      {/* Dotted Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
      <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

      <div className="relative z-10">
        {/* Article Header */}
        <section className="border-b border-white/8 bg-surface py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <Link
              href="/blog"
              className="mb-8 inline-block text-sm font-bold uppercase tracking-wider text-ember-500 hover:underline"
            >
              ← Nazad na blog
            </Link>

            {post.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-ember-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ember-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="mb-6 text-3xl font-black uppercase tracking-[0.03em] text-white font-display sm:text-5xl">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-white/60">
              <span className="font-bold">{post.author}</span>
              <span>·</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </section>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mx-auto max-w-4xl px-6 -mb-8">
            <div className="overflow-hidden rounded-3xl border border-white/10 -mt-8">
              <img loading="lazy" decoding="async"
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div
              className="prose prose-invert prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-white prose-headings:uppercase prose-headings:tracking-wide
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                prose-p:text-white/80 prose-p:leading-relaxed
                prose-a:text-ember-500 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white
                prose-blockquote:border-ember-500 prose-blockquote:text-white/70"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Share Section */}
            <div className="mt-16 border-t border-white/10 pt-8">
              <h3 className="mb-4 text-lg font-bold text-white">Podeli ovaj članak</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(window.location.href)
                      alert('Link kopiran!')
                    }
                  }}
                  className="rounded-xl border border-white/20 bg-primary-950/50 px-4 py-2 text-sm font-bold text-white/70 hover:text-white hover:border-ember-500 transition"
                >
                  Kopiraj link
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/20 bg-primary-950/50 px-4 py-2 text-sm font-bold text-white/70 hover:text-white hover:border-ember-500 transition"
                >
                  Twitter / X
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/20 bg-primary-950/50 px-4 py-2 text-sm font-bold text-white/70 hover:text-white hover:border-ember-500 transition"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-white/8 bg-surface py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-6">
              <h2 className="mb-8 text-center text-3xl font-bold text-white">
                Pročitajte još
              </h2>

              <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="group rounded-3xl border border-white/10 bg-primary-950/50 p-6 transition hover:border-ember-500/50 hover:-translate-y-1"
                  >
                    <h3 className="mb-2 text-lg font-bold text-white group-hover:text-ember-500 transition">
                      {related.title}
                    </h3>
                    <p className="text-sm text-white/60 line-clamp-2">
                      {related.excerpt}
                    </p>
                    <span className="mt-4 inline-block text-sm font-bold uppercase tracking-wider text-ember-500">
                      Čitaj više →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
