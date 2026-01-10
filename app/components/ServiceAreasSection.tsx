"use client";

import Link from "next/link";
import JapanMapDots from "./JapanMapDots";

const ServiceAreasSection = () => {
  const regions = [
    {
      name: "中国",
      position: "left-top",
      prefectures: [
        { name: "岡山県", key: "Okayama" },
        { name: "広島県", key: "Hiroshima" },
        { name: "島根県", key: "Shimane" },
        { name: "鳥取県", key: "Tottori" },
        { name: "山口県", key: "Yamaguchi" },
      ]
    },
    {
      name: "甲信越・北陸",
      position: "center-top",
      prefectures: [
        { name: "山梨県", key: "Yamanashi" },
        { name: "長野県", key: "Nagano" },
        { name: "石川県", key: "Ishikawa" },
        { name: "新潟県", key: "Niigata" },
        { name: "富山県", key: "Toyama" },
        { name: "福井県", key: "Fukui" },
      ]
    },
    {
      name: "北海道・東北",
      position: "right-top",
      prefectures: [
        { name: "北海道", key: "Hokkaido" },
        { name: "青森県", key: "Aomori" },
        { name: "岩手県", key: "Iwate" },
        { name: "宮城県", key: "Miyagi" },
        { name: "秋田県", key: "Akita" },
        { name: "山形県", key: "Yamagata" },
        { name: "福島県", key: "Fukushima" },
      ]
    },
    {
      name: "四国",
      position: "left-middle",
      prefectures: [
        { name: "愛媛県", key: "Ehime" },
        { name: "香川県", key: "Kagawa" },
        { name: "高知県", key: "Kochi" },
        { name: "徳島県", key: "Tokushima" },
      ]
    },
    {
      name: "関東",
      position: "right-middle",
      prefectures: [
        { name: "東京都", key: "Tokyo" },
        { name: "神奈川県", key: "Kanagawa" },
        { name: "千葉県", key: "Chiba" },
        { name: "埼玉県", key: "Saitama" },
        { name: "茨城県", key: "Ibaraki" },
        { name: "栃木県", key: "Tochigi" },
        { name: "群馬県", key: "Gunma" },
      ]
    },
    {
      name: "九州・沖縄",
      position: "left-bottom",
      prefectures: [
        { name: "福岡県", key: "Fukuoka" },
        { name: "佐賀県", key: "Saga" },
        { name: "長崎県", key: "Nagasaki" },
        { name: "熊本県", key: "Kumamoto" },
        { name: "大分県", key: "Oita" },
        { name: "宮崎県", key: "Miyazaki" },
        { name: "鹿児島県", key: "Kagoshima" },
        { name: "沖縄県", key: "Okinawa" },
      ]
    },
    {
      name: "関西",
      position: "center-bottom",
      prefectures: [
        { name: "大阪府", key: "Osaka" },
        { name: "兵庫県", key: "Hyogo" },
        { name: "京都府", key: "Kyoto" },
        { name: "滋賀県", key: "Shiga" },
        { name: "奈良県", key: "Nara" },
        { name: "和歌山県", key: "Wakayama" },
      ]
    },
    {
      name: "東海",
      position: "right-bottom",
      prefectures: [
        { name: "愛知県", key: "Aichi" },
        { name: "静岡県", key: "Shizuoka" },
        { name: "岐阜県", key: "Gifu" },
        { name: "三重県", key: "Mie" },
      ]
    }
  ];

  const RegionCard = ({ region }: { region: typeof regions[0] }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-md">
      <h3 className="font-bold text-[#f16f21] text-sm mb-2">
        {region.name}
      </h3>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {region.prefectures.map((prefecture, index) => (
          <Link
            key={index}
            href={`/areas/${prefecture.key}`}
            className="text-xs text-gray-700 hover:text-[#f16f21] underline transition-colors duration-200"
          >
            {prefecture.name}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <section id="service-areas" className="relative py-16 md:py-24 px-4 overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4b4137] to-[#3c3228]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6 text-[#f16f21]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              エリアから外壁・屋根塗装の優良業者を探す
            </h2>
          </div>
        </div>

        {/* メインコンテンツ: カード + 地図 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* 左列 */}
          <div className="space-y-4">
            <RegionCard region={regions[0]} /> {/* 中国 */}
            <RegionCard region={regions[3]} /> {/* 四国 */}
            <RegionCard region={regions[5]} /> {/* 九州・沖縄 */}
          </div>

          {/* 中央: 地図 + カード */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <RegionCard region={regions[1]} /> {/* 甲信越・北陸 */}

            {/* 日本地図 */}
            <div className="relative w-full max-w-xs">
              <JapanMapDots />
            </div>

            <RegionCard region={regions[6]} /> {/* 関西 */}
          </div>

          {/* 右列 */}
          <div className="space-y-4">
            <RegionCard region={regions[2]} /> {/* 北海道・東北 */}
            <RegionCard region={regions[4]} /> {/* 関東 */}
            <RegionCard region={regions[7]} /> {/* 東海 */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceAreasSection;
