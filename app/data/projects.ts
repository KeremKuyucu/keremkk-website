// Centralized project data for dynamic stats and consistency
import React from 'react';
import { FaMobile, FaServer, FaDesktop, FaCode, FaGraduationCap } from 'react-icons/fa';


import { Project, CategoryInfo } from '../types';

export const categoryInfo: { [key: string]: CategoryInfo } = {
    GeoGame: {
        name: "GeoGame",
        icon: React.createElement(FaMobile, { className: "text-xl" }),
        gradient: "from-emerald-500 to-teal-600",
        description: "Coğrafya öğrenme oyunu - Çoklu platform desteği",
    },
    PikaMed: {
        name: "PikaMed",
        icon: React.createElement(FaServer, { className: "text-xl" }),
        gradient: "from-rose-500 to-pink-600",
        description: "Yapay zeka destekli sağlık takip sistemi",
    },
    DiscordStorage: {
        name: "DiscordStorage",
        icon: React.createElement(FaDesktop, { className: "text-xl" }),
        gradient: "from-violet-500 to-purple-600",
        description: "Discord üzerinden dosya depolama çözümü",
    },
    Analytics: {
        name: "Analytics",
        icon: React.createElement(FaCode, { className: "text-xl" }),
        gradient: "from-amber-500 to-orange-600",
        description: "Web analytics ve izleme servisi",
    },
    kısaLink: {
        name: "kısaLink",
        icon: React.createElement(FaCode, { className: "text-xl" }),
        gradient: "from-cyan-500 to-blue-600",
        description: "Açık kaynak URL kısaltma servisi",
    },
    Auth: {
        name: "Auth",
        icon: React.createElement(FaServer, { className: "text-xl" }),
        gradient: "from-indigo-500 to-blue-600",
        description: "Merkezi kimlik doğrulama sistemi",
    },
    EglYillik: {
        name: "EglYillik",
        icon: React.createElement(FaGraduationCap, { className: "text-xl" }),
        gradient: "from-red-500 to-blue-600",
        description: "Eğitim kurumları için dijital mezuniyet albümü",
    },
};

