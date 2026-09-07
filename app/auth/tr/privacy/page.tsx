import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";

export const metadata = {
  title: "Gizlilik Politikası – Kerem Kuyucu Auth",
  description:
    "Kerem Kuyucu ortak kimlik doğrulama hizmetini kullanan tüm uygulamalar için gizlilik politikası.",
};

export default function AuthPrivacyPolicyTR() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar showLangSwitcher={false} />

      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Gizlilik Politikası
            </h1>
            <div className="inline-flex self-start sm:self-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">
              <Link
                href="/auth/en/privacy"
                className="px-3 py-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                EN
              </Link>
              <Link
                href="/auth/tr/privacy"
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
              Bu Gizlilik Politikası, Kerem Kuyucu&apos;nun (&quot;biz&quot;, &quot;bizim&quot;) tüm uygulamalarında
              kullanılan ortak kimlik doğrulama hizmeti aracılığıyla giriş yaptığınızda kişisel
              bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
            </p>
            <p>
              Hesap oluşturarak veya giriş yaparak, bu politikaya uygun olarak bilgilerinizin
              toplanmasını ve kullanılmasını kabul etmiş olursunuz.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                1. Topladığımız Bilgiler
              </h2>
              <p className="mb-3">
                Hesap oluştururken veya giriş yaparken aşağıdaki bilgileri toplarız:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>E-posta adresi:</strong> Hesap oluşturma, kimlik doğrulama ve hesap
                  kurtarma işlemleri için kullanılır.
                </li>
                <li>
                  <strong>Görünen ad / Kullanıcı adı:</strong> Kullandığınız uygulamalarda sizi
                  tanımlamak için kullanılır (örn. skor tabloları, profiller).
                </li>
                <li>
                  <strong>Şifre:</strong> Tek yönlü kriptografik hashleme ile şifrelenmiş olarak
                  saklanır. Şifreniz hiçbir zaman düz metin olarak depolanmaz veya iletilmez.
                </li>
                <li>
                  <strong>Profil fotoğrafı (isteğe bağlı):</strong> Seçerseniz, yalnızca görüntüleme
                  amacıyla kullanılır.
                </li>
              </ul>
              <p className="mt-3">
                Ayrıca güvenlik ve hizmet iyileştirme amacıyla benzersiz cihaz tanımlayıcıları ve
                temel kullanım istatistikleri (ör. giriş zaman damgaları) toplanabilir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                2. Bilgilerinizi Nasıl Kullanırız
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Uygulamalarımız genelinde hesabınızı oluşturmak ve yönetmek için.</li>
                <li>Giriş yaptığınızda kimliğinizi doğrulamak için.</li>
                <li>Skor tabloları ve uygulamalar arası profiller gibi özellikleri etkinleştirmek için.</li>
                <li>Şifre sıfırlama gibi temel hesap bildirimleri göndermek için.</li>
                <li>Sahte veya yetkisiz erişimi tespit etmek ve önlemek için.</li>
                <li>Geçerli yasal yükümlülüklere uymak için.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                3. Veri Depolama ve Güvenlik
              </h2>
              <p>
                Tüm veriler Supabase altyapısında güvenli bir şekilde depolanır. Şifreler tek yönlü
                kriptografik hashleme ile korunur ve hiçbir zaman düz metin olarak saklanmaz.
                Transit halindeki tüm veriler için HTTPS şifrelemesi dahil olmak üzere endüstri
                standardı güvenlik önlemleri uygulanır. Verileriniz, hizmetin sağlanması ve
                sürdürülmesi için gerekli olduğu sürece veya yasaların gerektirdiği kadar saklanır.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                4. Üçüncü Taraf Hizmet Sağlayıcılar
              </h2>
              <p className="mb-3">
                Kimlik doğrulama sistemimizi işletmek için aşağıdaki üçüncü taraf hizmetleri
                kullanmaktayız. Bu sağlayıcılar, kişisel bilgilerinize yalnızca adımıza görevleri
                yerine getirmek için erişebilir ve başka amaçlarla ifşa etmeme yükümlülüğü altındadır.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Supabase
                  </a>{" "}
                  – Kimlik doğrulama ve veritabanı altyapısı.
                </li>
                <li>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Google (Google ile Giriş)
                  </a>{" "}
                  – İsteğe bağlı OAuth giriş sağlayıcısı.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                5. Veri Paylaşımı
              </h2>
              <p>
                Kişisel bilgilerinizi üçüncü taraflara satmıyor, takas etmiyor veya kiralamıyoruz.
                Verileriniz yalnızca aşağıdaki sınırlı durumlarda paylaşılabilir:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Yalnızca kimlik doğrulama hizmetini işletmek amacıyla yukarıda listelenen hizmet sağlayıcılarla.</li>
                <li>Yasa, yönetmelik veya geçerli bir yasal sürecin gerektirmesi durumunda.</li>
                <li>Kerem Kuyucu veya kullanıcılarımızın haklarını, mülkünü veya güvenliğini korumak amacıyla.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                6. Günlük Verileri
              </h2>
              <p>
                Bir hata veya güvenlik olayı durumunda sunucularımız otomatik olarak IP adresiniz,
                tarayıcı türünüz, istek tarihi ve saati ile ziyaret edilen sayfalar gibi Günlük
                Verilerini toplayabilir. Bu bilgiler yalnızca güvenlik izleme ve hata ayıklama
                amacıyla kullanılır.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                7. Çocukların Gizliliği
              </h2>
              <p>
                Kimlik doğrulama hizmetimiz 13 yaşın altındaki kişilere yönelik değildir. 13
                yaşın altındaki çocuklardan bilerek kişisel bilgi toplamıyoruz. Çocuğunuzun bize
                kişisel bilgi sağladığına inanan ebeveyn veya vasilerin uygun önlem alabilmemiz
                için derhal bizimle iletişime geçmesini rica ederiz.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                8. Haklarınız
              </h2>
              <p className="mb-3">Aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hakkınızda tuttuğumuz kişisel verilere erişim.</li>
                <li>Yanlış verilerin düzeltilmesini talep etme.</li>
                <li>
                  Hesabınızın ve ilgili tüm verilerinizin silinmesini talep etme. Bu talebi e-posta
                  yoluyla iletebilir ya da{" "}
                  <a
                    href="/auth/tr/delete-account"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Hesap ve Veri Silme
                  </a>{" "}
                  sayfamızı ziyaret edebilirsiniz. Talepler 30 gün içinde işleme alınır.
                </li>
                <li>Verilerinizin belirli kullanımlarına itiraz etme veya kısıtlama talep etme.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                9. Bu Gizlilik Politikasındaki Değişiklikler
              </h2>
              <p>
                Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Değişiklikler bu sayfada
                yayımlandıktan hemen sonra yürürlüğe girer. Bu sayfayı periyodik olarak
                incelemenizi öneririz. Herhangi bir değişikliğin ardından hizmetlerimizi kullanmaya
                devam etmeniz, yeni politikayı kabul ettiğiniz anlamına gelir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                10. İletişim
              </h2>
              <p>
                Bu Gizlilik Politikası hakkında soru veya endişeleriniz için{" "}
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
