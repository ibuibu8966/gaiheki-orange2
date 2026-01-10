"use client";

import Image from "next/image";

const JapanMapWithStats = () => {
  return (
    <div className="relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl flex items-center justify-center">
      {/* 背景の丸（グラデーション付き） */}
      <div
        className="absolute w-[95%] aspect-square rounded-full"
        style={{
          background: 'radial-gradient(circle, transparent 60%, rgba(212, 196, 176, 0.3) 80%, rgba(212, 196, 176, 0.5) 100%)',
        }}
      ></div>
      <div className="absolute w-[95%] aspect-square rounded-full border border-[#d4c4b0] opacity-70"></div>
      <div className="absolute w-[80%] aspect-square rounded-full border border-[#e0d5c8] opacity-50"></div>

      {/* 地方名ラベル */}
      <div className="absolute z-20 top-[12%] right-[28%] text-base lg:text-lg font-bold text-white bg-[#f16f21] px-3 py-1 rounded-full shadow-md">北海道</div>
      <div className="absolute z-20 top-[30%] right-[18%] text-base lg:text-lg font-bold text-white bg-[#8bc34a] px-3 py-1 rounded-full shadow-md">東北</div>
      <div className="absolute z-20 top-[45%] right-[15%] text-base lg:text-lg font-bold text-white bg-[#ff9800] px-3 py-1 rounded-full shadow-md">関東</div>
      <div className="absolute z-20 top-[52%] right-[25%] text-base lg:text-lg font-bold text-white bg-[#03a9f4] px-3 py-1 rounded-full shadow-md">中部</div>
      <div className="absolute z-20 top-[52%] left-[18%] text-base lg:text-lg font-bold text-white bg-[#9c27b0] px-3 py-1 rounded-full shadow-md">中国</div>
      <div className="absolute z-20 top-[55%] left-[32%] text-base lg:text-lg font-bold text-white bg-[#e91e63] px-3 py-1 rounded-full shadow-md">近畿</div>
      <div className="absolute z-20 top-[62%] left-[28%] text-base lg:text-lg font-bold text-white bg-[#00bcd4] px-3 py-1 rounded-full shadow-md">四国</div>
      <div className="absolute z-20 top-[68%] left-[12%] text-base lg:text-lg font-bold text-white bg-[#4caf50] px-3 py-1 rounded-full shadow-md">九州</div>

      {/* 日本地図画像 */}
      <div className="relative z-10 w-full scale-[1.7] origin-center">
        <Image
          src="/images/japan-map-new.png"
          alt="日本地図 - 地域別加盟店・直営店数"
          width={650}
          height={650}
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  );
};

export default JapanMapWithStats;
