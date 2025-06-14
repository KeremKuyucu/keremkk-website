"use client"
import React, { useEffect, useRef } from "react";
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
      <div className="relative w-full md:w-1/2 h-64 md:h-auto ">
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-full object-cover rounded-3xl max-w-128"
        />
      </div>
      <div className="p-4 md:p-8 flex-1">
        <div className="flex flex-wrap gap-2 mb-2">
          {isNew && (
            <div className="bg-yellow-500/85 text-white px-5 py-1 rounded-full text-lg">
              Yeni
            </div>
          )}
          {isDeveloping && (
            <div className="bg-blue-500 text-white px-5 py-1 rounded-full text-lg">
              Geliştiriliyor
            </div>
          )}
        </div>
        <h3 className="text-3xl font-normal mb-4">{title}</h3>
        <ul className="space-y-3 mb-6 stagger-reveal">
          {features.map((feature, index) => {
            return (
              <li className="flex items-center text-lg" key={index}>
                <FontAwesomeIcon
                  icon={featureIcons[index]}
                  className="mr-3 fa-fw"
                />
                {feature}
              </li>
            );
          })}
        </ul>
        <div className="flex gap-4 mt-4">
          {viewLink && (
            <a
              href={viewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-6 rounded-full text-lg text-blue-500 flex items-center group relative overflow-hidden transition-all duration-300 ease-out pr-12 hover:bg-blue-200 dark:hover:bg-blue-900/20"
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
              className="dark:border-white py-2 px-6 rounded-full text-lg flex items-center group relative overflow-hidden transition-all duration-300 ease-out pr-12 hover:bg-gray-300 dark:hover:bg-black/35"
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

interface SubProject {
  title: string;
  features: string[];
  featureIcons: IconProp[];
  viewLink?: string;
  githubLink?: string;
}

interface MainProject {
  imageUrl: string;
  altText: string;
  isNew?: boolean;
  isDeveloping?: boolean;
  title: string;
  subProjects: SubProject[];
}

const SubProjectCard: React.FC<SubProject> = ({
  title,
  features,
  featureIcons,
  viewLink,
  githubLink,
}) => (
  <div className="border rounded-2xl p-4 mb-4 bg-white/70 dark:bg-black/30">
    <h4 className="text-xl font-semibold mb-2">{title}</h4>
    <ul className="space-y-2 mb-3">
      {features.map((feature, idx) => (
        <li className="flex items-center text-base" key={idx}>
          <FontAwesomeIcon icon={featureIcons[idx]} className="mr-2 fa-fw" />
          {feature}
        </li>
      ))}
    </ul>
    <div className="flex gap-3">
      {viewLink && (
        <a href={viewLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Demo</a>
      )}
      {githubLink && (
        <a href={githubLink} target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-200 underline">GitHub</a>
      )}
    </div>
  </div>
);

const MainProjectCard: React.FC<MainProject> = ({
  imageUrl,
  altText,
  isNew,
  isDeveloping,
  title,
  subProjects,
}) => (
  <div className="rounded-3xl overflow-hidden flex flex-col md:flex-row mb-8 transform transition-all duration-500 ease-out">
    <div className="relative w-full md:w-1/2 h-64 md:h-auto">
      <img src={imageUrl} alt={altText} className="w-full h-full object-cover rounded-3xl max-w-128" />
    </div>
    <div className="p-4 md:p-8 flex-1">
      <div className="flex flex-wrap gap-2 mb-2">
        {isNew && <div className="bg-yellow-500/85 text-white px-5 py-1 rounded-full text-lg">Yeni</div>}
        {isDeveloping && <div className="bg-blue-500 text-white px-5 py-1 rounded-full text-lg">Geliştiriliyor</div>}
      </div>
      <h3 className="text-3xl font-normal mb-4">{title}</h3>
      <div className="space-y-4">
        {subProjects.map((sub, idx) => <SubProjectCard key={idx} {...sub} />)}
      </div>
    </div>
  </div>
);

const ProjelerSection: React.FC = () => {
  const mainProjects: MainProject[] = [
    {
      imageUrl: "/imgs/geogame.png",
      altText: "GeoGame",
      isNew: false,
      isDeveloping: false,
      title: "GeoGame Proje Ailesi",
      subProjects: [
        {
          title: "GeoGame App (Flutter)",
          features: ["Çevrimiçi/Çevrimdışı kullanım", "Açık kaynak", "Android ve Windows", "Flutter"],
          featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
          viewLink: "https://geogame.keremkk.com.tr",
          githubLink: "https://github.com/KeremKuyucu/geogame"
        },
        {
          title: "GeoGame API",
          features: ["REST API", "Açık kaynak", "Node.js", "Express"],
          featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
          viewLink: "#",
          githubLink: "https://github.com/KeremKuyucu/geogame-api"
        },
        {
          title: "GeoGame CDN",
          features: ["Statik dosya servisi", "Açık kaynak", "CDN", "Node.js"],
          featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
          viewLink: "#",
          githubLink: "https://github.com/KeremKuyucu/geogame-cdn"
        },
        {
          title: "GeoGame C++",
          features: ["Çevrimdışı kullanım", "Açık kaynak", "Windows", "C++"],
          featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
          viewLink: "#",
          githubLink: "https://github.com/KeremKuyucu/geogameCpp"
        }
      ]
    },
    // Diğer ana projeler eski formatta eklenebilir
    {
      imageUrl: "/imgs/pikamed.png",
      altText: "Pikamed",
      isNew: false,
      isDeveloping: false,
      title: "Pikamed - Sağlık Takip Sistemi",
      subProjects: [
        {
          title: "Pikamed App (Flutter)",
          features: ["Yapay Zeka Destekli", "Açık Kaynak", "Android", "Flutter"],
          featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
          viewLink: "https://pikamed.keremkk.com.tr",
          githubLink: "https://github.com/KeremKuyucu/pikamed"
        }
      ]
    },
    {
      imageUrl: "/imgs/discordstorage.png",
      altText: "DiscordStorage",
      isNew: false,
      isDeveloping: false,
      title: "DiscordStorage Proje Ailesi",
      subProjects: [
        {
          title: "DiscordStorage App (Flutter)",
          features: ["Bot Tokeni İle Çalışır", "Açık Kaynak", "Android ve Windows", "Flutter"],
          featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
          viewLink: "#",
          githubLink: "https://github.com/KeremKuyucu/DiscordStorage"
        },
        {
          title: "DiscordStorage C++",
          features: ["Bot Tokeni İle Çalışır", "Açık Kaynak", "Windows", "C++"],
          featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
          viewLink: "#",
          githubLink: "https://github.com/KeremKuyucu/DiscordStorageCPP"
        }
      ]
    }
  ];

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
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="min-h-screen px-4 py-16 md:py-0 md:flex md:flex-col md:justify-center md:items-center"
    >
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-normal mb-8 md:mb-12 scroll-reveal">
          Projelerim
        </h2>
        <div className="space-y-8 md:space-y-12">
          {mainProjects.map((mainProject, idx) => (
            <div key={idx} className="scroll-reveal" style={{ transitionDelay: `${idx * 0.15}s` }}>
              <MainProjectCard {...mainProject} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjelerSection;
