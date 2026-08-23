import { Metadata } from "next";
import ProjectsPageClient from "@/app/components/projects/ProjectsPageClient";

export const metadata: Metadata = {
    title: "Projeler - Kerem Kuyucu",
    description: "Geliştirdiğim tüm projeler. Mobil uygulamalar, web servisleri, masaüstü uygulamaları ve açık kaynak yazılımlar.",
    openGraph: {
        title: "Projeler - Kerem Kuyucu",
        description: "Geliştirdiğim tüm projeler. Mobil uygulamalar, web servisleri, masaüstü uygulamaları ve açık kaynak yazılımlar.",
        url: "https://keremkk.com.tr/tr/projects",
        siteName: "Kerem Kuyucu",
        locale: "tr_TR",
        type: "website",
    },
};

export default function TurkishProjectsPage() {
    return <ProjectsPageClient lang="tr" />;
}
