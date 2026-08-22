import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";

export const metadata = {
  title: "GeoGame - Kullanım Koşulları",
  description: "GeoGame mobil uygulaması için kullanım koşulları",
};

export default function GeoGameTermsOfService() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar />

      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            GeoGame - Kullanım Koşulları
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Son Güncelleme Tarihi: 23 Ağustos 2026
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              Bu Kullanım Koşulları, Kerem Kuyucu tarafından geliştirilen GeoGame uygulamasını (&quot;Uygulama&quot;) kullanımınıza ilişkin hüküm ve koşulları belirler. Uygulamayı indirerek, yükleyerek veya kullanarak bu koşulları kabul etmiş sayılırsınız. Bu koşulları kabul etmiyorsanız, lütfen Uygulamayı kullanmayınız.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1. Hizmetin Tanımı</h2>
              <p>
                GeoGame, kullanıcıların coğrafya bilgilerini etkileşimli oyun modları (başkentler, bayraklar, mesafe tahmini ve kıta bazlı seviyeler) aracılığıyla test etmelerine ve geliştirmelerine olanak tanıyan ücretsiz, eğitim amaçlı bir uygulamadır. Uygulama Android ve Windows (Masaüstü) platformlarında kullanılabilir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2. Hesap Oluşturma ve Güvenlik</h2>
              <p className="mb-3">
                Uygulamanın belirli özelliklerini kullanmak için bir hesap oluşturmanız gerekebilir. Hesap oluştururken:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Doğru, güncel ve eksiksiz bilgiler sağlamakla yükümlüsünüz.</li>
                <li>Hesap bilgilerinizin (özellikle şifrenizin) gizliliğini korumak sizin sorumluluğunuzdadır.</li>
                <li>Hesabınız üzerinden gerçekleştirilen tüm işlemlerden siz sorumlusunuz.</li>
                <li>Hesabınıza yetkisiz erişim tespit etmeniz durumunda derhal <a href="mailto:help@keremkk.com.tr" className="text-blue-600 dark:text-blue-400 hover:underline">help@keremkk.com.tr</a> adresine bildirmelisiniz.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">3. Kabul Edilebilir Kullanım</h2>
              <p className="mb-3">
                Uygulamayı kullanırken aşağıdaki kurallara uymayı kabul edersiniz:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Uygulamayı yalnızca yasal amaçlarla ve bu koşullara uygun şekilde kullanacaksınız.</li>
                <li>Sıralama tablolarını manipüle etmek veya haksız avantaj elde etmek amacıyla hile yazılımı, bot, otomasyon aracı veya benzeri yöntemler kullanmayacaksınız.</li>
                <li>Uygulamanın sunucu altyapısına, veritabanına veya API&apos;lerine yetkisiz erişim sağlamaya çalışmayacaksınız.</li>
                <li>Diğer kullanıcıların Uygulamayı kullanmasını engelleyecek veya olumsuz etkileyecek faaliyetlerde bulunmayacaksınız.</li>
                <li>Kullanıcı adınızda veya profil bilgilerinizde hakaret, nefret söylemi, müstehcen veya yanıltıcı içerik kullanmayacaksınız.</li>
                <li>Uygulamayı tersine mühendislik (reverse engineering), kaynak kodunu çıkarma (decompile) veya parçalarına ayırma (disassemble) girişiminde bulunmayacaksınız (ilgili açık kaynak lisansının izin verdiği durumlar hariç).</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">4. Fikri Mülkiyet</h2>
              <p>
                Uygulama, GNU General Public License v3.0 (GPLv3) lisansı altında dağıtılmaktadır. Kaynak kodu, ilgili lisans koşullarına uygun olarak kullanılabilir, değiştirilebilir ve dağıtılabilir. Ancak GeoGame adı, logosu ve markası Kerem Kuyucu&apos;ya aittir ve önceden yazılı izin alınmadan ticari amaçlarla kullanılamaz.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">5. Kullanıcı İçeriği</h2>
              <p>
                Uygulama içerisinde oluşturduğunuz kullanıcı adı ve profil bilgileri gibi içerikler, sıralama tabloları ve diğer sosyal özelliklerde görüntülenebilir. Bu içeriklerin üçüncü tarafların haklarını ihlal etmemesinden ve topluluk kurallarına uygun olmasından siz sorumlusunuz. Kerem Kuyucu, bu koşulları ihlal eden kullanıcı içeriklerini önceden bildirimde bulunmaksızın kaldırma hakkını saklı tutar.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">6. Sorumluluk Sınırlaması</h2>
              <p className="mb-3">
                Uygulama &quot;olduğu gibi&quot; ve &quot;mevcut haliyle&quot; sunulmaktadır. Kerem Kuyucu:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Uygulamanın kesintisiz, hatasız veya güvenli çalışacağını garanti etmez.</li>
                <li>Uygulamanın kullanımından veya kullanılamamasından doğan doğrudan, dolaylı, arızi, özel veya sonuç olarak ortaya çıkan herhangi bir zarardan sorumlu tutulamaz.</li>
                <li>Oyun içi verilerin (skorlar, istatistikler, ilerleme vb.) kaybından sorumlu değildir.</li>
                <li>Üçüncü taraf hizmet sağlayıcılarının (Supabase, Google Play Hizmetleri vb.) kesintilerinden veya hatalarından sorumlu tutulamaz.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">7. Hesap Askıya Alma ve Fesih</h2>
              <p className="mb-3">
                Kerem Kuyucu, aşağıdaki durumlarda hesabınızı önceden bildirimde bulunmaksızın askıya alma veya kalıcı olarak sonlandırma hakkını saklı tutar:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Bu Kullanım Koşulları&apos;nın ihlal edilmesi.</li>
                <li>Hile, dolandırıcılık veya kötüye kullanım tespit edilmesi.</li>
                <li>Diğer kullanıcıları rahatsız eden veya tehdit eden davranışlar sergilenmesi.</li>
                <li>Uygulamanın güvenliğini veya bütünlüğünü tehlikeye atan faaliyetler.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">8. Hesap Silme</h2>
              <p>
                Hesabınızı ve tüm ilişkili verilerinizi kalıcı olarak silmek istemeniz durumunda, <a href="mailto:help@keremkk.com.tr" className="text-blue-600 dark:text-blue-400 hover:underline">help@keremkk.com.tr</a> adresine başvurabilirsiniz. Hesap silme talepleriniz en geç 30 gün içinde işleme alınacaktır. Silinen hesaplar ve veriler geri alınamaz.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">9. Hizmet Değişiklikleri</h2>
              <p>
                Kerem Kuyucu, Uygulamayı herhangi bir zamanda güncelleme, değiştirme veya hizmeti geçici ya da kalıcı olarak durdurma hakkını saklı tutar. Hizmetin durdurulması veya değiştirilmesi nedeniyle oluşabilecek herhangi bir kayıp veya zarardan sorumluluk kabul edilmez.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">10. Yaş Sınırı</h2>
              <p>
                Uygulamayı kullanmak için en az 13 yaşında olmanız gerekmektedir. 13 yaşından küçük kullanıcılar, yalnızca ebeveyn veya yasal vasilerinin gözetiminde Uygulamayı kullanabilirler.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">11. Gizlilik</h2>
              <p>
                Kişisel verilerinizin toplanması ve kullanılması hakkında detaylı bilgi için lütfen{" "}
                <a href="/privacy/geogame" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Gizlilik Politikamızı
                </a>{" "}
                inceleyiniz. Gizlilik Politikası, bu Kullanım Koşulları&apos;nın ayrılmaz bir parçasıdır.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">12. Uygulanacak Hukuk</h2>
              <p>
                Bu Kullanım Koşulları, Türkiye Cumhuriyeti yasalarına tabidir ve bu yasalara göre yorumlanır. Bu koşullardan kaynaklanan herhangi bir uyuşmazlık, Türkiye Cumhuriyeti mahkemelerinin münhasır yargı yetkisine tabi olacaktır.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">13. Değişiklikler</h2>
              <p>
                Bu Kullanım Koşulları&apos;nı zaman zaman güncelleyebiliriz. Değişiklikler bu sayfada yayımlandıktan hemen sonra yürürlüğe girer. Önemli değişiklikler yapılması durumunda, Uygulama içinden bildirim gönderilmesi için çaba gösterilecektir. Uygulamayı kullanmaya devam etmeniz, güncellenmiş koşulları kabul ettiğiniz anlamına gelir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">14. Bize Ulaşın</h2>
              <p>
                Bu Kullanım Koşulları ile ilgili herhangi bir sorunuz veya öneriniz varsa, benimle iletişime geçmekten çekinmeyin. Bana <a href="mailto:help@keremkk.com.tr" className="text-blue-600 dark:text-blue-400 hover:underline">help@keremkk.com.tr</a> adresinden ulaşabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FooterComponent />
    </main>
  );
}
