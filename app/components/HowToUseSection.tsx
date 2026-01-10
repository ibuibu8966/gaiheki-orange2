const HowToUseSection = () => {
  const steps = [
    {
      number: "1",
      title: "お建物のご状況を\nお知らせください",
      description: "ご希望の施工箇所や現在お困りのご状況を、本ページ内にある「外壁塗装の相場を診断」のフォームよりご入力ください。およそ10秒で簡単に入力できます。",
      icon: (
        <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
          {/* モニター外枠 */}
          <rect x="8" y="10" width="48" height="32" rx="2" stroke="#d4a574" strokeWidth="2" fill="white" />
          {/* モニター画面 */}
          <rect x="12" y="14" width="40" height="24" fill="#fef3c7" />
          {/* スタンド */}
          <path d="M28 42 L28 48 L36 48 L36 42" stroke="#d4a574" strokeWidth="2" fill="none" />
          <rect x="24" y="48" width="16" height="3" fill="#d4a574" />
          {/* 画面内のライン */}
          <rect x="16" y="20" width="16" height="2" fill="#f16f21" opacity="0.6" />
          <rect x="16" y="26" width="24" height="2" fill="#d4a574" opacity="0.5" />
          <rect x="16" y="32" width="20" height="2" fill="#d4a574" opacity="0.5" />
          {/* カーソル矢印 */}
          <path d="M40 22 L48 30 L44 30 L44 36 L40 36 L40 30 L36 30 Z" fill="#f16f21" />
        </svg>
      )
    },
    {
      number: "2",
      title: "専門の外壁アドバイザーが\nお電話にてご相談を承ります",
      description: "ご入力いただいた内容を元に、お客様のご状況を詳しくヒアリングさせていただきます。不安要素やお悩み、ご質問等なんでもお伺いいたします。",
      icon: (
        <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
          {/* 円形背景 */}
          <circle cx="32" cy="32" r="26" fill="#fef3c7" />
          {/* ヘッドセットバンド */}
          <path d="M16 32 C16 22 23 14 32 14 C41 14 48 22 48 32" stroke="#d4a574" strokeWidth="3" fill="none" />
          {/* 左イヤーパッド */}
          <rect x="12" y="28" width="8" height="14" rx="2" fill="#f16f21" />
          {/* 右イヤーパッド */}
          <rect x="44" y="28" width="8" height="14" rx="2" fill="#f16f21" />
          {/* マイクアーム */}
          <path d="M20 42 L20 46 C20 50 26 54 32 54" stroke="#d4a574" strokeWidth="2" fill="none" />
          {/* マイク */}
          <ellipse cx="34" cy="54" rx="4" ry="3" fill="#d4a574" />
        </svg>
      )
    },
    {
      number: "3",
      title: "ご要望に沿った施工店を\nご紹介いたします",
      description: "\"外壁塗装パートナーズ\"の厳しい審査をクリアした優良施工店のうちご要望に沿った施工店をご紹介し、お見積りを取得することができます。",
      icon: (
        <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
          {/* 円形背景 */}
          <circle cx="32" cy="32" r="26" fill="#fef3c7" />
          {/* ドキュメント */}
          <rect x="18" y="12" width="28" height="36" rx="2" fill="white" stroke="#d4a574" strokeWidth="2" />
          {/* ドキュメントライン */}
          <rect x="22" y="18" width="16" height="2" fill="#f16f21" />
          <rect x="22" y="24" width="20" height="2" fill="#d4a574" opacity="0.5" />
          <rect x="22" y="30" width="18" height="2" fill="#d4a574" opacity="0.5" />
          <rect x="22" y="36" width="20" height="2" fill="#d4a574" opacity="0.5" />
          {/* チェックマーク */}
          <circle cx="44" cy="42" r="10" fill="#f16f21" />
          <path d="M39 42 L42 45 L49 38" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  ];

  return (
    <section className="bg-white py-12 md:py-20 lg:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* タイトル */}
        <div className="flex items-center gap-4 mb-12 md:mb-16">
          <div className="w-1 h-12 bg-[#f16f21]"></div>
          <div className="flex items-center gap-6">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
              ご相談の<span className="text-[#f16f21]">流れ</span>
            </h2>
            <p className="hidden md:block text-gray-500 text-sm border-l border-gray-300 pl-6">
              外壁塗装パートナーズのご相談の流れをご説明します
            </p>
          </div>
        </div>

        {/* ステップ */}
        <div className="relative">
          {/* ステップ番号と矢印のライン - デスクトップ */}
          <div className="hidden md:flex justify-between items-center mb-6 px-[calc(16.666%-24px)]">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                {/* 番号 */}
                <div className="w-14 h-14 border-[3px] border-[#f16f21] rounded-full flex items-center justify-center bg-white relative z-10">
                  <span className="text-2xl font-bold text-[#f16f21]">{step.number}</span>
                </div>

                {/* 矢印（最後のステップ以外） */}
                {index < steps.length - 1 && (
                  <div className="flex items-center w-[calc((100vw-200px)/3)] max-w-[280px] ml-2">
                    <svg className="w-full h-4" viewBox="0 0 200 16" preserveAspectRatio="none">
                      <line
                        x1="0"
                        y1="8"
                        x2="180"
                        y2="8"
                        stroke="#f16f21"
                        strokeWidth="2"
                        strokeDasharray="8,6"
                      />
                      <polygon points="180,3 195,8 180,13" fill="#f16f21" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* カード */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col">
                {/* モバイル用番号 */}
                <div className="md:hidden flex items-center mb-4">
                  <div className="w-12 h-12 border-[3px] border-[#f16f21] rounded-full flex items-center justify-center bg-white mr-4">
                    <span className="text-xl font-bold text-[#f16f21]">{step.number}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800 whitespace-pre-line">
                    {step.title}
                  </h3>
                </div>

                {/* コンテンツカード */}
                <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex-1 flex flex-col">
                  {/* アイコン */}
                  <div className="flex justify-center mb-5">
                    {step.icon}
                  </div>

                  <h3 className="hidden md:block text-base font-bold text-gray-800 mb-4 text-center whitespace-pre-line leading-relaxed">
                    {step.title}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed flex-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToUseSection;
