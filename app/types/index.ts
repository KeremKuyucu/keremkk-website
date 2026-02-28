import React from 'react';
import { IconType } from "react-icons";

/**
 * Proje kartı için kullanılan veri yapısı
 * 
 * ## Temel Bilgiler
 * @property {string} imageUrl - Proje kartının kapak görseli URL'i (örn: "/imgs/projects/geogame.png")
 * @property {string} altText - Görsel yüklenemezse gösterilen alternatif metin
 * @property {string} title - Proje başlığı, gradient renkli olarak gösterilir
 * @property {string} [description] - Projenin kısa açıklaması (2 satırla sınırlı)
 * @property {string[]} features - Projenin özellik listesi, ✅ ikonuyla gösterilir (max 3 tanesi)
 * @property {string[]} [techStack] - Kullanılan teknolojiler (Flutter, Next.js vb.) ikonlarıyla gösterilir
 * @property {string} [viewLink] - "Görüntüle" butonunun yönlendireceği URL
 * @property {string} [githubLink] - GitHub repo linki
 * 
 * ## Etiketler (Badges)
 * @property {boolean} [isNew] - ✨ Yeni etiketi (turuncu, yanıp sönen)
 * @property {boolean} [isDeveloping] - 🚧 Geliştiriliyor etiketi (mavi)
 */
export interface Project {
    /** Proje kartının kapak görseli URL'i */
    imageUrl: string;
    /** Görsel yüklenemezse gösterilen alternatif metin */
    altText: string;
    /** ✨ Yeni etiketi göster */
    isNew?: boolean;
    /** 🚧 Geliştiriliyor etiketi göster */
    isDeveloping?: boolean;
    /** 🔒 Gizli proje etiketi */
    isPrivate?: boolean;
    /** Proje başlığı */
    title: string;
    /** Projenin kısa açıklaması */
    description?: string;
    /** Projenin özellik listesi (max 3 tanesi gösterilir) */
    features: string[];
    /** Kullanılan teknolojiler */
    techStack?: string[];
    /** "Görüntüle" butonunun yönlendireceği URL */
    viewLink?: string;
    /** GitHub repo linki */
    githubLink?: string;
    /** Detaylı proje açıklaması */
    longDescription?: string;
}

export interface CategoryInfo {
    name: string;
    slug?: string;
    icon: React.ReactNode;
    gradient: string;
    description: string;
    longDescription?: string;
}

export interface Skill {
    name: string;
    icon: IconType;
    iconifyIcon: string; // For Iconify usage
    color: string;
}
