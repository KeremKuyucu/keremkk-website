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

    const mainImage = category.projects[0]?.imageUrl || "/imgs/logo.png";

    return {
        title: `${category.info.name} - Kerem Kuyucu`,
        description: category.info.description,
        openGraph: {
            title: `${category.info.name} - Kerem Kuyucu`,
            description: category.info.description,
            url: `https://keremkuyucu.com.tr/tr/projects/${slug}`,
            siteName: "Kerem Kuyucu",
            locale: "tr_TR",
            type: "website",
            images: [
                {
                    url: mainImage,
                    width: 1200,
                    height: 630,
                    alt: category.info.name,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${category.info.name} - Kerem Kuyucu`,
            description: category.info.description,
            images: [mainImage],
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
