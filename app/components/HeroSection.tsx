"use client";

const HeroSection = () => {
  const scrollToDiagnosisForm = () => {
    const element = document.getElementById('diagnosis-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative py-16 md:py-24 lg:py-28 px-4 overflow-hidden">
      {/* 背景画像 + 紺オーバーレイ */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/hero-bg.jpg)'}}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B4F72]/85 via-[#154360]/80 to-[#0E2F44]/90"></div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        {/* 信頼バッジ */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8 animate-fadeIn">
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-white text-sm font-medium">圧倒的な施工実績</span>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="text-white text-sm font-medium">長きにわたる運営実績</span>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-white text-sm font-medium">直営店舗運営</span>
          </div>
        </div>

        {/* メインキャッチコピー */}
        <div className="animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight drop-shadow-lg mb-6">
            大切なご自宅の外壁塗装を<br/>確かな品質と適正価格で
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
            業界経験豊富な専門家が、お客様に最適な施工会社をご案内いたします
          </p>
        </div>

        {/* CTAボタン */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <a
            href="tel:0120-83-2103"
            className="inline-flex items-center gap-3 bg-[#B94040] hover:bg-[#A03636] text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 shadow-lg hover:shadow-xl phone-button-pulse"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span>0120-83-2103</span>
          </a>
          <button
            onClick={scrollToDiagnosisForm}
            className="inline-flex items-center gap-2 bg-white text-[#1B4F72] hover:bg-gray-100 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg"
          >
            無料で相場を診断する
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="mt-4 text-white/60 text-sm animate-fadeIn" style={{animationDelay: '0.5s'}}>
          受付時間 8:00〜21:00（年中無休）<br />不在の場合は翌営業日にご連絡いたします
        </p>

        {/* 特徴バー */}
        <div className="mt-14 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl py-6 px-4 animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <div className="flex flex-col md:flex-row items-center justify-around gap-6 md:gap-0 md:divide-x md:divide-white/20">
            <div className="flex items-center gap-3 px-6">
              <svg className="w-8 h-8 text-white/90 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <p className="text-white font-bold text-base">経験豊富な専門相談員</p>
                <p className="text-white/60 text-sm">業界を熟知したスタッフが対応</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6">
              <svg className="w-8 h-8 text-white/90 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div>
                <p className="text-white font-bold text-base">厳選された優良施工店</p>
                <p className="text-white/60 text-sm">審査基準をクリアした業者のみ</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6">
              <svg className="w-8 h-8 text-white/90 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <div>
                <p className="text-white font-bold text-base">複数社の見積り比較</p>
                <p className="text-white/60 text-sm">適正価格で安心の施工</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
