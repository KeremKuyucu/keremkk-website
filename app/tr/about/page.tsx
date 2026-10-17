import type { Metadata } from "next";
import AboutPageClient from "@/app/components/about/AboutPageClient";

export const metadata: Metadata = {
  title: "Hakkımda - Kerem Kuyucu",
  description:
    "Kerem Kuyucu hakkında bilgi edinin. Yazılım geliştirme serüveni, yetenekler, eğitim geçmişi ve sertifikalar.",
  openGraph: {
    title: "Hakkımda - Kerem Kuyucu",
    description:
      "Kerem Kuyucu hakkında bilgi edinin. Yazılım geliştirme serüveni, yetenekler, eğitim geçmişi ve sertifikalar.",
    url: "https://keremkuyucu.com.tr/tr/about",
    siteName: "Kerem Kuyucu",
    locale: "tr_TR",
    type: "profile",
  },
};

export default function TurkishAboutPage() {
  return <AboutPageClient lang="tr" />;
}
