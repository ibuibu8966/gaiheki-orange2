"use client";

import Image from "next/image";

const FeaturesSection = () => {
  const scrollToDiagnosisForm = () => {
    const element = document.getElementById('diagnosis-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#faf6f1] to-[#f5efe8] py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* タイトル */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[#f16f21] text-sm font-medium tracking-wider mb-2">Service Features</p>
          <div className="flex justify-center gap-1.5 mb-4">
            <span className="w-2 h-2 bg-[#f16f21] rounded-full"></span>
            <span className="w-2 h-2 bg-[#f16f21] rounded-full"></span>
            <span className="w-2 h-2 bg-[#f16f21] rounded-full"></span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
            外壁塗装パートナーズの特徴
          </h2>
        </div>

        {/* 特徴グリッド - 3列 */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-10 mb-12">
          {/* Feature 01 - 紹介手数料なし */}
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              {/* Feature番号バッジ */}
              <div className="absolute -top-3 -right-3 z-10">
                <div className="bg-gradient-to-br from-[#f16f21] to-[#e05a10] text-white px-3 py-2 rounded-lg shadow-lg">
                  <span className="text-[10px] block leading-none font-medium">Feature</span>
                  <span className="text-2xl font-bold leading-none">01</span>
                </div>
              </div>
              {/* 円形カード - よりソフトなシャドウ */}
              <div className="w-52 h-52 md:w-56 md:h-56 bg-gradient-to-br from-white via-white to-[#fef7f0] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-center border border-gray-100">
                <div className="text-center p-4">
                  <Image
                    src="/images/fee-zero.jpg"
                    alt="紹介手数料なし"
                    width={140}
                    height={140}
                    className="w-32 h-32 object-contain mx-auto"
                  />
                </div>
              </div>
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-800 text-center mb-3 leading-relaxed">
              紹介手数料がかからないから<br/>
              <span className="text-[#f16f21]">適正価格</span>で施工できる
            </h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed max-w-xs">
              他社サービスでは紹介手数料が工事費に<br/>
              上乗せされることも。当サービスなら<br/>
              手数料無料で適正価格をお届けします。
            </p>
          </div>

          {/* Feature 02 - 直接施工店とつながる */}
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              {/* Feature番号バッジ */}
              <div className="absolute -top-3 -right-3 z-10">
                <div className="bg-gradient-to-br from-[#f16f21] to-[#e05a10] text-white px-3 py-2 rounded-lg shadow-lg">
                  <span className="text-[10px] block leading-none font-medium">Feature</span>
                  <span className="text-2xl font-bold leading-none">02</span>
                </div>
              </div>
              {/* 円形カード */}
              <div className="w-52 h-52 md:w-56 md:h-56 bg-gradient-to-br from-white via-white to-[#fef7f0] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center border border-gray-100 overflow-hidden relative">
                <Image
                  src="/images/direct-connect.jpg"
                  alt="直接施工店とつながる"
                  width={224}
                  height={224}
                  className="absolute inset-0 w-full h-full object-cover scale-110"
                />
                <div className="relative z-10 mt-auto mb-4 text-center bg-white/80 px-3 py-1 rounded">
                  <p className="text-[#f16f21] text-xl font-bold">直接</p>
                  <p className="text-gray-700 text-xs font-medium">施工店とつながる</p>
                </div>
              </div>
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-800 text-center mb-3 leading-relaxed">
              仲介なしで<span className="text-[#f16f21]">施工店と直接</span><br/>
              やり取りできる
            </h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed max-w-xs">
              お客様と施工店の間に業者が入らないので、<br/>
              要望が正確に伝わり、<br/>
              スムーズなコミュニケーションが可能です。
            </p>
          </div>

          {/* Feature 03 - 見積り比較 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              {/* Feature番号バッジ */}
              <div className="absolute -top-3 -right-3 z-10">
                <div className="bg-gradient-to-br from-[#f16f21] to-[#e05a10] text-white px-3 py-2 rounded-lg shadow-lg">
                  <span className="text-[10px] block leading-none font-medium">Feature</span>
                  <span className="text-2xl font-bold leading-none">03</span>
                </div>
              </div>
              {/* 円形カード */}
              <div className="w-52 h-52 md:w-56 md:h-56 bg-gradient-to-br from-white via-white to-[#fef7f0] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-center border border-gray-100">
                <div className="text-center p-2">
                  <Image
                    src="/images/estimate-compare.jpg"
                    alt="見積り比較"
                    width={180}
                    height={180}
                    className="w-40 h-40 object-contain mx-auto"
                  />
                </div>
              </div>
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-800 text-center mb-3 leading-relaxed">
              <span className="text-[#f16f21]">最大3社</span>の見積りを<br/>
              比較検討できる
            </h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed max-w-xs">
              複数の見積りを同一フォーマットで比較。<br/>
              価格・内容・保証を見比べて、<br/>
              納得のいく施工店を選べます。
            </p>
          </div>
        </div>

        {/* CTAボタン */}
        <div className="text-center">
          <button
            onClick={scrollToDiagnosisForm}
            className="group inline-flex items-center justify-center bg-gradient-to-r from-[#f16f21] to-[#e05a10] hover:from-[#e05a10] hover:to-[#d04a00] text-white font-bold py-4 px-12 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            施工店を探す
            <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
