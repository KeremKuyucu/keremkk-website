import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";

export const metadata = {
  title: "GeoGame - Gizlilik Politikası",
  description: "GeoGame mobil uygulaması için gizlilik politikası",
};

export default function GeoGamePrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            GeoGame - Gizlilik Politikası
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Son Güncelleme Tarihi: 11 Ağustos 2026
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              Kerem Kuyucu, GeoGame uygulamasını Ücretsiz bir uygulama olarak geliştirmiştir. Bu HİZMET Kerem Kuyucu tarafından hiçbir ücret talep edilmeden sağlanmaktadır ve olduğu gibi kullanılması amaçlanmıştır.
            </p>
            <p>
              Bu sayfa, HİZMET&apos;imi kullanmaya karar veren herkesi, Kişisel Bilgilerin toplanması, kullanılması ve ifşa edilmesiyle ilgili politikalarım hakkında bilgilendirmek için kullanılmaktadır.
            </p>
            <p>
              HİZMET&apos;imi kullanmayı seçerseniz, bu politikayla ilişkili olarak bilgilerin toplanmasını ve kullanılmasını kabul etmiş olursunuz.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Bilgi Toplama ve Kullanım</h2>
              <p className="mb-3">
                Uygulamamız, hesap oluşturma ve oturum açma işlemleri için aşağıdaki kişisel bilgileri toplamaktadır:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-3">
                <li><strong>E-posta adresi:</strong> Hesap oluşturma, oturum açma ve hesap kurtarma amacıyla kullanılır.</li>
                <li><strong>Kullanıcı adı (İsim):</strong> Oyun içi sıralama tablolarında ve profil bilgilerinizde görüntülenmek üzere kullanılır.</li>
                <li><strong>Şifre:</strong> Hesap güvenliğinizi sağlamak amacıyla şifrelenmiş olarak saklanır.</li>
              </ul>
              <p>
                Bunlara ek olarak, uygulama istatistiksel amaçlı olarak cihazınızda oluşturulan tekil tanımlayıcılar (UUID) ve oyun istatistikleri (oyun skorları, oynanma süreleri vb.) toplayabilir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Verilerin Saklanması</h2>
              <p>
                Toplanan veriler, Supabase altyapısı üzerinde güvenli bir şekilde saklanmaktadır. Şifreleriniz tek yönlü şifreleme (hashing) ile korunmakta olup, düz metin olarak hiçbir yerde saklanmamaktadır. Verileriniz yalnızca hizmetin işleyişi için gerekli olduğu sürece muhafaza edilir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Üçüncü Taraf Hizmet Sağlayıcıları</h2>
              <p className="mb-3">
                Uygulamamız, kimlik doğrulama ve veri saklama hizmetleri için üçüncü taraf altyapı sağlayıcılarını kullanmaktadır.
              </p>
              <p className="mb-2">Uygulama tarafından kullanılan üçüncü taraf hizmet sağlayıcılarının gizlilik politikalarına aşağıdaki bağlantılardan ulaşabilirsiniz:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Google Play Hizmetleri
                  </a>
                </li>
                <li>
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Supabase
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Günlük Verileri (Log Data)</h2>
              <p>
                Uygulamayı kullanırken bir hata veya çökme oluşması durumunda, cihazınızdaki Günlük Verileri (Log Data) toplanabilir. Bu Günlük Verileri; cihazınızın İnternet Protokolü (&quot;IP&quot;) adresi, cihaz adı, işletim sistemi sürümü, hizmetimizi kullanırken uygulamanın yapılandırması, hizmeti kullanımınızın saati, tarihi ve diğer istatistikler gibi bilgileri içerebilir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Hesap Silme</h2>
              <p>
                Hesabınızı ve tüm ilişkili verilerinizi kalıcı olarak silmek istemeniz durumunda, aşağıdaki e-posta adresi üzerinden talepte bulunabilirsiniz. Hesap silme talepleriniz en geç 30 gün içinde işleme alınacaktır.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Çocukların Gizliliği</h2>
              <p>
                Bu HİZMET, 13 yaşın altındaki çocuklara yönelik değildir. 13 yaşın altındaki çocuklardan bilerek kişisel bilgi toplamam. Bir ebeveyn veya vasi olarak çocuğunuzun bize kişisel bilgi sağladığını fark ederseniz, lütfen benimle iletişime geçin; gerekli önlemleri alacağım.
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
                Gizlilik Politikam ile ilgili herhangi bir sorunuz veya öneriniz varsa, benimle iletişime geçmekten çekinmeyin. Bana <a href="mailto:help@keremkk.com.tr" className="text-blue-600 dark:text-blue-400 hover:underline">iletisim@keremkk.com.tr</a> adresinden ulaşabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FooterComponent />
    </main>
  );
}
