"use client";
import { FaCertificate } from "react-icons/fa";

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

const CertificatesSection: React.FC = () => {
    return (
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
    );
};

export default CertificatesSection;
