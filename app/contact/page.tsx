import { Metadata } from "next";
import ContactPageClient from "@/app/components/contact/ContactPageClient";

export const metadata: Metadata = {
    title: "Contact - Kerem Kuyucu",
    description: "Get in touch with me. Send a message for project ideas, collaboration proposals, or just to say hello.",
    openGraph: {
        title: "Contact - Kerem Kuyucu",
        description: "Get in touch with me. Send a message for project ideas, collaboration proposals, or just to say hello.",
        url: "https://keremkk.com.tr/contact",
        siteName: "Kerem Kuyucu",
        locale: "en_US",
        type: "website",
    },
};

export default function ContactPage() {
    return <ContactPageClient lang="en" />;
}
