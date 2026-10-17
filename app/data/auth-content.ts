export const AUTH_LANGUAGES = {
  eng: "English",
  tur: "Türkçe",
  deu: "Deutsch",
  spa: "Español",
  fra: "Français",
  por: "Português",
  rus: "Русский",
} as const;

export type AuthLang = keyof typeof AUTH_LANGUAGES;
export type AuthPageSlug = "privacy" | "tos" | "delete-account";

export interface AuthPageMetadata {
  title: string;
  description: string;
}

export interface PrivacyContent {
  metadata: AuthPageMetadata;
  title: string;
  lastUpdated: string;
  intro: string[];
  sections: {
    section1: {
      title: string;
      intro: string;
      googleItems: { label: string; text: string }[];
      passwordNotice: string;
      telemetryNotice: string;
      telemetryItems: { label: string; text: string }[];
    };
    section2: {
      title: string;
      items: { text: string; legalBasis: string }[];
    };
    section3: {
      title: string;
      paragraphs: string[];
    };
    section4: {
      title: string;
      intro: string;
      providers: {
        name: string;
        url: string;
        description: string;
        role: string;
        extraNotice?: {
          text: string;
          linkText: string;
          url: string;
          suffix: string;
        };
      }[];
    };
    section5: {
      title: string;
      intro: string;
      items: string[];
    };
    section6: {
      title: string;
      text: string;
    };
    section7: {
      title: string;
      paragraphs: string[];
      contact: {
        prefix: string;
        email: string;
        suffix: string;
      };
    };
    section8: {
      title: string;
      intro: string;
      rights: {
        text: string;
        link?: {
          prefix: string;
          label: string;
          suffix: string;
        };
      }[];
      notice: string;
    };
    section9: {
      title: string;
      text: string;
    };
    section10: {
      title: string;
      text: string;
      email: string;
    };
  };
}

export interface TosContent {
  metadata: AuthPageMetadata;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: {
    section1: {
      title: string;
      text: string;
    };
    section2: {
      title: string;
      intro: string;
      items: {
        text: string;
        emailLink?: {
          prefix: string;
          email: string;
          suffix: string;
        };
      }[];
    };
    section3: {
      title: string;
      intro: string;
      items: string[];
    };
    section4: {
      title: string;
      text: string;
    };
    section5: {
      title: string;
      intro: string;
      items: string[];
    };
    section6: {
      title: string;
      intro: string;
      items: string[];
    };
    section7: {
      title: string;
      textBeforeEmail: string;
      email: string;
      textBetween: string;
      deleteLinkText: string;
      textAfterDeleteLink: string;
    };
    section8: {
      title: string;
      paragraphs: string[];
    };
    section9: {
      title: string;
      textBeforeLink: string;
      privacyLinkText: string;
      textAfterLink: string;
      paragraph2: string;
    };
    section10: {
      title: string;
      text: string;
    };
    section11: {
      title: string;
      text: string;
    };
    section12: {
      title: string;
      textBeforeEmail: string;
      email: string;
      textAfterEmail: string;
    };
  };
}

export interface DeleteAccountContent {
  metadata: AuthPageMetadata;
  title: string;
  lastUpdated: string;
  intro: string;
  howTo: {
    title: string;
    intro: string;
    emailBoxTitle: string;
    email: string;
    emailSubject: string;
    warningTitle: string;
    warningText: string;
  };
  whatDeleted: {
    title: string;
    intro: string;
    items: string[];
    notice: string;
  };
  processingTime: {
    title: string;
    text: string;
  };
  contact: {
    title: string;
    textBeforeEmail: string;
    email: string;
    textAfterEmail: string;
  };
}

export interface AuthContentData {
  privacy: Record<AuthLang, PrivacyContent>;
  tos: Record<AuthLang, TosContent>;
  "delete-account": Record<AuthLang, DeleteAccountContent>;
}

