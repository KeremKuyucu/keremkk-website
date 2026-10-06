// Centralized project data for dynamic stats and consistency with bilingual support
import React from 'react';
import { FaMobile, FaDesktop, FaGraduationCap, FaGamepad, FaKeyboard, FaKey, FaMicrochip, FaGlobe } from 'react-icons/fa';
import { Project, CategoryInfo } from '../types';
import { Language } from './translations';

export const categoryInfoEN: { [key: string]: CategoryInfo } = {
    GeoGame: {
        name: "GeoGame",
        slug: "geogame",
        icon: React.createElement(FaMobile, { className: "text-xl" }),
        gradient: "from-emerald-500 to-teal-600",
        description: "Geography learning platform with cross-platform support",
    },
    OkeyDefteri: {
        name: "Okey Defteri",
        slug: "okey-defteri",
        icon: React.createElement(FaGamepad, { className: "text-xl" }),
        gradient: "from-emerald-600 to-teal-700",
        description: "Okey 101 live score & game statistics tracker",
    },
    CopilotButton: {
        name: "Copilot Button",
        slug: "copilot-button",
        icon: React.createElement(FaKeyboard, { className: "text-xl" }),
        gradient: "from-cyan-500 to-blue-600",
        description: "Media & microphone controller for Windows Copilot key",
    },
    DiscordStorage: {
        name: "DiscordStorage",
        slug: "discordstorage",
        icon: React.createElement(FaDesktop, { className: "text-xl" }),
        gradient: "from-violet-500 to-purple-600",
        description: "File storage and sharing solution over Discord",
    },
    EglYillik: {
        name: "EglYillik",
        slug: "eglyillik",
        icon: React.createElement(FaGraduationCap, { className: "text-xl" }),
        gradient: "from-red-500 to-blue-600",
        description: "Interactive digital graduation yearbook platform",
    }
};

export const categoryInfoTR: { [key: string]: CategoryInfo } = {
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
    DiscordStorage: {
        name: "DiscordStorage",
        slug: "discordstorage",
        icon: React.createElement(FaDesktop, { className: "text-xl" }),
        gradient: "from-violet-500 to-purple-600",
        description: "Discord altyapısı üzerinden dosya depolama ve paylaşım çözümü",
    },
    EglYillik: {
        name: "EglYillik",
        slug: "eglyillik",
        icon: React.createElement(FaGraduationCap, { className: "text-xl" }),
        gradient: "from-red-500 to-blue-600",
        description: "Eğitim kurumları için dijital mezuniyet albümü",
    }
};

