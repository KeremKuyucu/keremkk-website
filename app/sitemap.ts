import type { MetadataRoute } from "next";
import { categoryInfoEN } from "@/app/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://keremkuyucu.com.tr";
  const currentDate = new Date();

  // Ana statik sayfalar (İngilizce & Türkçe)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tr`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tr/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tr/projects`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tr/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dinamik proje detay sayfaları (İngilizce ve Türkçe)
  const projectSlugs = Object.values(categoryInfoEN).map((cat) => cat.slug);
  const projectRoutes: MetadataRoute.Sitemap = projectSlugs.flatMap((slug) => [
    {
      url: `${baseUrl}/projects/${slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tr/projects/${slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ]);

  // Kimlik doğrulama ve yasal politika sayfaları (Gizlilik, Koşullar, Hesap Silme)
  const authPages = ["privacy", "tos", "delete-account"];
  const authLanguages = ["en", "tr", "de", "es", "fr", "pt", "ru"];
  const authRoutes: MetadataRoute.Sitemap = authPages.flatMap((page) =>
    authLanguages.map((lang) => ({
      url: `${baseUrl}/auth/${lang}/${page}`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.5,
    }))
  );

  return [...staticRoutes, ...projectRoutes, ...authRoutes];
}
