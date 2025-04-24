// components/Footer.tsx
import React from "react";
import Link from "next/link";

const FooterComponent: React.FC = () => {
  return (
    <footer className="mt-60 bg-black rounded-tl-[64px] rounded-tr-[64px] text-white p-6 w-full transform transition-all duration-700 ease-out hover:rounded-tl-[72px] hover:rounded-tr-[72px]">
            <div className="max-w-6xl mx-auto py-12">
        <div className="flex flex-col justify-center items-center stagger-reveal">
          <div className="mb-8 text-center">
                      {/*  <h2 className="text-4xl font-bold">İstediğin gibi miyim?</h2>
           <p className="text-4xl mb-6">
              O zaman{" "}
              <Link href="https://drive.google.com/file/d/1nkFktkrbYJ1-rbCNUmAzAy1BGN5pdLFb/view?usp=sharing" target="_blank" className="hover:underline underline-offset-4">
                cv'me
              </Link>{" "}
              göz at ve iletişime geç.
            </p>
            */}
            <div className="flex flex-row space-x-6 space-y-0 text-4xl justify-center mx-auto stagger-reveal">
              <Link href="mailto:keremkk.iletisim@gmail.com" className=" hover:underline underline-offset-4">
                E-posta
              </Link>
              <Link target="_blank" href="https://github.com/keremlogg" className="hover:underline underline-offset-4">
                GitHub
              </Link>
              <Link target="_blank" href="https://discord.com/users/483678328646270996" className="hover:underline underline-offset-4">
                Discord
              </Link>
              <Link target="_blank" href="https://www.linkedin.com/in/kerem-kuyucu/" className="hover:underline underline-offset-4">
                LinkedIn
              </Link>
              <Link target="_blank" href="https://instagram.com/keremxkuyucu" className="hover:underline underline-offset-4">
                Instagram
              </Link>
            </div>
           </div>
           </div>

        <div className="mt-24 -mb-12 text-center text-sm text-gray-400">
          Bu site açık kaynaktır, yapımcısı {" "}
          <Link target="_blank" href="https://github.com/lewislosa" className="hover:underline">
          lewislosa
          </Link>{" "}
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
