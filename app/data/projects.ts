// Centralized project data for dynamic stats and consistency

export interface Project {
    imageUrl: string;
    altText: string;
    isNew?: boolean;
    isDeveloping?: boolean;
    isArchived?: boolean;
    isPrivate?: boolean;
    lastCommit?: string;
    stars?: number;
    forks?: number;
    language?: string | null;
    watchers?: number;
    title: string;
    description?: string;
    features: string[];
    techStack?: string[];
    viewLink?: string;
    githubLink?: string;
}

export const projectsByCategory: { [key: string]: Project[] } = {
    GeoGame: [
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
            features: ["Güvenli session yönetimi", "Sosyal login desteği", "Merkezi kullanıcı veritabanı", "Açık kaynak"],
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
            description: "Eğitim kurumları için tasarlanmış, çok katmanlı yetkilendirme ve yoğun veri etkileşimi içeren dijital anı platformu.",
            features: [
                "Gelişmiş RBAC (Owner'dan User'a 5 seviyeli yetki)",
                "Resend ile otomatize mail iş akışları",
                "Dinamik sınıf ve ilerleme istatistikleri",
                "Gerçek zamanlı veri senkronizasyonu",
                "Tip güvenli (TypeScript) mimari"
            ],
            techStack: ["Next.js", "Supabase", "Resend", "Tailwind CSS", "TypeScript"],
            githubLink: "https://github.com/KeremKuyucu/Egl-yillik",
        }
    ]
};

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