export const authContent: AuthContentData = {
  privacy: {
    tur: {
      metadata: {
        title: "Gizlilik Politikası – Kerem Kuyucu Auth",
        description:
          "Kerem Kuyucu ortak kimlik doğrulama hizmetini kullanan tüm uygulamalar için gizlilik politikası.",
      },
      title: "Gizlilik Politikası",
      lastUpdated: "Son Güncelleme: 17 Ekim 2026",
      intro: [
        "Bu Gizlilik Politikası, Kerem Kuyucu'nun (\"biz\", \"bizim\") tüm uygulamalarında kullanılan ortak kimlik doğrulama hizmeti aracılığıyla giriş yaptığınızda kişisel bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.",
        "Bu Gizlilik Politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Genel Veri Koruma Tüzüğü (GDPR) kapsamında veri sorumlusu olarak aydınlatma yükümlülüğümüzün yerine getirilmesi amacıyla hazırlanmıştır.",
      ],
      sections: {
        section1: {
          title: "1. Topladığımız Bilgiler",
          intro: "Google ile giriş yaptığınızda, Google hesabınızdan aşağıdaki bilgileri alırız:",
          googleItems: [
            {
              label: "E-posta adresi:",
              text: "Hesap tanımlama ve kimlik doğrulama için kullanılır.",
            },
            {
              label: "Görünen ad / Kullanıcı adı:",
              text: "Kullandığınız uygulamalarda sizi tanımlamak için kullanılır (örn. skor tabloları, profiller).",
            },
            {
              label: "Profil fotoğrafı (isteğe bağlı):",
              text: "Google hesabınız tarafından sağlanmışsa, yalnızca görüntüleme amacıyla kullanılır.",
            },
          ],
          passwordNotice:
            "Şifre toplamıyor veya depolamıyoruz. Kimlik doğrulama tamamen Google ile Giriş (OAuth 2.0) üzerinden gerçekleştirilmektedir.",
          telemetryNotice:
            "Ayrıca güvenlik, hata ayıklama ve hizmet iyileştirme amacıyla tüm platformlarımızda (Web, Android ve Windows) aşağıdaki teknik telemetri verileri toplanabilir:",
          telemetryItems: [
            {
              label: "Kullanıcı / Cihaz Belirteci (UID):",
              text: "Tüm platformlarda (Web, Android, Windows) standart olarak; kurulumda üretilen tekil UUID v4 belirteci ve oturum açıldığında atanan Supabase Kullanıcı Kimliği (UID).",
            },
            {
              label: "IP Adresi:",
              text: "Güvenlik, sahte erişimleri önleme ve istek yönetimi amacıyla tüm platformlardan iletilen ağ IP adresi.",
            },
            {
              label: "İstemci Bilgisi (User-Agent):",
              text: "Web ortamında standart tarayıcı ve işletim sistemi bilgisi; Android ve Windows uygulamalarında ise uygulamanın çalışma ortamına ait istemci bilgisi (ör. Dart/HTTP istemci başlığı).",
            },
          ],
        },
        section2: {
          title: "2. Bilgilerinizi Nasıl Kullanırız",
          items: [
            {
              text: "Uygulamalarımız genelinde hesabınızı oluşturmak ve yönetmek için; Google üzerinden giriş yaptığınızda kimliğinizi doğrulamak için.",
              legalBasis: "Hukuki dayanak: Sözleşmenin İfası – GDPR Madde 6(1)(b) / KVKK Madde 5(2)(c)",
            },
            {
              text: "Skor tabloları ve uygulamalar arası profiller gibi özellikleri etkinleştirmek için.",
              legalBasis: "Hukuki dayanak: Sözleşmenin İfası – GDPR Madde 6(1)(b) / KVKK Madde 5(2)(c)",
            },
            {
              text: "Sahte veya yetkisiz erişimi tespit etmek ve önlemek, hata ayıklama ve güvenlik logları için.",
              legalBasis: "Hukuki dayanak: Meşru Menfaat – GDPR Madde 6(1)(f) / KVKK Madde 5(2)(f)",
            },
            {
              text: "Geçerli yasal yükümlülüklere uymak için.",
              legalBasis: "Hukuki dayanak: Hukuki Yükümlülük – GDPR Madde 6(1)(c) / KVKK Madde 5(2)(ç)",
            },
          ],
        },
        section3: {
          title: "3. Veri Depolama, Güvenlik ve Yurt Dışına Aktarım",
          paragraphs: [
            "Tüm veriler, Supabase veritabanı altyapısının Avrupa Birliği sınırları içerisindeki (AWS İrlanda) güvenli veri merkezlerinde barındırılmaktadır.",
            "Türkiye'de ikamet eden kullanıcılar için: Kimlik ve telemetri verileriniz, sistemin işletilmesi ve barındırılması amacıyla 6698 sayılı KVKK kapsamında yurt dışındaki (AB bölgesi) güvenli sunuculara aktarılmaktadır.",
            "Veritabanı güvenliği için Satır Düzeyi Güvenlik (Row Level Security – RLS) politikaları uygulanmakta olup, aktarım halindeki tüm veriler HTTPS/TLS şifrelemesi ile korunmaktadır.",
            "Hesabınız aktif olduğu sürece veriler saklanır; hesap silindiğinde Supabase üzerinden 30 gün içinde kalıcı olarak kaldırılır. Güvenlik ve sistem logları en fazla 90 gün tutulur.",
          ],
        },
        section4: {
          title: "4. Üçüncü Taraf Hizmet Sağlayıcılar",
          intro:
            "Kimlik doğrulama sistemimizi işletmek için aşağıdaki üçüncü taraf hizmetleri kullanmaktayız. Bu sağlayıcılar, kişisel bilgilerinize yalnızca adımıza görevleri yerine getirmek için erişebilir ve başka amaçlarla ifşa etmeme yükümlülüğü altındadır.",
          providers: [
            {
              name: "Supabase",
              url: "https://supabase.com/privacy",
              description: "Kimlik doğrulama ve veritabanı altyapısı.",
              role: "Rolü: Veri İşleyen / Data Processor",
            },
            {
              name: "Google (Google ile Giriş)",
              url: "https://policies.google.com/privacy",
              description: "OAuth 2.0 giriş sağlayıcısı.",
              role: "Rolü: Bağımsız Kimlik Sağlayıcı",
              extraNotice: {
                text: "Google ile giriş yaparak ",
                linkText: "Google'ın Gizlilik Politikasını",
                url: "https://policies.google.com/privacy",
                suffix: " da kabul etmiş olursunuz.",
              },
            },
          ],
        },
        section5: {
          title: "5. Veri Paylaşımı",
          intro:
            "Kişisel bilgilerinizi üçüncü taraflara satmıyor, takas etmiyor veya kiralamıyoruz. Verileriniz yalnızca aşağıdaki sınırlı durumlarda paylaşılabilir:",
          items: [
            "Yalnızca kimlik doğrulama hizmetini işletmek amacıyla yukarıda listelenen hizmet sağlayıcılarla.",
            "Yasa, yönetmelik veya geçerli bir yasal sürecin gerektirmesi durumunda.",
            "Kerem Kuyucu veya kullanıcılarımızın haklarını, mülkünü veya güvenliğini korumak amacıyla.",
          ],
        },
        section6: {
          title: "6. Günlük Verileri",
          text: "Bir hata veya güvenlik olayı durumunda sunucularımız otomatik olarak IP adresiniz, tarayıcı türünüz, istek tarihi ve saati ile ziyaret edilen sayfalar gibi Günlük Verilerini toplayabilir. Bu bilgiler yalnızca güvenlik izleme ve hata ayıklama amacıyla kullanılır.",
        },
        section7: {
          title: "7. Çocukların Gizliliği",
          paragraphs: [
            "Uygulamalarımız PEGI 3 derecelendirmesine sahip olup her yaşa uygun şekilde tasarlanmıştır. Giriş yalnızca Google ile Giriş aracılığıyla yapılmaktadır; bu nedenle hizmete erişmek için geçerli bir Google hesabına sahip olunması gerekmektedir. Küçüklerin hesap uygunluğuna ilişkin Google'ın kendi politikaları geçerlidir.",
            "Google ile Giriş akışı dışında bilerek hiçbir kişisel bilgi toplamıyoruz.",
          ],
          contact: {
            prefix: "Çocuğunuzun uygulamalarımızı kullanımı hakkında endişeleriniz varsa ",
            email: "help@keremkuyucu.com.tr",
            suffix: " adresinden bizimle iletişime geçebilirsiniz.",
          },
        },
        section8: {
          title: "8. Haklarınız (KVKK ve GDPR Kapsamında)",
          intro: "6698 sayılı KVKK Madde 11 ve GDPR Madde 15–22 kapsamında aşağıdaki haklara sahipsiniz:",
          rights: [
            { text: "Hakkınızda tuttuğumuz kişisel verilere erişim (Erişim Hakkı)." },
            { text: "Yanlış verilerin düzeltilmesini talep etme (Düzeltme Hakkı)." },
            {
              text: "Hesabınızın ve ilgili tüm verilerinizin silinmesini talep etme (Silme / Unutulma Hakkı). Bu talebi e-posta yoluyla iletebilir ya da ",
              link: {
                prefix: "",
                label: "Hesap ve Veri Silme",
                suffix: " sayfamızı ziyaret edebilirsiniz.",
              },
            },
            { text: "Verilerinizin belirli kullanımlarına itiraz etme veya kısıtlama talep etme (İtiraz Hakkı)." },
            {
              text: "Verilerinizin yapılandırılmış ve makinece okunabilir bir formatta (JSON vb.) tarafınıza iletilmesini talep etme (Veri Taşınabilirliği Hakkı).",
            },
          ],
          notice: "Talepler, KVKK ve GDPR uyarınca en geç 30 gün içinde ücretsiz olarak sonuçlandırılır.",
        },
        section9: {
          title: "9. Bu Gizlilik Politikasındaki Değişiklikler",
          text: "Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Değişiklikler bu sayfada yayımlandıktan hemen sonra yürürlüğe girer. Bu sayfayı periyodik olarak incelemenizi öneririz. Herhangi bir değişikliğin ardından hizmetlerimizi kullanmaya devam etmeniz, yeni politikayı kabul ettiğiniz anlamına gelir.",
        },
        section10: {
          title: "10. İletişim",
          text: "Bu Gizlilik Politikası hakkında soru veya endişeleriniz için ",
          email: "help@keremkuyucu.com.tr",
        },
      },
    },
    eng: {
      metadata: {
        title: "Privacy Policy – Kerem Kuyucu Auth",
        description:
          "Privacy policy for all applications using the Kerem Kuyucu shared authentication service.",
      },
      title: "Privacy Policy",
      lastUpdated: "Last Updated: October 17, 2026",
      intro: [
        "This Privacy Policy describes how Kerem Kuyucu (\"we\", \"us\", or \"our\") collects, uses, and protects your personal information when you sign in through our shared authentication service used across all our applications.",
        "This Privacy Policy has been prepared to fulfil our disclosure obligations as the data controller under the Turkish Personal Data Protection Law No. 6698 (KVKK) and the General Data Protection Regulation (GDPR).",
      ],
      sections: {
        section1: {
          title: "1. Information We Collect",
          intro: "When you sign in with Google, we receive the following information from your Google account:",
          googleItems: [
            {
              label: "Email address:",
              text: "Used for account identification and authentication.",
            },
            {
              label: "Display name / Username:",
              text: "Used to identify you within the applications you use (e.g., leaderboards, profiles).",
            },
            {
              label: "Profile picture (optional):",
              text: "If provided by your Google account, used solely for display purposes.",
            },
          ],
          passwordNotice:
            "We do not collect or store passwords. Authentication is handled entirely through Google Sign-In (OAuth 2.0).",
          telemetryNotice:
            "Additionally, the following technical telemetry data may be collected across all our platforms (Web, Android, and Windows) for security, debugging, and service improvement purposes:",
          telemetryItems: [
            {
              label: "User / Device Identifier (UID):",
              text: "Standard across all platforms (Web, Android, Windows); a unique UUID v4 identifier generated upon setup, and the Supabase User ID (UID) assigned when signing in.",
            },
            {
              label: "IP Address:",
              text: "Transmitted from all platforms for network security, abuse prevention, and request routing.",
            },
            {
              label: "Client Information (User-Agent):",
              text: "Standard browser and operating system details in web environments; runtime client details (e.g., Dart/HTTP client header) in Android and Windows applications.",
            },
          ],
        },
        section2: {
          title: "2. How We Use Your Information",
          items: [
            {
              text: "To create and manage your account across our applications; to authenticate your identity when you sign in via Google.",
              legalBasis: "Legal basis: Contractual Necessity – GDPR Art. 6(1)(b) / KVKK Art. 5(2)(c)",
            },
            {
              text: "To enable features such as leaderboards and cross-app profiles.",
              legalBasis: "Legal basis: Contractual Necessity – GDPR Art. 6(1)(b) / KVKK Art. 5(2)(c)",
            },
            {
              text: "To detect and prevent fraudulent or unauthorized access; for debugging and security logging.",
              legalBasis: "Legal basis: Legitimate Interests – GDPR Art. 6(1)(f) / KVKK Art. 5(2)(f)",
            },
            {
              text: "To comply with applicable legal obligations.",
              legalBasis: "Legal basis: Legal Obligation – GDPR Art. 6(1)(c) / KVKK Art. 5(2)(ç)",
            },
          ],
        },
        section3: {
          title: "3. Data Storage, Security and International Data Transfers",
          paragraphs: [
            "All data is hosted on Supabase infrastructure within secure data centres located in the European Union (AWS Ireland).",
            "For users residing in Turkey: identity and telemetry data is transferred to secure servers outside Turkey (EU region) for the purpose of operating and hosting the service, in accordance with the Turkish Personal Data Protection Law No. 6698 (KVKK).",
            "Row Level Security (RLS) policies are enforced at the database level, and all data in transit is protected with HTTPS/TLS encryption.",
            "Your data is retained for as long as your account remains active. Upon account deletion, data is permanently removed from Supabase within 30 days. Security and system logs are retained for a maximum of 90 days.",
          ],
        },
        section4: {
          title: "4. Third-Party Service Providers",
          intro:
            "We use the following third-party services to operate our authentication system. These providers may have access to your personal information only to perform tasks on our behalf and are obligated not to disclose or use it for any other purpose.",
          providers: [
            {
              name: "Supabase",
              url: "https://supabase.com/privacy",
              description: "Authentication and database infrastructure.",
              role: "Role: Data Processor",
            },
            {
              name: "Google (Sign in with Google)",
              url: "https://policies.google.com/privacy",
              description: "OAuth 2.0 sign-in provider.",
              role: "Role: Independent Identity Provider",
              extraNotice: {
                text: "By signing in with Google, you are also subject to ",
                linkText: "Google's Privacy Policy",
                url: "https://policies.google.com/privacy",
                suffix: ".",
              },
            },
          ],
        },
        section5: {
          title: "5. Data Sharing",
          intro:
            "We do not sell, trade, or rent your personal information to third parties. Your data may only be shared in the following limited circumstances:",
          items: [
            "With service providers listed above, solely to operate the authentication service.",
            "If required by law, regulation, or a valid legal process.",
            "To protect the rights, property, or safety of Kerem Kuyucu or our users.",
          ],
        },
        section6: {
          title: "6. Log Data",
          text: "In the event of an error or security event, our servers may automatically collect Log Data such as your IP address, browser type, the time and date of your request, and the pages visited. This information is used solely for security monitoring and debugging purposes.",
        },
        section7: {
          title: "7. Children's Privacy",
          paragraphs: [
            "Our applications are rated PEGI 3 and are designed to be suitable for all ages. Sign-in is handled exclusively through Google Sign-In, which means users must have a valid Google account to access the service. Google's own policies apply regarding account eligibility for minors.",
            "We do not knowingly collect any personal information beyond what is provided through the Google Sign-In flow.",
          ],
          contact: {
            prefix: "If you are a parent or guardian and have concerns about your child's use of our applications, please contact us at ",
            email: "help@keremkuyucu.com.tr",
            suffix: ".",
          },
        },
        section8: {
          title: "8. Your Rights (Under GDPR and Turkish KVKK)",
          intro: "Under GDPR Articles 15–22 and Turkish KVKK Article 11, you have the following rights:",
          rights: [
            { text: "Access the personal data we hold about you (Right of Access)." },
            { text: "Request correction of inaccurate data (Right to Rectification)." },
            {
              text: "Request deletion of your account and all associated data (Right to Erasure). You can submit this request via email or visit our ",
              link: {
                prefix: "",
                label: "Account & Data Deletion",
                suffix: " page.",
              },
            },
            { text: "Object to or restrict certain uses of your data (Right to Object / Restriction)." },
            {
              text: "Request that your data be provided to you in a structured, machine-readable format (e.g. JSON) (Right to Data Portability).",
            },
          ],
          notice: "Requests are processed free of charge within 30 days at the latest, in accordance with GDPR and KVKK.",
        },
        section9: {
          title: "9. Changes to This Privacy Policy",
          text: "We may update this Privacy Policy from time to time. Changes are effective immediately upon being posted on this page. We encourage you to review this page periodically. Your continued use of our services after any changes constitutes your acceptance of the new policy.",
        },
        section10: {
          title: "10. Contact Us",
          text: "If you have any questions or concerns about this Privacy Policy, please contact us at ",
          email: "help@keremkuyucu.com.tr",
        },
      },
    },
    deu: {
      metadata: {
        title: "Datenschutzerklärung – Kerem Kuyucu Auth",
        description:
          "Datenschutzerklärung für alle Anwendungen, die den gemeinsamen Authentifizierungsdienst von Kerem Kuyucu nutzen.",
      },
      title: "Datenschutzerklärung",
      lastUpdated: "Zuletzt aktualisiert: 17. Oktober 2026",
      intro: [
        "Diese Datenschutzerklärung erläutert, wie Kerem Kuyucu (\"wir\", \"uns\" oder \"unser\") Ihre personenbezogenen Daten erfasst, verwendet und schützt, wenn Sie sich über unseren gemeinsamen Authentifizierungsdienst anmelden, der in allen unseren Anwendungen genutzt wird.",
        "Diese Datenschutzerklärung wurde erstellt, um unseren Informationspflichten als Verantwortlicher gemäß dem türkischen Datenschutzgesetz Nr. 6698 (KVKK) und der Datenschutz-Grundverordnung (DSGVO) nachzukommen.",
      ],
      sections: {
        section1: {
          title: "1. Von uns erfasste Daten",
          intro: "Wenn Sie sich mit Google anmelden, erhalten wir die folgenden Informationen von Ihrem Google-Konto:",
          googleItems: [
            {
              label: "E-Mail-Adresse:",
              text: "Wird zur Kontenidentifizierung und Authentifizierung verwendet.",
            },
            {
              label: "Anzeigename / Benutzername:",
              text: "Wird verwendet, um Sie innerhalb der genutzten Anwendungen zu identifizieren (z. B. Bestenlisten, Profile).",
            },
            {
              label: "Profilbild (optional):",
              text: "Sofern von Ihrem Google-Konto bereitgestellt, wird es ausschließlich zu Anzeigezwecken verwendet.",
            },
          ],
          passwordNotice:
            "Wir erfassen oder speichern keine Passwörter. Die Authentifizierung erfolgt ausschließlich über Google Sign-In (OAuth 2.0).",
          telemetryNotice:
            "Darüber hinaus können zu Sicherheits-, Debugging- und Serviceverbesserungszwecken auf allen unseren Plattformen (Web, Android und Windows) folgende technische Telemetriedaten erfasst werden:",
          telemetryItems: [
            {
              label: "Benutzer- / Gerätekennung (UID):",
              text: "Standard auf allen Plattformen (Web, Android, Windows); eine bei der Einrichtung generierte eindeutige UUID-v4-Kennung und die beim Anmelden zugewiesene Supabase-Benutzer-ID (UID).",
            },
            {
              label: "IP-Adresse:",
              text: "Wird von allen Plattformen zur Netzwerksicherheit, Missbrauchsprävention und Anforderungssteuerung übermittelt.",
            },
            {
              label: "Client-Informationen (User-Agent):",
              text: "Standardmäßige Browser- und Betriebssystemdetails in Webumgebungen; Laufzeit-Clientdetails (z. B. Dart/HTTP-Client-Header) in Android- und Windows-Anwendungen.",
            },
          ],
        },
        section2: {
          title: "2. Wie wir Ihre Daten verwenden",
          items: [
            {
              text: "Um Ihr Konto über alle unsere Anwendungen hinweg zu erstellen und zu verwalten; um Ihre Identität bei der Anmeldung über Google zu überprüfen.",
              legalBasis: "Rechtsgrundlage: Vertragserfüllung – DSGVO Art. 6(1)(b) / KVKK Art. 5(2)(c)",
            },
            {
              text: "Um Funktionen wie Bestenlisten und anwendungsübergreifende Profile bereitzustellen.",
              legalBasis: "Rechtsgrundlage: Vertragserfüllung – DSGVO Art. 6(1)(b) / KVKK Art. 5(2)(c)",
            },
            {
              text: "Um betrügerische oder unbefugte Zugriffe zu erkennen und zu verhindern; für Debugging und Sicherheitsprotokollierung.",
              legalBasis: "Rechtsgrundlage: Berechtigte Interessen – DSGVO Art. 6(1)(f) / KVKK Art. 5(2)(f)",
            },
            {
              text: "Zur Erfüllung geltender rechtlicher Verpflichtungen.",
              legalBasis: "Rechtsgrundlage: Rechtliche Verpflichtung – DSGVO Art. 6(1)(c) / KVKK Art. 5(2)(ç)",
            },
          ],
        },
        section3: {
          title: "3. Datenspeicherung, Sicherheit und internationale Datenübermittlung",
          paragraphs: [
            "Alle Daten werden auf der Supabase-Infrastruktur in sicheren Rechenzentren innerhalb der Europäischen Union (AWS Irland) gehostet.",
            "Für Nutzer mit Wohnsitz in der Türkei: Identitäts- und Telemetriedaten werden gemäß dem türkischen Datenschutzgesetz Nr. 6698 (KVKK) zum Betrieb und Hosting des Dienstes auf sichere Server außerhalb der Türkei (EU-Region) übertragen.",
            "Auf Datenbankebene werden Row-Level-Security-Richtlinien (RLS) durchgesetzt, und alle Daten bei der Übertragung sind durch HTTPS/TLS-Verschlüsselung geschützt.",
            "Ihre Daten werden so lange aufbewahrt, wie Ihr Konto aktiv bleibt. Nach der Kontolöschung werden die Daten innerhalb von 30 Tagen dauerhaft aus Supabase entfernt. Sicherheits- und Systemprotokolle werden maximal 90 Tage aufbewahrt.",
          ],
        },
        section4: {
          title: "4. Drittanbieter-Dienstleister",
          intro:
            "Wir nutzen die folgenden Drittanbieterdienste zum Betrieb unseres Authentifizierungssystems. Diese Anbieter haben nur Zugriff auf Ihre personenbezogenen Daten, um Aufgaben in unserem Auftrag auszuführen, und sind verpflichtet, diese nicht weiterzugeben oder zu anderen Zwecken zu verwenden.",
          providers: [
            {
              name: "Supabase",
              url: "https://supabase.com/privacy",
              description: "Authentifizierungs- und Datenbankinfrastruktur.",
              role: "Rolle: Auftragsverarbeiter / Data Processor",
            },
            {
              name: "Google (Google Sign-In)",
              url: "https://policies.google.com/privacy",
              description: "OAuth 2.0-Anmeldeanbieter.",
              role: "Rolle: Unabhängiger Identitätsanbieter",
              extraNotice: {
                text: "Mit der Anmeldung über Google stimmen Sie auch den ",
                linkText: "Datenschutzbestimmungen von Google",
                url: "https://policies.google.com/privacy",
                suffix: " zu.",
              },
            },
          ],
        },
        section5: {
          title: "5. Datenweitergabe",
          intro:
            "Wir verkaufen, tauschen oder vermieten Ihre personenbezogenen Daten nicht an Dritte. Ihre Daten dürfen nur unter folgenden begrenzten Umständen weitergegeben werden:",
          items: [
            "Ausschließlich mit den oben aufgeführten Dienstleistern zum Betrieb des Authentifizierungsdienstes.",
            "Sofern gesetzlich, behördlich oder im Rahmen eines gerichtlichen Verfahrens vorgeschrieben.",
            "Zum Schutz der Rechte, des Eigentums oder der Sicherheit von Kerem Kuyucu oder unseren Nutzern.",
          ],
        },
        section6: {
          title: "6. Protokolldaten",
          text: "Im Falle eines Fehlers oder Sicherheitsvorfalls erfassen unsere Server automatisch Protokolldaten wie Ihre IP-Adresse, den Browsertyp, das Datum und die Uhrzeit Ihrer Anfrage sowie die besuchten Seiten. Diese Informationen werden ausschließlich zur Sicherheitsüberwachung und Fehlerbehebung verwendet.",
        },
        section7: {
          title: "7. Datenschutz für Kinder",
          paragraphs: [
            "Unsere Anwendungen sind mit PEGI 3 eingestuft und für alle Altersgruppen geeignet. Die Anmeldung erfolgt ausschließlich über Google Sign-In, sodass Nutzer über ein gültiges Google-Konto verfügen müssen. Hinsichtlich der Kontoberechtigung von Minderjährigen gelten die Richtlinien von Google.",
            "Wir erfassen wissentlich keine personenbezogenen Daten über die im Rahmen der Google-Anmeldung bereitgestellten Daten hinaus.",
          ],
          contact: {
            prefix: "Wenn Sie als Elternteil oder Erziehungsberechtigter Bedenken hinsichtlich der Nutzung durch Ihr Kind haben, kontaktieren Sie uns bitte unter ",
            email: "help@keremkuyucu.com.tr",
            suffix: ".",
          },
        },
        section8: {
          title: "8. Ihre Rechte (gemäß DSGVO und türkischem KVKK)",
          intro: "Gemäß Art. 15–22 DSGVO und Art. 11 des türkischen KVKK stehen Ihnen folgende Rechte zu:",
          rights: [
            { text: "Auskunft über die von uns gespeicherten personenbezogenen Daten (Recht auf Auskunft)." },
            { text: "Berichtigung unrichtiger Daten verlangen (Recht auf Berichtigung)." },
            {
              text: "Löschung Ihres Kontos und aller zugehörigen Daten verlangen (Recht auf Löschung). Sie können diesen Antrag per E-Mail stellen oder unsere Seite zur ",
              link: {
                prefix: "",
                label: "Konto- und Datenlöschung",
                suffix: " besuchen.",
              },
            },
            { text: "Widerspruch gegen bestimmte Verwendungen Ihrer Daten einlegen oder deren Einschränkung verlangen (Recht auf Widerspruch / Einschränkung)." },
            {
              text: "Verlangen, dass Ihnen Ihre Daten in einem strukturierten, maschinenlesbaren Format (z. B. JSON) bereitgestellt werden (Recht auf Datenübertragbarkeit).",
            },
          ],
          notice: "Anfragen werden gemäß DSGVO und KVKK spätestens innerhalb von 30 Tagen kostenlos bearbeitet.",
        },
        section9: {
          title: "9. Änderungen dieser Datenschutzerklärung",
          text: "Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Änderungen treten sofort mit der Veröffentlichung auf dieser Seite in Kraft. Wir empfehlen Ihnen, diese Seite regelmäßig zu überprüfen. Ihre fortgesetzte Nutzung nach Änderungen gilt als Zustimmung zur aktualisierten Richtlinie.",
        },
        section10: {
          title: "10. Kontakt",
          text: "Bei Fragen oder Bedenken zu dieser Datenschutzerklärung kontaktieren Sie uns bitte unter ",
          email: "help@keremkuyucu.com.tr",
        },
      },
    },
    spa: {
      metadata: {
        title: "Política de privacidad – Kerem Kuyucu Auth",
        description:
          "Política de privacidad para todas las aplicaciones que utilizan el servicio de autenticación compartida de Kerem Kuyucu.",
      },
      title: "Política de privacidad",
      lastUpdated: "Última actualización: 17 de octubre de 2026",
      intro: [
        "Esta Política de privacidad describe cómo Kerem Kuyucu (\"nosotros\", \"nos\" o \"nuestro\") recopila, utiliza y protege su información personal cuando inicia sesión a través de nuestro servicio compartido de autenticación utilizado en todas nuestras aplicaciones.",
        "Esta Política de privacidad se ha elaborado para cumplir con nuestras obligaciones de información como responsable del tratamiento en virtud de la Ley de Protección de Datos Personales de Turquía N.º 6698 (KVKK) y el Reglamento General de Protección de Datos (RGPD).",
      ],
      sections: {
        section1: {
          title: "1. Información que recopilamos",
          intro: "Cuando inicia sesión con Google, recibimos la siguiente información de su cuenta de Google:",
          googleItems: [
            {
              label: "Dirección de correo electrónico:",
              text: "Se utiliza para la identificación y autenticación de la cuenta.",
            },
            {
              label: "Nombre para mostrar / Nombre de usuario:",
              text: "Se utiliza para identificarle en las aplicaciones que utiliza (p. ej., tablas de clasificación, perfiles).",
            },
            {
              label: "Foto de perfil (opcional):",
              text: "Si la proporciona su cuenta de Google, se utiliza exclusivamente para fines de visualización.",
            },
          ],
          passwordNotice:
            "No recopilamos ni almacenamos contraseñas. La autenticación se realiza exclusivamente a través de Iniciar sesión con Google (OAuth 2.0).",
          telemetryNotice:
            "Además, para fines de seguridad, depuración y mejora del servicio, se pueden recopilar los siguientes datos técnicos de telemetría en todas nuestras plataformas (Web, Android y Windows):",
          telemetryItems: [
            {
              label: "Identificador de usuario / dispositivo (UID):",
              text: "Estándar en todas las plataformas (Web, Android, Windows); un identificador único UUID v4 generado en la configuración y el ID de usuario de Supabase (UID) asignado al iniciar sesión.",
            },
            {
              label: "Dirección IP:",
              text: "Transmitida desde todas las plataformas para la seguridad de la red, la prevención de abusos y el enrutamiento de solicitudes.",
            },
            {
              label: "Información del cliente (User-Agent):",
              text: "Detalles estándar del navegador y del sistema operativo en entornos web; detalles del cliente en tiempo de ejecución (p. ej., encabezado de cliente Dart/HTTP) en aplicaciones de Android y Windows.",
            },
          ],
        },
        section2: {
          title: "2. Cómo utilizamos su información",
          items: [
            {
              text: "Para crear y administrar su cuenta en todas nuestras aplicaciones; para verificar su identidad cuando inicia sesión con Google.",
              legalBasis: "Base legal: Ejecución contractual – RGPD Art. 6(1)(b) / KVKK Art. 5(2)(c)",
            },
            {
              text: "Para habilitar funciones como tablas de clasificación y perfiles entre aplicaciones.",
              legalBasis: "Base legal: Ejecución contractual – RGPD Art. 6(1)(b) / KVKK Art. 5(2)(c)",
            },
            {
              text: "Para detectar y prevenir accesos fraudulentos o no autorizados; para depuración y registros de seguridad.",
              legalBasis: "Base legal: Interés legítimo – RGPD Art. 6(1)(f) / KVKK Art. 5(2)(f)",
            },
            {
              text: "Para cumplir con las obligaciones legales aplicables.",
              legalBasis: "Base legal: Obligación legal – RGPD Art. 6(1)(c) / KVKK Art. 5(2)(ç)",
            },
          ],
        },
        section3: {
          title: "3. Almacenamiento de datos, seguridad y transferencias internacionales",
          paragraphs: [
            "Todos los datos se alojan en la infraestructura de Supabase en centros de datos seguros ubicados en la Unión Europea (AWS Irlanda).",
            "Para usuarios residentes en Turquía: los datos de identidad y telemetría se transfieren a servidores seguros fuera de Turquía (región de la UE) con el fin de operar y alojar el servicio, de conformidad con la Ley de Protección de Datos Personales N.º 6698 (KVKK).",
            "Se aplican políticas de seguridad a nivel de fila (RLS) en la base de datos, y todos los datos en tránsito están protegidos mediante cifrado HTTPS/TLS.",
            "Sus datos se conservan mientras su cuenta permanezca activa. Tras la eliminación de la cuenta, los datos se eliminan permanentemente de Supabase en un plazo de 30 días. Los registros del sistema y de seguridad se conservan durante un máximo de 90 días.",
          ],
        },
        section4: {
          title: "4. Proveedores de servicios terceros",
          intro:
            "Utilizamos los siguientes servicios de terceros para operar nuestro sistema de autenticación. Estos proveedores tienen acceso a su información personal únicamente para realizar tareas en nuestro nombre y están obligados a no divulgarla ni utilizarla para ningún otro fin.",
          providers: [
            {
              name: "Supabase",
              url: "https://supabase.com/privacy",
              description: "Infraestructura de autenticación y base de datos.",
              role: "Rol: Encargado del tratamiento / Data Processor",
            },
            {
              name: "Google (Iniciar sesión con Google)",
              url: "https://policies.google.com/privacy",
              description: "Proveedor de inicio de sesión OAuth 2.0.",
              role: "Rol: Proveedor de identidad independiente",
              extraNotice: {
                text: "Al iniciar sesión con Google, también acepta la ",
                linkText: "Política de privacidad de Google",
                url: "https://policies.google.com/privacy",
                suffix: ".",
              },
            },
          ],
        },
        section5: {
          title: "5. Compartición de datos",
          intro:
            "No vendemos, intercambiamos ni alquilamos su información personal a terceros. Sus datos solo se podrán compartir en las siguientes circunstancias limitadas:",
          items: [
            "Únicamente con los proveedores de servicios indicados arriba para operar el servicio de autenticación.",
            "Si así lo exige la ley, un reglamento o un proceso judicial válido.",
            "Para proteger los derechos, la propiedad o la seguridad de Kerem Kuyucu o de nuestros usuarios.",
          ],
        },
        section6: {
          title: "6. Datos de registro",
          text: "En caso de error o evento de seguridad, nuestros servidores pueden recopilar automáticamente datos de registro como su dirección IP, tipo de navegador, fecha y hora de la solicitud y páginas visitadas. Esta información se utiliza únicamente con fines de depuración y supervisión de seguridad.",
        },
        section7: {
          title: "7. Privacidad infantil",
          paragraphs: [
            "Nuestras aplicaciones tienen clasificación PEGI 3 y están diseñadas para todas las edades. El inicio de sesión se gestiona exclusivamente a través de Google Sign-In, lo que significa que los usuarios deben disponer de una cuenta válida de Google. Se aplican las políticas de Google relativas a menores de edad.",
            "No recopilamos conscientemente ninguna información personal más allá de la proporcionada en el inicio de sesión con Google.",
          ],
          contact: {
            prefix: "Si es padre o tutor y tiene inquietudes sobre el uso de nuestras aplicaciones por parte de su hijo, contáctenos en ",
            email: "help@keremkuyucu.com.tr",
            suffix: ".",
          },
        },
        section8: {
          title: "8. Sus derechos (en virtud del RGPD y de la ley turca KVKK)",
          intro: "En virtud de los Artículos 15–22 del RGPD y el Artículo 11 de la ley turca KVKK, usted tiene los siguientes derechos:",
          rights: [
            { text: "Acceder a los datos personales que conservamos sobre usted (Derecho de acceso)." },
            { text: "Solicitar la corrección de datos inexactos (Derecho de rectificación)." },
            {
              text: "Solicitar la eliminación de su cuenta y de todos los datos asociados (Derecho de supresión). Puede enviar esta solicitud por correo electrónico o visitar nuestra página de ",
              link: {
                prefix: "",
                label: "Eliminación de cuenta y datos",
                suffix: ".",
              },
            },
            { text: "Oponerse a determinados usos de sus datos o solicitar su limitación (Derecho de oposición / limitación)." },
            {
              text: "Solicitar que se le entreguen sus datos en un formato estructurado y de lectura mecánica (p. ej. JSON) (Derecho a la portabilidad de los datos).",
            },
          ],
          notice: "Las solicitudes se tramitan de forma gratuita en un plazo máximo de 30 días, de conformidad con el RGPD y la KVKK.",
        },
        section9: {
          title: "9. Cambios en esta Política de privacidad",
          text: "Podemos actualizar esta Política de privacidad periódicamente. Los cambios entran en vigor inmediatamente después de su publicación en esta página. Le recomendamos revisarla periódicamente. El uso continuado de nuestros servicios tras cualquier modificación constituye la aceptación de la nueva política.",
        },
        section10: {
          title: "10. Contacto",
          text: "Si tiene alguna pregunta o inquietud sobre esta Política de privacidad, contáctenos en ",
          email: "help@keremkuyucu.com.tr",
        },
      },
    },
    fra: {
      metadata: {
        title: "Politique de confidentialité – Kerem Kuyucu Auth",
        description:
          "Politique de confidentialité pour toutes les applications utilisant le service d'authentification partagé de Kerem Kuyucu.",
      },
      title: "Politique de confidentialité",
      lastUpdated: "Dernière mise à jour : 17 octobre 2026",
      intro: [
        "Cette Politique de confidentialité décrit la manière dont Kerem Kuyucu (« nous », « notre » ou « nos ») recueille, utilise et protège vos informations personnelles lorsque vous vous connectez via notre service partagé d'authentification utilisé dans l'ensemble de nos applications.",
        "Cette Politique de confidentialité a été rédigée pour répondre à nos obligations d'information en qualité de responsable du traitement en vertu de la loi turque n° 6698 sur la protection des données personnelles (KVKK) et du Règlement général sur la protection des données (RGPD).",
      ],
      sections: {
        section1: {
          title: "1. Informations que nous recueillons",
          intro: "Lorsque vous vous connectez avec Google, nous recevons les informations suivantes de votre compte Google :",
          googleItems: [
            {
              label: "Adresse e-mail :",
              text: "Utilisée pour l'identification et l'authentification du compte.",
            },
            {
              label: "Nom d'affichage / Nom d'utilisateur :",
              text: "Utilisé pour vous identifier au sein des applications (ex. classements, profils).",
            },
            {
              label: "Photo de profil (facultatif) :",
              text: "Si fournie par votre compte Google, utilisée uniquement à des fins d'affichage.",
            },
          ],
          passwordNotice:
            "Nous ne collectons ni ne stockons de mots de passe. L'authentification s'effectue exclusivement via Connexion avec Google (OAuth 2.0).",
          telemetryNotice:
            "De plus, à des fins de sécurité, de débogage et d'amélioration du service, les données télémétriques suivantes peuvent être collectées sur l'ensemble de nos plateformes (Web, Android et Windows) :",
          telemetryItems: [
            {
              label: "Identifiant utilisateur / appareil (UID) :",
              text: "Standard sur toutes les plateformes (Web, Android, Windows) ; identifiant UUID v4 unique généré lors de la configuration et UID Supabase attribué lors de la connexion.",
            },
            {
              label: "Adresse IP :",
              text: "Transmise depuis toutes les plateformes pour la sécurité du réseau, la prévention des abus et l'acheminement des requêtes.",
            },
            {
              label: "Informations client (User-Agent) :",
              text: "Détails standard du navigateur et du système d'exploitation sur le web ; détails du client d'exécution (ex. en-tête client Dart/HTTP) sous Android et Windows.",
            },
          ],
        },
        section2: {
          title: "2. Utilisation de vos informations",
          items: [
            {
              text: "Pour créer et gérer votre compte dans toutes nos applications ; pour authentifier votre identité lors de votre connexion via Google.",
              legalBasis: "Base légale : Nécessité contractuelle – RGPD Art. 6(1)(b) / KVKK Art. 5(2)(c)",
            },
            {
              text: "Pour activer des fonctionnalités telles que les classements et profils multi-applications.",
              legalBasis: "Base légale : Nécessité contractuelle – RGPD Art. 6(1)(b) / KVKK Art. 5(2)(c)",
            },
            {
              text: "Pour détecter et prévenir les accès frauduleux ou non autorisés ; pour le débogage et la sécurité.",
              legalBasis: "Base légale : Intérêts légitimes – RGPD Art. 6(1)(f) / KVKK Art. 5(2)(f)",
            },
            {
              text: "Pour respecter les obligations légales applicables.",
              legalBasis: "Base légale : Obligation légale – RGPD Art. 6(1)(c) / KVKK Art. 5(2)(ç)",
            },
          ],
        },
        section3: {
          title: "3. Stockage des données, sécurité et transferts internationaux",
          paragraphs: [
            "Toutes les données sont hébergées sur l'infrastructure Supabase dans des centres de données sécurisés situés au sein de l'Union européenne (AWS Irlande).",
            "Pour les utilisateurs résidant en Turquie : les données d'identité et de télémétrie sont transférées vers des serveurs sécurisés hors de Turquie (région UE) pour l'exploitation et l'hébergement du service, conformément à la loi turque n° 6698 (KVKK).",
            "Des politiques de sécurité au niveau des lignes (RLS) sont appliquées sur la base de données, et toutes les données en transit sont protégées par chiffrement HTTPS/TLS.",
            "Vos données sont conservées tant que votre compte reste actif. Dès la suppression du compte, les données sont définitivement supprimées de Supabase dans les 30 jours. Les journaux système et de sécurité sont conservés au maximum 90 jours.",
          ],
        },
        section4: {
          title: "4. Prestataires de services tiers",
          intro:
            "Nous utilisons les services tiers suivants pour faire fonctionner notre système d'authentification. Ces prestataires n'ont accès à vos informations personnelles que pour effectuer des tâches en notre nom et sont tenus de ne pas les divulguer ni les utiliser à d'autres fins.",
          providers: [
            {
              name: "Supabase",
              url: "https://supabase.com/privacy",
              description: "Infrastructure d'authentification et de base de données.",
              role: "Rôle : Sous-traitant / Data Processor",
            },
            {
              name: "Google (Connexion avec Google)",
              url: "https://policies.google.com/privacy",
              description: "Fournisseur de connexion OAuth 2.0.",
              role: "Rôle : Fournisseur d'identité indépendant",
              extraNotice: {
                text: "En vous connectant avec Google, vous acceptez également les ",
                linkText: "Règles de confidentialité de Google",
                url: "https://policies.google.com/privacy",
                suffix: ".",
              },
            },
          ],
        },
        section5: {
          title: "5. Partage des données",
          intro:
            "Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers. Vos données ne peuvent être partagées que dans les circonstances restreintes suivantes :",
          items: [
            "Uniquement avec les prestataires de services énumérés ci-dessus pour exploiter le service d'authentification.",
            "Si la loi, un règlement ou une procédure judiciaire valide l'exige.",
            "Pour protéger les droits, la propriété ou la sécurité de Kerem Kuyucu ou de nos utilisateurs.",
          ],
        },
        section6: {
          title: "6. Données de journal",
          text: "En cas d'erreur ou d'incident de sécurité, nos serveurs peuvent collecter automatiquement des données de journal telles que votre adresse IP, votre type de navigateur, l'heure et la date de votre requête ainsi que les pages visitées. Ces informations servent exclusivement à la surveillance de la sécurité et au débogage.",
        },
        section7: {
          title: "7. Confidentialité des enfants",
          paragraphs: [
            "Nos applications sont classées PEGI 3 et sont conçues pour convenir à tous les âges. La connexion s'effectue exclusivement via Google Sign-In, ce qui signifie que les utilisateurs doivent détenir un compte Google valide. Les politiques de Google concernant les mineurs s'appliquent.",
            "Nous ne collectons sciemment aucune information personnelle au-delà de ce qui est transmis lors de la connexion Google.",
          ],
          contact: {
            prefix: "Si vous êtes parent ou tuteur et avez des préoccupations quant à l'utilisation par votre enfant, veuillez nous contacter à l'adresse ",
            email: "help@keremkuyucu.com.tr",
            suffix: ".",
          },
        },
        section8: {
          title: "8. Vos droits (en vertu du RGPD et du KVKK turc)",
          intro: "En vertu des articles 15–22 du RGPD et de l'article 11 de la loi turque KVKK, vous disposez des droits suivants :",
          rights: [
            { text: "Accéder aux données personnelles que nous détenons à votre sujet (Droit d'accès)." },
            { text: "Demander la rectification de données inexactes (Droit de rectification)." },
            {
              text: "Demander la suppression de votre compte et de toutes les données associées (Droit à l'effacement). Vous pouvez soumettre cette demande par e-mail ou visiter notre page de ",
              link: {
                prefix: "",
                label: "Suppression de compte et données",
                suffix: ".",
              },
            },
            { text: "Vous opposer à certaines utilisations de vos données ou en demander la limitation (Droit d'opposition / limitation)." },
            {
              text: "Demander que vos données vous soient fournies dans un format structuré et lisible par machine (ex. JSON) (Droit à la portabilité des données).",
            },
          ],
          notice: "Les demandes sont traitées gratuitement dans un délai maximum de 30 jours, conformément au RGPD et au KVKK.",
        },
        section9: {
          title: "9. Modifications de cette politique de confidentialité",
          text: "Nous pouvons mettre à jour cette Politique de confidentialité de temps à autre. Les modifications entrent en vigueur immédiatement après leur publication sur cette page. Nous vous encourageons à consulter régulièrement cette page. Votre utilisation continue après toute modification vaut acceptation de la nouvelle politique.",
        },
        section10: {
          title: "10. Nous contacter",
          text: "Pour toute question ou préoccupation relative à cette Politique de confidentialité, contactez-nous à ",
          email: "help@keremkuyucu.com.tr",
        },
      },
    },
    por: {
      metadata: {
        title: "Política de Privacidade – Kerem Kuyucu Auth",
        description:
          "Política de privacidade para todos os aplicativos que utilizam o serviço de autenticação compartilhada de Kerem Kuyucu.",
      },
      title: "Política de Privacidade",
      lastUpdated: "Última atualização: 17 de outubro de 2026",
      intro: [
        "Esta Política de Privacidade descreve como Kerem Kuyucu (\"nós\", \"nosso\" ou \"nossos\") coleta, usa e protege suas informações pessoais quando você faz login por meio do nosso serviço de autenticação compartilhada utilizado em todos os nossos aplicativos.",
        "Esta Política de Privacidade foi elaborada para cumprir nossas obrigações de divulgação como controlador de dados sob a Lei de Proteção de Dados Pessoais da Turquia N.º 6698 (KVKK) e o Regulamento Geral sobre a Proteção de Dados (RGPD).",
      ],
      sections: {
        section1: {
          title: "1. Informações que coletamos",
          intro: "Ao fazer login com o Google, recebemos as seguintes informações da sua conta do Google:",
          googleItems: [
            {
              label: "Endereço de e-mail:",
              text: "Usado para identificação e autenticação da conta.",
            },
            {
              label: "Nome de exibição / Nome de usuário:",
              text: "Usado para identificar você nos aplicativos utilizados (ex.: tabelas de classificação, perfis).",
            },
            {
              label: "Foto de perfil (opcional):",
              text: "Se fornecida pela sua conta do Google, usada apenas para fins de exibição.",
            },
          ],
          passwordNotice:
            "Não coletamos nem armazenamos senhas. A autenticação é realizada inteiramente por meio do Login do Google (OAuth 2.0).",
          telemetryNotice:
            "Além disso, para fins de segurança, depuração e aprimoramento do serviço, os seguintes dados técnicos de telemetria podem ser coletados em todas as nossas plataformas (Web, Android e Windows):",
          telemetryItems: [
            {
              label: "Identificador de usuário / dispositivo (UID):",
              text: "Padrão em todas as plataformas (Web, Android, Windows); um identificador UUID v4 exclusivo gerado na configuração e o ID de usuário do Supabase (UID) atribuído ao fazer login.",
            },
            {
              label: "Endereço IP:",
              text: "Transmitido de todas as plataformas para segurança de rede, prevenção contra abusos e roteamento de solicitações.",
            },
            {
              label: "Informações do cliente (User-Agent):",
              text: "Detalhes padrão do navegador e sistema operacional em ambientes web; detalhes do cliente em tempo de execução (ex.: cabeçalho de cliente Dart/HTTP) em aplicativos Android e Windows.",
            },
          ],
        },
        section2: {
          title: "2. Como usamos suas informações",
          items: [
            {
              text: "Para criar e gerenciar sua conta em todos os nossos aplicativos; para autenticar sua identidade ao fazer login pelo Google.",
              legalBasis: "Base legal: Execução contratual – RGPD Art. 6(1)(b) / KVKK Art. 5(2)(c)",
            },
            {
              text: "Para habilitar recursos como placares de líderes e perfis entre aplicativos.",
              legalBasis: "Base legal: Execução contratual – RGPD Art. 6(1)(b) / KVKK Art. 5(2)(c)",
            },
            {
              text: "Para detectar e prevenir acessos fraudulentos ou não autorizados; para depuração e registros de segurança.",
              legalBasis: "Base legal: Interesses legítimos – RGPD Art. 6(1)(f) / KVKK Art. 5(2)(f)",
            },
            {
              text: "Para cumprir obrigações legais aplicáveis.",
              legalBasis: "Base legal: Obrigação legal – RGPD Art. 6(1)(c) / KVKK Art. 5(2)(ç)",
            },
          ],
        },
        section3: {
          title: "3. Armazenamento de dados, segurança e transferências internacionais",
          paragraphs: [
            "Todos os dados são hospedados na infraestrutura do Supabase em data centers seguros localizados na União Europeia (AWS Irlanda).",
            "Para usuários residentes na Turquia: os dados de identidade e telemetria são transferidos para servidores seguros fora da Turquia (região da UE) para operação e hospedagem do serviço, de acordo com a Lei de Proteção de Dados Pessoais N.º 6698 (KVKK).",
            "Políticas de segurança em nível de linha (RLS) são aplicadas no banco de dados, e todos os dados em trânsito são protegidos por criptografia HTTPS/TLS.",
            "Seus dados são retidos enquanto sua conta permanecer ativa. Após a exclusão da conta, os dados são removidos permanentemente do Supabase em até 30 dias. Os registros de sistema e segurança são retidos por no máximo 90 dias.",
          ],
        },
        section4: {
          title: "4. Provedores de serviços terceirizados",
          intro:
            "Usamos os seguintes serviços de terceiros para operar nosso sistema de autenticação. Esses provedores têm acesso às suas informações pessoais apenas para realizar tarefas em nosso nome e são obrigados a não divulgá-las ou usá-las para qualquer outro fim.",
          providers: [
            {
              name: "Supabase",
              url: "https://supabase.com/privacy",
              description: "Infraestrutura de autenticação e banco de dados.",
              role: "Função: Operador de Dados / Data Processor",
            },
            {
              name: "Google (Fazer login com o Google)",
              url: "https://policies.google.com/privacy",
              description: "Provedor de login OAuth 2.0.",
              role: "Função: Provedor de Identidade Independente",
              extraNotice: {
                text: "Ao fazer login com o Google, você também concorda com a ",
                linkText: "Política de Privacidade do Google",
                url: "https://policies.google.com/privacy",
                suffix: ".",
              },
            },
          ],
        },
        section5: {
          title: "5. Compartilhamento de dados",
          intro:
            "Não vendemos, trocamos ou alugamos suas informações pessoais a terceiros. Seus dados só poderão ser compartilhados nas seguintes circunstâncias limitadas:",
          items: [
            "Exclusivamente com os provedores de serviços listados acima para operar o serviço de autenticação.",
            "Se exigido por lei, regulamento ou processo legal válido.",
            "Para proteger os direitos, a propriedade ou a segurança de Kerem Kuyucu ou de nossos usuários.",
          ],
        },
        section6: {
          title: "6. Dados de log",
          text: "Em caso de erro ou incidente de segurança, nossos servidores podem coletar automaticamente dados de log, como seu endereço IP, tipo de navegador, data e hora da solicitação e páginas visitadas. Essas informações são usadas exclusivamente para monitoramento de segurança e depuração.",
        },
        section7: {
          title: "7. Privacidade de crianças",
          paragraphs: [
            "Nossos aplicativos possuem classificação PEGI 3 e são adequados para todas as idades. O login é gerenciado exclusivamente pelo Google Sign-In, o que significa que os usuários devem ter uma conta válida do Google. Aplicam-se as políticas do Google sobre menores.",
            "Não coletamos intencionalmente nenhuma informação pessoal além daquela fornecida pelo fluxo de login do Google.",
          ],
          contact: {
            prefix: "Se você é pai ou responsável e tem dúvidas sobre o uso de nossos aplicativos por seu filho, entre em contato em ",
            email: "help@keremkuyucu.com.tr",
            suffix: ".",
          },
        },
        section8: {
          title: "8. Seus direitos (sob o RGPD e a lei turca KVKK)",
          intro: "De acordo com os artigos 15 a 22 do RGPD e o artigo 11 da lei turca KVKK, você tem os seguintes direitos:",
          rights: [
            { text: "Acessar os dados pessoais que mantemos sobre você (Direito de Acesso)." },
            { text: "Solicitar a correção de dados imprecisos (Direito de Retificação)." },
            {
              text: "Solicitar a exclusão da sua conta e de todos os dados associados (Direito ao Apagamento). Você pode enviar esta solicitação por e-mail ou visitar nossa página de ",
              link: {
                prefix: "",
                label: "Exclusão de Conta e Dados",
                suffix: ".",
              },
            },
            { text: "Opor-se a determinados usos dos seus dados ou solicitar a sua limitação (Direito de Oposição / Limitação)." },
            {
              text: "Solicitar que seus dados sejam fornecidos em formato estruturado e legível por máquina (ex.: JSON) (Direito à Portabilidade de Dados).",
            },
          ],
          notice: "As solicitações são processadas gratuitamente em no máximo 30 dias, em conformidade com o RGPD e a KVKK.",
        },
        section9: {
          title: "9. Alterações nesta Política de Privacidade",
          text: "Podemos atualizar esta Política de Privacidade periodicamente. As alterações entram em vigor imediatamente após a publicação nesta página. Recomendamos consultar esta página periodicamente. O uso continuado após alterações constitui aceitação da nova política.",
        },
        section10: {
          title: "10. Fale Conosco",
          text: "Se tiver dúvidas sobre esta Política de Privacidade, entre em contato em ",
          email: "help@keremkuyucu.com.tr",
        },
      },
    },
    rus: {
      metadata: {
        title: "Политика конфиденциальности – Kerem Kuyucu Auth",
        description:
          "Политика конфиденциальности для всех приложений, использующих единую службу аутентификации Kerem Kuyucu.",
      },
      title: "Политика конфиденциальности",
      lastUpdated: "Последнее обновление: 17 октября 2026 г.",
      intro: [
        "Настоящая Политика конфиденциальности описывает, как Kerem Kuyucu («мы», «нас» или «наш») собирает, использует и защищает вашу личную информацию, когда вы входите в систему через нашу единую службу аутентификации, используемую во всех наших приложениях.",
        "Настоящая Политика конфиденциальности подготовлена во исполнение наших обязательств по информированию в качестве оператора персональных данных в соответствии с Законом Турции о защите персональных данных № 6698 (KVKK) и Общим регламентом по защите данных (GDPR).",
      ],
      sections: {
        section1: {
          title: "1. Собираемая информация",
          intro: "При входе через Google мы получаем следующую информацию из вашего аккаунта Google:",
          googleItems: [
            {
              label: "Адрес электронной почты:",
              text: "Используется для идентификации и аутентификации учетной записи.",
            },
            {
              label: "Отображаемое имя / Имя пользователя:",
              text: "Используется для вашей идентификации в приложениях (например, таблицы лидеров, профили).",
            },
            {
              label: "Фотография профиля (необязательно):",
              text: "Если предоставлена вашей учетной записью Google, используется исключительно для отображения.",
            },
          ],
          passwordNotice:
            "Мы не собираем и не храним пароли. Аутентификация осуществляется исключительно через Google Sign-In (OAuth 2.0).",
          telemetryNotice:
            "Кроме того, в целях безопасности, отладки и улучшения обслуживания на всех наших платформах (Web, Android и Windows) могут собираться следующие технические телеметрические данные:",
          telemetryItems: [
            {
              label: "Идентификатор пользователя / устройства (UID):",
              text: "Стандарт для всех платформ (Web, Android, Windows); уникальный идентификатор UUID v4, создаваемый при установке, и UID пользователя Supabase, назначаемый при входе.",
            },
            {
              label: "IP-адрес:",
              text: "Передается со всех платформ для сетевой безопасности, предотвращения нарушений и маршрутизации запросов.",
            },
            {
              label: "Информация о клиенте (User-Agent):",
              text: "Стандартные данные браузера и операционной системы в веб-среде; сведения о среде выполнения клиента (например, заголовок клиента Dart/HTTP) в приложениях Android и Windows.",
            },
          ],
        },
        section2: {
          title: "2. Как мы используем вашу информацию",
          items: [
            {
              text: "Для создания и управления вашей учетной записью во всех наших приложениях; для подтверждения личности при входе через Google.",
              legalBasis: "Правовая основа: Исполнение договора – GDPR ст. 6(1)(b) / KVKK ст. 5(2)(c)",
            },
            {
              text: "Для включения таких функций, как таблицы лидеров и межпрограммные профили.",
              legalBasis: "Правовая основа: Исполнение договора – GDPR ст. 6(1)(b) / KVKK ст. 5(2)(c)",
            },
            {
              text: "Для обнаружения и предотвращения мошеннического или несанкционированного доступа; для отладки и журналов безопасности.",
              legalBasis: "Правовая основа: Законные интересы – GDPR ст. 6(1)(f) / KVKK ст. 5(2)(f)",
            },
            {
              text: "Для соблюдения применимых юридических обязательств.",
              legalBasis: "Правовая основа: Юридическое обязательство – GDPR ст. 6(1)(c) / KVKK ст. 5(2)(ç)",
            },
          ],
        },
        section3: {
          title: "3. Хранение данных, безопасность и трансграничная передача",
          paragraphs: [
            "Все данные хранятся в инфраструктуре Supabase в защищенных центрах обработки данных на территории Европейского Союза (AWS Ирландия).",
            "Для пользователей, проживающих в Турции: идентификационные и телеметрические данные передаются на защищенные серверы за пределами Турции (регион ЕС) для работы и хостинга службы в соответствии с турецким законом № 6698 (KVKK).",
            "На уровне базы данных применяются политики безопасности на уровне строк (RLS), а все передаваемые данные защищены шифрованием HTTPS/TLS.",
            "Ваши данные сохраняются до тех пор, пока ваша учетная запись активна. После удаления учетной записи данные безвозвратно удаляются из Supabase в течение 30 дней. Журналы безопасности и системы хранятся не более 90 дней.",
          ],
        },
        section4: {
          title: "4. Сторонние поставщики услуг",
          intro:
            "Мы используем следующие сторонние службы для работы нашей системы аутентификации. Эти поставщики имеют доступ к вашей личной информации только для выполнения задач от нашего имени и обязаны не раскрывать и не использовать ее для каких-либо иных целей.",
          providers: [
            {
              name: "Supabase",
              url: "https://supabase.com/privacy",
              description: "Инфраструктура аутентификации и базы данных.",
              role: "Роль: Обработчик данных / Data Processor",
            },
            {
              name: "Google (Вход с аккаунтом Google)",
              url: "https://policies.google.com/privacy",
              description: "Провайдер аутентификации OAuth 2.0.",
              role: "Роль: Независимый поставщик идентификационных данных",
              extraNotice: {
                text: "Выполняя вход через Google, вы также соглашаетесь с ",
                linkText: "Политикой конфиденциальности Google",
                url: "https://policies.google.com/privacy",
                suffix: ".",
              },
            },
          ],
        },
        section5: {
          title: "5. Передача данных третьим лицам",
          intro:
            "Мы не продаем, не обмениваем и не сдаем в аренду вашу личную информацию третьим лицам. Ваши данные могут быть переданы только в следующих ограниченных случаях:",
          items: [
            "Исключительно перечисленным выше поставщикам услуг для обеспечения работы службы аутентификации.",
            "Если это требуется по закону, нормативному акту или в рамках судебного процесса.",
            "Для защиты прав, собственности или безопасности Kerem Kuyucu или наших пользователей.",
          ],
        },
        section6: {
          title: "6. Данные журналов",
          text: "В случае ошибки или инцидента безопасности наши серверы могут автоматически собирать данные журнала, такие как ваш IP-адрес, тип браузера, время и дата запроса, а также посещенные страницы. Эта информация используется исключительно для контроля безопасности и отладки.",
        },
        section7: {
          title: "7. Конфиденциальность детей",
          paragraphs: [
            "Наши приложения имеют возрастной рейтинг PEGI 3 и предназначены для всех возрастов. Вход осуществляется исключительно через Google Sign-In, поэтому пользователи должны иметь действующий аккаунт Google. В отношении несовершеннолетних действуют правила Google.",
            "Мы сознательно не собираем никакой личной информации помимо той, которая предоставляется при входе через Google.",
          ],
          contact: {
            prefix: "Если вы родитель или опекун и у вас есть вопросы относительно использования приложений вашим ребенком, свяжитесь с нами по адресу ",
            email: "help@keremkuyucu.com.tr",
            suffix: ".",
          },
        },
        section8: {
          title: "8. Ваши права (в соответствии с GDPR и турецким законом KVKK)",
          intro: "В соответствии со статьями 15–22 GDPR и статьей 11 турецкого закона KVKK вы имеете следующие права:",
          rights: [
            { text: "Получать доступ к хранящимся у нас персональным данным (Право на доступ)." },
            { text: "Требовать исправления неточных данных (Право на исправление)." },
            {
              text: "Требовать удаления вашей учетной записи и всех связанных данных (Право на забвение). Вы можете отправить этот запрос по электронной почте или перейти на страницу ",
              link: {
                prefix: "",
                label: "Удаление аккаунта и данных",
                suffix: ".",
              },
            },
            { text: "Возражать против определенного использования ваших данных или требовать ограничения их обработки (Право на возражение / ограничение)." },
            {
              text: "Требовать предоставления ваших данных в структурированном машиночитаемом формате (например, JSON) (Право на переносимость данных).",
            },
          ],
          notice: "Запросы обрабатываются бесплатно не позднее чем в течение 30 дней в соответствии с GDPR и KVKK.",
        },
        section9: {
          title: "9. Изменения в Политике конфиденциальности",
          text: "Мы можем периодически обновлять настоящую Политику конфиденциальности. Изменения вступают в силу немедленно после их публикации на этой странице. Мы рекомендуем регулярно просматривать эту страницу. Продолжение использования услуг после внесения изменений означает принятие новой политики.",
        },
        section10: {
          title: "10. Связаться с нами",
          text: "Если у вас есть вопросы или пожелания относительно настоящей Политики конфиденциальности, свяжитесь с нами по адресу ",
          email: "help@keremkuyucu.com.tr",
        },
      },
    },
  },
  tos: {
    tur: {
      metadata: {
        title: "Kullanım Koşulları – Kerem Kuyucu Auth",
        description:
          "Kerem Kuyucu ortak kimlik doğrulama hizmetini kullanan tüm uygulamalar için kullanım koşulları.",
      },
      title: "Kullanım Koşulları",
      lastUpdated: "Son Güncelleme: 17 Ekim 2026",
      intro:
        "Bu Kullanım Koşulları, Kerem Kuyucu tarafından sağlanan ve birden fazla uygulama tarafından kullanılan ortak kimlik doğrulama hizmetinin kullanımını düzenlemektedir. Giriş yaparak bu koşulları kabul etmiş olursunuz.",
      sections: {
        section1: {
          title: "1. Hizmetin Tanımı",
          text: "Kerem Kuyucu tarafından geliştirilen uygulamalar (GeoGame, Okey Defteri ve diğerleri) tek bir ortak hesap sistemi kullanmaktadır. Bu hizmet; hesap oluşturma, kimlik doğrulama ve uygulamalar arası profil yönetimi işlevlerini kapsar.",
        },
        section2: {
          title: "2. Hesap Oluşturma ve Güvenlik",
          intro:
            "Hesaplar yalnızca Google ile Giriş (OAuth 2.0) aracılığıyla oluşturulmaktadır. Giriş yaparak aşağıdaki kurallara uymayı kabul edersiniz:",
          items: [
            { text: "Giriş için geçerli ve aktif bir Google hesabı kullanmayı kabul edersiniz." },
            { text: "Hesabınız altında gerçekleşen tüm faaliyetlerden sorumlusunuz." },
            {
              text: "Hesabınıza yetkisiz erişim tespit ederseniz derhal bildirimde bulunmanız gerekmektedir: ",
              emailLink: {
                prefix: "",
                email: "help@keremkuyucu.com.tr",
                suffix: "",
              },
            },
          ],
        },
        section3: {
          title: "3. Kabul Edilebilir Kullanım",
          intro: "Hizmetimizi kullanırken aşağıdaki kurallara uymayı kabul edersiniz:",
          items: [
            "Hizmeti yalnızca yasal amaçlar için ve bu koşullara uygun şekilde kullanırsınız.",
            "Sahte hesap oluşturmazsınız veya başkasının kimliğine bürünmezsiniz.",
            "Kullanıcı adı veya profil bilgilerinizde saldırgan, nefret içeren, müstehcen veya yanıltıcı dil kullanmazsınız.",
            "Sistemin güvenliğini tehlikeye atacak girişimlerde bulunmazsınız.",
            "Hizmetin sunucu altyapısına, veritabanlarına veya API'larına yetkisiz erişim sağlamaya çalışmazsınız.",
          ],
        },
        section4: {
          title: "4. Fikri Mülkiyet",
          text: "Kimlik doğrulama hizmetine ilişkin tüm haklar Kerem Kuyucu'ya aittir. Kerem Kuyucu adı, logosu ve markası, önceden yazılı izin alınmadan ticari amaçlarla kullanılamaz.",
        },
        section5: {
          title: "5. Sorumluluk Sınırlaması",
          intro: "Hizmet \"olduğu gibi\" sunulmaktadır. Kerem Kuyucu:",
          items: [
            "Hizmetin kesintisiz, hatasız veya tamamen güvenli olacağını garanti etmez.",
            "Hizmetin kullanımından veya kullanılamamasından kaynaklanan doğrudan, dolaylı veya arızi zararlardan sorumlu tutulamaz.",
            "Üçüncü taraf hizmet sağlayıcılarından (Supabase, Google vb.) kaynaklanan kesintiler veya hatalardan sorumlu değildir.",
          ],
        },
        section6: {
          title: "6. Hesap Askıya Alma ve Fesih",
          intro:
            "Kerem Kuyucu, aşağıdaki durumlarda hesabınızı önceden bildirimde bulunmaksızın askıya alma veya kalıcı olarak sonlandırma hakkını saklı tutar:",
          items: [
            "Bu Kullanım Koşullarının ihlali.",
            "Sahtecilik, dolandırıcılık veya kötüye kullanım tespiti.",
            "Diğer kullanıcılara yönelik taciz edici, tehdit edici veya zarar verici davranış.",
            "Hizmetin güvenliğini veya bütünlüğünü tehlikeye atacak eylemler.",
          ],
        },
        section7: {
          title: "7. Hesap Silme",
          textBeforeEmail: "Hesabınızı ve ilgili tüm verilerinizi kalıcı olarak silmek istiyorsanız ",
          email: "help@keremkuyucu.com.tr",
          textBetween: " adresine e-posta gönderebilir ya da ",
          deleteLinkText: "Hesap ve Veri Silme",
          textAfterDeleteLink:
            " sayfamızı ziyaret edebilirsiniz. Hesap silme işlemi sırasında şifre veya parola silinmez; kimlik doğrulama yalnızca Google OAuth üzerinden sağlandığından, silinen hesabın Google OAuth bağlantısı Supabase üzerinden koparılır. Silme talepleri 30 gün içinde işleme alınır. Silinen hesaplar ve veriler kurtarılamaz.",
        },
        section8: {
          title: "8. Yaş ve Ebeveyn Gözetimi",
          paragraphs: [
            "Uygulamalarımız PEGI 3 derecelendirmesine sahip olup her yaşa uygun şekilde tasarlanmıştır. Giriş Google ile Giriş üzerinden yapıldığından, kullanıcıların geçerli bir Google hesabına sahip olması gerekmektedir. Küçüklerin hesap uygunluğuna ilişkin Google'ın politikaları geçerlidir.",
            "Ebeveyn ve vasilerin çocuklarının uygulamalarımızı kullanmasını denetlemelerini öneririz.",
          ],
        },
        section9: {
          title: "9. Gizlilik ve Veri Aktarımı",
          textBeforeLink: "Kişisel verilerinizin nasıl toplandığı ve işlendiğine ilişkin ayrıntılı bilgi için lütfen ",
          privacyLinkText: "Gizlilik Politikamızı",
          textAfterLink: " inceleyin. Gizlilik Politikası bu Kullanım Koşullarının ayrılmaz bir parçasını oluşturmaktadır.",
          paragraph2:
            "Hizmetin kullanımı sırasında toplanan kişisel veriler ve yurt dışı veri barındırma süreçleri Gizlilik Politikası'nda belirtilen kurallara ve yasal dayanaklara tabidir.",
        },
        section10: {
          title: "10. Uygulanacak Hukuk",
          text: "Bu Kullanım Koşulları Türkiye Cumhuriyeti kanunlarına tabidir. Bu koşullardan doğabilecek her türlü uyuşmazlık, Türkiye Cumhuriyeti mahkemelerinin münhasır yargı yetkisine tabidir.",
        },
        section11: {
          title: "11. Koşullardaki Değişiklikler",
          text: "Bu Kullanım Koşullarını zaman zaman güncelleyebiliriz. Değişiklikler bu sayfada yayımlandıktan hemen sonra yürürlüğe girer. Hizmeti kullanmaya devam etmeniz, güncellenmiş koşulları kabul ettiğiniz anlamına gelir.",
        },
        section12: {
          title: "12. İletişim",
          textBeforeEmail: "Bu Kullanım Koşulları hakkında soru veya önerileriniz için ",
          email: "help@keremkuyucu.com.tr",
          textAfterEmail: " adresinden bizimle iletişime geçebilirsiniz.",
        },
      },
    },
    eng: {
      metadata: {
        title: "Terms of Service – Kerem Kuyucu Auth",
        description:
          "Terms of service for all applications using the Kerem Kuyucu shared authentication service.",
      },
      title: "Terms of Service",
      lastUpdated: "Last Updated: October 17, 2026",
      intro:
        "These Terms of Service govern your use of the shared authentication service provided by Kerem Kuyucu (\"we\", \"us\", or \"our\") and used across all applications developed by Kerem Kuyucu. By signing in, you agree to be bound by these terms.",
      sections: {
        section1: {
          title: "1. Description of Service",
          text: "Applications developed by Kerem Kuyucu (including GeoGame, Okey Defteri, and others) share a single unified account system. This service covers account creation, authentication, and cross-application profile management.",
        },
        section2: {
          title: "2. Account Creation and Security",
          intro:
            "Accounts are created exclusively through Google Sign-In (OAuth 2.0). By signing in, you agree to the following:",
          items: [
            { text: "You agree to use a valid and active Google account for sign-in." },
            { text: "You are responsible for all activities that occur under your account." },
            {
              text: "If you discover any unauthorized access to your account, you must immediately notify us at ",
              emailLink: {
                prefix: "",
                email: "help@keremkuyucu.com.tr",
                suffix: ".",
              },
            },
          ],
        },
        section3: {
          title: "3. Acceptable Use",
          intro: "By using our service, you agree to:",
          items: [
            "Use the service only for lawful purposes and in accordance with these Terms.",
            "Not create fake accounts or impersonate another person.",
            "Not use abusive, hateful, obscene, or misleading language in your username or profile information.",
            "Not attempt to compromise the security of the system.",
            "Not attempt unauthorized access to the service's server infrastructure, databases, or APIs.",
          ],
        },
        section4: {
          title: "4. Intellectual Property",
          text: "All rights relating to the authentication service belong to Kerem Kuyucu. The Kerem Kuyucu name, logo, and branding may not be used for commercial purposes without prior written permission.",
        },
        section5: {
          title: "5. Limitation of Liability",
          intro: "The service is provided \"as is\" and \"as available\". Kerem Kuyucu:",
          items: [
            "Does not guarantee that the service will operate uninterrupted, error-free, or completely secure.",
            "Shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the service.",
            "Is not responsible for disruptions or errors caused by third-party service providers (Supabase, Google, etc.).",
          ],
        },
        section6: {
          title: "6. Account Suspension and Termination",
          intro:
            "Kerem Kuyucu reserves the right to suspend or permanently terminate your account without prior notice in the following circumstances:",
          items: [
            "Breach of these Terms of Service.",
            "Detection of fraud, cheating, or abusive behavior.",
            "Harassing, threatening, or harmful conduct towards other users.",
            "Actions that compromise the security or integrity of the service.",
          ],
        },
        section7: {
          title: "7. Account Deletion",
          textBeforeEmail: "If you wish to permanently delete your account and all associated data, you can send a request to ",
          email: "help@keremkuyucu.com.tr",
          textBetween: " or visit our ",
          deleteLinkText: "Account & Data Deletion",
          textAfterDeleteLink:
            " page. No password is deleted during the account deletion process; since authentication is handled exclusively via Google OAuth, the deleted account's Google OAuth link is severed through Supabase. Requests are processed within 30 days. Deleted accounts and data cannot be recovered.",
        },
        section8: {
          title: "8. Age and Parental Supervision",
          paragraphs: [
            "Our applications are rated PEGI 3 and are designed to be suitable for all ages. Since sign-in is handled through Google Sign-In, users are required to have a valid Google account. Google's policies on account eligibility for minors apply.",
            "We encourage parents and guardians to supervise their children's use of our applications.",
          ],
        },
        section9: {
          title: "9. Privacy and Data Transfers",
          textBeforeLink: "For detailed information on how personal data is collected and processed, please review our ",
          privacyLinkText: "Privacy Policy",
          textAfterLink: ". The Privacy Policy forms an integral part of these Terms of Service.",
          paragraph2:
            "Personal data collected during the use of the service and international data hosting processes are subject to the rules and legal bases set out in the Privacy Policy.",
        },
        section10: {
          title: "10. Governing Law",
          text: "These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of Turkey. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of the Republic of Turkey.",
        },
        section11: {
          title: "11. Changes to Terms",
          text: "We may update these Terms of Service from time to time. Changes take effect immediately upon being posted on this page. Your continued use of the service after any changes constitutes your acceptance of the updated terms.",
        },
        section12: {
          title: "12. Contact Us",
          textBeforeEmail: "If you have any questions or suggestions regarding these Terms of Service, please contact us at ",
          email: "help@keremkuyucu.com.tr",
          textAfterEmail: ".",
        },
      },
    },
    deu: {
      metadata: {
        title: "Nutzungsbedingungen – Kerem Kuyucu Auth",
        description:
          "Nutzungsbedingungen für alle Anwendungen, die den gemeinsamen Authentifizierungsdienst von Kerem Kuyucu nutzen.",
      },
      title: "Nutzungsbedingungen",
      lastUpdated: "Zuletzt aktualisiert: 17. Oktober 2026",
      intro:
        "Diese Nutzungsbedingungen regeln Ihre Nutzung des gemeinsamen Authentifizierungsdienstes von Kerem Kuyucu (\"wir\", \"uns\" oder \"unser\"), der in allen von Kerem Kuyucu entwickelten Anwendungen verwendet wird. Mit Ihrer Anmeldung stimmen Sie diesen Bedingungen zu.",
      sections: {
        section1: {
          title: "1. Beschreibung des Dienstes",
          text: "Von Kerem Kuyucu entwickelte Anwendungen (einschließlich GeoGame, Okey Defteri u. a.) nutzen ein einheitliches Kontensystem. Dieser Dienst umfasst die Kontoerstellung, Authentifizierung und anwendungsübergreifende Profilverwaltung.",
        },
        section2: {
          title: "2. Kontoerstellung und Sicherheit",
          intro:
            "Konten werden ausschließlich über Google Sign-In (OAuth 2.0) erstellt. Durch die Anmeldung erklären Sie sich mit Folgendem einverstanden:",
          items: [
            { text: "Sie verpflichten sich, für die Anmeldung ein gültiges und aktives Google-Konto zu verwenden." },
            { text: "Sie sind für alle Aktivitäten verantwortlich, die unter Ihrem Konto stattfinden." },
            {
              text: "Wenn Sie einen unbefugten Zugriff auf Ihr Konto feststellen, müssen Sie uns unverzüglich benachrichtigen: ",
              emailLink: {
                prefix: "",
                email: "help@keremkuyucu.com.tr",
                suffix: ".",
              },
            },
          ],
        },
        section3: {
          title: "3. Zulässige Nutzung",
          intro: "Durch die Nutzung unseres Dienstes verpflichten Sie sich:",
          items: [
            "Den Dienst nur für rechtmäßige Zwecke und in Übereinstimmung mit diesen Bedingungen zu nutzen.",
            "Keine gefälschten Konten zu erstellen oder sich als eine andere Person auszugeben.",
            "Keine beleidigende, hasserfüllte, obszöne oder irreführende Sprache in Ihrem Benutzernamen oder Profil zu verwenden.",
            "Keine Versuche zu unternehmen, die Sicherheit des Systems zu gefährden.",
            "Keinen unbefugten Zugriff auf Serverinfrastruktur, Datenbanken oder APIs zu versuchen.",
          ],
        },
        section4: {
          title: "4. Geistiges Eigentum",
          text: "Alle Rechte am Authentifizierungsdienst liegen bei Kerem Kuyucu. Der Name, das Logo und die Marke von Kerem Kuyucu dürfen ohne vorherige schriftliche Genehmigung nicht für kommerzielle Zwecke verwendet werden.",
        },
        section5: {
          title: "5. Haftungsbeschränkung",
          intro: "Der Dienst wird \"wie besehen\" und \"wie verfügbar\" bereitgestellt. Kerem Kuyucu:",
          items: [
            "Garantiert nicht, dass der Dienst ununterbrochen, fehlerfrei oder absolut sicher funktioniert.",
            "Haftet nicht für direkte, indirekte oder beiläufig entstandene Schäden aus der Nutzung oder Unmöglichkeit der Nutzung des Dienstes.",
            "Ist nicht verantwortlich für Störungen, die durch Drittanbieter (Supabase, Google etc.) verursacht werden.",
          ],
        },
        section6: {
          title: "6. Kontosperrung und Kündigung",
          intro:
            "Kerem Kuyucu behält sich das Recht vor, Ihr Konto in folgenden Fällen ohne vorherige Ankündigung zu sperren oder dauerhaft zu kündigen:",
          items: [
            "Verstoß gegen diese Nutzungsbedingungen.",
            "Feststellung von Betrug, Täuschung oder missbräuchlichem Verhalten.",
            "Belästigendes, bedrohliches oder schädigendes Verhalten gegenüber anderen Nutzern.",
            "Handlungen, die die Sicherheit oder Integrität des Dienstes gefährden.",
          ],
        },
        section7: {
          title: "7. Kontolöschung",
          textBeforeEmail: "Wenn Sie Ihr Konto und alle zugehörigen Daten dauerhaft löschen möchten, senden Sie eine Anfrage an ",
          email: "help@keremkuyucu.com.tr",
          textBetween: " oder besuchen Sie unsere Seite zur ",
          deleteLinkText: "Konto- und Datenlöschung",
          textAfterDeleteLink:
            ". Beim Löschen des Kontos wird kein Passwort gelöscht; da die Authentifizierung ausschließlich über Google OAuth erfolgt, wird die Google OAuth-Verbindung über Supabase getrennt. Anfragen werden innerhalb von 30 Tagen bearbeitet. Gelöschte Konten und Daten können nicht wiederhergestellt werden.",
        },
        section8: {
          title: "8. Alter und elterliche Aufsicht",
          paragraphs: [
            "Unsere Anwendungen sind mit PEGI 3 eingestuft und für alle Altersgruppen geeignet. Da die Anmeldung über Google Sign-In erfolgt, benötigen Nutzer ein gültiges Google-Konto. Es gelten die Google-Richtlinien für Minderjährige.",
            "Wir empfehlen Eltern und Erziehungsberechtigten, die Nutzung unserer Anwendungen durch ihre Kinder zu beaufsichtigen.",
          ],
        },
        section9: {
          title: "9. Datenschutz und Datenübermittlung",
          textBeforeLink: "Detaillierte Informationen zur Erfassung und Verarbeitung personenbezogener Daten finden Sie in unserer ",
          privacyLinkText: "Datenschutzerklärung",
          textAfterLink: ". Die Datenschutzerklärung ist integraler Bestandteil dieser Nutzungsbedingungen.",
          paragraph2:
            "Bei der Nutzung des Dienstes erfasste personenbezogene Daten und internationale Hosting-Prozesse unterliegen den in der Datenschutzerklärung festgelegten Regeln und Rechtsgrundlagen.",
        },
        section10: {
          title: "10. Anwendbares Recht",
          text: "Diese Nutzungsbedingungen unterliegen den Gesetzen der Republik Türkei. Alle Streitigkeiten aus oder im Zusammenhang mit diesen Bedingungen unterliegen der ausschließlichen Zuständigkeit der Gerichte der Republik Türkei.",
        },
        section11: {
          title: "11. Änderungen der Bedingungen",
          text: "Wir können diese Nutzungsbedingungen von Zeit zu Zeit aktualisieren. Änderungen treten unmittelbar mit der Veröffentlichung auf dieser Seite in Kraft. Ihre fortgesetzte Nutzung nach Änderungen gilt als Zustimmung zu den aktualisierten Bedingungen.",
        },
        section12: {
          title: "12. Kontakt",
          textBeforeEmail: "Bei Fragen oder Anregungen zu diesen Nutzungsbedingungen wenden Sie sich bitte an ",
          email: "help@keremkuyucu.com.tr",
          textAfterEmail: ".",
        },
      },
    },
    spa: {
      metadata: {
        title: "Términos de servicio – Kerem Kuyucu Auth",
        description:
          "Términos de servicio para todas las aplicaciones que utilizan el servicio de autenticación compartida de Kerem Kuyucu.",
      },
      title: "Términos de servicio",
      lastUpdated: "Última actualización: 17 de octubre de 2026",
      intro:
        "Estos Términos de servicio rigen el uso del servicio de autenticación compartida provisto por Kerem Kuyucu (\"nosotros\", \"nos\" o \"nuestro\") y utilizado en todas las aplicaciones desarrolladas por Kerem Kuyucu. Al iniciar sesión, usted acepta estos términos.",
      sections: {
        section1: {
          title: "1. Descripción del servicio",
          text: "Las aplicaciones desarrolladas por Kerem Kuyucu (incluidas GeoGame, Okey Defteri y otras) comparten un único sistema de cuentas. Este servicio abarca la creación de cuentas, la autenticación y la gestión de perfiles entre aplicaciones.",
        },
        section2: {
          title: "2. Creación de cuenta y seguridad",
          intro:
            "Las cuentas se crean exclusivamente mediante Iniciar sesión con Google (OAuth 2.0). Al iniciar sesión, usted acepta lo siguiente:",
          items: [
            { text: "Usted acepta utilizar una cuenta de Google válida y activa para iniciar sesión." },
            { text: "Usted es responsable de todas las actividades que ocurran bajo su cuenta." },
            {
              text: "Si detecta cualquier acceso no autorizado a su cuenta, debe notificárnoslo inmediatamente a: ",
              emailLink: {
                prefix: "",
                email: "help@keremkuyucu.com.tr",
                suffix: ".",
              },
            },
          ],
        },
        section3: {
          title: "3. Uso aceptable",
          intro: "Al utilizar nuestro servicio, usted se compromete a:",
          items: [
            "Utilizar el servicio únicamente para fines lícitos y de conformidad con estos Términos.",
            "No crear cuentas falsas ni hacerse pasar por otra persona.",
            "No emplear lenguaje abusivo, de odio, obsceno o engañoso en su nombre de usuario o perfil.",
            "No intentar comprometer la seguridad del sistema.",
            "No intentar el acceso no autorizado a la infraestructura de servidores, bases de datos o API.",
          ],
        },
        section4: {
          title: "4. Propiedad intelectual",
          text: "Todos los derechos relativos al servicio de autenticación pertenecen a Kerem Kuyucu. El nombre, logotipo y marca de Kerem Kuyucu no pueden utilizarse con fines comerciales sin autorización previa por escrito.",
        },
        section5: {
          title: "5. Limitación de responsabilidad",
          intro: "El servicio se proporciona \"tal cual\" y \"según disponibilidad\". Kerem Kuyucu:",
          items: [
            "No garantiza que el servicio funcione de manera ininterrumpida, libre de errores o totalmente segura.",
            "No será responsable de daños directos, indirectos o incidentales derivados del uso o imposibilidad de uso del servicio.",
            "No se hace responsable de interrupciones causadas por terceros proveedores (Supabase, Google, etc.).",
          ],
        },
        section6: {
          title: "6. Suspensión y rescisión de la cuenta",
          intro:
            "Kerem Kuyucu se reserva el derecho de suspender o rescindir permanentemente su cuenta sin previo aviso en los siguientes casos:",
          items: [
            "Incumplimiento de estos Términos de servicio.",
            "Detección de fraude, trampas o conducta abusiva.",
            "Conducta hostil, amenazante o dañina hacia otros usuarios.",
            "Acciones que comprometan la seguridad o integridad del servicio.",
          ],
        },
        section7: {
          title: "7. Eliminación de cuenta",
          textBeforeEmail: "Si desea eliminar permanentemente su cuenta y todos los datos asociados, envíe una solicitud a ",
          email: "help@keremkuyucu.com.tr",
          textBetween: " o visite nuestra página de ",
          deleteLinkText: "Eliminación de cuenta y datos",
          textAfterDeleteLink:
            ". No se elimina ninguna contraseña durante el proceso; al manejarse la autenticación exclusivamente mediante Google OAuth, el vínculo de Google se desconecta a través de Supabase. Las solicitudes se procesan en un plazo de 30 días. Las cuentas y datos eliminados no se pueden recuperar.",
        },
        section8: {
          title: "8. Edad y supervisión parental",
          paragraphs: [
            "Nuestras aplicaciones tienen clasificación PEGI 3 y son aptas para todas las edades. Dado que el inicio de sesión se realiza a través de Google Sign-In, los usuarios deben contar con una cuenta de Google válida. Se aplican las políticas de Google relativas a menores.",
            "Recomendamos que los padres y tutores supervisen el uso de nuestras aplicaciones por parte de los niños.",
          ],
        },
        section9: {
          title: "9. Privacidad y transferencias de datos",
          textBeforeLink: "Para obtener información detallada sobre la recopilación y tratamiento de datos personales, consulte nuestra ",
          privacyLinkText: "Política de privacidad",
          textAfterLink: ". La Política de privacidad forma parte integral de estos Términos de servicio.",
          paragraph2:
            "Los datos personales recopilados durante el uso y los procesos de alojamiento internacional están sujetos a las normas y bases legales establecidas en la Política de privacidad.",
        },
        section10: {
          title: "10. Ley aplicable",
          text: "Estos Términos de servicio se regirán e interpretarán de conformidad con las leyes de la República de Turquía. Cualquier disputa derivada de estos términos estará sujeta a la jurisdicción exclusiva de los tribunales de la República de Turquía.",
        },
        section11: {
          title: "11. Modificaciones de los Términos",
          text: "Podemos actualizar estos Términos de servicio periódicamente. Los cambios entran en vigor inmediatamente después de su publicación. El uso continuado del servicio tras cualquier cambio constituye la aceptación de los nuevos términos.",
        },
        section12: {
          title: "12. Contacto",
          textBeforeEmail: "Si tiene preguntas o sugerencias acerca de estos Términos de servicio, contáctenos en ",
          email: "help@keremkuyucu.com.tr",
          textAfterEmail: ".",
        },
      },
    },
    fra: {
      metadata: {
        title: "Conditions d'utilisation – Kerem Kuyucu Auth",
        description:
          "Conditions d'utilisation pour toutes les applications utilisant le service d'authentification partagé de Kerem Kuyucu.",
      },
      title: "Conditions d'utilisation",
      lastUpdated: "Dernière mise à jour : 17 octobre 2026",
      intro:
        "Les présentes Conditions d'utilisation régissent votre utilisation du service d'authentification partagé fourni par Kerem Kuyucu (« nous », « notre » ou « nos ») et utilisé dans toutes les applications développées par Kerem Kuyucu. En vous connectant, vous acceptez d'être lié par ces conditions.",
      sections: {
        section1: {
          title: "1. Description du service",
          text: "Les applications développées par Kerem Kuyucu (notamment GeoGame, Okey Defteri et d'autres) partagent un système de compte unique. Ce service couvre la création de compte, l'authentification et la gestion de profil inter-applications.",
        },
        section2: {
          title: "2. Création de compte et sécurité",
          intro:
            "Les comptes sont créés exclusivement via Connexion avec Google (OAuth 2.0). En vous connectant, vous acceptez ce qui suit :",
          items: [
            { text: "Vous acceptez d'utiliser un compte Google valide et actif pour vous connecter." },
            { text: "Vous êtes responsable de toutes les activités survenant sous votre compte." },
            {
              text: "Si vous découvrez un accès non autorisé à votre compte, vous devez nous en informer immédiatement à l'adresse : ",
              emailLink: {
                prefix: "",
                email: "help@keremkuyucu.com.tr",
                suffix: ".",
              },
            },
          ],
        },
        section3: {
          title: "3. Utilisation acceptable",
          intro: "En utilisant notre service, vous vous engagez à :",
          items: [
            "Utiliser le service uniquement à des fins licites et conformément aux présentes Conditions.",
            "Ne pas créer de faux comptes ni usurper l'identité d'une autre personne.",
            "Ne pas utiliser de langage injurieux, haineux, obscène ou trompeur dans votre nom d'utilisateur ou profil.",
            "Ne pas tenter de compromettre la sécurité du système.",
            "Ne pas tenter d'accéder sans autorisation à l'infrastructure, aux bases de données ou aux API du service.",
          ],
        },
        section4: {
          title: "4. Propriété intellectuelle",
          text: "Tous les droits relatifs au service d'authentification appartiennent à Kerem Kuyucu. Le nom, le logo et la marque de Kerem Kuyucu ne peuvent être utilisés à des fins commerciales sans autorisation écrite préalable.",
        },
        section5: {
          title: "5. Limitation de responsabilité",
          intro: "Le service est fourni « en l'état » et « selon disponibilité ». Kerem Kuyucu :",
          items: [
            "Ne garantit pas que le service fonctionnera sans interruption, sans erreur ou de manière totalement sécurisée.",
            "Ne pourra être tenu responsable des dommages directs, indirects ou accessoires résultant de l'utilisation ou de l'impossibilité d'utiliser le service.",
            "N'est pas responsable des pannes causées par des tiers prestataires (Supabase, Google, etc.).",
          ],
        },
        section6: {
          title: "6. Suspension et résiliation du compte",
          intro:
            "Kerem Kuyucu se réserve le droit de suspendre ou de résilier définitivement votre compte sans préavis dans les cas suivants :",
          items: [
            "Violation des présentes Conditions d'utilisation.",
            "Détection de fraude, de tricherie ou de comportement abusif.",
            "Comportement harcelant, menaçant ou nuisible envers d'autres utilisateurs.",
            "Actions compromettant la sécurité ou l'intégrité du service.",
          ],
        },
        section7: {
          title: "7. Suppression de compte",
          textBeforeEmail: "Si vous souhaitez supprimer définitivement votre compte et toutes les données associées, vous pouvez envoyer une demande à ",
          email: "help@keremkuyucu.com.tr",
          textBetween: " ou visiter notre page de ",
          deleteLinkText: "Suppression de compte et données",
          textAfterDeleteLink:
            ". Aucun mot de passe n'est supprimé lors de la suppression ; l'authentification étant gérée exclusivement par Google OAuth, le lien Google OAuth est rompu via Supabase. Les demandes sont traitées sous 30 jours. Les comptes et données supprimés ne peuvent être récupérés.",
        },
        section8: {
          title: "8. Âge et supervision parentale",
          paragraphs: [
            "Nos applications sont classées PEGI 3 et sont conçues pour convenir à tous les âges. La connexion étant gérée via Google Sign-In, les utilisateurs doivent détenir un compte Google valide. Les politiques de Google concernant les mineurs s'appliquent.",
            "Nous encourageons les parents et tuteurs à superviser l'utilisation de nos applications par leurs enfants.",
          ],
        },
        section9: {
          title: "9. Confidentialité et transferts de données",
          textBeforeLink: "Pour des informations détaillées sur la collecte et le traitement des données, veuillez consulter notre ",
          privacyLinkText: "Politique de confidentialité",
          textAfterLink: ". La Politique de confidentialité fait partie intégrante des présentes Conditions d'utilisation.",
          paragraph2:
            "Les données personnelles collectées lors de l'utilisation et les transferts internationaux sont régis par les règles et bases légales énoncées dans la Politique de confidentialité.",
        },
        section10: {
          title: "10. Droit applicable",
          text: "Les présentes Conditions d'utilisation sont régies et interprétées conformément aux lois de la République de Turquie. Tout litige découlant des présentes conditions relèvera de la compétence exclusive des tribunaux de la République de Turquie.",
        },
        section11: {
          title: "11. Modifications des conditions",
          text: "Nous pouvons mettre à jour ces Conditions d'utilisation périodiquement. Les modifications prennent effet immédiatement dès leur publication. Votre utilisation continue du service vaut acceptation des conditions mises à jour.",
        },
        section12: {
          title: "12. Nous contacter",
          textBeforeEmail: "Pour toute question ou suggestion concernant ces Conditions d'utilisation, veuillez nous contacter à ",
          email: "help@keremkuyucu.com.tr",
          textAfterEmail: ".",
        },
      },
    },
    por: {
      metadata: {
        title: "Termos de Serviço – Kerem Kuyucu Auth",
        description:
          "Termos de serviço para todos os aplicativos que utilizam o serviço de autenticação compartilhada de Kerem Kuyucu.",
      },
      title: "Termos de Serviço",
      lastUpdated: "Última atualização: 17 de outubro de 2026",
      intro:
        "Estes Termos de Serviço regem o uso do serviço de autenticação compartilhada fornecido por Kerem Kuyucu (\"nós\", \"nosso\" ou \"nossos\") e utilizado em todos os aplicativos desenvolvidos por Kerem Kuyucu. Ao fazer login, você concorda em cumprir estes termos.",
      sections: {
        section1: {
          title: "1. Descrição do Serviço",
          text: "Os aplicativos desenvolvidos por Kerem Kuyucu (incluindo GeoGame, Okey Defteri e outros) compartilham um sistema unificado de contas. Este serviço abrange a criação de contas, autenticação e gerenciamento de perfis entre aplicativos.",
        },
        section2: {
          title: "2. Criação de Conta e Segurança",
          intro:
            "As contas são criadas exclusivamente pelo Login do Google (OAuth 2.0). Ao fazer login, você concorda com o seguinte:",
          items: [
            { text: "Você concorda em usar uma conta válida e ativa do Google para fazer login." },
            { text: "Você é responsável por todas as atividades que ocorram em sua conta." },
            {
              text: "Se você descobrir qualquer acesso não autorizado à sua conta, notifique-nos imediatamente em: ",
              emailLink: {
                prefix: "",
                email: "help@keremkuyucu.com.tr",
                suffix: ".",
              },
            },
          ],
        },
        section3: {
          title: "3. Uso Aceitável",
          intro: "Ao usar nosso serviço, você concorda em:",
          items: [
            "Usar o serviço apenas para fins legais e de acordo com estes Termos.",
            "Não criar contas falsas nem se passar por outra pessoa.",
            "Não usar linguagem abusiva, de ódio, obscena ou enganosa em seu nome de usuário ou perfil.",
            "Não tentar comprometer a segurança do sistema.",
            "Não tentar acesso não autorizado à infraestrutura de servidores, bancos de dados ou APIs.",
          ],
        },
        section4: {
          title: "4. Propriedade Intelectual",
          text: "Todos os direitos relativos ao serviço de autenticação pertencem a Kerem Kuyucu. O nome, logotipo e marca de Kerem Kuyucu não podem ser usados para fins comerciais sem permissão prévia por escrito.",
        },
        section5: {
          title: "5. Limitação de Responsabilidade",
          intro: "O serviço é fornecido \"no estado em que se encontra\" e \"conforme disponível\". Kerem Kuyucu:",
          items: [
            "Não garante que o serviço funcionará sem interrupções, livre de erros ou de forma totalmente segura.",
            "Não será responsabilizado por danos diretos, indiretos ou incidentais decorrentes do uso ou da incapacidade de usar o serviço.",
            "Não se responsabiliza por interrupções causadas por provedores terceiros (Supabase, Google etc.).",
          ],
        },
        section6: {
          title: "6. Suspensão e Encerramento de Conta",
          intro:
            "Kerem Kuyucu reserva-se o direito de suspender ou encerrar permanentemente sua conta sem aviso prévio nas seguintes circunstâncias:",
          items: [
            "Violação destes Termos de Serviço.",
            "Detecção de fraude, trapaça ou comportamento abusivo.",
            "Conduta hostil, ameaçadora ou prejudicial contra outros usuários.",
            "Ações que comprometam a segurança ou integridade do serviço.",
          ],
        },
        section7: {
          title: "7. Exclusão de Conta",
          textBeforeEmail: "Se desejar excluir permanentemente sua conta e todos os dados associados, envie uma solicitação para ",
          email: "help@keremkuyucu.com.tr",
          textBetween: " ou visite nossa página de ",
          deleteLinkText: "Exclusão de Conta e Dados",
          textAfterDeleteLink:
            ". Nenhuma senha é excluída durante o processo; como a autenticação é tratada exclusivamente via Google OAuth, a vinculação é desfeita via Supabase. As solicitações são processadas em até 30 dias. Contas e dados excluídos não podem ser recuperados.",
        },
        section8: {
          title: "8. Idade e Supervisão dos Pais",
          paragraphs: [
            "Nossos aplicativos são classificados como PEGI 3 e adequados para todas as idades. Como o login é gerenciado pelo Google Sign-In, os usuários devem ter uma conta válida do Google. Aplicam-se as políticas do Google sobre menores.",
            "Recomendamos que pais e responsáveis supervisionem o uso de nossos aplicativos por seus filhos.",
          ],
        },
        section9: {
          title: "9. Privacidade e Transferência de Dados",
          textBeforeLink: "Para informações detalhadas sobre a coleta e o processamento de dados, consulte nossa ",
          privacyLinkText: "Política de Privacidade",
          textAfterLink: ". A Política de Privacidade é parte integrante destes Termos de Serviço.",
          paragraph2:
            "Os dados pessoais coletados durante o uso e os processos de hospedagem internacional estão sujeitos às regras e bases legais estabelecidas na Política de Privacidade.",
        },
        section10: {
          title: "10. Legislação Aplicável",
          text: "Estes Termos de Serviço serão regidos e interpretados de acordo com as leis da República da Turquia. Qualquer litígio decorrente destes termos estará sujeito à jurisdição exclusiva dos tribunais da República da Turquia.",
        },
        section11: {
          title: "11. Alterações nos Termos",
          text: "Podemos atualizar estes Termos de Serviço periodicamente. As alterações entram em vigor imediatamente após a publicação nesta página. O uso continuado após alterações constitui aceitação dos novos termos.",
        },
        section12: {
          title: "12. Fale Conosco",
          textBeforeEmail: "Se você tiver dúvidas ou sugestões sobre estes Termos de Serviço, entre em contato em ",
          email: "help@keremkuyucu.com.tr",
          textAfterEmail: ".",
        },
      },
    },
    rus: {
      metadata: {
        title: "Условия обслуживания – Kerem Kuyucu Auth",
        description:
          "Условия обслуживания для всех приложений, использующих единую службу аутентификации Kerem Kuyucu.",
      },
      title: "Условия обслуживания",
      lastUpdated: "Последнее обновление: 17 октября 2026 г.",
      intro:
        "Настоящие Условия обслуживания регулируют использование единой службы аутентификации, предоставляемой Kerem Kuyucu («мы», «нас» или «наш») и используемой во всех приложениях, разработанных Kerem Kuyucu. Выполняя вход, вы соглашаетесь с этими условиями.",
      sections: {
        section1: {
          title: "1. Описание службы",
          text: "Приложения, разработанные Kerem Kuyucu (включая GeoGame, Okey Defteri и другие), используют единую систему учетных записей. Эта служба охватывает создание учетных записей, аутентификацию и управление межпрограммными профилями.",
        },
        section2: {
          title: "2. Создание учетной записи и безопасность",
          intro:
            "Учетные записи создаются исключительно через Google Sign-In (OAuth 2.0). Выполняя вход, вы соглашаетесь со следующим:",
          items: [
            { text: "Вы соглашаетесь использовать действующий и активный аккаунт Google для входа." },
            { text: "Вы несете ответственность за все действия, происходящие под вашей учетной записью." },
            {
              text: "Если вы обнаружите несанкционированный доступ к вашей учетной записи, немедленно сообщите нам по адресу: ",
              emailLink: {
                prefix: "",
                email: "help@keremkuyucu.com.tr",
                suffix: ".",
              },
            },
          ],
        },
        section3: {
          title: "3. Допустимое использование",
          intro: "Используя нашу службу, вы обязуетесь:",
          items: [
            "Использовать службу только в законных целях и в соответствии с настоящими Условиями.",
            "Не создавать поддельные учетные записи и не выдавать себя за другое лицо.",
            "Не использовать оскорбительные, разжигающие ненависть, непристойные или вводящие в заблуждение выражения в имени пользователя или профиле.",
            "Не предпринимать попыток нарушить безопасность системы.",
            "Не пытаться получить несанкционированный доступ к серверной инфраструктуре, базам данных или API службы.",
          ],
        },
        section4: {
          title: "4. Интеллектуальная собственность",
          text: "Все права на службу аутентификации принадлежат Kerem Kuyucu. Имя, логотип и брендинг Kerem Kuyucu не могут использоваться в коммерческих целях без предварительного письменного разрешения.",
        },
        section5: {
          title: "5. Ограничение ответственности",
          intro: "Служба предоставляется на условиях «как есть» и «по мере доступности». Kerem Kuyucu:",
          items: [
            "Не гарантирует, что служба будет работать непрерывно, безошибочно или полностью безопасно.",
            "Не несет ответственности за прямые, косвенные или случайные убытки, возникшие в результате использования или невозможности использования службы.",
            "Не несет ответственности за сбои, вызванные сторонними поставщиками услуг (Supabase, Google и др.).",
          ],
        },
        section6: {
          title: "6. Приостановление и прекращение действия учетной записи",
          intro:
            "Kerem Kuyucu оставляет за собой право приостановить или навсегда прекратить действие вашей учетной записи без предварительного уведомления в следующих случаях:",
          items: [
            "Нарушение настоящих Условий обслуживания.",
            "Обнаружение мошенничества, нечестной игры или злоупотреблений.",
            "Оскорбительное, угрожающее или вредоносное поведение по отношению к другим пользователям.",
            "Действия, ставящие под угрозу безопасность или целостность службы.",
          ],
        },
        section7: {
          title: "7. Удаление учетной записи",
          textBeforeEmail: "Если вы хотите навсегда удалить свою учетную запись и все связанные с ней данные, отправьте запрос на адрес ",
          email: "help@keremkuyucu.com.tr",
          textBetween: " или перейдите на страницу ",
          deleteLinkText: "Удаление аккаунта и данных",
          textAfterDeleteLink:
            ". В процессе удаления пароли не удаляются; поскольку аутентификация осуществляется исключительно через Google OAuth, связь с Google OAuth разрывается через Supabase. Запросы обрабатываются в течение 30 дней. Удаленные учетные записи и данные восстановить невозможно.",
        },
        section8: {
          title: "8. Возраст и родительский контроль",
          paragraphs: [
            "Наши приложения имеют возрастной рейтинг PEGI 3 и подходят для всех возрастов. Поскольку вход осуществляется через Google Sign-In, пользователи должны иметь действующий аккаунт Google. Действуют правила Google в отношении несовершеннолетних.",
            "Мы рекомендуем родителям и опекунам контролировать использование приложений детьми.",
          ],
        },
        section9: {
          title: "9. Конфиденциальность и передача данных",
          textBeforeLink: "Подробную информацию о сборе и обработке персональных данных см. в нашей ",
          privacyLinkText: "Политике конфиденциальности",
          textAfterLink: ". Политика конфиденциальности является неотъемлемой частью настоящих Условий обслуживания.",
          paragraph2:
            "Персональные данные, собираемые при использовании, и процессы трансграничного хостинга регулируются правилами и правовыми основаниями, изложенными в Политике конфиденциальности.",
        },
        section10: {
          title: "10. Применимое право",
          text: "Настоящие Условия обслуживания регулируются и толкуются в соответствии с законодательством Турецкой Республики. Все споры, возникающие в связи с настоящими условиями, подлежат исключительной юрисдикции судов Турецкой Республики.",
        },
        section11: {
          title: "11. Изменения в Условиях",
          text: "Мы можем периодически обновлять настоящие Условия обслуживания. Изменения вступают в силу немедленно после их публикации. Продолжение использования службы после внесения изменений означает согласие с обновленными условиями.",
        },
        section12: {
          title: "12. Связаться с нами",
          textBeforeEmail: "Если у вас есть вопросы или предложения относительно настоящих Условий обслуживания, свяжитесь с нами по адресу ",
          email: "help@keremkuyucu.com.tr",
          textAfterEmail: ".",
        },
      },
    },
  },
  "delete-account": {
    tur: {
      metadata: {
        title: "Hesap ve Veri Silme - Kerem Kuyucu",
        description: "Uygulamalarımızdaki hesabınızın ve ilişkili verilerinizin silinmesini talep edin.",
      },
      title: "Hesap ve Veri Silme",
      lastUpdated: "Son Güncelleme Tarihi: 17 Ekim 2026",
      intro:
        "Kişisel verilerinizi kontrol etme hakkınıza saygı duyuyoruz. Herhangi bir uygulamamızdaki hesabınızı ve ilişkili tüm verilerinizi kalıcı olarak silmek istiyorsanız, aşağıdaki talimatları izleyerek silme talebinde bulunabilirsiniz.",
      howTo: {
        title: "Hesap ve Veri Silme Talebi Nasıl Yapılır?",
        intro:
          "Hesabınızın ve onunla ilişkili tüm verilerin silinmesini talep etmek için lütfen aşağıdaki adrese bir e-posta gönderin. Hesabınızı tespit edebilmemiz için kayıt olurken kullandığınız e-posta adresini veya kullanıcı adını belirttiğinizden emin olun.",
        emailBoxTitle: "Talebinizi ileteceğiniz adres:",
        email: "help@keremkuyucu.com.tr",
        emailSubject: "Hesap ve Veri Silme Talebi",
        warningTitle: "Önemli:",
        warningText:
          "Kimliğinizi doğrulayabilmemiz ve talebinizi daha hızlı işleme alabilmemiz için lütfen silme talebini hesabınızla ilişkili olan e-posta adresinden gönderin.",
      },
      whatDeleted: {
        title: "Hangi Veriler Silinecek?",
        intro: "Talebiniz işleme alındığında aşağıdaki veriler sistemlerimizden kalıcı olarak silinecektir:",
        items: [
          "Hesap giriş bilgileriniz (Google hesap e-posta adresi, kullanıcı adı, Google OAuth kullanıcı kimliği – UID)",
          "Profil bilgileriniz ve tercihleriniz",
          "Oyun istatistikleri, skorlar ve aktivite geçmişi",
          "Hesabınızla bağlantılı diğer tüm kişisel tanımlanabilir veriler",
        ],
        notice:
          "Kullanıcı hesabınız, profiliniz ve kimliğinizi tanımlayan tüm veriler kalıcı olarak silinir. Sistem bütünlüğü için tutulan geçmiş kayıtlar varsa kimlikten arındırılarak anonim hale getirilir.",
      },
      processingTime: {
        title: "İşlem Süresi",
        text: "Silme talepleri tarafımıza ulaştıktan sonra en geç 30 gün içinde işleme alınır. Hesabınız ve verileriniz kalıcı olarak silindiğinde bir onay e-postası alacaksınız. Bu işlemin geri alınamaz olduğunu, tüm verilerinizin kalıcı olarak silineceğini ve kurtarılamayacağını lütfen unutmayın.",
      },
      contact: {
        title: "Bize Ulaşın",
        textBeforeEmail: "Silme işlemiyle ilgili herhangi bir sorunuz veya endişeniz varsa, bizimle ",
        email: "help@keremkuyucu.com.tr",
        textAfterEmail: " adresi üzerinden iletişime geçebilirsiniz.",
      },
    },
    eng: {
      metadata: {
        title: "Account & Data Deletion - Kerem Kuyucu",
        description: "Request deletion of your account and associated data from our applications.",
      },
      title: "Account & Data Deletion",
      lastUpdated: "Last Updated: October 17, 2026",
      intro:
        "We respect your right to control your personal data. If you would like to permanently delete your account and all associated data from any of our applications, you can submit a deletion request by following the instructions below.",
      howTo: {
        title: "How to Request Account & Data Deletion",
        intro:
          "To request the deletion of your account and all data associated with it, please send an e-mail to the address below. Make sure to include the e-mail address or username you used to register so that we can locate your account.",
        emailBoxTitle: "Send your request to",
        email: "help@keremkuyucu.com.tr",
        emailSubject: "Account and Data Deletion Request",
        warningTitle: "Important:",
        warningText:
          "Please send your deletion request from the e-mail address associated with your account. This helps us verify your identity and process your request faster.",
      },
      whatDeleted: {
        title: "What Data Will Be Deleted?",
        intro: "Upon processing your request, the following data will be permanently removed from our systems:",
        items: [
          "Your account credentials (Google account email address, username, Google OAuth Provider UID)",
          "Profile information and preferences",
          "Game statistics, scores, and activity history",
          "Any other personally identifiable data linked to your account",
        ],
        notice:
          "Your user account, profile, and all data identifying you will be permanently deleted. Any historical records retained for system integrity purposes will be de-identified and anonymized.",
      },
      processingTime: {
        title: "Processing Time",
        text: "Deletion requests are processed within 30 days of receipt. You will receive a confirmation e-mail once your account and data have been permanently deleted. Please note that this action is irreversible — all your data will be permanently erased and cannot be recovered.",
      },
      contact: {
        title: "Contact Us",
        textBeforeEmail: "If you have any questions or concerns regarding the deletion process, feel free to reach out to us at ",
        email: "help@keremkuyucu.com.tr",
        textAfterEmail: ".",
      },
    },
    deu: {
      metadata: {
        title: "Konto- und Datenlöschung - Kerem Kuyucu",
        description: "Beantragen Sie die Löschung Ihres Kontos und der zugehörigen Daten aus unseren Anwendungen.",
      },
      title: "Konto- und Datenlöschung",
      lastUpdated: "Zuletzt aktualisiert: 17. Oktober 2026",
      intro:
        "Wir respektieren Ihr Recht auf Kontrolle über Ihre personenbezogenen Daten. Wenn Sie Ihr Konto und alle zugehörigen Daten aus einer unserer Anwendungen dauerhaft löschen möchten, können Sie einen Löschantrag gemäß den nachstehenden Anweisungen einreichen.",
      howTo: {
        title: "Wie beantrage ich die Konto- und Datenlöschung?",
        intro:
          "Um die Löschung Ihres Kontos und aller damit verknüpften Daten zu beantragen, senden Sie bitte eine E-Mail an die unten angegebene Adresse. Bitte geben Sie unbedingt die E-Mail-Adresse oder den Benutzernamen an, den Sie bei der Registrierung verwendet haben.",
        emailBoxTitle: "Senden Sie Ihren Antrag an:",
        email: "help@keremkuyucu.com.tr",
        emailSubject: "Antrag auf Konto- und Datenloeschung",
        warningTitle: "Wichtig:",
        warningText:
          "Bitte senden Sie Ihren Löschantrag von der E-Mail-Adresse, die mit Ihrem Konto verknüpft ist. Dies hilft uns, Ihre Identität zu bestätigen und Ihre Anfrage schneller zu bearbeiten.",
      },
      whatDeleted: {
        title: "Welche Daten werden gelöscht?",
        intro: "Nach Bearbeitung Ihrer Anfrage werden folgende Daten dauerhaft aus unseren Systemen entfernt:",
        items: [
          "Ihre Anmeldedaten (Google-Konto-E-Mail-Adresse, Benutzername, Google OAuth Provider UID)",
          "Profilinformationen und Einstellungen",
          "Spielstatistiken, Spielstände und Aktivitätsverlauf",
          "Alle weiteren mit Ihrem Konto verknüpften personenbezogenen Daten",
        ],
        notice:
          "Ihr Benutzerkonto, Ihr Profil und alle Sie identifizierenden Daten werden dauerhaft gelöscht. Historische Datensätze, die zur Systemintegrität aufbewahrt werden, werden de-identifiziert und anonymisiert.",
      },
      processingTime: {
        title: "Bearbeitungszeit",
        text: "Löschanträge werden innerhalb von 30 Tagen nach Eingang bearbeitet. Sie erhalten eine Bestätigungs-E-Mail, sobald Ihr Konto und Ihre Daten dauerhaft gelöscht wurden. Bitte beachten Sie, dass dieser Vorgang unumkehrbar ist – alle Daten werden dauerhaft gelöscht und können nicht wiederhergestellt werden.",
      },
      contact: {
        title: "Kontakt",
        textBeforeEmail: "Wenn Sie Fragen oder Bedenken bezüglich des Löschvorgangs haben, wenden Sie sich bitte an ",
        email: "help@keremkuyucu.com.tr",
        textAfterEmail: ".",
      },
    },
    spa: {
      metadata: {
        title: "Eliminación de cuenta y datos - Kerem Kuyucu",
        description: "Solicite la eliminación de su cuenta y los datos asociados de nuestras aplicaciones.",
      },
      title: "Eliminación de cuenta y datos",
      lastUpdated: "Última actualización: 17 de octubre de 2026",
      intro:
        "Respetamos su derecho a controlar sus datos personales. Si desea eliminar permanentemente su cuenta y todos los datos asociados de cualquiera de nuestras aplicaciones, puede enviar una solicitud de eliminación siguiendo las instrucciones a continuación.",
      howTo: {
        title: "¿Cómo solicitar la eliminación de cuenta y datos?",
        intro:
          "Para solicitar la eliminación de su cuenta y de todos los datos asociados a ella, envíe un correo electrónico a la dirección indicada abajo. Asegúrese de incluir la dirección de correo o nombre de usuario que utilizó para registrarse.",
        emailBoxTitle: "Envíe su solicitud a:",
        email: "help@keremkuyucu.com.tr",
        emailSubject: "Solicitud de eliminacion de cuenta y datos",
        warningTitle: "Importante:",
        warningText:
          "Envíe su solicitud de eliminación desde la dirección de correo electrónico asociada a su cuenta. Esto nos ayuda a verificar su identidad y procesar su solicitud con mayor rapidez.",
      },
      whatDeleted: {
        title: "¿Qué datos se eliminarán?",
        intro: "Una vez procesada su solicitud, los siguientes datos se eliminarán permanentemente de nuestros sistemas:",
        items: [
          "Sus credenciales de acceso (correo de la cuenta de Google, nombre de usuario, UID de Google OAuth)",
          "Información de perfil y preferencias",
          "Estadísticas de juego, puntuaciones e historial de actividad",
          "Cualquier otro dato de identificación personal vinculado a su cuenta",
        ],
        notice:
          "Su cuenta de usuario, perfil y todos los datos que le identifican se eliminarán de forma permanente. Cualquier registro histórico retenido por integridad del sistema será anonimizado.",
      },
      processingTime: {
        title: "Tiempo de procesamiento",
        text: "Las solicitudes de eliminación se procesan en un plazo de 30 días a partir de su recepción. Recibirá un correo electrónico de confirmación una vez que su cuenta y datos hayan sido eliminados permanentemente. Tenga en cuenta que esta acción es irreversible.",
      },
      contact: {
        title: "Contacto",
        textBeforeEmail: "Si tiene preguntas o dudas sobre el proceso de eliminación, comuníquese con nosotros en ",
        email: "help@keremkuyucu.com.tr",
        textAfterEmail: ".",
      },
    },
    fra: {
      metadata: {
        title: "Suppression de compte et données - Kerem Kuyucu",
        description: "Demandez la suppression de votre compte et des données associées de nos applications.",
      },
      title: "Suppression de compte et données",
      lastUpdated: "Dernière mise à jour : 17 octobre 2026",
      intro:
        "Nous respectons votre droit de contrôler vos données personnelles. Si vous souhaitez supprimer définitivement votre compte et toutes les données associées de l'une de nos applications, vous pouvez soumettre une demande de suppression en suivant les instructions ci-dessous.",
      howTo: {
        title: "Comment demander la suppression de compte et de données ?",
        intro:
          "Pour demander la suppression de votre compte et de toutes les données associées, veuillez envoyer un e-mail à l'adresse ci-dessous. Assurez-vous d'inclure l'adresse e-mail ou le nom d'utilisateur utilisé lors de votre inscription.",
        emailBoxTitle: "Envoyez votre demande à :",
        email: "help@keremkuyucu.com.tr",
        emailSubject: "Demande de suppression de compte et donnees",
        warningTitle: "Important :",
        warningText:
          "Veuillez envoyer votre demande de suppression depuis l'adresse e-mail associée à votre compte. Cela nous permet de vérifier votre identité et de traiter votre demande plus rapidement.",
      },
      whatDeleted: {
        title: "Quelles données seront supprimées ?",
        intro: "Après traitement de votre demande, les données suivantes seront définitivement supprimées de nos systèmes :",
        items: [
          "Vos identifiants de compte (adresse e-mail du compte Google, nom d'utilisateur, UID Google OAuth)",
          "Informations de profil et préférences",
          "Statistiques de jeu, scores et historique d'activité",
          "Toutes les autres données personnellement identifiables liées à votre compte",
        ],
        notice:
          "Votre compte utilisateur, votre profil et toutes les données vous identifiant seront définitivement supprimés. Les enregistrements historiques conservés pour l'intégrité du système seront anonymisés.",
      },
      processingTime: {
        title: "Délai de traitement",
        text: "Les demandes de suppression sont traitées dans un délai de 30 jours à compter de leur réception. Vous recevrez un e-mail de confirmation une fois votre compte et vos données définitivement supprimés. Veuillez noter que cette action est irréversible.",
      },
      contact: {
        title: "Nous contacter",
        textBeforeEmail: "Si vous avez des questions ou des inquiétudes concernant le processus de suppression, contactez-nous à ",
        email: "help@keremkuyucu.com.tr",
        textAfterEmail: ".",
      },
    },
    por: {
      metadata: {
        title: "Exclusão de Conta e Dados - Kerem Kuyucu",
        description: "Solicite a exclusão de sua conta e dos dados associados dos nossos aplicativos.",
      },
      title: "Exclusão de Conta e Dados",
      lastUpdated: "Última atualização: 17 de outubro de 2026",
      intro:
        "Respeitamos o seu direito de controlar seus dados pessoais. Se desejar excluir permanentemente sua conta e todos os dados associados de qualquer um de nossos aplicativos, envie uma solicitação de exclusão seguindo as instruções abaixo.",
      howTo: {
        title: "Como solicitar a exclusão de conta e dados?",
        intro:
          "Para solicitar a exclusão da sua conta e de todos os dados associados a ela, envie um e-mail para o endereço abaixo. Certifique-se de incluir o endereço de e-mail ou nome de usuário utilizado no cadastro.",
        emailBoxTitle: "Envie sua solicitação para:",
        email: "help@keremkuyucu.com.tr",
        emailSubject: "Solicitacao de exclusao de conta e dados",
        warningTitle: "Importante:",
        warningText:
          "Envie sua solicitação de exclusão a partir do endereço de e-mail associado à sua conta. Isso nos ajuda a verificar sua identidade e processar a solicitação mais rapidamente.",
      },
      whatDeleted: {
        title: "Quais dados serão excluídos?",
        intro: "Após o processamento da solicitação, os seguintes dados serão permanentemente removidos de nossos sistemas:",
        items: [
          "Suas credenciais de conta (e-mail da conta do Google, nome de usuário, UID do Google OAuth)",
          "Informações de perfil e preferências",
          "Estatísticas de jogo, pontuações e histórico de atividades",
          "Quaisquer outros dados de identificação pessoal vinculados à sua conta",
        ],
        notice:
          "Sua conta de usuário, perfil e todos os dados que identificam você serão excluídos permanentemente. Quaisquer registros históricos mantidos para integridade do sistema serão anonimizados.",
      },
      processingTime: {
        title: "Tempo de processamento",
        text: "As solicitações de exclusão são processadas em até 30 dias após o recebimento. Você receberá um e-mail de confirmação quando sua conta e seus dados forem excluídos permanentemente. Lembre-se de que esta ação é irreversível.",
      },
      contact: {
        title: "Fale Conosco",
        textBeforeEmail: "Se você tiver dúvidas sobre o processo de exclusão, entre em contato em ",
        email: "help@keremkuyucu.com.tr",
        textAfterEmail: ".",
      },
    },
    rus: {
      metadata: {
        title: "Удаление аккаунта и данных - Kerem Kuyucu",
        description: "Запросите удаление вашей учетной записи и связанных данных из наших приложений.",
      },
      title: "Удаление аккаунта и данных",
      lastUpdated: "Последнее обновление: 17 октября 2026 г.",
      intro:
        "Мы уважаем ваше право контролировать свои персональные данные. Если вы хотите навсегда удалить свою учетную запись и все связанные данные из любого из наших приложений, отправьте запрос на удаление, следуя инструкциям ниже.",
      howTo: {
        title: "Как запросить удаление аккаунта и данных?",
        intro:
          "Чтобы запросить удаление вашей учетной записи и всех связанных с ней данных, отправьте электронное письмо по указанному ниже адресу. Обязательно укажите адрес электронной почты или имя пользователя, использованные при регистрации.",
        emailBoxTitle: "Отправьте ваш запрос по адресу:",
        email: "help@keremkuyucu.com.tr",
        emailSubject: "Запрос на удаление аккаунта и данных",
        warningTitle: "Важно:",
        warningText:
          "Пожалуйста, отправляйте запрос на удаление с адреса электронной почты, связанного с вашей учетной записью. Это поможет нам подтвердить вашу личность и быстрее обработать запрос.",
      },
      whatDeleted: {
        title: "Какие данные будут удалены?",
        intro: "После обработки вашего запроса из наших систем будут безвозвратно удалены следующие данные:",
        items: [
          "Учетные данные для входа (адрес электронной почты Google, имя пользователя, UID провайдера Google OAuth)",
          "Информация профиля и настройки",
          "Статистика игр, результаты и история активности",
          "Любые другие персональные данные, связанные с вашей учетной записью",
        ],
        notice:
          "Ваша учетная запись, профиль и все идентифицирующие вас данные будут удалены навсегда. Исторические записи, сохраненные для обеспечения целостности системы, будут анонимизированы.",
      },
      processingTime: {
        title: "Срок обработки",
        text: "Запросы на удаление обрабатываются в течение 30 дней с момента получения. Вы получите письмо с подтверждением, как только ваша учетная запись и данные будут удалены навсегда. Обратите внимание, что это действие необратимо.",
      },
      contact: {
        title: "Связаться с нами",
        textBeforeEmail: "Если у вас есть вопросы или сомнения относительно процесса удаления, свяжитесь с нами по адресу ",
        email: "help@keremkuyucu.com.tr",
        textAfterEmail: ".",
      },
    },
  },
};

