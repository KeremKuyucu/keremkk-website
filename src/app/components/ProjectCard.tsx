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

interface ProjectGroup {
  groupTitle: string;
  projects: Project[];
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
          {features.map((feature, index) => (
            <li className="flex items-center text-lg" key={index}>
              <FontAwesomeIcon
                icon={featureIcons[index]}
                className="mr-3 fa-fw"
              />
              {feature}
            </li>
          ))}
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

const ProjelerSection: React.FC = () => {
  const projectsGroups: ProjectGroup[] = [
    {
      groupTitle: "GeoGame Serisi",
      projects: [
        {
          imageUrl: "/imgs/geogame.png",
          altText: "GeoGame",
          title: "GeoGame - Flutter",
          features: ["Çevrimiçi/Çevrimdışı", "Açık kaynak", "Android/Windows", "Flutter"],
          featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
          viewLink: "https://geogame.keremkk.com.tr",
          githubLink: "https://github.com/KeremKuyucu/geogame",
        },
        {
          imageUrl: "/imgs/geogamecpp.png",
          altText: "GeoGameCPP",
          title: "GeoGame - C++",
          features: ["Çevrimdışı kullanım", "Açık kaynak", "Windows", "C++"],
          featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
          githubLink: "https://github.com/KeremKuyucu/geogameCpp",
        },
        {
          imageUrl: "/imgs/geogame-api.png",
          altText: "GeoGameAPI",
          title: "GeoGame API",
          features: ["REST API", "Node.js", "Express"],
          featureIcons: [faCodeBranch, faFilePen, faLaptop],
          githubLink: "https://github.com/KeremKuyucu/geogame-api",
        },
        {
          imageUrl: "/imgs/geogame-cdn.png",
          altText: "GeoGameCDN",
          title: "GeoGame CDN",
          features: ["Statik içerik sunucu", "Hızlı Erişim", "CDN"],
          featureIcons: [faCheckCircle, faGaugeHigh, faLaptop],
          githubLink: "https://github.com/KeremKuyucu/geogame-cdn",
        },
      ],
    },
    {
      groupTitle: "DiscordStorage",
      projects: [
        {
          imageUrl: "/imgs/discordstorage.png",
          altText: "DiscordStorage",
          title: "DiscordStorage - Flutter",
          features: ["Bot Tokeni ile çalışır", "Açık kaynak", "Android/Windows", "Flutter"],
          featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
          githubLink: "https://github.com/KeremKuyucu/DiscordStorage",
        },
        {
          imageUrl: "/imgs/discordstoragecpp.png",
          altText: "DiscordStorageCPP",
          title: "DiscordStorage - C++",
          features: ["Bot Tokeni ile çalışır", "Açık kaynak", "Windows", "C++"],
          featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
          githubLink: "https://github.com/KeremKuyucu/DiscordStorageCPP",
        },
      ],
    },
    {
      groupTitle: "Diğer Projeler",
      projects: [
        {
          imageUrl: "/imgs/pikamed.png",
          altText: "Pikamed",
          title: "Pikamed - Sağlık Takip Sistemi",
          features: ["Yapay Zeka Destekli", "Açık Kaynak", "Android", "Flutter"],
          featureIcons: [faCheckCircle, faFilePen, faLaptop, faGaugeHigh],
          viewLink: "https://pikamed.keremkk.com.tr",
          githubLink: "https://github.com/KeremKuyucu/pikamed",
        },
      ],
    },
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
    scrollElements.forEach((el) => observer.observe(el));

    return () => {
      scrollElements.forEach((el) => observer.unobserve(el));
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
        {projectsGroups.map((group, i) => (
          <div key={i} className="mb-12">
            <h3 className="text-2xl font-semibold mb-6 scroll-reveal">{group.groupTitle}</h3>
            <div className="space-y-8 md:space-y-12">
              {group.projects.map((project, index) => (
                <div
                  key={index}
                  className="scroll-reveal"
                  style={{ transitionDelay: `${index * 0.15}s` }}
                >
                  <ProjectCard {...project} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjelerSection;
