"use client";
import { useEffect } from "react";
import ProjelerSection from "./components/ProjectCard";
import Navbar from "@/app/components/Navbar";
import FooterComponent from "@/app/components/Footer";



export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const scrollElements = document.querySelectorAll(".scroll-reveal");
    scrollElements.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      scrollElements.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <main>
      <Navbar />
      <header className="relative h-screen w-full overflow-hidden">
        <div className="absolute left-1/4 top-2/5 transform -translate-y-1/2 -translate-x-1/2 w-64 h-64 md:w-96 md:h-96 rounded-full bg-green-400 opacity-20 blur-3xl z-0"></div>
        <div className="absolute right-1/4 top-3/5 transform -translate-y-1/2 translate-x-1/2 w-64 h-64 md:w-96 md:h-96 rounded-full bg-blue-400 opacity-20 blur-3xl z-0"></div>
        <div className="h-screen flex flex-col justify-center items-center relative z-10">
          <div className="stagger-reveal px-4 sm:px-6 mb-20 md:mb-40 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl transform transition-all duration-500 ease-out opacity-0 translate-y-6">
              <b className="relative after:content-[''] after:absolute after:w-0 after:h-1 after:bg-current after:left-0 after:bottom-0 after:transition-all after:duration-700 after:ease-out hover:after:w-full">
                Merhaba,
              </b>{" "}
              <br />
              Ben Kerem. Kendi başıma hobi projeleri üreterek kendimi geliştiriyorum. <br />
            </h1>
            <p className="mt-4 text-center text-base sm:text-lg opacity-0 translate-y-6 text-gray-500 transform transition-all duration-500 ease-out hover:text-gray-700">
            </p>
          </div>
        </div>
      </header>
      <ProjelerSection />
      <FooterComponent />
    </main>
  );
}