const LANG_ALIASES: Record<string, AuthLang> = {
  // 3-letter codes
  eng: "eng",
  tur: "tur",
  deu: "deu",
  spa: "spa",
  fra: "fra",
  por: "por",
  rus: "rus",
  // 2-letter codes (backward compatibility)
  en: "eng",
  tr: "tur",
  de: "deu",
  es: "spa",
  fr: "fra",
  pt: "por",
  ru: "rus",
};

export function parseAuthSlug(
  slug: string[]
): { lang: AuthLang; pageSlug: AuthPageSlug } | null {
  if (!slug || slug.length === 0 || slug.length > 2) return null;

  if (slug.length === 1) {
    const s = slug[0];
    if (s === "privacy" || s === "tos" || s === "delete-account") {
      return { lang: "tur", pageSlug: s };
    }
    return null;
  }

  if (slug.length === 2) {
    const [l, s] = slug;
    const resolvedLang = LANG_ALIASES[l.toLowerCase()];
    if (
      resolvedLang &&
      (s === "privacy" || s === "tos" || s === "delete-account")
    ) {
      return { lang: resolvedLang, pageSlug: s as AuthPageSlug };
    }
    return null;
  }

  return null;
}

export function getAllAuthSlugs(): { slug: string[] }[] {
  const pageSlugs: AuthPageSlug[] = ["privacy", "tos", "delete-account"];
  const canonicalLangs: AuthLang[] = ["tur", "eng", "deu", "spa", "fra", "por", "rus"];
  const legacyLangs = ["tr", "en", "de", "es", "fr", "pt", "ru"];

  const result: { slug: string[] }[] = [];

  for (const pageSlug of pageSlugs) {
    // 1-segment: /auth/privacy
    result.push({ slug: [pageSlug] });

    // Canonical 3-letter: /auth/tur/privacy, /auth/eng/privacy, etc.
    for (const clang of canonicalLangs) {
      result.push({ slug: [clang, pageSlug] });
    }

    // Legacy 2-letter: /auth/tr/privacy, /auth/en/privacy, etc.
    for (const llang of legacyLangs) {
      result.push({ slug: [llang, pageSlug] });
    }
  }

  return result;
}
