"use client";

const CTASection = () => {
  const scrollToDiagnosisForm = () => {
    const element = document.getElementById('diagnosis-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative py-16 md:py-24 px-4 overflow-hidden bg-gradient-to-b from-[#faf6f1] to-[#f5efe8]">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* メインタイトル */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 animate-fadeInUp">
          まずはお気軽にご相談ください
        </h2>

        {/* サブテキスト */}
        <p className="text-lg md:text-xl lg:text-2xl mb-10 text-gray-700 leading-relaxed animate-fadeInUp" style={{animationDelay: '0.1s'}}>
          外壁の経歴10年のスタッフが対応いたします
        </p>

        {/* 電話ボタンエリア */}
        <div className="mb-8 animate-scale-in" style={{animationDelay: '0.2s'}}>
          <a
            href="tel:0120-945-990"
            className="inline-flex items-center justify-center gap-4 md:gap-6 bg-brand hover:bg-brand-hover text-white font-black py-6 px-10 md:px-16 rounded-2xl text-3xl md:text-4xl lg:text-5xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 phone-button-pulse"
          >
            <svg className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span>0120-945-990</span>
          </a>
        </div>

        {/* 受付時間 */}
        <div className="mb-10 animate-fadeIn" style={{animationDelay: '0.3s'}}>
          <p className="text-xl md:text-2xl text-gray-800 font-medium mb-2">
            受付時間 <span className="text-brand font-bold">8:00〜21:00</span>
          </p>
          <p className="text-lg text-gray-600">
            年中無休・電話/メール対応
          </p>
        </div>

        {/* 診断ボタン */}
        <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <button
            onClick={scrollToDiagnosisForm}
            className="inline-flex items-center justify-center border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300"
          >
            無料診断で相場を確認
            <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 安心ポイント */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-base text-gray-600 animate-fadeIn" style={{animationDelay: '0.5s'}}>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-brand" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>相談無料</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-brand" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>契約の強制なし</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-brand" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>お断り代行あり</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
