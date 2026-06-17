"use client";

const CTASection = () => {
  const scrollToDiagnosisForm = () => {
    const element = document.getElementById('diagnosis-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-xl">
          {/* 左パネル: 紺背景 - 電話CTA */}
          <div className="lg:w-1/2 bg-gradient-to-br from-[#1B4F72] to-[#154360] p-8 md:p-12 text-white flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              お電話でのご相談を承ります
            </h2>
            <p className="text-white/80 mb-8 text-base leading-relaxed">
              外壁塗装に精通した専門相談員が、お客様のご要望を丁寧にお伺いいたします
            </p>

            {/* 電話ボタン */}
            <a
              href="tel:0120-832-103"
              className="inline-flex items-center justify-center gap-4 bg-[#B94040] hover:bg-[#A03636] text-white font-black py-5 px-8 rounded-xl text-2xl md:text-3xl transition-all duration-300 shadow-lg hover:shadow-xl phone-button-pulse mb-4"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span>0120-832-103</span>
            </a>
            <p className="text-white/60 text-sm text-center mb-8">
              受付時間 8:00〜21:00（年中無休）<br />不在の場合は翌営業日にご連絡いたします
            </p>

            {/* お客様の声 */}
            <div className="pt-6 border-t border-white/20">
              <p className="text-white/90 text-sm italic leading-relaxed">
                「丁寧にお話を聞いていただき、安心して業者を選ぶことができました」
              </p>
              <p className="text-white/50 text-xs mt-2">ー 東京都 S.T様（60代）</p>
            </div>
          </div>

          {/* 右パネル: 白背景 - 診断CTA */}
          <div className="lg:w-1/2 bg-gray-50 p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              まずは無料の費用比較
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              ご要望等をヒアリングの上、最適な業者3〜4社を一括比較
            </p>

            {/* 診断ボタン */}
            <button
              onClick={scrollToDiagnosisForm}
              className="w-full bg-[#1B4F72] hover:bg-[#154360] text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-md hover:shadow-lg mb-8 flex items-center justify-center gap-2"
            >
              無料で相場を診断する
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 安心チェック */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#1B4F72] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">ご相談・お見積りは完全無料</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#1B4F72] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">ご契約の強制は一切ございません</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#1B4F72] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">お断りの代行も承ります</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
