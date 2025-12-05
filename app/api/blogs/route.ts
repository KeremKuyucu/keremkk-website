import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const blogsDir = path.join(process.cwd(), "public", "blogs")

    // Dizin yoksa oluştur
    if (!fs.existsSync(blogsDir)) {
      fs.mkdirSync(blogsDir, { recursive: true })
      return Response.json([])
    }

    // JSON dosyalarını oku
    const files = fs.readdirSync(blogsDir).filter((file) => file.endsWith(".json"))
    const blogs = files.map((file) => {
      const content = fs.readFileSync(path.join(blogsDir, file), "utf-8")
      return JSON.parse(content)
    })

    // Tarih sırasına göre sırala (yeniden eskiye)
    blogs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return Response.json(blogs)
  } catch (error) {
    console.error("Blog API hatası:", error)
    return Response.json([], { status: 500 })
  }
}
