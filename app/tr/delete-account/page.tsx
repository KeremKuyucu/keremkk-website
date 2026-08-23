import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import FooterComponent from "@/app/components/layout/Footer";

export const metadata = {
  title: "Hesap ve Veri Silme - Kerem Kuyucu",
  description:
    "Uygulamalarımızdaki hesabınızın ve ilişkili verilerinizin silinmesini talep edin.",
};

export default function DeleteAccountPageTR() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Navbar />

      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Hesap ve Veri Silme
            </h1>
            <div className="inline-flex self-start sm:self-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">
              <Link
                href="/en/delete-account"
                className="px-3 py-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                EN
              </Link>
              <Link
                href="/tr/delete-account"
                className="px-3 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              >
                TR
              </Link>
            </div>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Son Güncelleme Tarihi: 11 Ağustos 2026
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              Kişisel verilerinizi kontrol etme hakkınıza saygı duyuyoruz. Herhangi bir uygulamamızdaki hesabınızı ve ilişkili tüm verilerinizi kalıcı olarak silmek istiyorsanız, aşağıdaki talimatları izleyerek silme talebinde bulunabilirsiniz.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Hesap ve Veri Silme Talebi Nasıl Yapılır?
              </h2>
              <p className="mb-4">
                Hesabınızın ve onunla ilişkili tüm verilerin silinmesini talep etmek için lütfen aşağıdaki adrese bir e-posta gönderin. Hesabınızı tespit edebilmemiz için kayıt olurken kullandığınız e-posta adresini veya kullanıcı adını belirttiğinizden emin olun.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Talebinizi ileteceğiniz adres:
                </p>
                <a
                  href="mailto:help@keremkk.com.tr?subject=Hesap%20ve%20Veri%20Silme%20Talebi"
                  className="text-lg md:text-xl font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  help@keremkk.com.tr
                </a>
              </div>
              <div className="mt-4 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <span className="text-amber-500 text-xl leading-none mt-0.5">⚠️</span>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  <strong>Önemli:</strong> Kimliğinizi doğrulayabilmemiz ve talebinizi daha hızlı işleme alabilmemiz için lütfen silme talebini hesabınızla ilişkili olan e-posta adresinden gönderin.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Hangi Veriler Silinecek?
              </h2>
              <p className="mb-3">
                Talebiniz işleme alındığında aşağıdaki veriler sistemlerimizden kalıcı olarak silinecektir:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hesap giriş bilgileriniz (e-posta adresi, kullanıcı adı, şifrelenmiş parola)</li>
                <li>Profil bilgileriniz ve tercihleriniz</li>
                <li>Oyun istatistikleri, skorlar ve aktivite geçmişi</li>
                <li>Hesabınızla bağlantılı diğer tüm kişisel tanımlanabilir veriler</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                İşlem Süresi
              </h2>
              <p>
                Silme talepleri tarafımıza ulaştıktan sonra en geç <strong>30 gün</strong> içinde işleme alınır. Hesabınız ve verileriniz kalıcı olarak silindiğinde bir onay e-postası alacaksınız. Bu işlemin geri alınamaz olduğunu, tüm verilerinizin kalıcı olarak silineceğini ve kurtarılamayacağını lütfen unutmayın.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Bize Ulaşın
              </h2>
              <p>
                Silme işlemiyle ilgili herhangi bir sorunuz veya endişeniz varsa, bizimle{" "}
                <a
                  href="mailto:help@keremkk.com.tr"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  help@keremkk.com.tr
                </a>{" "}
                adresi üzerinden iletişime geçebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FooterComponent />
    </main>
  );
}
