import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";

export const metadata = {
  title: "Okey Defteri - Gizlilik Politikası",
  description: "Okey Defteri mobil uygulaması için gizlilik politikası",
};

export default function OkeyDefteriPrivacyPolicyTR() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Okey Defteri - Gizlilik Politikası
            </h1>
            <div className="inline-flex self-start sm:self-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">
              <Link
                href="/en/privacy/okey-defteri"
                className="px-3 py-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                EN
              </Link>
              <Link
                href="/tr/privacy/okey-defteri"
                className="px-3 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              >
                TR
              </Link>
            </div>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Son Güncelleme Tarihi: 16 Temmuz 2026
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              Kerem Kuyucu, Okey Defteri uygulamasını Ücretsiz (Reklam Destekli) bir uygulama olarak geliştirmiştir. Bu HİZMET Kerem Kuyucu tarafından hiçbir ücret talep edilmeden sağlanmaktadır ve olduğu gibi kullanılması amaçlanmıştır.
            </p>
            <p>
              Bu sayfa, HİZMET&apos;imi kullanmaya karar veren herkesi, Kişisel Bilgilerin toplanması, kullanılması ve ifşa edilmesiyle ilgili politikalarım hakkında bilgilendirmek için kullanılmaktadır.
            </p>
            <p>
              HİZMET&apos;imi kullanmayı seçerseniz, bu politikayla ilişkili olarak bilgilerin toplanmasını ve kullanılmasını kabul etmiş olursunuz.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Bilgi Toplama ve Kullanım</h2>
              <p>
                Uygulamamız daha iyi bir deneyim sunmak amacıyla, bazı kişisel olmayan verileri toplayabilir. Topladığımız veriler arasında istatistiksel amaçlı olarak cihazınızda oluşturulan tekil tanımlayıcılar (UUID) bulunabilir. Bu verilerle kişisel kimliğinize (adınız, e-posta adresiniz vb.) ulaşılması kesinlikle mümkün değildir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Üçüncü Taraf Hizmet Sağlayıcıları</h2>
              <p className="mb-3">
                Uygulamamız, hizmetlerimizi sağlamak veya reklam göstermek için üçüncü taraf hizmetlerini kullanmaktadır. Bu hizmetler, cihazınızın Reklam Kimliği&apos;ne veya teknik verilere (Crash günlükleri gibi) erişebilir.
              </p>
              <p className="mb-2">Uygulama tarafından kullanılan üçüncü taraf hizmet sağlayıcılarının gizlilik politikalarına aşağıdaki bağlantılardan ulaşabilirsiniz:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Google Play Hizmetleri
                  </a>
                </li>
                <li>
                  <a href="https://support.google.com/admob/answer/6128543?hl=tr" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    AdMob
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Günlük Verileri (Log Data)</h2>
              <p>
                Uygulamayı kullanırken bir hata veya çökme oluşması durumunda, (üçüncü taraf ürünler aracılığıyla) cihazınızdaki Günlük Verileri (Log Data) toplanabilir. Bu Günlük Verileri; cihazınızın İnternet Protokolü (&quot;IP&quot;) adresi, cihaz adı, işletim sistemi sürümü, hizmetimizi kullanırken uygulamanın yapılandırması, hizmeti kullanımınızın saati, tarihi ve diğer istatistikler gibi bilgileri içerebilir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Değişiklikler</h2>
              <p>
                Gizlilik Politikamızı zaman zaman güncelleyebiliriz. Bu nedenle, herhangi bir değişiklik olup olmadığını görmek için bu sayfayı periyodik olarak gözden geçirmeniz tavsiye edilir. Değişiklikler bu sayfada yayımlandıktan hemen sonra yürürlüğe girer.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Bize Ulaşın</h2>
              <p>
                Gizlilik Politikam ile ilgili herhangi bir sorunuz veya öneriniz varsa, benimle iletişime geçmekten çekinmeyin. Bana <a href="mailto:help@keremkk.com.tr" className="text-blue-600 dark:text-blue-400 hover:underline">help@keremkk.com.tr</a> adresinden ulaşabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FooterComponent />
    </main>
  );
}
