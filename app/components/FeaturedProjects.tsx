"use client";
import { FaGlobe } from "react-icons/fa";

const featuredProjects = [
    {
        title: "GeoGame",
        description: "Coğrafya öğrenmeyi eğlenceli hale getiren çoklu platform oyunu",
        tags: ["Flutter", "C++", "Next.js"],
        gradient: "from-emerald-500 to-teal-600",
        link: "/geogame",
    },
    {
        title: "PikaMed",
        description: "Yapay zeka destekli sağlık takip sistemi",
        tags: ["Flutter", "Next.js", "AI"],
        gradient: "from-rose-500 to-pink-600",
        link: "/pikamed",
    },
    {
        title: "DiscordStorage",
        description: "Discord üzerinden dosya depolama çözümü",
        tags: ["C++", "Flutter", "Dart"],
        gradient: "from-violet-500 to-purple-600",
        link: "/discordstorage",
    },
];

const FeaturedProjects: React.FC = () => {
    return (
        <section className="py-20 px-6 scroll-reveal" id="projects">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                        Öne Çıkan Projeler
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        En son üzerinde çalıştığım ve en çok ilgi gören projelerim
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {featuredProjects.map((project, index) => (
                        <a
                            key={index}
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                            style={{
                                background: `linear-gradient(135deg, var(--background) 0%, var(--background) 100%)`,
                            }}
                        >
                            {/* Gradient Overlay */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                            />

                            {/* Border Gradient */}
                            <div
                                className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-br ${project.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                                style={{
                                    WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                                    WebkitMaskComposite: "xor" as any,
                                    maskComposite: "exclude",
                                }}
                            />

                            <div className="relative z-10">
                                <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r ${project.gradient} bg-clip-text text-transparent`}>
                                    {project.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                    {project.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map((tag, tagIndex) => (
                                        <span
                                            key={tagIndex}
                                            className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Arrow Icon */}
                            <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-violet-500 group-hover:to-fuchsia-500 transition-all duration-300">
                                <FaGlobe className="text-gray-500 group-hover:text-white transition-colors" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedProjects;
