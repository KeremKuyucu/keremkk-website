// Centralized project data for dynamic stats and consistency
import React from 'react';
import { FaMobile, FaServer, FaDesktop, FaCode, FaGraduationCap, FaGamepad, FaKeyboard } from 'react-icons/fa';


import { Project, CategoryInfo } from '../types';

export const categoryInfo: { [key: string]: CategoryInfo } = {
    GeoGame: {
        name: "GeoGame",
        slug: "geogame",
        icon: React.createElement(FaMobile, { className: "text-xl" }),
        gradient: "from-emerald-500 to-teal-600",
        description: "Coğrafya öğrenme oyunu - Çoklu platform desteği",
    },
    OkeyDefteri: {
        name: "Okey Defteri",
        slug: "okey-defteri",
        icon: React.createElement(FaGamepad, { className: "text-xl" }),
        gradient: "from-emerald-600 to-teal-700",
        description: "Okey 101 canlı skor ve istatistik takip uygulaması",
    },
    CopilotButton: {
        name: "Copilot Button",
        slug: "copilot-button",
        icon: React.createElement(FaKeyboard, { className: "text-xl" }),
        gradient: "from-cyan-500 to-blue-600",
        description: "Windows Copilot tuşu için medya ve mikrofon kontrolörü",
    },
    PikaMed: {
        name: "PikaMed",
        slug: "pikamed",
        icon: React.createElement(FaServer, { className: "text-xl" }),
        gradient: "from-rose-500 to-pink-600",
        description: "Yapay zeka destekli sağlık takip sistemi",
    },
    DiscordStorage: {
        name: "DiscordStorage",
        slug: "discordstorage",
        icon: React.createElement(FaDesktop, { className: "text-xl" }),
        gradient: "from-violet-500 to-purple-600",
        description: "Discord üzerinden dosya depolama çözümü",
    },
    Analytics: {
        name: "Analytics",
        slug: "analytics",
        icon: React.createElement(FaCode, { className: "text-xl" }),
        gradient: "from-amber-500 to-orange-600",
        description: "Web analytics ve izleme servisi",
    },
    kısaLink: {
        name: "kısaLink",
        slug: "kisalink",
        icon: React.createElement(FaCode, { className: "text-xl" }),
        gradient: "from-cyan-500 to-blue-600",
        description: "Açık kaynak URL kısaltma servisi",
    },
    Auth: {
        name: "Auth",
        slug: "auth",
        icon: React.createElement(FaServer, { className: "text-xl" }),
        gradient: "from-indigo-500 to-blue-600",
        description: "Merkezi kimlik doğrulama sistemi",
    },
    EglYillik: {
        name: "EglYillik",
        slug: "eglyillik",
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
            longDescription: "GeoGame, coğrafya bilgisini interaktif oyun modlarıyla test eden ve geliştiren cross-platform bir eğitici oyundur. Başkent, bayrak, mesafe tahmini ve kıta bazlı seviyeler içerir. Android, Windows ve web platformlarında çalışır; İngilizce ve Türkçe dil desteği sunar. Supabase ile liderlik tablosu ve kullanıcı profili yönetimi sağlar. keremkk-auth, geogame-cdn modülleriyle birlikte çalışan açık kaynaklı bir ekosistem parçasıdır.",
            features: ["Cross-platform mimari", "Gelişmiş state yönetimi", "Modern UI/UX", "Açık kaynak"],
            techStack: ["Flutter", "Dart", "Supabase"],
            githubLink: "https://github.com/KeremKuyucu/GeoGame",
            viewLink: "https://geogame.keremkk.com.tr",
        },
        {
            imageUrl: "/imgs/projects/geogamecpp.png",
            altText: "GeoGame C++",
            title: "GeoGame - C++ Versiyonu",
            description: "Windows API ve düşük seviyeli kaynak yönetimi ile optimize edilmiş yüksek performanslı yerel masaüstü oyunu.",
            longDescription: "GeoGame'in C++ ile geliştirilmiş orijinal masaüstü sürümüdür. SFML kütüphanesi ile modern UI sunar. Çalıştırıldığında GitHub deposundan gerekli veri dosyalarını otomatik olarak indirerek her zaman güncel içerikle oynanmasını sağlar. Başkent, bayrak ve konum bilgisi testleri ile kıtalar hakkında öğretici içerikler barındırır. Sadece Windows platformu için optimize edilmiş bağımsız bir uygulamadır. Flutter sürümünün geliştirilmesiyle birlikte arşivlenmiştir.",
            features: ["Düşük gecikmeli UI", "Win32 API Entegrasyonu", "Verimli bellek yönetimi", "Açık kaynak"],
            techStack: ["C++", "SFML"],
            githubLink: "https://github.com/KeremKuyucu/GeoGameCPP",
        },
        {
            imageUrl: "/imgs/projects/geogamecdn.png",
            altText: "GeoGame CDN",
            title: "GeoGame CDN",
            description: "Oyun içi statik varlıkların hızlı dağıtımı ve dinamik içerik yönetimi için özelleştirilmiş API servisi.",
            longDescription: "GeoGame ekosisteminin veri kaynağı servisidir. Ülke bilgileri, bayrak görselleri ve coğrafi veriler gibi oyun içi statik varlıkların merkezi olarak yönetilmesini ve hızlı dağıtılmasını sağlar. Next.js API Routes altyapısı ile Vercel üzerinde serverless olarak çalışır. Oyunun hem Flutter hem de C++ sürümleri bu servisten veri çeker.",
            features: ["Optimize edilmiş asset servisi", "Next.js API Routes", "Merkezi içerik yönetimi", "Açık kaynak"],
            techStack: ["Next.js"],
            githubLink: "https://github.com/KeremKuyucu/geogame-cdn",
        }
    ],
    OkeyDefteri: [
        {
            imageUrl: "/imgs/projects/okeydefteri.jpg",
            altText: "Okey Defteri",
            title: "Okey Defteri - Mobil Skor Takipçisi",
            description: "Okey 101 oyunları için geliştirilmiş, canlı skor takibi, el sonu taş hesaplayıcı ve dinamik lakap motoru içeren Flutter uygulaması.",
            longDescription: "Okey 101 karşılaşmaları için geliştirilmiş modern ve akıllı bir skor takip mobil uygulamasıdır. 4 oyunculu masa düzeni, tek tıkla ceza/puan girişi, otomatik tur yönetimi, el sonu kalan taşları toplayan hesap makinesi ve çiftli puanlama desteği sunar. Oyunun gidişatına göre her tur oyunculara bağlama uygun unvanlar atayan dinamik lakap motoru, detaylı oyuncu/takım istatistikleri, SharedPreferences tabanlı yerel otomatik kayıt, JSON formatında veri yedekleme ve GitHub Releases üzerinden otomatik güncelleme denetleyicisi içerir.",
            features: ["Canlı Masa ve Skor Takibi", "Taş Hesap Makinesi & İstatistikler", "Dinamik Lakap Motoru", "Açık kaynak"],
            techStack: ["Flutter", "Dart"],
            githubLink: "https://github.com/KeremKuyucu/okey-defteri-flutter",
            isNew: true,
            isDeveloping: false
        }
    ],
    CopilotButton: [
        {
            imageUrl: "/imgs/projects/copilotbutton.jpg",
            altText: "Copilot Button Controller",
            title: "Copilot Button - Windows Kontrolörü",
            description: "Windows 11 Copilot tuşunu oyun korumalı mikrofon susturma, medya kontrolü ve özelleştirilebilir OSD eylemlerine dönüştüren AutoHotkey aracı.",
            longDescription: "Windows 11 klavyelerindeki donanımsal Copilot tuşunu (Win + Shift + F23) güçlü bir mikrofon ve medya kontrolcüsüne dönüştüren AutoHotkey v2 aracıdır. Anti-modifier leak hook mimarisi sayesinde oyunlarda ve tam ekran uygulamalarda Shift veya Win tuşlarının kilitlenmesini kesin olarak engeller. 1-4 tıklama ve basılı tutma hareketleriyle anında mikrofon susturma, Spotify / YouTube Music kontrolü, ekranda beliren şık OSD bildirimleri, koyu tema destekli ayarlar arayüzü ve GitHub üzerinden tek tıkla otomatik güncelleme sunar.",
            features: ["Anti-Modifier Tuş Koruması", "Mikrofon & Medya OSD Kontrolü", "Özelleştirilebilir Tıklama Eylemleri", "Açık kaynak"],
            techStack: ["AutoHotkey", "Windows"],
            githubLink: "https://github.com/KeremKuyucu/copilot-button",
            isNew: true,
            isDeveloping: false
        }
    ],
    PikaMed: [
        {
            imageUrl: "/imgs/projects/pikamed.png",
            altText: "PikaMed",
            title: "PikaMed - Sağlık Takip Sistemi",
            description: "Kullanıcı verilerini yapay zeka ile işleyerek kişiselleştirilmiş sağlık öngörüleri sunan mobil çözüm.",
            longDescription: "Deneyap bitirme projesi olarak geliştirilen PikaMed, sağlık hizmetleri ve hasta takibi için tasarlanmış kapsamlı bir mobil uygulamadır. Firebase Authentication ile güvenli kullanıcı girişi, anlık bildirim altyapısı ve Gemini AI ile yapay zeka destekli sağlık analizi sunar. Hasta takip ve kayıt sistemi, biyometrik veri görselleştirme ve kişiselleştirilmiş sağlık öngörüleri içerir. Proje tamamlandıktan sonra API servisleri ve doktor paneli kapatılarak arşivlenmiştir; kodlar referans ve eğitim amaçlı saklanmaktadır.",
            features: ["LLM / AI Entegrasyonu", "Biyometrik veri görselleştirme", "Kullanıcı odaklı tasarım", "Açık kaynak"],
            techStack: ["Flutter", "Dart"],
            githubLink: "https://github.com/KeremKuyucu/PikaMed-Mobile",
        },
        {
            imageUrl: "/imgs/projects/pikamedwebsite.png",
            altText: "PikaMed Website",
            title: "PikaMed Website",
            description: "Proje ekosisteminin tanıtımı ve kullanıcı dokümantasyonu için tasarlanmış yüksek performanslı web arayüzü.",
            longDescription: "PikaMed mobil uygulamasının tanıtım web sitesidir. Deneyap mezuniyet projesi kapsamında hazırlanmıştır. Projenin özelliklerini, kullanım senaryolarını ve teknik detaylarını sergileyen SEO uyumlu, responsive bir landing page olarak tasarlanmıştır. Next.js ile geliştirilmiş olup hızlı sayfa yükleme süreleri ve modern web standartlarına uygunluk sunar.",
            features: ["SEO Optimizasyonu", "Responsive tasarım", "Hızlı sayfa yükleme", "Açık kaynak"],
            techStack: ["Next.js"],
            githubLink: "https://github.com/KeremKuyucu/PikaMed-website",
            viewLink: "https://pikamed.keremkk.com.tr",
        },
        {
            imageUrl: "/imgs/projects/pikamedapi.png",
            altText: "PikaMed API",
            title: "PikaMed API Server",
            description: "Tüm PikaMed ekosisteminin veri tutarlılığını ve güvenliğini sağlayan ölçeklenebilir backend mimarisi.",
            longDescription: "PikaMed ekosisteminin merkezi backend servisidir. Mobil uygulama, yönetim paneli ve web sitesi bu API üzerinden haberleşir. Hasta verileri, doktor bilgileri ve AI analiz sonuçlarının güvenli bir şekilde saklanmasını ve iletilmesini sağlayan RESTful mimari sunar. Kullanıcı kimlik doğrulama, veri validasyonu ve hızlı yanıt süreleri için optimize edilmiştir. Proje arşivlendiğinde servis kapatılmıştır.",
            features: ["Güvenli veri modelleme", "RESTful mimari", "Hızlı yanıt süreleri", "Açık kaynak"],
            techStack: ["Next.js"],
            githubLink: "https://github.com/KeremKuyucu/pikamed-apiserver",
        },
        {
            imageUrl: "/imgs/projects/pikamedpanel.png",
            altText: "PikaMed Panel",
            title: "PikaMed Yönetim Paneli",
            description: "Sistem yöneticileri için veri manipülasyonu ve kullanıcı yönetimi sağlayan operasyonel dashboard.",
            longDescription: "PikaMed sisteminin yönetim paneli olarak geliştirilmiştir. Google ile giriş ve admin yetkilendirme, kullanıcı-doktor-admin listeleri, doktor ekleme/silme, HTML destekli bildirim gönderimi (Mailjet entegrasyonu), hasta detaylarını görüntüleme ve karanlık mod desteği sunar. API server'a bağlı olarak çalışır ve rol tabanlı erişim kontrolüyle sistem güvenliğini sağlar.",
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
            longDescription: "Discord API üzerinden dosya depolama ve yönetimi sağlayan C++ masaüstü uygulamasıdır. İnteraktif menü ve güçlü CLI olmak üzere iki kullanım modu sunar. LibCurl, DPP ve nlohmann/json kütüphaneleri ile geliştirilmiştir. Her dosya için ayrı kanal oluşturma, otomatik güncelleme bildirimi, config.json ile kolay yapılandırma ve otomatik loglama özellikleri içerir. C++ ekosistemindeki bağımlılık yönetimi karmaşıklığı nedeniyle arşivlenmiş, geliştirme Dart ve Flutter sürümlerine taşınmıştır.",
            features: ["Multi-part upload mantığı", "Düşük overhead", "Sistem seviyesinde entegrasyon", "Açık kaynak"],
            techStack: ["C++", "Win32 API"],
            githubLink: "https://github.com/KeremKuyucu/DiscordStorageCPP",
        },
        {
            imageUrl: "/imgs/projects/discordstorage.png",
            altText: "DiscordStorage",
            title: "DiscordStorage - Flutter Versiyonu",
            description: "Dosya yönetimini Discord sunucuları üzerinden kullanıcı dostu bir arayüzle sunan cross-platform uygulama.",
            longDescription: "Discord kanallarını depolama alanı olarak kullanan deneysel bir cross-platform uygulamadır. Dosyalar otomatik olarak parçalara bölünür, mesaj eki olarak yüklenir ve indirilirken yeniden birleştirilir. SHA-256 checksum ile dosya bütünlüğü doğrulanır. Tek kod tabanından Android ve Windows üzerinde çalışır. Rate limit yönetimi, retry mekanizmaları ve büyük dosya transferleri konusunda pratik deneyim kazanmak amacıyla teknik bir deney projesi olarak geliştirilmiştir.",
            features: ["Dosya şifreleme mantığı", "Görsel dosya gezgini", "Mobil ve Masaüstü desteği", "Açık kaynak"],
            techStack: ["Flutter", "Dart"],
            githubLink: "https://github.com/KeremKuyucu/DiscordStorage",
        },
        {
            imageUrl: "/imgs/projects/discordstoragedart.png",
            altText: "DiscordStorageDart",
            title: "DiscordStorage - Dart CLI Versiyonu",
            description: "Geliştiriciler için terminal üzerinden hızlı dosya yükleme ve yönetme imkanı tanıyan komut satırı aracı.",
            longDescription: "DiscordStorage projesinin Dart ile yazılmış komut satırı aracıdır. C++ sürümünün bağımlılık karmaşıklığını ortadan kaldırarak aynı işlevselliği hafif ve taşınabilir bir CLI formatında sunar. Terminal üzerinden dosya listeleme, yükleme ve indirme komutları ile hızlı dosya yönetimi sağlar. Otomasyon ve scripting senaryoları için idealdir, minimal çalışma zamanı gereksinimiyle çalışır.",
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
            longDescription: "Basit ve gizlilik odaklı bir web analiz servisidir. Benzersiz kullanıcı ID'leri (UID) üzerinden tekil ziyaretçi takibi yapar ve aylık istatistikler sunar. Üçüncü taraf tracking scriptleri kullanmadan, minimal JavaScript footprint ile web trafiğini izler. Supabase veritabanı ile veri saklama ve Next.js ile dashboard görselleştirmesi sağlar.",
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
            longDescription: "Kısa ve özelleştirilebilir URL'ler oluşturan bir link yönetim platformudur. Firebase Realtime Database ile anlık yönlendirme, tıklama analitiği ve link istatistikleri sunar. Serverless mimari sayesinde yüksek trafik yüklerini sorunsuz karşılar. Next.js üzerinde çalışır ve Vercel'de barınır.",
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
            longDescription: "Tüm keremkk.com.tr projeleri için merkezi kimlik doğrulama servisidir. Supabase Auth altyapısı üzerine inşa edilmiş Single Sign-On (SSO) çözümü sunar. Kullanıcı kayıt, giriş, şifre sıfırlama ve e-posta doğrulama işlemlerini Resend entegrasyonu ile yönetir. GeoGame, Analytics ve diğer projeler bu servis üzerinden kullanıcı kimlik doğrulaması yapar. v0.app ile geliştirilmiş modern auth sayfaları içerir.",
            features: ["Güvenli session yönetimi", "Merkezi kullanıcı veritabanı"],
            techStack: ["Next.js", "Supabase", "Resend"],
            githubLink: "https://github.com/KeremKuyucu/keremkk-auth",
            viewLink: "https://accounts.keremkk.com.tr",
        }
    ],
    EglYillik: [
        {
            imageUrl: "/imgs/projects/egl-yillik.png",
            altText: "EGL-Yillik",
            title: "EGL Yıllık - Dijital Mezuniyet Albümü",
            description: "Mezuniyet heyecanını dijitalleştiren; zaman kilitli Gizli Kasa ve interaktif oylama sistemleriyle zenginleştirilmiş modern yıllık platformu.",
            longDescription: "EGL 2026 mezunları için geliştirilen dijital yıllık platformudur. Kişiselleştirilmiş dashboard ile günlük selamlamalar, istatistikler ve geri sayım sayaçları sunar. Profil sistemi, badge'ler ve aktivite durumları içerir. Arkadaşlara anı yazma özelliği ve mezuniyet gününe kadar kilitli kalan 'Gizli Kasa' mekanizması barındırır. Sınıf içi oylama sistemiyle en komik, en çalışkan gibi kategorilerde oy kullanılabilir. 4 seviyeli RBAC (User, Admin, Super Admin, Owner) ile güvenlik, Supabase Auth ve Row Level Security ile veri koruması, bakım modu ve Resend entegrasyonlu bildirim sistemi sunar.",
            features: [
                "Zaman Ayarlı Gizli Kasa Anı Teknolojisi",
                "Gelişmiş Rol sistemli yetkilendirme kontrolü",
                "Resend Entegrasyonlu Bildirim Sistemi",
            ],
            techStack: ["Next.js", "Supabase", "Resend", "Tailwind CSS", "TypeScript"],
            githubLink: "https://github.com/KeremKuyucu/Egl-yillik",
            isNew: false,
            isDeveloping: false
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

// Helper functions for dynamic routing
export const getCategoryBySlug = (slug: string): { key: string; info: CategoryInfo; projects: Project[] } | null => {
    const entry = Object.entries(categoryInfo).find(([, info]) => info.slug === slug);
    if (!entry) return null;
    const [key, info] = entry;
    return { key, info, projects: projectsByCategory[key] || [] };
};

export const getAllCategorySlugs = (): string[] => {
    return Object.values(categoryInfo).map((info) => info.slug).filter(Boolean) as string[];
};
