"use client";

const HeroSection = () => {
  const scrollToDiagnosisForm = () => {
    const element = document.getElementById('diagnosis-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative py-12 md:py-20 px-4 overflow-hidden">
      {/* 背景画像 */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{backgroundImage: 'url(/hero-bg.jpg)'}}
        />
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* メインビジュアル */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* 左側: キャッチコピーと信頼バッジ */}
          <div className="flex-1 w-full lg:w-1/2 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            {/* メインキャッチコピー */}
            <div className="mb-6 md:mb-8">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight drop-shadow-lg mb-4">
                信頼と安心の<br className="hidden sm:block"/>全国ネットワーク
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-medium drop-shadow-md">
                比較で納得、直営で安心
              </p>
            </div>

            {/* サブキャッチコピー */}
            <div className="mb-6 md:mb-10">
              <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                塗装会社を10年経営した経験を活かし、<br className="hidden sm:block"/>
                お客様に本当に信頼できる業者をご紹介します
              </p>
            </div>

            {/* 信頼バッジ */}
            <div className="flex flex-wrap gap-4 md:gap-6 mb-8 md:mb-10">
              {/* 外壁の経歴10年 */}
              <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
                <LaurelLeft />
                <div className="text-center px-2">
                  <p className="text-base md:text-lg font-bold text-gray-800">
                    外壁の経歴10年
                  </p>
                  <p className="text-sm text-gray-600">
                    直営店の信頼性
                  </p>
                </div>
                <LaurelRight />
              </div>

              {/* 10年以上運営 */}
              <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
                <LaurelLeft />
                <div className="text-center px-2">
                  <p className="text-base md:text-lg font-bold text-gray-800">
                    10年以上運営
                  </p>
                  <p className="text-sm text-gray-600">
                    実績あり
                  </p>
                </div>
                <LaurelRight />
              </div>

              {/* 塗装会社経営の経験 */}
              <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
                <LaurelLeft />
                <div className="text-center px-2">
                  <p className="text-base md:text-lg font-bold text-gray-800">
                    塗装会社経営
                  </p>
                  <p className="text-sm text-gray-600">
                    10年の経験
                  </p>
                </div>
                <LaurelRight />
              </div>
            </div>
          </div>

          {/* 右側: CTAカード */}
          <div className="w-full lg:w-auto animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl max-w-md mx-auto lg:mx-0">
              {/* カードヘッダー */}
              <div className="text-center mb-6">
                <div className="inline-block bg-brand text-white text-base font-bold px-5 py-2 rounded-full mb-4">
                  ご相談無料
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                  まずはお気軽にお電話ください
                </h2>
                <p className="text-base text-gray-600">
                  外壁の経歴10年のスタッフが対応
                </p>
              </div>

              {/* 電話ボタン（メインCTA） */}
              <a
                href="tel:0120-945-990"
                className="flex items-center justify-center gap-4 w-full bg-brand hover:bg-brand-hover text-white font-black py-5 px-6 rounded-xl text-2xl md:text-3xl transition-all duration-300 shadow-lg hover:shadow-xl phone-button-pulse mb-4"
              >
                <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>0120-945-990</span>
              </a>

              {/* 受付時間 */}
              <div className="text-center mb-6">
                <p className="text-base text-gray-700 font-medium">
                  受付時間 <span className="text-brand font-bold">8:00〜21:00</span>（年中無休）
                </p>
                <p className="text-sm text-gray-500 mt-1">電話・メール対応</p>
              </div>

              {/* 診断ボタン（サブCTA） */}
              <button
                onClick={scrollToDiagnosisForm}
                className="w-full border-2 border-brand text-brand hover:bg-brand hover:text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300"
              >
                無料診断で相場を確認
              </button>
            </div>
          </div>
        </div>

        {/* 3つの特徴 */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-12 md:mt-16">
          {/* 特徴1 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 animate-fadeIn" style={{animationDelay: '0.6s'}}>
            <div className="w-18 h-18 mx-auto mb-4 bg-brand/10 rounded-full flex items-center justify-center" style={{width: '72px', height: '72px'}}>
              <svg className="w-10 h-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">専門アドバイザー在籍</h3>
            <p className="text-base text-gray-600">外壁のプロが最適な施工店をご提案</p>
          </div>

          {/* 特徴2 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 animate-fadeIn" style={{animationDelay: '0.7s'}}>
            <div className="w-18 h-18 mx-auto mb-4 bg-brand/10 rounded-full flex items-center justify-center" style={{width: '72px', height: '72px'}}>
              <svg className="w-10 h-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">優良施工店をご紹介</h3>
            <p className="text-base text-gray-600">厳選された信頼できる業者のみ</p>
          </div>

          {/* 特徴3 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 animate-fadeIn" style={{animationDelay: '0.8s'}}>
            <div className="w-18 h-18 mx-auto mb-4 bg-brand/10 rounded-full flex items-center justify-center" style={{width: '72px', height: '72px'}}>
              <svg className="w-10 h-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">複数社の見積り比較</h3>
            <p className="text-base text-gray-600">複数社から無料でお見積り</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// 月桂冠（左側）
const LaurelLeft = () => (
  <svg width="28" height="56" viewBox="0 0 20 40" className="text-[#d4a574]">
    <path
      d="M16 4c-3 1.5-5 5-5 8 0 3-1.5 6-4.5 9 3-1.5 6-4.5 7.5-9 1.5-3 1.5-6 2-8z"
      fill="currentColor"
    />
    <path
      d="M16 12c-3 1.5-5 5-5 8 0 3-1.5 6-4.5 9 3-1.5 6-4.5 7.5-9 1.5-3 1.5-6 2-8z"
      fill="currentColor"
    />
    <path
      d="M14 20c-2.5 1.5-4 4-4 6.5 0 3-1.5 5-4 8 3-1.5 5.5-4 7-8 1-2.5 1-5 1-6.5z"
      fill="currentColor"
    />
  </svg>
);

// 月桂冠（右側）
const LaurelRight = () => (
  <svg width="28" height="56" viewBox="0 0 20 40" className="text-[#d4a574] scale-x-[-1]">
    <path
      d="M16 4c-3 1.5-5 5-5 8 0 3-1.5 6-4.5 9 3-1.5 6-4.5 7.5-9 1.5-3 1.5-6 2-8z"
      fill="currentColor"
    />
    <path
      d="M16 12c-3 1.5-5 5-5 8 0 3-1.5 6-4.5 9 3-1.5 6-4.5 7.5-9 1.5-3 1.5-6 2-8z"
      fill="currentColor"
    />
    <path
      d="M14 20c-2.5 1.5-4 4-4 6.5 0 3-1.5 5-4 8 3-1.5 5.5-4 7-8 1-2.5 1-5 1-6.5z"
      fill="currentColor"
    />
  </svg>
);

export default HeroSection;
