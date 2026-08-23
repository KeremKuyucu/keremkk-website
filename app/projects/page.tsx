import { Metadata } from "next";
import ProjectsPageClient from "@/app/components/projects/ProjectsPageClient";

export const metadata: Metadata = {
    title: "Projects - Kerem Kuyucu",
    description: "Explore all my projects including mobile applications, web services, desktop tools, and open-source software.",
    openGraph: {
        title: "Projects - Kerem Kuyucu",
        description: "Explore all my projects including mobile applications, web services, desktop tools, and open-source software.",
        url: "https://keremkk.com.tr/projects",
        siteName: "Kerem Kuyucu",
        locale: "en_US",
        type: "website",
    },
};

export default function ProjectsPage() {
    return <ProjectsPageClient lang="en" />;
}
