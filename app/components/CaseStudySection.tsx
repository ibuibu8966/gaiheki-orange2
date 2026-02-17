"use client";

import Image from "next/image";

const caseStudies = [
  {
    id: 2,
    title: "戸建て外壁塗装",
    description: "色褪せた白い外壁を、鮮やかなブルーに全面塗り替え。外観の印象が大きく変わりました。",
    category: "外壁塗装",
    before: "/images/case-before-2.jpg",
    after: "/images/case-after-2.jpg",
  },
  {
    id: 6,
    title: "戸建て外壁・屋根塗装",
    description: "2階モルタル壁の上塗り＋1階レンガ調サイディングのクリア塗装、屋根カバー工法まで一括施工。",
    category: "外壁・屋根塗装",
    before: "/images/case-before-6.jpg",
    after: "/images/case-after-6.jpg",
    process: [
      { src: "/images/case-process-6a.jpg", label: "外壁上塗り" },
      { src: "/images/case-process-6b.jpg", label: "屋根塗装完了" },
    ],
  },
  {
    id: 1,
    title: "マンション大規模修繕",
    description: "築年数による外壁の劣化を一新。共用廊下・バルコニーを含む全面塗り替えを実施しました。",
    category: "大規模修繕",
    before: "/images/case-before-1.jpg",
    after: "/images/case-after-1.jpg",
  },
];

const subCaseStudies = [
  {
    id: 3,
    title: "戸建て外壁塗装",
    category: "外壁塗装",
    before: "/images/case-before-3.jpg",
    after: "/images/case-after-3.jpg",
  },
  {
    id: 4,
    title: "3階建て塗り替え",
    category: "外壁塗装",
    before: "/images/case-before-4.jpg",
    after: "/images/case-after-4.jpg",
  },
  {
    id: 5,
    title: "遮熱塗装・ドローン調査",
    category: "屋根塗装",
    before: "/images/case-before-5.jpg",
    after: "/images/case-after-5.jpg",
  },
  {
    id: 7,
    title: "タイル外壁補修",
    category: "タイル補修",
    before: "/images/case-before-7.jpg",
    after: "/images/case-after-7.jpg",
  },
];

const CaseStudySection = () => {
  return (
    <section className="bg-gray-50 py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* タイトル */}
        <div className="text-center mb-12">
          <p className="text-[#1B4F72]/60 text-sm tracking-[0.2em] uppercase mb-2">CASE STUDIES</p>
          <div className="w-16 h-0.5 bg-[#B94040] mx-auto mb-6"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">施工事例のご紹介</h2>
          <p className="mt-4 text-gray-500">実際の施工事例をビフォーアフターでご覧いただけます</p>
        </div>

        {/* メイン事例 3件 */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {caseStudies.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
            >
              {/* Before/After画像 */}
              <div className="relative">
                <div className="grid grid-cols-2">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={item.before}
                      alt={`${item.title} 施工前`}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-gray-800/70 text-white text-xs font-bold px-2 py-1 rounded">
                      BEFORE
                    </span>
                  </div>
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={item.after}
                      alt={`${item.title} 施工後`}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-[#1B4F72] text-white text-xs font-bold px-2 py-1 rounded">
                      AFTER
                    </span>
                  </div>
                </div>
                {/* 矢印 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#B94040] rounded-full flex items-center justify-center shadow-lg z-10">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* 施工中写真（あれば） */}
              {item.process && (
                <div className="flex gap-2 px-4 pt-3">
                  {item.process.map((p, idx) => (
                    <div key={idx} className="flex-1 relative">
                      <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
                        <Image
                          src={p.src}
                          alt={p.label}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 text-center">{p.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* テキスト */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#1B4F72]/10 text-[#1B4F72] text-xs font-bold px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* サブ事例 4件 */}
        <div>
          <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">その他の施工事例</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {subCaseStudies.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div className="relative">
                  <div className="grid grid-cols-2">
                    <div className="relative aspect-square">
                      <Image
                        src={item.before}
                        alt={`${item.title} 施工前`}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-1 left-1 bg-gray-800/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        BEFORE
                      </span>
                    </div>
                    <div className="relative aspect-square">
                      <Image
                        src={item.after}
                        alt={`${item.title} 施工後`}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-1 left-1 bg-[#1B4F72] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        AFTER
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#B94040] rounded-full flex items-center justify-center shadow z-10">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div className="p-3">
                  <span className="bg-[#1B4F72]/10 text-[#1B4F72] text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {item.category}
                  </span>
                  <p className="text-sm font-bold text-gray-700 mt-1">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudySection;
