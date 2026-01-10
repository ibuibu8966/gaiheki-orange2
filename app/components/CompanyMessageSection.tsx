'use client';

export default function CompanyMessageSection() {
  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-blue-50/30 to-white py-24 px-4 overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-slate-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
              Message from Us
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 animate-fadeIn">
            運営会社からのメッセージ
          </h2>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            業界の"当たり前"を見直し、透明で誠実なサービスを目指す私たちの想い
          </p>
        </div>

        {/* 手紙風カード */}
        <div className="relative bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-xl p-8 md:p-12 lg:p-16">
          {/* 左上の装飾 */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-blue-600 rounded-tl-2xl opacity-30"></div>
          {/* 右上の装飾 */}
          <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-blue-600 rounded-tr-2xl opacity-30"></div>

          {/* メッセージ本文 */}
          <div className="relative">
            <div className="prose prose-slate max-w-none">
              <div className="space-y-5 text-slate-800 leading-[1.9]">
                <p className="text-base">
                  外壁塗装は、家を長く守るための大切な工事です。ところがこの業界では、受注が決まっていない段階の「紹介」だけで、施工会社が紹介元へ数万円〜十数万円の手数料を支払う慣習が少なくありません。結果として、そのコストは見積りに上乗せされ、利用者にとっての適正価格が見えづらくなります。さらに、多重下請けで間に何社も入る構造は、価格を押し上げるだけでなく、現場の職人にシワ寄せがいき、品質低下のリスクも生みます。
                </p>

                <p className="text-base">
                  とくに、何社も通じて仕事が下ろされる（多重下請け）過程で、中間マージンが差し引かれ、いわゆる"間を抜かれる"ことが起こりがちです。実際に施工する職人に届く対価が細り、結果として価格は上がるのに品質は下がるという矛盾が生まれます。
                </p>

                <p className="text-lg font-bold text-blue-600 my-6">
                  私たちは、この"当たり前"を見直します。
                </p>

                <p className="text-base">
                  私たちの仕組みは、紹介だけで費用が発生しない設計を徹底し、できる限り施工店とお客さまを直接つなぐことを前提にしています。中間コストを抑え、同じ予算でもより良い材料・丁寧な手間に配分できる状態をつくる——それが私たちの目指す透明で健全な市場です。
                </p>

                <p className="text-base">
                  もちろん、価格だけで選ぶことはおすすめしません。だからこそ、私たちは複数社からの見積りを、一度の入力で、同じフォーマットで比べられるようにしました。下地補修の範囲、塗料グレード、足場、保証内容などを内訳で可視化し、「なぜ安いのか・なぜ高いのか」を理解したうえで、納得の一社を選べます。合わない会社からの連絡はワンクリックで停止でき、しつこい営業の心配もありません。
                </p>

                <p className="text-lg font-bold text-blue-600 my-6">
                  外壁塗装の見積りは、もっとシンプルで、誠実であるべきです。
                </p>

                <p className="text-base">
                  お客さまが無用な不安やムダなコストに悩まされず、施工店が正当な対価を得て、胸を張って品質で勝負できる環境をつくる。私たちは、この業界の在り方を透明性と直接性で変えていきます。
                </p>
              </div>
            </div>

            {/* 右下の運営会社写真エリア */}
            <div className="mt-8 flex justify-end">
              <div className="relative">
                {/* 写真プレースホルダー - 実際の写真に差し替えてください */}
                <div className="w-48 h-48 md:w-56 md:h-56 bg-slate-100 rounded-lg border-2 border-slate-200 shadow-md overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm">運営会社の写真</p>
                    </div>
                  </div>
                  {/* 実際の写真を使用する場合は、下記のように記述してください */}
                  {/* <img
                    src="/images/company-photo.jpg"
                    alt="運営会社"
                    className="w-full h-full object-cover"
                  /> */}
                </div>

                {/* 署名風のテキスト */}
                <div className="mt-4 text-right">
                  <p className="text-sm text-slate-600 font-medium">外壁塗装パートナーズ 運営チーム一同</p>
                </div>
              </div>
            </div>
          </div>

          {/* 下部の装飾 */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-30"></div>
        </div>
      </div>
    </section>
  );
}
