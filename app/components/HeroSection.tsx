"use client";

import JapanMapWithStats from "./JapanMapWithStats";

const HeroSection = () => {
  const scrollToDiagnosisForm = () => {
    const element = document.getElementById('diagnosis-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative py-8 md:py-16 px-4 overflow-hidden bg-gradient-to-b from-[#fff8f0] to-white">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* メインビジュアル */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4">
          {/* 左側: キャッチコピーと統計情報 */}
          <div className="flex-1 w-full lg:w-1/2">
            {/* メインキャッチコピー */}
            <div className="mb-6 md:mb-8">
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4">
                <span className="text-[#f16f21]">信頼</span><span className="text-[#4a4a4a]">と</span><span className="text-[#f16f21]">安心</span><span className="text-[#4a4a4a]">の</span><br/><span className="text-[#4a4a4a]">全国ネットワーク</span>
              </h1>
            </div>

            {/* 特徴（月桂冠付き） */}
            <div className="flex flex-wrap gap-4 md:gap-6 mb-6 md:mb-8">
              {/* 外壁の経歴10年 */}
              <div className="flex items-center">
                <LaurelLeft />
                <div className="text-center px-1">
                  <p className="text-sm md:text-base font-bold text-gray-800">
                    外壁の経歴10年
                  </p>
                  <p className="text-xs text-gray-600">
                    直営店の信頼性
                  </p>
                </div>
                <LaurelRight />
              </div>

              {/* 10年以上運営 */}
              <div className="flex items-center">
                <LaurelLeft />
                <div className="text-center px-1">
                  <p className="text-sm md:text-base font-bold text-gray-800">
                    10年以上運営
                  </p>
                  <p className="text-xs text-gray-600">
                    実績あり
                  </p>
                </div>
                <LaurelRight />
              </div>
            </div>

            {/* サブキャッチコピー */}
            <div className="mb-6 md:mb-8">
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                比較で納得、直営で安心。<br/>
                すべてが揃う外壁塗装パートナーズ。
              </p>
            </div>

            {/* CTAボタン */}
            <div className="flex flex-col gap-3 max-w-xs">
              <a
                href="tel:0120-000-000"
                className="inline-flex items-center justify-center bg-[#fef3c7] border-2 border-[#f59e0b] text-[#92400e] font-bold py-3 px-6 rounded-lg text-base transition-all duration-300 hover:bg-[#fde68a] shadow-md"
              >
                <svg className="w-5 h-5 mr-2 text-[#f59e0b]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                ご相談・お問い合わせ
              </a>
              <button
                onClick={scrollToDiagnosisForm}
                className="inline-flex items-center justify-center bg-[#f16f21] hover:bg-[#e05a10] text-white font-bold py-3 px-6 rounded-lg text-base transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                無料診断
              </button>
            </div>
          </div>

          {/* 右側: 日本地図（地域別統計付き） */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <JapanMapWithStats />
          </div>
        </div>
      </div>
    </section>
  );
};

// 月桂冠（左側）
const LaurelLeft = () => (
  <svg width="20" height="40" viewBox="0 0 20 40" className="text-[#d4a574]">
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
  <svg width="20" height="40" viewBox="0 0 20 40" className="text-[#d4a574] scale-x-[-1]">
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
