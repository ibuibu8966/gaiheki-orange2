"use client";

import Image from "next/image";

const AboutServiceSection = () => {
  return (
    <>
      {/* セクション1: 外壁塗装パートナーズとは - 紺背景 */}
      <section className="relative bg-gradient-to-br from-[#1B4F72] to-[#154360] py-16 md:py-24 px-4 overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* タイトル */}
          <div className="text-center mb-12 md:mb-16">
            <p className="text-white/70 text-sm mb-3 tracking-[0.2em] font-medium uppercase">About Our Service</p>
            <div className="w-16 h-0.5 bg-[#B94040] mx-auto mb-6"></div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              外壁塗装パートナーズとは
            </h2>
            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              全国の優良リフォーム会社、塗装専門会社とのネットワークを持ち、
              独立した第三者機関の立場からお客様のご要望やご希望に沿った会社をご案内しています。
            </p>
            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-3xl mx-auto mt-2">
              また、ご紹介にとどまらず直営店舗も全国に構えており、外壁塗装パートナーズが責任をもって施工を承ることも可能です。
            </p>
            {/* 信頼メッセージ */}
            <div className="mt-6 inline-block bg-white/95 backdrop-blur-sm rounded-xl px-6 py-4 border-l-4 border-[#B94040]">
              <p className="text-gray-800 text-base md:text-lg font-medium">
                塗装会社を10年経営し、業界の裏側まで知っているからこそ、<br className="hidden sm:block" />
                本当に信頼できる業者だけをご紹介できます
              </p>
            </div>
          </div>

          {/* 3ステップカード */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#B94040] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">1</div>
                <h3 className="text-white font-bold text-lg">ご相談・お問い合わせ</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                お客様のご要望やお悩みをお伺いし、最適な施工プランをご提案いたします
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#B94040] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">2</div>
                <h3 className="text-white font-bold text-lg">優良施工店のご紹介</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                厳正な審査基準をクリアした優良施工店から、お客様に最適な業者をご紹介いたします
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#B94040] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">3</div>
                <h3 className="text-white font-bold text-lg">お見積り・施工開始</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                複数社のお見積りを比較し、ご納得いただいた上で施工に進みます。直営店舗での施工も可能です
              </p>
            </div>
          </div>

          {/* 下部テキスト */}
          <div className="text-center mt-10">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-8 py-3 border border-white/20">
              <p className="text-white font-bold text-base md:text-lg drop-shadow">
                お客様の大切なご自宅を、確かな技術と適正価格でお守りいたします
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* セクション2: 私たちが選ばれる理由 - 横長カード */}
      <section className="bg-gray-50 py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* タイトル */}
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[#1B4F72]/60 text-sm font-medium tracking-[0.2em] mb-3 uppercase">Service Features</p>
            <div className="w-16 h-0.5 bg-[#B94040] mx-auto mb-6"></div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
              私たちが選ばれる理由
            </h2>
          </div>

          {/* 横長カード */}
          <div className="space-y-8">
            {/* Feature 01 */}
            <div className="flex flex-col md:flex-row items-center gap-6 bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="md:w-1/3 shrink-0">
                <div className="bg-[#1B4F72]/5 rounded-lg p-6 flex items-center justify-center relative overflow-hidden">
                  <span className="absolute text-[#1B4F72]/10 text-7xl font-bold">01</span>
                  <Image src="/images/fee-zero.jpg" alt="紹介手数料なし" width={160} height={160} className="w-40 h-40 object-contain relative z-10" />
                </div>
              </div>
              <div className="md:w-2/3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#B94040] text-sm font-bold tracking-wider">FEATURE 01</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">紹介手数料が一切かからない仕組み</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  一般的な見積サイトでは、受注前の紹介段階で手数料が発生いたします。私たちはこの業界慣行を見直し、お客様にご負担のない仕組みを実現いたしました。
                </p>
                <div className="flex flex-col sm:flex-row gap-3 text-sm">
                  <div className="flex items-center gap-2 bg-[#1B4F72]/5 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4 text-[#1B4F72]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">ご納得いくまで比較可能</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#1B4F72]/5 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4 text-[#1B4F72]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">適正価格でのお見積り</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 02 - reversed */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-6 bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="md:w-1/3 shrink-0">
                <div className="bg-[#1B4F72]/5 rounded-lg p-6 flex items-center justify-center relative overflow-hidden">
                  <span className="absolute text-[#1B4F72]/10 text-7xl font-bold">02</span>
                  <Image src="/images/direct-connect.jpg" alt="直接施工店とつながる" width={160} height={160} className="w-40 h-40 object-contain relative z-10" />
                </div>
              </div>
              <div className="md:w-2/3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#B94040] text-sm font-bold tracking-wider">FEATURE 02</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">施工店との直接契約で中間マージンを排除</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  私たちは一次施工店と直接つなげることで、価格と責任の所在を明確にいたします。多重下請け構造による不要な費用を排除しています。
                </p>
                <div className="flex flex-col sm:flex-row gap-3 text-sm">
                  <div className="flex items-center gap-2 bg-[#1B4F72]/5 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4 text-[#1B4F72]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">品質と責任の所在が明確</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#1B4F72]/5 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4 text-[#1B4F72]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">不要な中間費用を削減</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 03 */}
            <div className="flex flex-col md:flex-row items-center gap-6 bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="md:w-1/3 shrink-0">
                <div className="bg-[#1B4F72]/5 rounded-lg p-6 flex items-center justify-center relative overflow-hidden">
                  <span className="absolute text-[#1B4F72]/10 text-7xl font-bold">03</span>
                  <Image src="/images/estimate-compare.jpg" alt="見積り比較" width={160} height={160} className="w-40 h-40 object-contain relative z-10" />
                </div>
              </div>
              <div className="md:w-2/3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#B94040] text-sm font-bold tracking-wider">FEATURE 03</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">一度のご入力で複数社のお見積りを一括比較</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  条件のご入力は1回のみ。下地補修、塗料グレード、足場、保証などを同一フォーマットで見比べていただけます。
                </p>
                <div className="flex flex-col sm:flex-row gap-3 text-sm">
                  <div className="flex items-center gap-2 bg-[#1B4F72]/5 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4 text-[#1B4F72]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">価格差の理由が明確</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#1B4F72]/5 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4 text-[#1B4F72]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">適正な競争による適正価格</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutServiceSection;
