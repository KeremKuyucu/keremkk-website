import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const productSans = localFont({
  src: [
    {
      path: "../../public/fonts/product-sans/Product Sans Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/product-sans/Product Sans Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/product-sans/Product Sans Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/product-sans/Product Sans Bold Italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
});
export const metadata: Metadata = {
  title: "Kerem Kuyucu",
  authors: [{ name: "Kerem Kuyucu", url: "https://keremkk.com.tr" }],
  description: "Kerem Kuyucu'nun kişisel web sitesi.",
  keywords: ["Kerem Kuyucu", "Yazılım Geliştirici", "Programlama", "Projeler", "Teknoloji"],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Kerem Kuyucu",
    description: "Kerem Kuyucu'nun kişisel web sitesi.",
    url: "https://keremkk.com.tr",
    siteName: "Kerem Kuyucu",
    images: [
      {
        url: "https://keremkk.com.tr/imgs/image.jpg",
        width: 1200,
        height: 630,
        alt: "Kerem Kuyucu",
      },
    ],
    locale: "tr_TR",
    type: "website",
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${productSans.className} antialiased`}>{children}</body>
    </html>
  );
}
