import { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー - 外壁塗装パートナーズ",
  description: "外壁塗装パートナーズのプライバシーポリシー（個人情報保護方針）をご確認ください。",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">プライバシーポリシー</h1>
          <p className="text-gray-600">
            オムコン株式会社（以下「当社」といいます）は、お客様および従業者の個人情報を重要な情報と認識し、その保護を重要な社会的責務として、以下のとおり個人情報保護方針を定め、これを遵守いたします。
          </p>
        </div>

        {/* ポリシー本文 */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-10">
          {/* 基本方針 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              1. 基本方針
            </h2>
            <div className="text-gray-700 space-y-4 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">（1）個人情報の取得・利用・提供</h3>
                <p>当社は、適法かつ公正な手段によって個人情報を取得し、利用目的の範囲内で利用いたします。第三者への提供を行う場合は、事前にご本人の同意を得るものとします。</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">（2）法令等の遵守</h3>
                <p>当社は、個人情報の取り扱いに関する法令、国が定める指針その他の規範を遵守し、従業者への周知徹底を継続的に実施いたします。</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">（3）安全管理措置</h3>
                <p>当社は、不正アクセス、個人情報の漏えい、滅失、または毀損などのリスクに対し、合理的な安全対策を講じるとともに、従業者への教育を徹底いたします。</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">（4）相談窓口の設置</h3>
                <p>当社は、個人情報に関するお問い合わせ、苦情等に対応するための窓口を設置し、適切かつ迅速に対応いたします。</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">（5）継続的改善</h3>
                <p>当社は、個人情報保護マネジメントシステムを継続的に見直し、改善に努めます。</p>
              </div>
            </div>
          </section>

          {/* 個人情報の収集 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              2. 個人情報の収集
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>当社は、以下の方法により個人情報を収集することがあります。</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>
                  <span className="font-medium">直接ご提供いただく情報：</span>
                  氏名、住所、電話番号、メールアドレス、その他お問い合わせやお申込みの際にご入力いただく情報
                </li>
                <li>
                  <span className="font-medium">取引に関する情報：</span>
                  サービスのご利用履歴、お取引履歴、メールマガジンの購読情報等
                </li>
                <li>
                  <span className="font-medium">自動的に収集される情報：</span>
                  IPアドレス、クッキー情報、閲覧履歴、位置情報、端末情報等
                </li>
              </ul>
            </div>
          </section>

          {/* 個人情報の利用目的 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              3. 個人情報の利用目的
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>当社は、収集した個人情報を以下の目的で利用いたします。</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>ご本人確認および認証のため</li>
                <li>サービスの提供、お取引の遂行のため</li>
                <li>当社サービスに関する広告・宣伝、キャンペーン情報等のご案内のため</li>
                <li>お問い合わせ、ご相談への対応のため</li>
                <li>サービス向上のための調査・分析のため</li>
                <li>行動ターゲティング広告の配信のため</li>
                <li>クッキー情報等の分析・検証のため</li>
                <li>その他、上記利用目的に付随する業務のため</li>
              </ul>
            </div>
          </section>

          {/* 個人情報の第三者提供 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              4. 個人情報の第三者提供
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>当社は、以下の場合を除き、ご本人の同意なく個人情報を第三者に提供することはありません。</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合であって、ご本人の同意を得ることが困難であるとき</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、ご本人の同意を得ることが困難であるとき</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、ご本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
              </ul>
            </div>
          </section>

          {/* 業務委託 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              5. 業務委託
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>当社は、利用目的の達成に必要な範囲内において、個人情報の取り扱いを第三者に委託することがあります。この場合、当社は委託先との間で個人情報の適正管理・機密保持について契約を締結し、適切な監督を行います。</p>
            </div>
          </section>

          {/* セキュリティ */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              6. セキュリティについて
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>当社は、個人情報の漏えい、滅失、毀損等を防止するため、SSL（Secure Sockets Layer）技術を使用した暗号化通信を採用するなど、適切なセキュリティ対策を講じています。</p>
            </div>
          </section>

          {/* クッキーについて */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              7. クッキー（Cookie）について
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>当社のウェブサイトでは、クッキーを使用しています。クッキーとは、ウェブサイトがお客様のコンピュータに送信する小さなテキストファイルで、お客様のブラウザに保存されます。</p>
              <p>クッキーは、ウェブサイトの利便性向上、アクセス解析、広告配信の最適化等の目的で使用されます。お客様はブラウザの設定によりクッキーの受け入れを拒否することができますが、その場合、一部のサービスをご利用いただけない場合があります。</p>
            </div>
          </section>

          {/* 開示等の請求 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              8. 開示等の請求
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>お客様は、当社に対して、ご自身の個人情報について、開示、訂正、追加、削除、利用停止、消去または第三者提供の停止を請求することができます。</p>
              <p>開示等の請求をご希望の場合は、下記のお問い合わせ窓口までご連絡ください。ご本人確認の上、法令に従い対応いたします。なお、開示請求に際しては、所定の手数料をいただく場合があります。</p>
            </div>
          </section>

          {/* お問い合わせ窓口 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              9. お問い合わせ窓口
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>個人情報の取り扱いに関するお問い合わせ、苦情、ご相談等は、下記窓口までお願いいたします。</p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="font-bold text-gray-800">オムコン株式会社　個人情報お問い合わせ窓口</p>
                <p className="mt-2">〒113-0023 東京都文京区向丘2-18-13-2F</p>
                <p>電話番号：0120-945-990</p>
              </div>
            </div>
          </section>

          {/* 改定について */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              10. プライバシーポリシーの改定
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>当社は、法令の変更、社会情勢の変化、その他必要に応じて、本プライバシーポリシーを改定することがあります。改定後のプライバシーポリシーは、当社ウェブサイトに掲載した時点から効力を生じるものとします。</p>
            </div>
          </section>

          {/* 制定日・改定日 */}
          <section className="pt-6 border-t border-gray-200">
            <div className="text-gray-600 text-sm space-y-1">
              <p>制定日：2025年1月1日</p>
              <p>最終改定日：2025年1月1日</p>
            </div>
          </section>
        </div>

        {/* 会社情報 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">運営会社</h3>
          <div className="text-gray-700 space-y-1">
            <p>オムコン株式会社</p>
            <p>代表取締役　大塚真央</p>
            <p>〒113-0023 東京都文京区向丘2-18-13-2F</p>
          </div>
        </div>
      </div>
    </div>
  );
}
