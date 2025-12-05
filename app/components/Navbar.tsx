// components/Navbar.js (veya .tsx)
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/30 dark:bg-black/30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Sol Taraf - Logo ve Hakkımda Linki */}
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-800 hover:text-gray-700 dark:text-gray-50 dark:hover:text-gray-400"
          >
            KK
          </Link>
          <Link
            href="/about"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-50 dark:hover:text-gray-400"
          >
            Hakkımda
          </Link>
          <Link
            href="/blog"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-50 dark:hover:text-gray-400"
          >
            Blog
          </Link>
        </div>

        {/* Sağ Taraf - İleride başka linkler eklenebilir */}
        <div></div>
      </div>
    </nav>
  );
};

export default Navbar;