export const projectsByCategoryEN: { [key: string]: Project[] } = {
    GeoGame: [
        {
            imageUrl: "/imgs/projects/geogame.png",
            altText: "GeoGame",
            title: "GeoGame - Flutter Version",
            description: "Cross-platform geography educational game offering rich animations, stateful gameplay, and leaderboard integration.",
            longDescription: "GeoGame is a cross-platform educational game that tests and improves geography knowledge through interactive game modes including capitals, flags, distance estimation, and continent-based levels. Available on Android, Windows, and Web with English and Turkish support. Utilizes Supabase for leaderboards and user profile management as part of an open-source ecosystem.",
            features: ["Cross-platform architecture", "Advanced state management", "Modern UI/UX", "Open source"],
            techStack: ["Flutter", "Dart", "Supabase"],
            githubLink: "https://github.com/KeremKuyucu/GeoGame",
            viewLink: "https://geogame.keremkk.com.tr",
        }
    ],
    OkeyDefteri: [
        {
            imageUrl: "/imgs/projects/okeydefteri.jpg",
            altText: "Okey Defteri",
            title: "Okey Defteri - Mobile Score Tracker",
            description: "Live score tracker, tile calculator, and dynamic nickname engine for Okey 101 games.",
            longDescription: "A modern smart score tracking mobile application designed for Okey 101 matches. Features 4-player table management, single-tap penalty/score entries, end-round tile counting calculator, and paired gameplay support. Includes a dynamic nickname engine that assigns situational titles to players each round, player/team statistics, local SharedPreferences persistence, JSON backups, and automatic update checks via GitHub Releases.",
            features: ["Live Table & Score Tracking", "Tile Calculator & Stats", "Dynamic Nickname Engine", "Open source"],
            techStack: ["Flutter", "Dart"],
            githubLink: "https://github.com/KeremKuyucu/OkeyDefteri",
            isNew: true,
            isDeveloping: false
        }
    ],
    CopilotButton: [
        {
            imageUrl: "/imgs/projects/copilotbutton.jpg",
            altText: "Copilot Button Controller",
            title: "Copilot Button - Windows Controller",
            description: "AutoHotkey tool converting the Windows 11 Copilot key into a game-safe mic mute, media controller, and OSD overlay.",
            longDescription: "Transforms the hardware Copilot key (Win + Shift + F23) on Windows 11 into a versatile microphone and media controller. Features an anti-modifier leak hook that prevents Shift/Win key locks in full-screen games. Supports 1-4 clicks and long-press gestures for mic muting, Spotify / YouTube Music playback, sleek on-screen OSD overlays, dark-themed GUI, and one-click GitHub updates.",
            features: ["Anti-Modifier Key Shield", "Mic & Media OSD Control", "Customizable Gestures", "Open source"],
            techStack: ["AutoHotkey", "Windows"],
            githubLink: "https://github.com/KeremKuyucu/copilot-button",
            isNew: true,
            isDeveloping: false
        }
    ],
    DiscordStorage: [
        {
            imageUrl: "/imgs/projects/discordstorage.png",
            altText: "DiscordStorage",
            title: "DiscordStorage - Flutter Version",
            description: "Cross-platform graphical client for seamless file archiving and retrieval through Discord server channels.",
            longDescription: "Experimental cross-platform storage client using Discord channels as backend storage. Automatically splits large files into multi-part chunks, validates checksums with SHA-256, and supports both Android and Windows desktop.",
            features: ["File chunking & integrity", "Visual file browser", "Mobile & Desktop", "Open source"],
            techStack: ["Flutter", "Dart"],
            githubLink: "https://github.com/KeremKuyucu/DiscordStorage",
        },
        {
            imageUrl: "/imgs/projects/discordstorageshare.jpg",
            altText: "DiscordStorage Share",
            title: "DiscordStorage-Share - Web Sharing Module",
            description: "Next.js web module for sharing and downloading files stored on Discord directly via message IDs.",
            longDescription: "A modern Next.js web application integrated with the DiscordStorage ecosystem. Allows users to share and download uploaded files using their Discord message ID without requiring additional databases or temporary file storage servers.",
            features: ["Direct Message ID Sharing", "No External Database Required", "Zero-storage Web Client", "Open source"],
            techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
            githubLink: "https://github.com/KeremKuyucu/discordStorage-share",
        }
    ],
    EglYillik: [
        {
            imageUrl: "/imgs/projects/egl-yillik.png",
            altText: "EGL-Yillik",
            title: "EGL Yıllık - Digital Yearbook",
            description: "Modern graduation platform featuring time-locked secret vaults and peer voting systems.",
            longDescription: "Digital yearbook web application designed for EGL graduates. Features personalized dashboards, memory walls, peer voting, and time-locked secret vaults unlocked on graduation day. Protected by 4-tier RBAC and Supabase Row Level Security.",
            features: [
                "Time-Locked Secret Vault Technology",
                "Advanced RBAC permission control",
                "Resend-Integrated Notification System",
            ],
            techStack: ["Next.js", "Supabase", "Resend", "Tailwind CSS", "TypeScript"],
            githubLink: "https://github.com/KeremKuyucu/egl-yillik",
            isNew: false,
            isDeveloping: false
        }
    ]
};

