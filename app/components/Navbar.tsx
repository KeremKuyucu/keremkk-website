"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUser, FaCode, FaFileAlt } from "react-icons/fa";

const navLinks = [
  { href: "/", label: "Ana Sayfa", icon: FaHome },
  { href: "/about", label: "Hakkımda", icon: FaUser },
  { href: "/#projects", label: "Projects", icon: FaCode },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          KK
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href.split("#")[0]));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                  ? "bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                <link.icon className="text-sm" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
