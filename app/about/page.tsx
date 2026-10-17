import type { Metadata } from "next";
import AboutPageClient from "@/app/components/about/AboutPageClient";

export const metadata: Metadata = {
  title: "About - Kerem Kuyucu",
  description:
    "Learn more about Kerem Kuyucu, software development journey, skills, education, and certificates.",
  openGraph: {
    title: "About - Kerem Kuyucu",
    description:
      "Learn more about Kerem Kuyucu, software development journey, skills, education, and certificates.",
    url: "https://keremkuyucu.com.tr/about",
    siteName: "Kerem Kuyucu",
    locale: "en_US",
    type: "profile",
  },
};

export default function AboutPage() {
  return <AboutPageClient lang="en" />;
}