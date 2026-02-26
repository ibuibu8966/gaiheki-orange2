const HowToUseSection = () => {
  const steps = [
    {
      number: "1",
      title: "お建物のご状況をお知らせください",
      description: "ご希望の施工箇所や現在のご状況を、本ページ内にある「外壁塗装の相場を診断」のフォームよりご入力ください。およそ10秒で簡単にご入力いただけます。",
      icon: (
        <svg className="w-20 h-20" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="10" width="48" height="32" rx="2" stroke="#1B4F72" strokeWidth="2" fill="white" />
          <rect x="12" y="14" width="40" height="24" fill="#EBF5FB" />
          <path d="M28 42 L28 48 L36 48 L36 42" stroke="#1B4F72" strokeWidth="2" fill="none" />
          <rect x="24" y="48" width="16" height="3" fill="#1B4F72" />
          <rect x="16" y="20" width="16" height="2" fill="#1B4F72" opacity="0.6" />
          <rect x="16" y="26" width="24" height="2" fill="#1B4F72" opacity="0.3" />
          <rect x="16" y="32" width="20" height="2" fill="#1B4F72" opacity="0.3" />
          <path d="M40 22 L48 30 L44 30 L44 36 L40 36 L40 30 L36 30 Z" fill="#1B4F72" />
        </svg>
      )
    },
    {
      number: "2",
      title: "専門の外壁相談員がお電話にてご対応いたします",
      description: "ご入力いただいた内容をもとに、お客様のご状況を詳しくお伺いいたします。ご不安な点やご質問等、何でもお気軽にお申し付けください。",
      icon: (
        <svg className="w-20 h-20" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="26" fill="#EBF5FB" />
          <path d="M16 32 C16 22 23 14 32 14 C41 14 48 22 48 32" stroke="#1B4F72" strokeWidth="3" fill="none" />
          <rect x="12" y="28" width="8" height="14" rx="2" fill="#1B4F72" />
          <rect x="44" y="28" width="8" height="14" rx="2" fill="#1B4F72" />
          <path d="M20 42 L20 46 C20 50 26 54 32 54" stroke="#1B4F72" strokeWidth="2" fill="none" />
          <ellipse cx="34" cy="54" rx="4" ry="3" fill="#1B4F72" />
        </svg>
      )
    },
    {
      number: "3",
      title: "ご要望に沿った施工店をご紹介",
      description: "塗装の相談室の厳正な審査をクリアした優良施工店の中から、お客様のご要望に最適な施工店をご紹介し、お見積りをお取りいただけます。",
      icon: (
        <svg className="w-20 h-20" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="26" fill="#EBF5FB" />
          <rect x="18" y="12" width="28" height="36" rx="2" fill="white" stroke="#1B4F72" strokeWidth="2" />
          <rect x="22" y="18" width="16" height="2" fill="#1B4F72" />
          <rect x="22" y="24" width="20" height="2" fill="#1B4F72" opacity="0.3" />
          <rect x="22" y="30" width="18" height="2" fill="#1B4F72" opacity="0.3" />
          <rect x="22" y="36" width="20" height="2" fill="#1B4F72" opacity="0.3" />
          <circle cx="44" cy="42" r="10" fill="#1B4F72" />
          <path d="M39 42 L42 45 L49 38" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  ];

  return (
    <section className="bg-white py-12 md:py-20 lg:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* タイトル */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[#1B4F72]/60 text-sm font-medium tracking-[0.2em] mb-3 uppercase">How to Use</p>
          <div className="w-16 h-0.5 bg-[#B94040] mx-auto mb-6"></div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
            ご相談の流れ
          </h2>
          <p className="mt-4 text-gray-500 text-base">
            塗装の相談室のご利用方法をご案内いたします
          </p>
        </div>

        {/* 縦タイムライン */}
        <div className="relative max-w-4xl mx-auto">
          {/* 縦線 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#1B4F72]/15 hidden md:block -translate-x-1/2"></div>

          {/* Step 1 - 左テキスト / 右アイコン */}
          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-12 mb-12 md:mb-16">
            <div className="md:w-1/2 md:text-right md:pr-12">
              <h3 className="text-xl font-bold text-gray-800 mb-3">{steps[0].title}</h3>
              <p className="text-gray-600 leading-relaxed">{steps[0].description}</p>
            </div>
            <div className="relative z-10 w-14 h-14 bg-[#1B4F72] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
              1
            </div>
            <div className="md:w-1/2 md:pl-12 flex justify-center md:justify-start">
              {steps[0].icon}
            </div>
          </div>

          {/* Step 2 - 右テキスト / 左アイコン (reversed) */}
          <div className="relative flex flex-col md:flex-row-reverse items-center gap-6 md:gap-12 mb-12 md:mb-16">
            <div className="md:w-1/2 md:text-left md:pl-12">
              <h3 className="text-xl font-bold text-gray-800 mb-3">{steps[1].title}</h3>
              <p className="text-gray-600 leading-relaxed">{steps[1].description}</p>
            </div>
            <div className="relative z-10 w-14 h-14 bg-[#1B4F72] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
              2
            </div>
            <div className="md:w-1/2 md:pr-12 flex justify-center md:justify-end">
              {steps[1].icon}
            </div>
          </div>

          {/* Step 3 - 左テキスト / 右アイコン */}
          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="md:w-1/2 md:text-right md:pr-12">
              <h3 className="text-xl font-bold text-gray-800 mb-3">{steps[2].title}</h3>
              <p className="text-gray-600 leading-relaxed">{steps[2].description}</p>
            </div>
            <div className="relative z-10 w-14 h-14 bg-[#1B4F72] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
              3
            </div>
            <div className="md:w-1/2 md:pl-12 flex justify-center md:justify-start">
              {steps[2].icon}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToUseSection;
