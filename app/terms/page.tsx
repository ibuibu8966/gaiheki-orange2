import { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 - 外壁塗装パートナーズ",
  description: "外壁塗装パートナーズの利用規約をご確認ください。",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">利用規約</h1>
          <p className="text-gray-600">
            本利用規約（以下「本規約」といいます）は、オムコン株式会社（以下「当社」といいます）が運営する「外壁塗装パートナーズ」（以下「本サービス」といいます）の利用条件を定めるものです。
          </p>
        </div>

        {/* 規約本文 */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-10">
          {/* 第1条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              第1条（本規約の適用、変更等）
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>1. 本規約は、本サービスの利用に関する条件を、本サービスを利用するすべてのお客様（以下「利用者」といいます）と当社との間で定めるものです。</p>
              <p>2. 利用者は、本サービスを利用することにより、本規約のすべての条項に同意したものとみなされます。</p>
              <p>3. 当社は、当社が必要と判断した場合には、利用者への事前の通知なく、本規約を変更することができるものとします。</p>
              <p>4. 当社が本規約を変更した場合、当社は変更後の本規約を本サービス上に掲示するものとし、当該掲示後に利用者が本サービスを利用した場合、利用者は変更後の本規約に同意したものとみなされます。</p>
            </div>
          </section>

          {/* 第2条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              第2条（情報の登録）
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>1. 利用者は、本サービスの利用に際し、正確かつ最新の情報を登録するものとします。</p>
              <p>2. 本サービスの一部において会員登録が必要な場合、利用者は当社所定の手続きに従って登録を行うものとします。</p>
              <p>3. 当社は、利用者が以下のいずれかに該当する場合、当該利用者の本サービスの利用を拒否、停止、または取消しすることができるものとします。</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>登録内容に虚偽の記載があった場合</li>
                <li>本規約に違反するおそれがあると当社が判断した場合</li>
                <li>その他当社が不適切と判断した場合</li>
              </ul>
            </div>
          </section>

          {/* 第3条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              第3条（利用者IDおよびパスワードの管理）
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>1. 利用者は、自己の責任において、本サービスの利用者IDおよびパスワードを厳重に管理し、第三者に使用させてはならないものとします。</p>
              <p>2. 利用者IDおよびパスワードを使用して行われた行為は、すべて当該利用者による行為とみなされ、利用者はその責任を負うものとします。</p>
              <p>3. 利用者IDおよびパスワードの不正使用により当社または第三者に損害が生じた場合、利用者はその損害を賠償する責任を負うものとします。</p>
            </div>
          </section>

          {/* 第4条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              第4条（利用者情報の削除）
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>1. 利用者が本サービスを退会した場合でも、当社は法令または本規約に基づき、利用者の個人情報を一定期間保持することがあります。</p>
              <p>2. 利用者が登録情報の削除を希望する場合は、利用者自身が当社所定の手続きを行うものとします。</p>
            </div>
          </section>

          {/* 第5条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              第5条（免責）
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>1. 当社は、本サービスを現状有姿のまま提供するものであり、本サービスの正確性、完全性、有用性、特定目的への適合性等について、いかなる保証も行わないものとします。</p>
              <p>2. 当社は、本サービスの中断、停止、終了、利用不能または変更、利用者が本サービスに送信した情報の消失、その他本サービスに関連して利用者が被った損害について、当社に故意または重過失がある場合を除き、一切の責任を負わないものとします。</p>
              <p>3. 当社が損害賠償責任を負う場合であっても、当社の責任は、利用者に直接かつ通常生じる範囲の損害に限定されるものとします。</p>
            </div>
          </section>

          {/* 第6条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              第6条（禁止事項）
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>利用者は、本サービスの利用に際し、以下の行為を行ってはならないものとします。</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>法令または公序良俗に違反する行為</li>
                <li>当社または第三者の名誉、信用、プライバシー等を侵害する行為</li>
                <li>当社または第三者の知的財産権を侵害する行為</li>
                <li>当社のサーバーまたはネットワークに過度な負荷をかける行為</li>
                <li>本サービスの運営を妨害する行為</li>
                <li>不正アクセス、またはこれを試みる行為</li>
                <li>コンピューターウイルス等の有害なプログラムを送信または掲載する行為</li>
                <li>本サービスを通じて取得した情報を商業目的で利用する行為</li>
                <li>その他当社が不適切と判断する行為</li>
              </ul>
            </div>
          </section>

          {/* 第7条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              第7条（クッキー等の行動履歴）
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>1. 当社は、利用者のIPアドレス、クッキー技術、その他の技術を用いて、利用者のアクセス履歴を収集することがあります。</p>
              <p>2. 本サービスの利用には、クッキーの受け入れが条件となる場合があります。</p>
              <p>3. 収集した情報は、本サービスの改善、利用者への最適なサービス提供、その他当社の業務に利用されます。</p>
            </div>
          </section>

          {/* 第8条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              第8条（個人情報等の取扱い）
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>1. 当社は、利用者の個人情報を、別途定めるプライバシーポリシーに従い適切に取り扱うものとします。</p>
              <p>2. 利用者は、本サービスを通じて申込みを行う場合、申込先事業者への情報提供に同意するものとします。</p>
            </div>
          </section>

          {/* 第9条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              第9条（サービスの中断・停止等）
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>1. 当社は、以下のいずれかに該当する場合、利用者への事前の通知なく、本サービスの全部または一部を中断または停止することができるものとします。</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>本サービスのシステムの保守、点検、更新を行う場合</li>
                <li>地震、火災、停電、天災等の不可抗力により本サービスの提供が困難な場合</li>
                <li>その他当社が必要と判断した場合</li>
              </ul>
              <p>2. 当社は、利用者が本規約に違反した場合、または不正な行為を行った場合、当該利用者の登録を削除し、または退会処分とすることができるものとします。</p>
            </div>
          </section>

          {/* 第10条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              第10条（サービスの変更・廃止）
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>当社は、当社の判断により、本サービスの全部または一部を変更または廃止することができるものとします。当社は、本サービスの変更または廃止により利用者に生じた損害について、一切の責任を負わないものとします。</p>
            </div>
          </section>

          {/* 第11条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              第11条（第三者のサービス）
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>本サービスには、第三者が運営するウェブサイトへのリンクが含まれる場合があります。当該第三者のウェブサイトの利用は、利用者の自己責任において行うものとし、当社は当該第三者のウェブサイトの内容、サービス等について一切の責任を負わないものとします。</p>
            </div>
          </section>

          {/* 第12条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              第12条（地位譲渡）
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>当社は、本サービスに係る事業を第三者に譲渡する場合、当該事業の譲渡に伴い、本規約に基づく権利義務および利用者の登録情報その他の情報を、当該事業の譲受人に譲渡することができるものとし、利用者はあらかじめこれに同意するものとします。</p>
            </div>
          </section>

          {/* 第13条 */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f16f21]">
              第13条（準拠法、合意管轄）
            </h2>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>1. 本規約の解釈にあたっては、日本法を準拠法とします。</p>
              <p>2. 本サービスに関連して生じた紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
            </div>
          </section>

          {/* 附則 */}
          <section className="pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              附則：本規約は2025年1月1日より施行します。
            </p>
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
