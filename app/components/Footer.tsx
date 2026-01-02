// components/Footer.tsx
import React from "react";
import {
  FaEnvelope,
  FaGithub,
  FaDiscord,
  FaLinkedin,
  FaInstagram,
} from "react-icons/fa";
import { FaSignalMessenger } from "react-icons/fa6";

const socialLinks = [
  {
    href: "mailto:contact@keremkk.com.tr",
    label: "E-posta",
    icon: <FaEnvelope />,
    bgHover: "hover:bg-blue-600",
    isMailto: true,
  },
  {
    href: "https://github.com/KeremKuyucu",
    label: "GitHub",
    icon: <FaGithub />,
    bgHover: "hover:bg-gray-700",
  },
  {
    href: "https://discord.com/users/483678328646270996",
    label: "Discord",
    icon: <FaDiscord />,
    bgHover: "hover:bg-indigo-600",
  },
  {
    href: "https://www.linkedin.com/in/kerem-kuyucu/",
    label: "LinkedIn",
    icon: <FaLinkedin />,
    bgHover: "hover:bg-blue-700",
  },
  {
    href: "https://signal.me/#eu/ARcpLe2E-_qPXnH6-I26hgbYj_Qco2bpvsoBu7Be67wvl5fAzPxLWIMrJulQBptb",
    label: "Signal",
    icon: <FaSignalMessenger />,
    bgHover: "hover:bg-pink-600",
  },
];

const SocialButton = ({
  href,
  label,
  icon,
  bgHover,
  isMailto,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  bgHover: string;
  isMailto?: boolean;
}) => {
  const commonClasses =
    "flex flex-col items-center justify-center gap-2 rounded-lg bg-gray-800 transition-colors duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-900 dark:hover:bg-blue-700 text-white py-4";

  return isMailto ? (
    <a
      href={href}
      className={`${commonClasses} ${bgHover} flex-1 max-w-[140px]`}
      aria-label={label}
      tabIndex={0}
    >
      <span className="text-4xl">{icon}</span>
      <span className="font-semibold text-base">{label}</span>
    </a>
  ) : (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${commonClasses} ${bgHover} flex-1 max-w-[140px]`}
      aria-label={label}
      tabIndex={0}
    >
      <span className="text-4xl">{icon}</span>
      <span className="font-semibold text-base">{label}</span>
    </a>
  );
};

const FooterComponent: React.FC = () => {
  return (
    <footer className="mt-40 bg-gradient-to-tr from-gray-900 via-black to-gray-900 rounded-tl-[48px] rounded-tr-[48px] text-white py-8 px-6 w-full shadow-lg dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="w-full max-w-4xl flex justify-between gap-4">
          {socialLinks.map(({ href, label, icon, bgHover, isMailto }) => (
            <SocialButton
              key={label}
              href={href}
              label={label}
              icon={icon}
              bgHover={bgHover}
              isMailto={isMailto}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-gray-400 text-sm max-w-4xl">
          © {new Date().getFullYear()} This site is open source, produced by{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/KeremKuyucu/keremkk-website"
            className="hover:underline text-gray-300 dark:text-gray-400"
          >
            Kerem Kuyucu
          </a>{" "}
          (Fork from{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/LewisLosa/manolya"
            className="hover:underline text-gray-300 dark:text-gray-400"
          >
            LewisLosa/manolya
          </a>
          )
        </p>
      </div>
    </footer>
  );
};

export default FooterComponent;
