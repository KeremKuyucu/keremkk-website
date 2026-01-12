// components/Footer.tsx
import React from "react";
import {
  FaEnvelope,
  FaGithub,
  FaDiscord,
  FaLinkedin,
} from "react-icons/fa";
import { FaSignalMessenger } from "react-icons/fa6";

export const socialLinks = [
  {
    href: "mailto:contact@keremkk.com.tr",
    label: "E-posta",
    icon: <FaEnvelope />,
    color: "from-blue-400 to-blue-600",
    isMailto: true,
  },
  {
    href: "https://github.com/KeremKuyucu",
    label: "GitHub",
    icon: <FaGithub />,
    color: "from-gray-600 to-gray-900",
  },
  {
    href: "https://discord.com/users/483678328646270996",
    label: "Discord",
    icon: <FaDiscord />,
    color: "from-indigo-400 to-indigo-600",
  },
  {
    href: "https://www.linkedin.com/in/kerem-kuyucu/",
    label: "LinkedIn",
    icon: <FaLinkedin />,
    color: "from-blue-600 to-blue-800",
  },
  {
    href: "https://signal.me/#eu/ARcpLe2E-_qPXnH6-I26hgbYj_Qco2bpvsoBu7Be67wvl5fAzPxLWIMrJulQBptb",
    label: "Signal",
    icon: <FaSignalMessenger />,
    color: "from-blue-400 to-blue-600",
  },
];

const SocialButton = ({
  href,
  label,
  icon,
  color,
  isMailto,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  isMailto?: boolean;
}) => {
  const Component = isMailto ? 'a' : 'a';
  const props = isMailto ? { href } : { href, target: "_blank", rel: "noopener noreferrer" };

  return (
    <Component
      {...props}
      className="group relative flex items-center justify-center p-4 rounded-xl transition-all duration-300 hover:-translate-y-1"
      aria-label={label}
    >
      {/* Background Gradient on Hover */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

      {/* Icon */}
      <div className={`text-2xl text-gray-500 dark:text-gray-400 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-white`}>
        {icon}
      </div>

      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap">
        {label}
      </span>
    </Component>
  );
};

const FooterComponent: React.FC = () => {
  return (
    <footer className="relative mt-20 pt-20 pb-10 bg-white dark:bg-black overflow-hidden">
      {/* Tweak: Top Border with subtle gradient line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-500/10 to-violet-500/10 blur-[100px] rounded-full pointer-events-none opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        {/* Call to Action */}
        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-6">
          Vakit ayırdığınız için teşekkürler.
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-12 text-lg">
          Projelerim hakkında konuşmak veya sadece merhaba demek için ulaşabilirsiniz.
        </p>

        {/* Social Links Grid */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          {socialLinks.map((link) => (
            <div key={link.label} className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
              <SocialButton {...link} />
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} Kerem Kuyucu. Tüm hakları saklıdır.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/KeremKuyucu/kisisel-website"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Kaynak Kod
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
