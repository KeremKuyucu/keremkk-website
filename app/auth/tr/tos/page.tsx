import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";

export const metadata = {
  title: "Kullanım Koşulları – Kerem Kuyucu Auth",
  description:
    "Kerem Kuyucu ortak kimlik doğrulama hizmetini kullanan tüm uygulamalar için kullanım koşulları.",
};

export default function AuthTosTR() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar showLangSwitcher={false} />

      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Kullanım Koşulları
            </h1>
            <div className="inline-flex self-start sm:self-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">
              <Link
                href="/auth/en/tos"
                className="px-3 py-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                EN
              </Link>
              <Link
                href="/auth/tr/tos"
                className="px-3 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              >
                TR
              </Link>
            </div>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Son Güncelleme: 7 Eylül 2026
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              Bu Kullanım Koşulları, Kerem Kuyucu tarafından sağlanan ve birden fazla uygulama
              tarafından kullanılan ortak kimlik doğrulama hizmetinin kullanımını düzenlemektedir.
              Hesap oluşturarak veya giriş yaparak bu koşulları kabul etmiş olursunuz.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                1. Hizmetin Tanımı
              </h2>
              <p>
                Kerem Kuyucu tarafından geliştirilen uygulamalar (GeoGame, Okey Defteri ve diğerleri)
                tek bir ortak hesap sistemi kullanmaktadır. Bu hizmet; hesap oluşturma, kimlik
                doğrulama ve uygulamalar arası profil yönetimi işlevlerini kapsar.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                2. Hesap Oluşturma ve Güvenlik
              </h2>
              <p className="mb-3">
                Hesap oluştururken aşağıdaki kurallara uymayı kabul edersiniz:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Doğru, güncel ve eksiksiz bilgi sağlamayı kabul edersiniz.</li>
                <li>Hesap kimlik bilgilerinizin (özellikle şifrenizin) gizliliğini korumakla yükümlüsünüz.</li>
                <li>Hesabınız altında gerçekleşen tüm faaliyetlerden sorumlusunuz.</li>
                <li>
                  Hesabınıza yetkisiz erişim tespit ederseniz derhal{" "}
                  <a
                    href="mailto:help@keremkk.com.tr"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    help@keremkk.com.tr
                  </a>{" "}
                  adresine bildirmeniz gerekmektedir.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                3. Kabul Edilebilir Kullanım
              </h2>
              <p className="mb-3">Hizmetimizi kullanırken aşağıdaki kurallara uymayı kabul edersiniz:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hizmeti yalnızca yasal amaçlar için ve bu koşullara uygun şekilde kullanırsınız.</li>
                <li>Sahte hesap oluşturmazsınız veya başkasının kimliğine bürünmezsiniz.</li>
                <li>Kullanıcı adı veya profil bilgilerinizde saldırgan, nefret içeren, müstehcen veya yanıltıcı dil kullanmazsınız.</li>
                <li>Sistemin güvenliğini tehlikeye atacak girişimlerde bulunmazsınız.</li>
                <li>Hizmetin sunucu altyapısına, veritabanlarına veya API&apos;larına yetkisiz erişim sağlamaya çalışmazsınız.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                4. Fikri Mülkiyet
              </h2>
              <p>
                Kimlik doğrulama hizmetine ilişkin tüm haklar Kerem Kuyucu&apos;ya aittir. Kerem Kuyucu
                adı, logosu ve markası, önceden yazılı izin alınmadan ticari amaçlarla kullanılamaz.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                5. Sorumluluk Sınırlaması
              </h2>
              <p className="mb-3">Hizmet &quot;olduğu gibi&quot; sunulmaktadır. Kerem Kuyucu:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hizmetin kesintisiz, hatasız veya tamamen güvenli olacağını garanti etmez.</li>
                <li>Hizmetin kullanımından veya kullanılamamasından kaynaklanan doğrudan, dolaylı veya arızi zararlardan sorumlu tutulamaz.</li>
                <li>Üçüncü taraf hizmet sağlayıcılarından (Supabase, Google vb.) kaynaklanan kesintiler veya hatalardan sorumlu değildir.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                6. Hesap Askıya Alma ve Fesih
              </h2>
              <p className="mb-3">
                Kerem Kuyucu, aşağıdaki durumlarda hesabınızı önceden bildirimde bulunmaksızın
                askıya alma veya kalıcı olarak sonlandırma hakkını saklı tutar:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Bu Kullanım Koşullarının ihlali.</li>
                <li>Sahtecilik, dolandırıcılık veya kötüye kullanım tespiti.</li>
                <li>Diğer kullanıcılara yönelik taciz edici, tehdit edici veya zarar verici davranış.</li>
                <li>Hizmetin güvenliğini veya bütünlüğünü tehlikeye atacak eylemler.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                7. Hesap Silme
              </h2>
              <p>
                Hesabınızı ve ilgili tüm verilerinizi kalıcı olarak silmek istiyorsanız{" "}
                <a
                  href="mailto:help@keremkk.com.tr"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  help@keremkk.com.tr
                </a>{" "}
                adresine e-posta gönderebilir ya da{" "}
                <a href="/auth/tr/delete-account" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Hesap ve Veri Silme
                </a>{" "}
                sayfamızı ziyaret edebilirsiniz. Silme talepleri 30 gün içinde işleme alınır.
                Silinen hesaplar ve veriler kurtarılamaz.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                8. Yaş Kısıtlaması
              </h2>
              <p>
                Bu hizmeti kullanabilmek için en az 13 yaşında olmanız gerekmektedir. 13 yaşın
                altındaki kullanıcılar, hizmeti yalnızca bir ebeveyn veya yasal vasi gözetiminde
                kullanabilir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                9. Gizlilik
              </h2>
              <p>
                Kişisel verilerinizin nasıl toplandığı ve işlendiğine ilişkin ayrıntılı bilgi için
                lütfen{" "}
                <a
                  href="/auth/tr/privacy"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Gizlilik Politikamızı
                </a>{" "}
                inceleyin. Gizlilik Politikası bu Kullanım Koşullarının ayrılmaz bir parçasını
                oluşturmaktadır.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                10. Uygulanacak Hukuk
              </h2>
              <p>
                Bu Kullanım Koşulları Türkiye Cumhuriyeti kanunlarına tabidir. Bu koşullardan
                doğabilecek her türlü uyuşmazlık, Türkiye Cumhuriyeti mahkemelerinin münhasır
                yargı yetkisine tabidir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                11. Koşullardaki Değişiklikler
              </h2>
              <p>
                Bu Kullanım Koşullarını zaman zaman güncelleyebiliriz. Değişiklikler bu sayfada
                yayımlandıktan hemen sonra yürürlüğe girer. Hizmeti kullanmaya devam etmeniz,
                güncellenmiş koşulları kabul ettiğiniz anlamına gelir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                12. İletişim
              </h2>
              <p>
                Bu Kullanım Koşulları hakkında soru veya önerileriniz için{" "}
                <a
                  href="mailto:help@keremkk.com.tr"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  help@keremkk.com.tr
                </a>{" "}
                adresinden bizimle iletişime geçebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FooterComponent />
    </main>
  );
}
