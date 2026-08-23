import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getAllCategorySlugs } from "@/app/data/projects";
import ProjectDetailClient from "@/app/components/projects/ProjectDetailClient";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return getAllCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const category = getCategoryBySlug(slug, "tr");
    if (!category) return { title: "Proje Bulunamadı" };

    return {
        title: `${category.info.name} - Kerem Kuyucu`,
        description: category.info.description,
        openGraph: {
            title: `${category.info.name} - Kerem Kuyucu`,
            description: category.info.description,
            url: `https://keremkk.com.tr/tr/projects/${slug}`,
            siteName: "Kerem Kuyucu",
            locale: "tr_TR",
            type: "website",
        },
    };
}

export default async function TurkishProjectDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const category = getCategoryBySlug(slug, "tr");

    if (!category) {
        notFound();
    }

    return (
        <ProjectDetailClient
            categoryKey={category.key}
            categoryInfo={category.info}
            projects={category.projects}
            lang="tr"
        />
    );
}
