"use client";

import Image from "next/image";

const CaseStudySection = () => {
  const caseStudies = [
    {
      beforeImage: "/images/case-before-1.jpg",
      afterImage: "/images/case-after-1.jpg",
      title: "マンション外壁塗装",
      location: "東京都",
      description: "築20年のマンションの大規模修繕",
    },
    {
      beforeImage: "/images/case-before-2.jpg",
      afterImage: "/images/case-after-2.jpg",
      title: "戸建て外壁塗装",
      location: "神奈川県",
      description: "白からブルーへのカラーチェンジ",
    },
    {
      beforeImage: "/images/case-before-3.jpg",
      afterImage: "/images/case-after-3.jpg",
      title: "戸建て外壁塗装",
      location: "埼玉県",
      description: "茶色から爽やかなブルーグリーンへ",
    },
    {
      beforeImage: "/images/case-before-4.jpg",
      afterImage: "/images/case-after-4.jpg",
      title: "アパート外壁塗装",
      location: "千葉県",
      description: "経年劣化した外壁のリフレッシュ",
    },
    {
      beforeImage: "/images/case-before-5.jpg",
      afterImage: "/images/case-after-5.jpg",
      title: "屋根遮熱塗装",
      location: "大阪府",
      description: "遮熱塗料で表面温度35℃低下",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-[#fff8f0]">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <p className="text-[#f16f21] text-sm font-semibold tracking-wider mb-2">
            Case Study
          </p>
          <div className="flex justify-center gap-1 mb-4">
            <span className="w-2 h-2 bg-[#f16f21] rounded-full"></span>
            <span className="w-2 h-2 bg-[#f16f21] rounded-full"></span>
            <span className="w-2 h-2 bg-[#f16f21] rounded-full"></span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            施工実績
          </h2>
          <p className="text-gray-600 mt-2">
            ビフォーアフターで見る、私たちの施工品質
          </p>
        </div>

        {/* 施工実績グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* ビフォーアフター画像 */}
              <div className="relative">
                <div className="grid grid-cols-2">
                  {/* Before */}
                  <div className="relative">
                    <Image
                      src={study.beforeImage}
                      alt={`${study.title} - 施工前`}
                      width={300}
                      height={200}
                      className="w-full h-40 object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-gray-800/80 text-white text-xs font-bold px-2 py-1 rounded">
                      Before
                    </span>
                  </div>
                  {/* After */}
                  <div className="relative">
                    <Image
                      src={study.afterImage}
                      alt={`${study.title} - 施工後`}
                      width={300}
                      height={200}
                      className="w-full h-40 object-cover"
                    />
                    <span className="absolute top-2 right-2 bg-[#f16f21] text-white text-xs font-bold px-2 py-1 rounded">
                      After
                    </span>
                  </div>
                </div>
                {/* 矢印アイコン */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                  <svg className="w-5 h-5 text-[#f16f21]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>

              {/* 情報 */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#fff8f0] text-[#f16f21] text-xs font-bold px-2 py-1 rounded">
                    {study.location}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">{study.title}</h3>
                <p className="text-sm text-gray-600">{study.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CaseStudySection;
