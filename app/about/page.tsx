import Navbar from "@/app/components/Navbar"
import FooterComponent from "@/app/components/Footer"
import Image from "next/image";
import profilePic from "../../public/imgs/1758910751670.jpg";
import { Icon } from "@iconify/react";

export default function Hakkimda() {
  const skills = [
    { name: "JavaScript", icon: "skill-icons:javascript" },
    { name: "TypeScript", icon: "skill-icons:typescript" },
    { name: "C++", icon: "skill-icons:cpp" },
    { name: "Arduino", icon: "skill-icons:arduino" },
    { name: "Flutter", icon: "logos:flutter" },
    { name: "Dart", icon: "logos:dart" },
  ];

  const education = [
    {
      school: "Ertuğrulgazi Lisesi",
      period: "2022-2026",
      current: true,
      department: "Sayısal",
      city: "Bilecik",
      country: "Türkiye",
    },
    {
      school: "Deneyap Teknoloji Atölyeleri",
      period: "2022-2025",
      current: false,
      city: "Bilecik",
      country: "Türkiye",
    },
  ];


  const certificates = [
    {
      title: "Mobil Uygulama",
      issuedBy: "Deneyap Teknoloji Atölyeleri",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/46284815765408/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/46284815765408.png",
    },
    {
      title: "Havacılık ve Uzay Teknolojileri",
      issuedBy: "Deneyap Teknoloji Atölyeleri",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/94718028006695/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/94718028006695.png",
    },
    {
      title: "Nanoteknoloji ve Malzeme Bilimi",
      issuedBy: "Deneyap Teknoloji Atölyeleri",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/73128913915133/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/73128913915133.png",
    },
    {
      title: "Siber Güvenlik",
      issuedBy: "Deneyap Teknoloji Atölyeleri",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/90969521776686/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/90969521776686.png",
    },
    {
      title: "Yazılım Teknolojileri",
      issuedBy: "Deneyap Teknoloji Atölyeleri",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/55126453824614/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/55126453824614.png",
    },
    {
      title: "İleri Robotik",
      issuedBy: "Deneyap Teknoloji Atölyeleri",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/61116175771908/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/61116175771908.png",
    },
    {
      title: "Elektronik Programlama ve Nesnelerin İnterneti",
      issuedBy: "Deneyap Teknoloji Atölyeleri",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/75809686615656/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/75809686615656.png",
    },
    {
      title: "Robotik ve Kodlama",
      issuedBy: "Deneyap Teknoloji Atölyeleri",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/52013621048830/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/52013621048830.png",
    },
    {
      title: "Tasarım ve Üretim",
      issuedBy: "Deneyap Teknoloji Atölyeleri",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/27701996921054/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/27701996921054.png",
    },
    {
      title: "Yapay Zeka",
      issuedBy: "Deneyap Teknoloji Atölyeleri",
      link: "https://drdogrulama.sanayi.gov.tr/tr/verify/29435665655018/",
      image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/29435665655018.png",
    },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <div className="container mx-auto px-6 py-20 max-w-7xl flex flex-col gap-16">
        {/* Hakkımda ve Resim Yan Yana */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Yazı */}
          <div className="md:w-3/5 text-center md:text-left space-y-6">
            <h2 className="text-4xl font-bold mb-4">Hakkımda</h2>
            <p className="text-xl max-w-3xl leading-relaxed mx-auto md:mx-0">
              Merhaba, ben Kerem Kuyucu. Bilecik Ertuğrulgazi Lisesi 12. sınıf öğrencisiyim ve teknolojiye büyük bir ilgi duyuyorum. Kendi başıma hobi projeleri geliştirerek kendimi sürekli ilerletmeye çalışıyorum. Geçmişte satranç ve robotik kodlama alanlarıyla ilgilendim ve bu alanlardaki etkinliklere katıldım.
              <br /><br />
              Bilecik Deneyap Teknoloji Atölyeleri'nde de öğrenim gördüm. Dart, Javascript, C++ dillerini kullanıyorum.
              <br /><br />
              Ayrıca, 2025 yılında TÜBİTAK 2204-A yarışmasında 'Küresel Isınmanın Arktik Bölge ve Türkiye Üzerindeki Etkilerinin Karşılaştırılması' projesi ile coğrafya alanında Bursa Bölge 3. oldum.
            </p>
          </div>

          {/* Resim */}
          <div className="md:w-2/5 flex justify-center">
            <div className="rounded-full overflow-hidden w-80 h-80 relative shadow-lg">
              <Image
                src={profilePic}
                alt="Kerem Kuyucu"
                layout="fill"
                objectFit="cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Eğitim */}
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4">Eğitim</h3>
          <ul className="list-disc pl-6 text-xl space-y-6">
            {education.map((edu, index) => (
              <li key={index}>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <div>
                    <b>{edu.school}</b> - <span className="italic">{edu.department || ""}</span>
                    <p>
                      {edu.city}, {edu.country}
                    </p>
                    <p>{edu.period}</p>
                  </div>
                  {edu.current && (
                    <div className="bg-green-400 rounded-full px-4 py-1 ml-4 text-lg whitespace-nowrap min-w-[80px] text-center">
                      Şu an
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Yetenekler */}
        <div>
          <h3 className="text-2xl font-semibold mb-6 text-center md:text-left">Yetenekler</h3>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="bg-gray-100 dark:bg-white/15 rounded-lg p-3 flex items-center shadow-md hover:shadow-lg transition-shadow"
              >
                <Icon icon={skill.icon} width={36} height={36} className="mr-3" />
                <h4 className="font-bold text-lg">{skill.name}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Sertifikalar */}
        <div>
          <h3 className="text-2xl font-semibold mb-6 text-center md:text-left">Sertifikalar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map(({ title, issuedBy, link, image }) => (
              <a
                key={title}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="border rounded-lg p-4 flex flex-col items-center hover:shadow-lg transition-shadow"
              >
                <img src={image} alt={title} className="w-40 h-auto mb-4" />
                <h4 className="font-bold text-lg">{title}</h4>
                <p className="text-sm text-gray-600">{issuedBy}</p>
                <span className="mt-2 text-blue-600 underline">Detayları Görüntüle</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <FooterComponent />
    </main>
  );

}