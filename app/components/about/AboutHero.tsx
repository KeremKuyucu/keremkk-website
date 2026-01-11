"use client";
import Image from "next/image";
import profilePic from "../../../public/imgs/1758910751670.jpg";
import { FaAward, FaCode } from "react-icons/fa";

const AboutHero: React.FC = () => {
    return (
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
    );
};

export default AboutHero;
