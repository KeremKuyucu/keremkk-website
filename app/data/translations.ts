export type Language = "en" | "tr";

export interface TranslationDictionary {
  nav: {
    home: string;
    about: string;
    projects: string;
    contact: string;
  };
  footer: {
    brandBio: string;
    status: string;
    quickLinks: string;
    connections: string;
    contactNote: string;
    sourceCode: string;
    scrollToTop: string;
    madeWith: string;
  };
  home: {
    statusBadge: string;
    greeting: string;
    name: string;
    bioLine: string;
    roles: string[];
    viewProjects: string;
    githubProfile: string;
    stats: {
      projects: string;
      technologies: string;
      yearsExperience: string;
    };
    scrollDown: string;
    techStackTitle: string;
    techStackSubtitle: string;
  };
  about: {
    badge: string;
    greetingPrefix: string;
    greetingName: string;
    p1Bold: string;
    p1Text: string;
    p2Bold: string;
    p2Text: string;
    achievementLabel: string;
    achievementValue: string;
    experienceLabel: string;
    experienceValue: string;
    educationTitle: string;
    currentStudent: string;
    skillsTitle: string;
    cvTitle: string;
    cvSubtitle: string;
    certificatesTitle: string;
    verifyCertificate: string;
    educationList: {
      school: string;
      period: string;
      current: boolean;
      department: string;
      city: string;
      country: string;
      description: string;
    }[];
    certificatesList: {
      title: string;
      issuedBy: string;
      link: string;
      image: string;
    }[];
  };
  projects: {
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    selectCategory: string;
    selectCategoryHint: string;
    totalProjects: string;
    categoriesCount: string;
    allDetails: string;
    preview: string;
    github: string;
    privateRepo: string;
    lastCommit: string;
    backToProjects: string;
    projectCount: string;
    technologiesCount: string;
    viewProject: string;
    badges: {
      new: string;
      developing: string;
      archived: string;
      private: string;
    };
  };
  contact: {
    badge: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    formTitle: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
    submitButton: string;
    submittingButton: string;
    successTitle: string;
    successSubtitle: string;
    sendNewMessage: string;
    fillAllFields: string;
    invalidEmail: string;
    connectionError: string;
    sendError: string;
    otherChannels: string;
    otherChannelsSubtitle: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      projects: "Projects",
      contact: "Contact",
    },
    footer: {
      brandBio: "Continuously improving by building hobby projects. Crafting creative solutions with modern technologies.",
      status: "Building new projects",
      quickLinks: "Quick Links",
      connections: "Connect",
      contactNote: "Feel free to reach out for project ideas or collaboration offers.",
      sourceCode: "Source Code",
      scrollToTop: "Scroll to top",
      madeWith: "Made with",
    },
    home: {
      statusBadge: "Building new projects",
      greeting: "Hello, I am",
      name: "Kerem Kuyucu",
      bioLine: "Continuously improving by building hobby projects",
      roles: [
        "Full-Stack Developer",
        "Mobile App Developer",
        "Flutter Developer",
        "Next.js Developer",
        "Engineering Student",
      ],
      viewProjects: "View My Projects",
      githubProfile: "GitHub Profile",
      stats: {
        projects: "Projects",
        technologies: "Technologies",
        yearsExperience: "Years Experience",
      },
      scrollDown: "Scroll Down",
      techStackTitle: "Technologies I Use",
      techStackSubtitle: "Modern technologies and tools I work with in my projects",
    },
    about: {
      badge: "ABOUT ME",
      greetingPrefix: "I am",
      greetingName: "Kerem Kuyucu",
      p1Bold: "Bilecik Şeyh Edebali University",
      p1Text: " Electrical and Electronics Engineering student. My passion for technology constantly drives me to learn and build new things.",
      p2Bold: "Full-Stack & Mobile App Developer",
      p2Text: " developing projects in Flutter, Next.js, and C++. I love solving problems, designing algorithms, and writing clean, scalable code.",
      achievementLabel: "Achievement",
      achievementValue: "TÜBİTAK Regional 3rd",
      experienceLabel: "Experience",
      experienceValue: "2+ Years Coding",
      educationTitle: "Education",
      currentStudent: "Student",
      skillsTitle: "Technologies I Use",
      cvTitle: "My Resume",
      cvSubtitle: "Download as PDF",
      certificatesTitle: "Certificates",
      verifyCertificate: "Verify Certificate",
      educationList: [
        {
          school: "Bilecik Şeyh Edebali University",
          period: "2026 - Present",
          current: true,
          department: "Electrical & Electronics Engineering",
          city: "Bilecik",
          country: "Turkey",
          description: "Pursuing my undergraduate degree in Electrical and Electronics Engineering.",
        },
        {
          school: "Ertuğrulgazi High School",
          period: "2022 - 2026",
          current: false,
          department: "Science / Mathematics",
          city: "Bilecik",
          country: "Turkey",
          description: "Successfully completed high school education focused on science and mathematics.",
        },
        {
          school: "Deneyap Technology Workshops",
          period: "2022 - 2025",
          current: false,
          department: "Technology & Robotics",
          city: "Bilecik",
          country: "Turkey",
          description: "Comprehensive 3-year hands-on program in robotic coding, embedded programming, and AI technologies.",
        },
      ],
      certificatesList: [
        {
          title: "Mobile Application",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/46284815765408/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/46284815765408.png",
        },
        {
          title: "Aerospace & Aviation",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/94718028006695/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/94718028006695.png",
        },
        {
          title: "Nanotechnology",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/73128913915133/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/73128913915133.png",
        },
        {
          title: "Cyber Security",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/90969521776686/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/90969521776686.png",
        },
        {
          title: "Software Technologies",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/55126453824614/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/55126453824614.png",
        },
        {
          title: "Advanced Robotics",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/61116175771908/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/61116175771908.png",
        },
        {
          title: "Electronic Programming",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/75809686615656/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/75809686615656.png",
        },
        {
          title: "Robotics & Coding",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/52013621048830/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/52013621048830.png",
        },
        {
          title: "Design & Production",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/27701996921054/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/27701996921054.png",
        },
        {
          title: "Artificial Intelligence",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/29435665655018/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/29435665655018.png",
        },
      ],
    },
    projects: {
      titlePrefix: "All My",
      titleHighlight: "Projects",
      subtitle: "Categorized overview of the applications and tools I have developed. Select a category to explore details.",
      selectCategory: "Select a Category",
      selectCategoryHint: "Click on one of the categories above to explore my projects.",
      totalProjects: "Total Projects",
      categoriesCount: "Categories",
      allDetails: "All Details",
      preview: "Preview",
      github: "GitHub",
      privateRepo: "Private Repo",
      lastCommit: "Last commit:",
      backToProjects: "All Projects",
      projectCount: "Project Count",
      technologiesCount: "Technologies",
      viewProject: "View Project",
      badges: {
        new: "✨ New",
        developing: "🚧 In Development",
        archived: "📦 Archived",
        private: "Private",
      },
    },
    contact: {
      badge: "Get in Touch",
      titlePrefix: "Have an Idea?",
      titleHighlight: "Let's Talk.",
      subtitle: "Send a message for project ideas, collaboration proposals, or simply to say hello. I'll get back to you shortly.",
      formTitle: "Send a Message",
      namePlaceholder: "Your Name",
      emailPlaceholder: "Your Email Address",
      subjectPlaceholder: "Subject",
      messagePlaceholder: "Your Message...",
      submitButton: "Send Message",
      submittingButton: "Sending...",
      successTitle: "Message Sent!",
      successSubtitle: "I will get back to you as soon as possible. Thank you!",
      sendNewMessage: "Send Another Message",
      fillAllFields: "Please fill in all fields.",
      invalidEmail: "Please enter a valid email address.",
      connectionError: "Connection error. Please try again.",
      sendError: "Failed to send message. Please try again.",
      otherChannels: "Other Channels",
      otherChannelsSubtitle: "You can also reach out to me via the platforms below.",
    },
  },
  tr: {
    nav: {
      home: "Ana Sayfa",
      about: "Hakkımda",
      projects: "Projeler",
      contact: "İletişim",
    },
    footer: {
      brandBio: "Hobi projeleri üreterek kendimi geliştiriyorum. Modern teknolojiler ile yaratıcı çözümler tasarlıyorum.",
      status: "Yeni projeler geliştiriyorum",
      quickLinks: "Hızlı Linkler",
      connections: "Bağlantılar",
      contactNote: "Proje fikirleri veya iş birliği teklifleri için iletişime geçebilirsiniz.",
      sourceCode: "Kaynak Kod",
      scrollToTop: "Yukarı çık",
      madeWith: "Made with",
    },
    home: {
      statusBadge: "Yeni projeler geliştiriyorum",
      greeting: "Merhaba, ben",
      name: "Kerem Kuyucu",
      bioLine: "Hobi projeleri üreterek kendimi geliştiriyorum",
      roles: [
        "Full-Stack Developer",
        "Mobile App Developer",
        "Flutter Developer",
        "Next.js Developer",
        "Mühendislik Öğrencisi",
      ],
      viewProjects: "Projelerimi Gör",
      githubProfile: "GitHub Profilim",
      stats: {
        projects: "Proje",
        technologies: "Teknoloji",
        yearsExperience: "Yıl Deneyim",
      },
      scrollDown: "Aşağı Kaydır",
      techStackTitle: "Kullandığım Teknolojiler",
      techStackSubtitle: "Projelerimde kullandığım modern teknolojiler ve araçlar",
    },
    about: {
      badge: "HAKKIMDA",
      greetingPrefix: "Ben",
      greetingName: "Kerem Kuyucu",
      p1Bold: "Bilecik Şeyh Edebali Üniversitesi",
      p1Text: " Elektrik-Elektronik Mühendisliği öğrencisiyim. Teknolojiye olan tutkum beni sürekli yeni şeyler öğrenmeye ve üretmeye itiyor.",
      p2Bold: "Full-Stack & Mobile App Developer",
      p2Text: " olarak (Flutter, Next.js, C++) projeler geliştiriyorum. Problem çözmeyi, algoritma kurmayı ve temiz kod yazmayı seviyorum.",
      achievementLabel: "Başarı",
      achievementValue: "TÜBİTAK Bölge 3.sü",
      experienceLabel: "Deneyim",
      experienceValue: "2+ Yıl Kodlama",
      educationTitle: "Eğitim",
      currentStudent: "Öğrenci",
      skillsTitle: "Kullandığım Teknolojiler",
      cvTitle: "Özgeçmişim",
      cvSubtitle: "PDF olarak indir",
      certificatesTitle: "Sertifikalar",
      verifyCertificate: "Sertifikayı Doğrula",
      educationList: [
        {
          school: "Bilecik Şeyh Edebali Üniversitesi",
          period: "2026 - Günümüz",
          current: true,
          department: "Elektrik-Elektronik Mühendisliği",
          city: "Bilecik",
          country: "Türkiye",
          description: "Lisans eğitimime Elektrik-Elektronik Mühendisliği bölümünde devam ediyorum.",
        },
        {
          school: "Ertuğrulgazi Lisesi",
          period: "2022 - 2026",
          current: false,
          department: "Sayısal",
          city: "Bilecik",
          country: "Türkiye",
          description: "Lise eğitimimi sayısal alanda başarıyla tamamladım.",
        },
        {
          school: "Deneyap Teknoloji Atölyeleri",
          period: "2022 - 2025",
          current: false,
          department: "Teknoloji & Robotik",
          city: "Bilecik",
          country: "Türkiye",
          description: "Robotik kodlama, elektronik programlama ve yapay zeka alanlarında 3 yıl süren kapsamlı eğitim.",
        },
      ],
      certificatesList: [
        {
          title: "Mobil Uygulama",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/46284815765408/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/46284815765408.png",
        },
        {
          title: "Havacılık ve Uzay",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/94718028006695/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/94718028006695.png",
        },
        {
          title: "Nanoteknoloji",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/73128913915133/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/73128913915133.png",
        },
        {
          title: "Siber Güvenlik",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/90969521776686/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/90969521776686.png",
        },
        {
          title: "Yazılım Teknolojileri",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/55126453824614/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/55126453824614.png",
        },
        {
          title: "İleri Robotik",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/61116175771908/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/61116175771908.png",
        },
        {
          title: "Elektronik Programlama",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/75809686615656/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/75809686615656.png",
        },
        {
          title: "Robotik ve Kodlama",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/52013621048830/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/52013621048830.png",
        },
        {
          title: "Tasarım ve Üretim",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/27701996921054/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/27701996921054.png",
        },
        {
          title: "Yapay Zeka",
          issuedBy: "Deneyap",
          link: "https://drdogrulama.sanayi.gov.tr/tr/verify/29435665655018/",
          image: "https://drdepo.sanayi.gov.tr/verified-bucket/cert/29435665655018.png",
        },
      ],
    },
    projects: {
      titlePrefix: "Tüm",
      titleHighlight: "Projelerim",
      subtitle: "Geliştirdiğim projeler kategorilere ayrılmış şekilde. Detayları görüntülemek için bir kategori seçin.",
      selectCategory: "Bir Kategori Seçin",
      selectCategoryHint: "Yukarıdaki kategorilerden birine tıklayarak projelerimi keşfedebilirsiniz.",
      totalProjects: "Toplam Proje",
      categoriesCount: "Kategori",
      allDetails: "Tüm Detaylar",
      preview: "Önizleme",
      github: "GitHub",
      privateRepo: "Private Repo",
      lastCommit: "Son commit:",
      backToProjects: "Tüm Projeler",
      projectCount: "Proje Sayısı",
      technologiesCount: "Teknolojiler",
      viewProject: "Projeyi Görüntüle",
      badges: {
        new: "✨ Yeni",
        developing: "🚧 Geliştiriliyor",
        archived: "📦 Arşivlendi",
        private: "Private",
      },
    },
    contact: {
      badge: "İletişime Geçin",
      titlePrefix: "Bir Fikriniz mi Var?",
      titleHighlight: "Konuşalım.",
      subtitle: "Proje fikirleri, iş birliği teklifleri veya sadece merhaba demek için mesaj gönderin. En kısa sürede dönüş yapacağım.",
      formTitle: "Mesaj Gönderin",
      namePlaceholder: "Adınız",
      emailPlaceholder: "E-posta adresiniz",
      subjectPlaceholder: "Konu",
      messagePlaceholder: "Mesajınız...",
      submitButton: "Mesajı Gönder",
      submittingButton: "Gönderiliyor...",
      successTitle: "Mesajınız Gönderildi!",
      successSubtitle: "En kısa sürede size dönüş yapacağım. Teşekkürler!",
      sendNewMessage: "Yeni Mesaj Gönder",
      fillAllFields: "Lütfen tüm alanları doldurun.",
      invalidEmail: "Lütfen geçerli bir e-posta adresi girin.",
      connectionError: "Bağlantı hatası. Lütfen tekrar deneyin.",
      sendError: "Mesaj gönderilemedi. Lütfen tekrar deneyin.",
      otherChannels: "Diğer Kanallar",
      otherChannelsSubtitle: "Aşağıdaki platformlardan da bana ulaşabilirsiniz.",
    },
  },
};
