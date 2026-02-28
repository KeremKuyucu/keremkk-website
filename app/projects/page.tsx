import { Metadata } from "next";
import ProjectsPageClient from "@/app/components/projects/ProjectsPageClient";

export const metadata: Metadata = {
    title: "Projeler - Kerem Kuyucu",
    description: "Geliştirdiğim tüm projeler. Mobil uygulamalar, web servisleri, masaüstü uygulamaları ve daha fazlası.",
    openGraph: {
        title: "Projeler - Kerem Kuyucu",
        description: "Geliştirdiğim tüm projeler. Mobil uygulamalar, web servisleri, masaüstü uygulamaları ve daha fazlası.",
        url: "https://keremkk.com.tr/projeler",
        siteName: "Kerem Kuyucu",
        locale: "tr_TR",
        type: "website",
    },
};

export default function ProjelerPage() {
    return <ProjectsPageClient />;
}
