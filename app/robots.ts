import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/go/"],
    },
    sitemap: "https://keremkuyucu.com.tr/sitemap.xml",
  };
}
