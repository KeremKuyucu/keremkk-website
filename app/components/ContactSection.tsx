"use client";
import { useEffect, useState } from "react";
import { FaRocket, FaCheck, FaSpinner } from "react-icons/fa";
import { socialLinks } from "./Footer";

const ContactSection: React.FC = () => {
    const [discordStatus, setDiscordStatus] = useState<'online' | 'idle' | 'dnd' | 'offline'>('offline');
    const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Discord Status from Lanyard
    useEffect(() => {
        const fetchDiscordStatus = async () => {
            try {
                const res = await fetch('https://api.lanyard.rest/v1/users/483678328646270996');
                const data = await res.json();
                if (data.success) {
                    setDiscordStatus(data.data.discord_status);
                }
            } catch (error) {
                console.error('Discord status fetch error:', error);
            }
        };

        fetchDiscordStatus();
        const interval = setInterval(fetchDiscordStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormState('loading');
        setErrorMessage('');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                setFormState('success');
                (e.target as HTMLFormElement).reset();
                setTimeout(() => setFormState('idle'), 5000);
            } else {
                setFormState('error');
                setErrorMessage(result.error || 'Bir hata oluştu');
            }
        } catch (error) {
            setFormState('error');
            setErrorMessage('Bağlantı hatası');
        }
    };

    return (
        <section className="py-24 px-6" id="iletisim">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 text-sm font-medium text-violet-600 dark:text-violet-400 mb-4">
                        İletişim
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                        Benimle İletişime Geçin
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                        Proje fikirleri, işbirliği teklifleri veya sadece merhaba demek için mesaj atabilirsiniz
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-12">
                    {/* Contact Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                    <FaRocket className="text-white text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Yeni Projeler</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Fikirlerinizi dinlemek isterim</p>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                Mobil uygulama, web sitesi veya herhangi bir yazılım projesi için benimle iletişime geçebilirsiniz.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Sosyal Medya</h3>
                            <div className="flex flex-wrap gap-3">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target={link.isMailto ? undefined : "_blank"}
                                        rel={link.isMailto ? undefined : "noopener noreferrer"}
                                        title={link.label}
                                        className={`w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:${link.color} hover:text-white transition-all duration-300 hover:scale-110`}
                                    >
                                        <span className="text-xl">{link.icon}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Discord Status Widget */}
                        <div className={`p-6 rounded-2xl border transition-all duration-500 ${discordStatus === 'online'
                            ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20'
                            : discordStatus === 'idle'
                                ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20'
                                : discordStatus === 'dnd'
                                    ? 'bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20'
                                    : 'bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-500/20'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="relative flex h-3 w-3">
                                    {discordStatus === 'online' && (
                                        <>
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </>
                                    )}
                                    {discordStatus === 'idle' && (
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                    )}
                                    {discordStatus === 'dnd' && (
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    )}
                                    {discordStatus === 'offline' && (
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-400"></span>
                                    )}
                                </span>
                                <span className={`text-sm font-medium ${discordStatus === 'online'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : discordStatus === 'idle'
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : discordStatus === 'dnd'
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                    {discordStatus === 'online' && 'Çevrimiçi'}
                                    {discordStatus === 'idle' && 'Boşta'}
                                    {discordStatus === 'dnd' && 'Rahatsız Etmeyin'}
                                    {discordStatus === 'offline' && 'Çevrimdışı'}
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {discordStatus === 'online'
                                    ? 'Şu an aktifim! Mesajınıza hızlıca yanıt verebilirim.'
                                    : discordStatus === 'idle'
                                        ? 'Kısa süre içinde döneceğim.'
                                        : discordStatus === 'dnd'
                                            ? 'Şu an meşgulüm, ama mesajınızı okurum.'
                                            : 'Şu an çevrimdışıyım. Mesajınıza en kısa sürede dönerim.'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        <form
                            onSubmit={handleSubmit}
                            className="p-8 rounded-3xl bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 backdrop-blur-xl shadow-xl"
                        >
                            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Adınız
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        disabled={formState === 'loading'}
                                        placeholder="Adınızı girin"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 disabled:opacity-50"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        E-posta
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        disabled={formState === 'loading'}
                                        placeholder="ornek@email.com"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Konu
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    required
                                    disabled={formState === 'loading'}
                                    placeholder="Mesajınızın konusu"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 disabled:opacity-50"
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mesajınız
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    required
                                    disabled={formState === 'loading'}
                                    placeholder="Mesajınızı buraya yazın..."
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 resize-none disabled:opacity-50"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={formState === 'loading'}
                                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${formState === 'success'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                    : formState === 'error'
                                        ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                                        : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-2xl hover:shadow-violet-500/25 hover:scale-[1.02]'
                                    } disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                                {formState === 'loading' && (
                                    <>
                                        <FaSpinner className="text-lg animate-spin" />
                                        Gönderiliyor...
                                    </>
                                )}
                                {formState === 'success' && (
                                    <>
                                        <FaCheck className="text-lg" />
                                        Mesajınız Gönderildi!
                                    </>
                                )}
                                {formState === 'error' && (
                                    <>
                                        Hata: {errorMessage}
                                    </>
                                )}
                                {formState === 'idle' && (
                                    <>
                                        <FaRocket className="text-lg" />
                                        Mesaj Gönder
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