export const projectsByCategoryTR: { [key: string]: Project[] } = {
    GeoGame: [
        {
            imageUrl: "/imgs/projects/geogame.png",
            altText: "GeoGame",
            title: "GeoGame - Flutter Versiyonu",
            description: "Platformlar arası tutarlı deneyim sunan, zengin animasyonlu ve genişletilebilir coğrafya öğrenme platformu.",
            longDescription: "GeoGame, coğrafya bilgisini interaktif oyun modlarıyla test eden ve geliştiren cross-platform bir eğitici oyundur. Başkent, bayrak, mesafe tahmini ve kıta bazlı seviyeler içerir. Android, Windows ve web platformlarında çalışır; İngilizce ve Türkçe dil desteği sunar. Supabase ile liderlik tablosu ve kullanıcı profili yönetimi sağlar.",
            features: ["Cross-platform mimari", "Gelişmiş state yönetimi", "Modern UI/UX", "Açık kaynak"],
            techStack: ["Flutter", "Dart", "Supabase"],
            githubLink: "https://github.com/KeremKuyucu/GeoGame",
            viewLink: "https://geogame.keremkk.com.tr",
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
            githubLink: "https://github.com/KeremKuyucu/OkeyDefteri",
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
    DiscordStorage: [
        {
            imageUrl: "/imgs/projects/discordstorage.png",
            altText: "DiscordStorage",
            title: "DiscordStorage - Flutter Versiyonu",
            description: "Dosya yönetimini Discord sunucuları üzerinden kullanıcı dostu bir arayüzle sunan cross-platform uygulama.",
            longDescription: "Discord kanallarını depolama alanı olarak kullanan deneysel bir cross-platform uygulamadır. Dosyalar otomatik olarak parçalara bölünür, mesaj eki olarak yüklenir ve indirilirken yeniden birleştirilir. SHA-256 checksum ile dosya bütünlüğü doğrulanır. Tek kod tabanından Android ve Windows üzerinde çalışır. Rate limit yönetimi, retry mekanizmaları ve büyük dosya transferleri konusunda pratik deneyim kazanmak amacıyla teknik bir deney projesi olarak geliştirilmiştir.",
            features: ["Dosya bütünlüğü & şifreleme", "Görsel dosya gezgini", "Mobil ve Masaüstü desteği", "Açık kaynak"],
            techStack: ["Flutter", "Dart"],
            githubLink: "https://github.com/KeremKuyucu/DiscordStorage",
        },
        {
            imageUrl: "/imgs/projects/discordstorageshare.jpg",
            altText: "DiscordStorage Share",
            title: "DiscordStorage-Share - Web Paylaşım Modülü",
            description: "Discord üzerinde saklanan dosyaların mesaj ID ile doğrudan paylaşılmasını ve indirilmesini sağlayan Next.js web modülü.",
            longDescription: "DiscordStorage ekosistemiyle entegre çalışan modern bir web arayüzüdür. Kullanıcıların Discord'a yüklenmiş dosyaları ek bir veritabanına veya geçici sunucuya ihtiyaç duymadan sadece mesaj ID'si üzerinden güvenle paylaşmasına ve indirmesine olanak tanır.",
            features: ["Mesaj ID ile Paylaşım", "Harici Veritabanı Gerektirmez", "Hızlı Web İndirme", "Açık kaynak"],
            techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
            githubLink: "https://github.com/KeremKuyucu/discordStorage-share",
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
            githubLink: "https://github.com/KeremKuyucu/egl-yillik",
            isNew: false,
            isDeveloping: false
        }
    ]
};

// Accessors by language
export const getCategoryInfo = (lang: Language = "en"): { [key: string]: CategoryInfo } => {
    return lang === "tr" ? categoryInfoTR : categoryInfoEN;
};

export const getProjectsByCategory = (lang: Language = "en"): { [key: string]: Project[] } => {
    return lang === "tr" ? projectsByCategoryTR : projectsByCategoryEN;
};

// Legacy exports (defaults to English)
export const categoryInfo = categoryInfoEN;
export const projectsByCategory = projectsByCategoryEN;

// Dynamic stats helpers
export const getTotalProjectCount = (): number => {
    return Object.values(projectsByCategoryEN).flat().length;
};

export const getCategoryCount = (): number => {
    return Object.keys(projectsByCategoryEN).length;
};

export const EXPERIENCE_START_DATE = new Date('2024-02-14');

export const getYearsOfExperience = (): number => {
    const now = new Date();
    const years = now.getFullYear() - EXPERIENCE_START_DATE.getFullYear();
    return Math.max(years, 2);
};

// Dynamic routing helpers
export const getCategoryBySlug = (
    slug: string,
    lang: Language = "en"
): { key: string; info: CategoryInfo; projects: Project[] } | null => {
    const categories = getCategoryInfo(lang);
    const projectsMap = getProjectsByCategory(lang);
    const entry = Object.entries(categories).find(([, info]) => info.slug === slug);
    if (!entry) return null;
    const [key, info] = entry;
    return { key, info, projects: projectsMap[key] || [] };
};

export const getAllCategorySlugs = (): string[] => {
    return Object.values(categoryInfoEN).map((info) => info.slug).filter(Boolean) as string[];
};
