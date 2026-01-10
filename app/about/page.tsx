"use client";
import Navbar from "@/app/components/Navbar";
import FooterComponent from "@/app/components/Footer";
import Image from "next/image";
import profilePic from "../../public/imgs/1758910751670.jpg";
import { Icon } from "@iconify/react";
import { FaGraduationCap, FaCertificate, FaCode, FaAward } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function Hakkimda() {
  const [activeTab, setActiveTab] = useState("skills");

  const skills = [
    { name: "Flutter", icon: "logos:flutter", level: "İleri" },
    { name: "Next.js", icon: "skill-icons:nextjs-dark", level: "Orta" },
    { name: "TypeScript", icon: "skill-icons:typescript", level: "Orta" },
    { name: "C++", icon: "skill-icons:cpp", level: "İleri" },
    { name: "Dart", icon: "logos:dart", level: "İleri" },
    { name: "Supabase", icon: "skill-icons:supabase-dark", level: "Orta" },
    { name: "Firebase", icon: "skill-icons:firebase-dark", level: "Orta" },
    { name: "Vercel", icon: "skill-icons:vercel-dark", level: "Orta" },
  ];

  const education = [
    {
      school: "Ertuğrulgazi Lisesi",
      period: "2022-2026",
      current: true,
      department: "Sayısal",
      city: "Bilecik",
      country: "Türkiye",
      description: "Lise eğitimime sayısal alanda devam ediyorum.",
    },
    {
      school: "Deneyap Teknoloji Atölyeleri",
      period: "2022-2025",
      current: false,
      city: "Bilecik",
      country: "Türkiye",
      description: "Robotik kodlama, elektronik programlama ve yapay zeka alanlarında 3 yıl süren kapsamlı eğitim.",
    },
  ];

  const certificates = [
    {
      title: "Mobil Uygulama",
      issuedBy: "Deneyap",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/46284815765408/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/46284815765408.png",
    },
    {
      title: "Havacılık ve Uzay",
      issuedBy: "Deneyap",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/94718028006695/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/94718028006695.png",
    },
    {
      title: "Nanoteknoloji",
      issuedBy: "Deneyap",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/73128913915133/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/73128913915133.png",
    },
    {
      title: "Siber Güvenlik",
      issuedBy: "Deneyap",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/90969521776686/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/90969521776686.png",
    },
    {
      title: "Yazılım Teknolojileri",
      issuedBy: "Deneyap",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/55126453824614/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/55126453824614.png",
    },
    {
      title: "İleri Robotik",
      issuedBy: "Deneyap",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/61116175771908/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/61116175771908.png",
    },
    {
      title: "Elektronik Programlama",
      issuedBy: "Deneyap",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/75809686615656/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/75809686615656.png",
    },
    {
      title: "Robotik ve Kodlama",
      issuedBy: "Deneyap",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/52013621048830/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/52013621048830.png",
    },
    {
      title: "Tasarım ve Üretim",
      issuedBy: "Deneyap",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/27701996921054/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/27701996921054.png",
    },
    {
      title: "Yapay Zeka",
      issuedBy: "Deneyap",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/29435665655018/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/29435665655018.png",
    },
  ];

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

    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            {/* Profile Image with Ring */}
            <div className="relative group shrink-0 scroll-reveal">
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full opacity-75 blur transition duration-500 group-hover:opacity-100" />
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 shadow-2xl">
                <Image
                  src={profilePic}
                  alt="Kerem Kuyucu"
                  layout="fill"
                  objectFit="cover"
                  priority
                  className="transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg text-2xl animate-bounce">
                👋
              </div>
            </div>

            {/* Intro Text */}
            <div className="text-center md:text-left space-y-6 scroll-reveal" style={{ transitionDelay: "0.2s" }}>
              <div>
                <h2 className="text-sm font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase mb-2">
                  Hakkımda
                </h2>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  Ben <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Kerem Kuyucu</span>
                </h1>
              </div>

              <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>
                  Bilecik <strong className="text-gray-900 dark:text-white">Ertuğrulgazi Lisesi</strong> 12. sınıf öğrencisiyim.
                  Teknolojiye olan tutkum beni sürekli yeni şeyler öğrenmeye ve üretmeye itiyor.
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">Full-Stack & Mobile App Developer</strong> olarak
                  (Flutter, Next.js, C++) projeler geliştiriyorum. Problem çözmeyi, algoritma kurmayı ve temiz kod yazmayı seviyorum.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <FaAward className="text-2xl text-blue-600" />
                    <div className="text-left">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Başarı</p>
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-300">TÜBİTAK Bölge 3.sü</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-2xl border border-violet-100 dark:border-violet-800">
                    <FaCode className="text-2xl text-violet-600" />
                    <div className="text-left">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Deneyim</p>
                      <p className="text-sm font-bold text-violet-700 dark:text-violet-300">3+ Yıl Kodlama</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* Left Column: Education & Skills */}
          <div className="lg:col-span-4 space-y-12">

            {/* Education Timeline */}
            <div className="scroll-reveal">
              <h3 className="flex items-center gap-2 text-2xl font-bold mb-8 text-gray-900 dark:text-white">
                <FaGraduationCap className="text-blue-600" /> Eğitim
              </h3>
              <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3 space-y-8 pl-8">
                {education.map((edu, index) => (
                  <div key={index} className="relative">
                    <span className={`absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-gray-900 ${edu.current ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mb-2 inline-block">
                        {edu.period}
                      </span>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{edu.school}</h4>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-2">{edu.department || "Öğrenci"}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {edu.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="scroll-reveal delay-200">
              <h3 className="flex items-center gap-2 text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                <FaCode className="text-violet-600" /> Yetenekler
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors shadow-sm group"
                  >
                    <div className="shrink-0 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-violet-50 dark:group-hover:bg-violet-900/30 transition-colors">
                      <Icon icon={skill.icon} width={24} height={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{skill.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{skill.level}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Certificates grid */}
          <div className="lg:col-span-8">
            <h3 className="flex items-center gap-2 text-2xl font-bold mb-8 scroll-reveal text-gray-900 dark:text-white">
              <FaCertificate className="text-orange-500" /> Sertifikalar
            </h3>

            <div className="grid sm:grid-cols-2 gap-6">
              {certificates.map((cert, index) => (
                <a
                  key={index}
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 scroll-reveal"
                  style={{ transitionDelay: `${index * 0.05}s` }}
                >
                  <div className="p-10 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-900 transition-colors">
                    {/* Resim alanı */}
                    <div className="relative w-48 h-32 transform group-hover:scale-105 transition-transform duration-300 drop-shadow-md">
                      <img
                        src={cert.image}
                        alt={cert.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col border-t border-gray-100 dark:border-gray-700">
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-orange-600 transition-colors">{cert.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{cert.issuedBy}</p>

                    <div className="mt-auto flex items-center text-sm font-semibold text-orange-500 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      Sertifikayı Doğrula <span className="ml-1">→</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>
      </section>

      <FooterComponent />
    </main>
  );
}