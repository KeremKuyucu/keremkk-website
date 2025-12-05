"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "@/app/components/Navbar"
import FooterComponent from "@/app/components/Footer"
import { Calendar, Clock } from "lucide-react"

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

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [selectedCategory, setSelectedCategory] = useState("Tümü")
  const [categories, setCategories] = useState(["Tümü"])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBlogs() {
      try {
        const res = await fetch("/api/blogs")
        const data = await res.json()
        setBlogs(data)

        const uniqueCategories = ["Tümü", ...new Set(data.map((blog: BlogPost) => blog.category))]
        setCategories(uniqueCategories as string[])
      } catch (error) {
        console.error("Blog yükleme hatası:", error)
      } finally {
        setLoading(false)
      }
    }
    loadBlogs()
  }, [])

  const filteredPosts = selectedCategory === "Tümü" ? blogs : blogs.filter((post) => post.category === selectedCategory)

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="max-w-6xl mx-auto px-6 py-20">
        {/* Blog Başlığı */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-gray-400">Yazılım geliştirme, web teknolojileri ve programlama hakkında yazılar</p>
        </div>

        {/* Kategoriler */}
        <div className="flex gap-3 mb-12 overflow-x-auto pb-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${category === selectedCategory ? "bg-white text-black" : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Yazıları */}
        {loading ? (
          <div className="text-center text-gray-400">Yazılar yükleniyor...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Henüz blog yazısı bulunmamaktadır.</div>
        ) : (
          <div className="grid gap-8">
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <article className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all cursor-pointer border border-gray-800 hover:border-gray-600 p-6">
                  <div className="flex gap-6 flex-col md:flex-row">
                    {post.image ? (
                      <img
                        src={`/blog-imgs/${post.image}`}
                        alt={post.title}
                        className="w-[100px] h-[100px] object-cover rounded-xl border border-neutral-300 shadow-md mb-8"
                      />
                    ) : (
                      <img
                        src="/blog-imgs/errorimage.jpg"
                        alt="placeholder"
                        className="w-[100px] h-[100px] object-cover rounded-xl border border-neutral-300 shadow-md mb-8"
                      />
                    )}


                    <div className="flex-1">
                      <span className="inline-block mb-3 text-xs font-semibold text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                      <h2 className="text-2xl font-bold mb-2 hover:text-gray-300 transition-colors">{post.title}</h2>
                      <p className="text-gray-400 text-base mb-4">{post.excerpt}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          {post.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          {post.readTime}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      <FooterComponent />
    </main>
  )
}
