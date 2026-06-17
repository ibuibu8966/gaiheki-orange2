"use client";

import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#0E2F44] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 上部：ロゴとナビゲーション */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          {/* ロゴ */}
          <div className="mb-6 md:mb-0">
            <Link href="/">
              <h2 className="font-serif text-2xl font-black text-white tracking-wide hover:opacity-80 transition-opacity duration-300">塗装の相談室</h2>
            </Link>
          </div>

          {/* ナビゲーションリンク */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/columns" className="text-white/70 hover:text-white transition-colors duration-300">
              外壁塗装コラム
            </Link>
            <Link href="/partner-registration" className="text-white/70 hover:text-white transition-colors duration-300">
              加盟店募集
            </Link>
            <Link href="/contact" className="text-white/70 hover:text-white transition-colors duration-300">
              お問い合わせ
            </Link>
          </nav>
        </div>

        {/* 中部：会社情報と連絡先 */}
        <div className="border-t border-white/15 pt-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 運営会社情報 */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3">運営会社</h3>
              <div className="text-sm text-white/60 space-y-1">
                <p className="font-medium text-white/80">オムコン株式会社</p>
                <p>〒113-0023 東京都文京区向丘2-18-13-2F</p>
              </div>
            </div>

            {/* 連絡先 */}
            <div>
              <h3 className="text-base font-bold text-white mb-3">お問い合わせ</h3>
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 text-[#B94040] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <a href="tel:0120-832-103" className="text-2xl font-black text-white hover:text-[#B94040] transition-colors duration-300">
                  0120-832-103
                </a>
              </div>
              <p className="text-sm text-white/50 mb-3">受付時間 8:00〜21:00（年中無休）</p>
              <div className="flex gap-6 text-sm text-white/50">
                <Link href="/terms" className="hover:text-white transition-colors duration-300">
                  利用規約
                </Link>
                <Link href="/privacy" className="hover:text-white transition-colors duration-300">
                  プライバシーポリシー
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 下部：コピーライト */}
        <div className="text-center">
          <p className="text-white/40 text-xs">
            © 2025 塗装の相談室. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
