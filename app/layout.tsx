import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Analytics } from "@vercel/analytics/next";
config.autoAddCss = false;

const productSans = localFont({
  src: [
    {
      path: "../public/fonts/product-sans/Product Sans Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/product-sans/Product Sans Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/product-sans/Product Sans Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/product-sans/Product Sans Bold Italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
});

export const metadata: Metadata = {
  title: "Kerem Kuyucu - Full-Stack & Mobile Developer",
  authors: [{ name: "Kerem Kuyucu", url: "https://keremkk.com.tr" }],
  description: "Hello, I'm Kerem. Continuously improving by building hobby projects with modern technologies.",
  keywords: ["Kerem Kuyucu", "Software Developer", "Full-Stack Developer", "Mobile Developer", "Flutter", "Next.js", "Projects"],
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
    title: "Kerem Kuyucu - Full-Stack & Mobile Developer",
    description: "Hello, I'm Kerem. Continuously improving by building hobby projects with modern technologies.",
    url: "https://keremkk.com.tr",
    siteName: "Kerem Kuyucu",
    locale: "en_US",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${productSans.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
