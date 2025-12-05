"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "@/app/components/Navbar"
import FooterComponent from "@/app/components/Footer"


interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  readTime: string
  category: string
  slug: string
  image?: string
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("")
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPost() {
      try {
        const resolvedParams = await params
        setSlug(resolvedParams.slug)

        const res = await fetch("/api/blogs")
        const blogs: BlogPost[] = await res.json()
        const foundPost = blogs.find((b) => b.slug === resolvedParams.slug)
        setPost(foundPost || null)
      } catch (error) {
        console.error("Blog yükleme hatası:", error)
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [params])

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center text-gray-400">Yükleniyor...</div>
        </section>
        <FooterComponent />
      </main>
    )
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <section className="max-w-4xl mx-auto px-6 py-16">
          <p className="text-gray-400 text-lg mb-4">Blog yazısı bulunamadı.</p>
          <Link href="/blog" className="text-blue-400 hover:text-blue-300">
            Blog'a geri dön
          </Link>
        </section>
        <FooterComponent />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <article className="max-w-3xl mx-auto px-6 py-16">
        {post.image ? (
          <img
            src={`/blog-imgs/${post.image}`}
            alt={post.title}
            className="w-full max-h-96 object-cover rounded-xl border border-neutral-300 shadow-md mb-8"
          />
        ) : (
          <img
            src="/blog-imgs/errorimage.jpg"
            alt="placeholder"
            className="w-full max-h-96 object-cover rounded-xl border border-neutral-300 shadow-md mb-8"
          />
        )}

        <div className="mb-8">
          <span className="text-xs font-semibold text-gray-400 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
            {post.category}
          </span>
          <h1 className="text-5xl font-bold mt-6 mb-4 leading-tight">{post.title}</h1>
          <p className="text-xl text-gray-400 mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-6 text-sm text-gray-500 pb-8 border-b border-gray-800">
            <span>{post.date}</span>
            <span>{post.readTime} okuma süresi</span>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap leading-8">{post.content}</div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            ← Blog'a Geri Dön
          </Link>
        </div>
      </article>

      <FooterComponent />
    </main>
  )
}
