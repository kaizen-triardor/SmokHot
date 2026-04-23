'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  slug: string
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

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog')
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Failed to fetch posts')
      })
      .then((data: BlogPost[]) => {
        setPosts(data)
      })
      .catch((err) => {
        console.error('Error fetching blog posts:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f6f1e7]">
      {/* Dotted Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,89,0,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(229,36,33,0.25),transparent_28%),linear-gradient(to_bottom,#0b0b0d,#111113)]" />
      <div className="fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="border-b border-white/8 bg-surface py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-ember-500">
                Naš Blog
              </p>
              <h1 className="mb-6 text-4xl font-black uppercase tracking-[0.05em] text-white font-display sm:text-6xl">
                Vatrene Priče
              </h1>
              <p className="mx-auto max-w-3xl text-xl text-white/80 leading-relaxed">
                Recepti, priče o paprikama, novosti sa događaja i sve što gori.
                Čitajte, učite, pecajte.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-ember-500" />
                  <p className="text-white/60">Učitavanje postova...</p>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-white/70 mb-6">
                  Još uvek nema blog postova. Pratite nas na društvenim mrežama!
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center border-2 border-black bg-[#e52421] px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[6px_6px_0_0_#000] transition hover:-translate-y-1 hover:bg-[#ff3d34] hover:shadow-[8px_8px_0_0_#000]"
                >
                  Nazad na početnu
                </Link>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {posts.map((post) => {
                  return (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group rounded-3xl border border-white/10 bg-surface overflow-hidden transition hover:border-ember-500/50 hover:-translate-y-1"
                    >
                      {/* Cover Image Area */}
                      <div className="h-48 bg-gradient-to-br from-ember-500/20 to-fire-500/10 flex items-center justify-center">
                        {post.coverImage ? (
                          <img loading="lazy" decoding="async"
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-6xl opacity-30">🔥</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 lg:p-8">
                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-2">
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

                        <h2 className="mb-3 text-xl font-bold text-white group-hover:text-ember-500 transition lg:text-2xl">
                          {post.title}
                        </h2>

                        <p className="mb-4 text-white/70 leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-white/50">
                            <span>{post.author}</span>
                            <span>·</span>
                            <span>{formatDate(post.createdAt)}</span>
                          </div>

                          <span className="text-sm font-bold uppercase tracking-wider text-ember-500 group-hover:underline">
                            Čitaj više →
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
