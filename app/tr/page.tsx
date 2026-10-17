import type { Metadata } from "next";
import HomePageClient from "@/app/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "Kerem Kuyucu - Full-Stack & Mobil Geliştirici",
  description:
    "Merhaba, ben Kerem. Modern teknolojilerle açık kaynaklı projeler, mobil ve web uygulamaları geliştiriyorum.",
  openGraph: {
    title: "Kerem Kuyucu - Full-Stack & Mobil Geliştirici",
    description:
      "Merhaba, ben Kerem. Modern teknolojilerle açık kaynaklı projeler, mobil ve web uygulamaları geliştiriyorum.",
    url: "https://keremkuyucu.com.tr/tr",
    siteName: "Kerem Kuyucu",
    locale: "tr_TR",
    type: "website",
  },
};

export default function TurkishHome() {
  return <HomePageClient lang="tr" />;
}
