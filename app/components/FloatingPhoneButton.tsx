"use client";

import { useState, useEffect } from "react";

const FloatingPhoneButton = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(true);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  // モバイル版: 画面下部全幅バー
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#B94040] shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        <a
          href="tel:0120-83-2103"
          className="flex items-center justify-center gap-3 py-4 px-6 text-white"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black tracking-wide">0120-83-2103</p>
            <p className="text-xs opacity-90">8:00-21:00 年中無休</p>
          </div>
        </a>
      </div>
    );
  }

  // デスクトップ版: 右下固定ボタン
  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <a
        href="tel:0120-83-2103"
        className="group flex flex-col items-center"
      >
        {/* メインボタン */}
        <div className="relative">
          <div className="w-20 h-20 bg-[#B94040] rounded-full shadow-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl phone-button-pulse">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </div>
          {/* パルスエフェクト */}
          <div className="absolute inset-0 w-20 h-20 bg-[#B94040] rounded-full animate-ping opacity-30"></div>
        </div>

        {/* 電話番号と受付時間 */}
        <div className="mt-2 bg-white rounded-lg shadow-lg px-3 py-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-[#B94040] font-black text-sm">0120-83-2103</p>
          <p className="text-gray-500 text-xs">8:00-21:00</p>
        </div>
      </a>
    </div>
  );
};

export default FloatingPhoneButton;
