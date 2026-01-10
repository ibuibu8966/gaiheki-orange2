"use client";

const CTASection = () => {
  const scrollToDiagnosisForm = () => {
    const element = document.getElementById('diagnosis-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative py-16 md:py-20 px-4 overflow-hidden">
      {/* 背景画像（グラデーションで代替） */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#5a4a42] via-[#6b5a50] to-[#7a6a5a]"></div>
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* 左側: テキストとボタン */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
              ご利用無料！まずはお気軽に相場を診断してみましょう
            </h2>
            <button
              onClick={scrollToDiagnosisForm}
              className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 font-bold py-4 px-12 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              今すぐ相場を診断する
              <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 右側: 電話番号 */}
          <div className="text-center lg:text-right">
            <p className="text-white text-sm mb-2">お電話はこちらから</p>
            <a
              href="tel:0120-945-990"
              className="flex items-center justify-center lg:justify-end gap-3 text-white hover:opacity-80 transition-opacity"
            >
              <span className="w-10 h-10 bg-[#f16f21] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </span>
              <span className="text-3xl md:text-4xl font-bold tracking-wide">0120-945-990</span>
            </a>
            <p className="text-[#f16f21] text-sm mt-2">24時間受付中（年中無休）</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