export const projectsByCategory: { [key: string]: Project[] } = {
    GeoGame: [
        {
            imageUrl: "/imgs/projects/geogame.png",
            altText: "GeoGame",
            title: "GeoGame - Flutter Versiyonu",
            description: "Platformlar arası tutarlı deneyim sunan, zengin animasyonlu ve genişletilebilir coğrafya öğrenme platformu.",
            features: ["Cross-platform mimari", "Gelişmiş state yönetimi", "Modern UI/UX", "Açık kaynak"],
            techStack: ["Flutter", "Dart", "Supabase"],
            githubLink: "https://github.com/KeremKuyucu/GeoGame",
            viewLink: "/geogame",
        },
        {
            imageUrl: "/imgs/projects/geogamecpp.png",
            altText: "GeoGame C++",
            title: "GeoGame - C++ Versiyonu",
            description: "Windows API ve düşük seviyeli kaynak yönetimi ile optimize edilmiş yüksek performanslı yerel masaüstü oyunu.",
            features: ["Düşük gecikmeli UI", "Win32 API Entegrasyonu", "Verimli bellek yönetimi", "Açık kaynak"],
            techStack: ["C++"],
            githubLink: "https://github.com/KeremKuyucu/GeoGameCPP",
        },
        {
            imageUrl: "/imgs/projects/geogamecdn.png",
            altText: "GeoGame CDN",
            title: "GeoGame CDN",
            description: "Oyun içi statik varlıkların hızlı dağıtımı ve dinamik içerik yönetimi için özelleştirilmiş API servisi.",
            features: ["Optimize edilmiş asset servisi", "Next.js API Routes", "Merkezi içerik yönetimi", "Açık kaynak"],
            techStack: ["Next.js"],
            githubLink: "https://github.com/KeremKuyucu/geogame-cdn",
        }
    ],
    PikaMed: [
        {
            imageUrl: "/imgs/projects/pikamed.png",
            altText: "PikaMed",
            title: "PikaMed - Sağlık Takip Sistemi",
            description: "Kullanıcı verilerini yapay zeka ile işleyerek kişiselleştirilmiş sağlık öngörüleri sunan mobil çözüm.",
            features: ["LLM / AI Entegrasyonu", "Biyometrik veri görselleştirme", "Kullanıcı odaklı tasarım", "Açık kaynak"],
            techStack: ["Flutter", "Dart"],
            githubLink: "https://github.com/KeremKuyucu/PikaMed-Mobile",
        },
        {
            imageUrl: "/imgs/projects/pikamedwebsite.png",
            altText: "PikaMed Website",
            title: "PikaMed Website",
            description: "Proje ekosisteminin tanıtımı ve kullanıcı dokümantasyonu için tasarlanmış yüksek performanslı web arayüzü.",
            features: ["SEO Optimizasyonu", "Responsive tasarım", "Hızlı sayfa yükleme", "Açık kaynak"],
            techStack: ["Next.js"],
            githubLink: "https://github.com/KeremKuyucu/PikaMed-website",
            viewLink: "/pikamed",
        },
        {
            imageUrl: "/imgs/projects/pikamedapi.png",
            altText: "PikaMed API",
            title: "PikaMed API Server",
            description: "Tüm PikaMed ekosisteminin veri tutarlılığını ve güvenliğini sağlayan ölçeklenebilir backend mimarisi.",
            features: ["Güvenli veri modelleme", "RESTful mimari", "Hızlı yanıt süreleri", "Açık kaynak"],
            techStack: ["Next.js"],
            githubLink: "https://github.com/KeremKuyucu/pikamed-apiserver",
        },
        {
            imageUrl: "/imgs/projects/pikamedpanel.png",
            altText: "PikaMed Panel",
            title: "PikaMed Yönetim Paneli",
            description: "Sistem yöneticileri için veri manipülasyonu ve kullanıcı yönetimi sağlayan operasyonel dashboard.",
            features: ["Rol tabanlı erişim kontrolü", "Veri analitiği arayüzü", "Anlık sistem takibi", "Açık kaynak"],
            techStack: ["Next.js"],
            githubLink: "https://github.com/KeremKuyucu/pikamed-panel",
        },
    ],
    DiscordStorage: [
        {
            imageUrl: "/imgs/projects/discordstoragecpp.png",
            altText: "DiscordStorageCPP",
            title: "DiscordStorage - C++ Versiyonu",
            description: "Discord altyapısını bir dosya sistemi gibi kullanan, performans ve hız odaklı masaüstü uygulaması.",
            features: ["Multi-part upload mantığı", "Düşük overhead", "Sistem seviyesinde entegrasyon", "Açık kaynak"],
            techStack: ["C++"],
            githubLink: "https://github.com/KeremKuyucu/DiscordStorageCPP",
        },
        {
            imageUrl: "/imgs/projects/discordstorage.png",
            altText: "DiscordStorage",
            title: "DiscordStorage - Flutter Versiyonu",
            description: "Dosya yönetimini Discord sunucuları üzerinden kullanıcı dostu bir arayüzle sunan cross-platform uygulama.",
            features: ["Dosya şifreleme mantığı", "Görsel dosya gezgini", "Mobil ve Masaüstü desteği", "Açık kaynak"],
            techStack: ["Flutter", "Dart"],
            githubLink: "https://github.com/KeremKuyucu/DiscordStorage",
        },
        {
            imageUrl: "/imgs/projects/discordstoragedart.png",
            altText: "DiscordStorageDart",
            title: "DiscordStorage - Dart CLI Versiyonu",
            description: "Geliştiriciler için terminal üzerinden hızlı dosya yükleme ve yönetme imkanı tanıyan komut satırı aracı.",
            features: ["Hızlı CLI komutları", "Otomasyon dostu", "Hafif çalışma zamanı", "Açık kaynak"],
            techStack: ["Dart"],
            githubLink: "https://github.com/KeremKuyucu/DiscordStorageDart",
        },
    ],
    Analytics: [
        {
            imageUrl: "/imgs/projects/analytics.png",
            altText: "Analytics",
            title: "Analytics - Web Paneli",
            description: "Üçüncü taraf takipçiler olmadan web trafiğini izleyen, gizlilik odaklı hafif analiz servisi.",
            features: ["Zero-JS footprint (minimalist)", "Gizlilik odaklı takip", "Özel veri görselleştirme", "Açık kaynak"],
            techStack: ["Next.js", "Supabase"],
            githubLink: "https://github.com/KeremKuyucu/analytics-service-basic",
        }
    ],
    kısaLink: [
        {
            imageUrl: "/imgs/projects/kısalink.png",
            altText: "kısaLink",
            title: "kısaLink - URL Kısaltma Servisi",
            description: "Yüksek trafik yükünü kaldırabilen, Firebase entegrasyonlu ve istatistik destekli link yönetim platformu.",
            features: ["Gerçek zamanlı yönlendirme", "Tıklama analitiği", "Serverless mimari", "Açık kaynak"],
            techStack: ["Next.js", "Firebase"],
            githubLink: "https://github.com/KeremKuyucu/shortlink",
        }
    ],
    Auth: [
        {
            imageUrl: "/imgs/projects/keremkkauth.png",
            altText: "KeremKK-Auth",
            title: "KeremKK-Auth - Kullanıcı Girişi",
            description: "Tüm projeler için merkezi bir kimlik doğrulama noktası sağlayan Single Sign-On (SSO) altyapısı.",
            features: ["Güvenli session yönetimi", "Merkezi kullanıcı veritabanı"],
            techStack: ["Next.js", "Supabase", "Resend"],
            githubLink: "https://github.com/KeremKuyucu/keremkk-auth",
            viewLink: "/accounts",
        }
    ],
    EglYillik: [
        {
            imageUrl: "/imgs/projects/egl-yillik.png",
            altText: "EGL-Yillik",
            title: "EGL Yıllık - Dijital Mezuniyet Albümü",
            description: "Mezuniyet heyecanını dijitalleştiren; zaman kilitli Gizli Kasa ve interaktif oylama sistemleriyle zenginleştirilmiş modern yıllık platformu.",
            features: [
                "Zaman Ayarlı Gizli Kasa Anı Teknolojisi",
                "Gelişmiş RBAC (4 Seviyeli Yetkilendirme)",
                "Resend Entegrasyonlu Bildirim Sistemi"
            ],
            techStack: ["Next.js", "Supabase", "Resend", "Tailwind CSS", "TypeScript"],
            githubLink: "https://github.com/KeremKuyucu/Egl-yillik",
            isNew: true,
            isDeveloping: true
        }
    ]
};
export const featuredProjects = [
    {
        title: "GeoGame",
        description: "Coğrafya öğrenmeyi eğlenceli hale getiren çoklu platform oyunu",
        tags: ["Flutter", "C++", "Next.js"],
        gradient: "from-emerald-500 to-teal-600",
        link: "/geogame",
    },
    {
        title: "PikaMed",
        description: "Yapay zeka destekli sağlık takip sistemi",
        tags: ["Flutter", "Next.js", "AI"],
        gradient: "from-rose-500 to-pink-600",
        link: "/pikamed",
    },
    {
        title: "DiscordStorage",
        description: "Discord üzerinden dosya depolama çözümü",
        tags: ["C++", "Flutter", "Dart"],
        gradient: "from-violet-500 to-purple-600",
        link: "/discordstorage",
    },
    {
        title: "EGL Yıllık",
        description: "Mezuniyet heyecanını dijitalleştiren; zaman kilitli Gizli Kasa ve interaktif oylama sistemleriyle zenginleştirilmiş modern yıllık platformu.",
        tags: ["Next.js", "Supabase", "Resend", "Tailwind CSS", "TypeScript"],
        gradient: "from-violet-500 to-purple-600"
    },
];

// Helper functions for dynamic stats
export const getTotalProjectCount = (): number => {
    return Object.values(projectsByCategory).flat().length;
};

export const getCategoryCount = (): number => {
    return Object.keys(projectsByCategory).length;
};

// Experience start date (for calculating years of experience)
export const EXPERIENCE_START_DATE = new Date('2024-02-14');

export const getYearsOfExperience = (): number => {
    const now = new Date();
    const years = now.getFullYear() - EXPERIENCE_START_DATE.getFullYear();
    return years;
};
