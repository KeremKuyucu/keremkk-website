import { Metadata } from "next";
import ContactPageClient from "@/app/components/contact/ContactPageClient";

export const metadata: Metadata = {
    title: "İletişim - Kerem Kuyucu",
    description: "Benimle iletişime geçin. Proje fikirleri, iş birliği teklifleri veya sadece merhaba demek için mesaj gönderin.",
    openGraph: {
        title: "İletişim - Kerem Kuyucu",
        description: "Benimle iletişime geçin. Proje fikirleri, iş birliği teklifleri veya sadece merhaba demek için mesaj gönderin.",
        url: "https://keremkk.com.tr/contact",
        siteName: "Kerem Kuyucu",
        locale: "tr_TR",
        type: "website",
    },
};

export default function ContactPage() {
    return <ContactPageClient />;
}
