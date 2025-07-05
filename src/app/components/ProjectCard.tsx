"use client";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faFileLines,
  faCodeBranch,
  faFilePen,
  faLaptop,
  faGaugeHigh,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface Project {
  imageUrl: string;
  altText: string;
  isNew?: boolean;
  isDeveloping?: boolean;
  title: string;
  features: string[];
  featureIcons: IconProp[];
  viewLink?: string;
  githubLink?: string;
}

const fallbackImage = "/imgs/errorimage.jpg";

const ProjectCard: React.FC<Project> = ({
  imageUrl,
  altText,
  isNew,
  isDeveloping,
  title,
  features,
  featureIcons,
  viewLink,
  githubLink,
}) => {
  return (
    <div className="rounded-3xl overflow-hidden flex flex-col md:flex-row mb-8 transform transition-all duration-500 ease-out">
      <div
        className="relative w-full md:w-1/2 max-w-[512px] mx-auto"
        style={{ aspectRatio: "16 / 9" }}
      >
        <img
          src={imageUrl}
          alt={altText}
          className="absolute top-0 left-0 w-full h-full object-cover object-center rounded-3xl"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackImage;
          }}
        />
      </div>
      <div className="p-4 md:p-8 flex-1">
        <div className="flex flex-wrap gap-2 mb-2">
          {isNew && (
            <div className="bg-yellow-500/85 text-white px-3 py-1 rounded-full text-sm sm:text-base"> {/* Mobil için font boyutu küçültüldü */}
              Yeni
            </div>
          )}
          {isDeveloping && (
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm sm:text-base"> {/* Mobil için font boyutu küçültüldü */}
              Geliştiriliyor
            </div>
          )}
        </div>
        <h3 className="text-2xl sm:text-3xl font-normal mb-4">{title}</h3> {/* Başlık boyutu mobil için küçültüldü */}
        <ul className="space-y-3 mb-6 stagger-reveal text-sm sm:text-base"> {/* Özellik listesi font boyutu küçültüldü */}
          {features.map((feature, index) => (
            <li className="flex items-center" key={index}>
              <FontAwesomeIcon icon={featureIcons[index]} className="mr-3 fa-fw" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="flex flex-col sm:flex-row gap-4 mt-4"> {/* Butonları mobil dikey, tablet/masaüstü yatay hizala */}
          {viewLink && (
            <a
              href={viewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 sm:px-6 rounded-full text-base sm:text-lg text-blue-500 flex items-center justify-center group relative overflow-hidden transition-all duration-300 ease-out pr-8 sm:pr-12 hover:bg-blue-200 dark:hover:bg-blue-900/20"
            >
              <FontAwesomeIcon icon={faFileLines} className="mr-2" />
              Gözat
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                className="absolute right-0 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out mr-3"
              />
            </a>
          )}
          {githubLink && (
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="dark:border-white py-2 px-4 sm:px-6 rounded-full text-base sm:text-lg flex items-center justify-center group relative overflow-hidden transition-all duration-300 ease-out pr-8 sm:pr-12 hover:bg-gray-300 dark:hover:bg-black/35"
            >
              <FontAwesomeIcon icon={faGithub} className="mr-2" />
              Github
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                className="absolute right-0 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out mr-3"
              />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const ProjelerSection: React.FC = () => {
  const projectsByCategory: { [key: string]: Project[] } = {
    GeoGame: [
      {
        imageUrl: "/imgs/geogamecpp.png",
        altText: "GeoGame C++",
        title: "GeoGame - C++ Versiyonu",
        features: ["Çevrimdışı", "C++", "Windows", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/GeoGameCPP",
        viewLink: "https://github.com/KeremKuyucu/GeoGameCPP/releases/latest",
      },
      {
        imageUrl: "/imgs/geogame.png",
        altText: "GeoGame",
        title: "GeoGame - Flutter Versiyonu",
        features: ["Çevrim içi/çevrimdışı", "Flutter", "Android ve Windows", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/GeoGame",
        viewLink: "https://geogame.keremkk.com.tr",
      },
      {
        imageUrl: "/imgs/geogameapi.png",
        altText: "GeoGame API",
        title: "GeoGame API",
        features: ["REST API", "Next.js", "Backend", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/geogame-api",
        viewLink: "https://geogame-api.keremkk.com.tr",
      },
      {
        imageUrl: "/imgs/geogamecdn.png",
        altText: "GeoGame CDN",
        title: "GeoGame CDN",
        features: ["Statik içerik", "Next.js", "Backend", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/geogame-cdn",
        viewLink: "https://geogame-cdn.keremkk.com.tr",
      },
      {
        imageUrl: "/imgs/geogamewebsite.png",
        altText: "GeoGame Website",
        title: "GeoGame Website",
        features: ["Frontend", "Next.js", "Web", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/geogame-website",
        viewLink: "https://geogame.keremkk.com.tr",
      },
      {
        imageUrl: "/imgs/geogameauth.png",
        altText: "GeoGame Auth",
        title: "GeoGame Authentication Web",
        features: ["Kullanıcı Girişi", "Next.js", "Web", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/geogame-auth-web",
        viewLink: "https://geogame-auth.keremkk.com.tr",
      },
    ],
    PikaMed: [
      {
        imageUrl: "/imgs/pikamed.png",
        altText: "PikaMed",
        title: "PikaMed - Sağlık Takip Sistemi",
        features: ["Yapay Zeka Destekli", "Flutter", "Android", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/PikaMed",
        viewLink: "https://pikamed.keremkk.com.tr",
      },
      {
        imageUrl: "/imgs/pikamedwebsite.png",
        altText: "PikaMed Website",
        title: "PikaMed Website",
        features: ["Frontend", "Next.js", "Web", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/PikaMed-website",
        viewLink: "https://pikamed.keremkk.com.tr",
      },
      {
        imageUrl: "/imgs/pikamedapi.png",
        altText: "PikaMed API",
        title: "PikaMed API Server",
        features: ["REST API", "Next.js", "Backend", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/pikamed-api",
        viewLink: "https://pikamed-api.keremkk.com.tr",
      },
      {
        imageUrl: "/imgs/pikamedpanel.png",
        altText: "PikaMed Panel",
        title: "PikaMed Yönetim Paneli",
        features: ["Yönetici Arayüzü", "Next.js", "Web", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/pikamed-panel",
        viewLink: "https://pikamed-panel.keremkk.com.tr",
      },
    ],
    DiscordStorage: [
      {
        imageUrl: "/imgs/discordstoragecpp.png",
        altText: "DiscordStorageCPP",
        title: "DiscordStorage - C++ Versiyonu",
        features: ["Discord Bot API", "C++", "Windows", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/DiscordStorageCPP",
        viewLink: "https://github.com/KeremKuyucu/DiscordStorageCPP/releases/latest",
      },
      {
        imageUrl: "/imgs/discordstorage.png",
        altText: "DiscordStorage",
        title: "DiscordStorage - Flutter Versiyonu",
        features: ["Discord Bot API", "Flutter", "Android ve Windows", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/DiscordStorage",
        viewLink: "https://github.com/KeremKuyucu/DiscordStorage/releases/latest",
      },
      {    
        imageUrl: "/imgs/discordstoragedart.png",
        altText: "DiscordStorageDart",
        title: "DiscordStorage - Dart CLI Versiyonu",
        features: ["Discord Bot API", "Dart", "Windows", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/DiscordStorageDart",
        viewLink: "https://github.com/KeremKuyucu/DiscordStorageDart/releases/latest",
      },
    ],
    Analytics: [
      {
        imageUrl: "/imgs/analytics.png",
        altText: "Analytics",
        title: "Analytics - Web Paneli",
        features: ["REST API", "Next.js", "Web", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/analytics-dashboard",
        viewLink: "https://analytics.keremkk.com.tr",
      }
    ],
    kısaLink: [
      {
        imageUrl: "/imgs/kısalink.png",
        altText: "kısaLink",
        title: "kısaLink - Açık Kaynak URL Kısaltma Servisi",
        features: ["Firebase", "Next.js", "Web", "Açık kaynak"],
        featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
        githubLink: "https://github.com/KeremKuyucu/shortlink",
        viewLink: "https://kisalink.icu",
      }
    ]
  };

  const [activeCategory, setActiveCategory] = useState<string | null>(null); // null olarak ayarlandı

  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
  
    const scrollElements = document.querySelectorAll(".scroll-reveal");
    scrollElements.forEach((el) => {
      observer.observe(el);
    });
  
    return () => {
      scrollElements.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, [activeCategory]);

  return (
    <div
        ref={sectionRef}
        className="min-h-auto px-4 py-8 md:py-0 md:flex md:flex-col md:justify-center md:items-center"
      >
        <div className="mx-auto w-full max-w-6xl p-0 m-0">
          <h2 className="text-3xl md:text-4xl font-normal mb-8 md:mb-12 text-center md:text-left">Projelerim</h2>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-8 md:mb-12">
            {Object.keys(projectsByCategory).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm sm:px-6 sm:py-2 rounded-full text-base font-medium transition-colors duration-300
                  ${
                    activeCategory === category
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
          {activeCategory && ( // activeCategory null ise bu blok render edilmeyecek
            <div className="space-y-8 md:space-y-12">
              {projectsByCategory[activeCategory].map((project, index) => (
                <div
                  key={index}
                  className="scroll-reveal"
                  style={{ transitionDelay: `${index * 0.15}s` }}
                >
                  <ProjectCard {...project} />
                </div>
              ))}
            </div>
          )}
          {!activeCategory && ( // Hiçbir kategori seçili değilse gösterilecek metin
            <p className="text-center text-gray-500 text-lg mt-8">
              Lütfen görüntülemek için bir kategori seçin.
            </p>
          )}
        </div>
      </div>
  );
};

export default ProjelerSection;