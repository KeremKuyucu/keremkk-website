import { SiFlutter, SiNextdotjs, SiTypescript, SiCplusplus, SiDart, SiSupabase, SiFirebase, SiVercel } from "react-icons/si";
import { Skill } from '../types';


export const skills: Skill[] = [
    { name: "Flutter", icon: SiFlutter, iconifyIcon: "logos:flutter", color: "#02569B" },
    { name: "Next.js", icon: SiNextdotjs, iconifyIcon: "skill-icons:nextjs-dark", color: "#000000" },
    { name: "TypeScript", icon: SiTypescript, iconifyIcon: "skill-icons:typescript", color: "#3178C6" },
    { name: "C++", icon: SiCplusplus, iconifyIcon: "skill-icons:cpp", color: "#00599C" },
    { name: "Dart", icon: SiDart, iconifyIcon: "logos:dart", color: "#0175C2" },
    { name: "Supabase", icon: SiSupabase, iconifyIcon: "skill-icons:supabase-dark", color: "#3ECF8E" },
    { name: "Firebase", icon: SiFirebase, iconifyIcon: "vscode-icons:file-type-firebase", color: "#FFCA28" },
    { name: "Vercel", icon: SiVercel, iconifyIcon: "skill-icons:vercel-dark", color: "#000000" },
];

// Typing animation roles
export const roles = [
    "Full-Stack Developer",
    "Mobile App Developer",
    "Flutter Developer",
    "Next.js Developer",
    "Lise Öğrencisi",
];
