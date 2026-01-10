"use client";

import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 上部：ロゴとナビゲーション */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          {/* ロゴ */}
          <div className="mb-6 md:mb-0">
            <Link href="/">
              <h2 className="font-serif text-2xl font-black text-[#f16f21] tracking-wide hover:opacity-80 transition-opacity duration-300">外壁塗装パートナーズ</h2>
            </Link>
          </div>

          {/* ナビゲーションリンク */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/#service-areas" className="hover:text-[#f16f21] transition-colors duration-300">
              施工店一覧
            </Link>
            <Link href="/columns" className="hover:text-[#f16f21] transition-colors duration-300">
              外壁塗装コラム
            </Link>
            <Link href="/partner-registration" className="hover:text-[#f16f21] transition-colors duration-300">
              加盟店募集
            </Link>
            <Link href="/contact" className="hover:text-[#f16f21] transition-colors duration-300">
              お問い合わせ
            </Link>
          </nav>
        </div>

        {/* 中部：会社情報と連絡先 */}
        <div className="border-t border-gray-300 pt-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 運営会社情報 */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3">運営会社</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium">オムコン株式会社</p>
                <p>代表取締役　大塚真央</p>
                <p>資本金　2,000万円</p>
                <p>〒113-0023 東京都文京区向丘2-18-13-2F</p>
              </div>
            </div>

            {/* 連絡先 */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3">お問い合わせ</h3>
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 text-[#f16f21] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <a href="tel:0120-945-990" className="text-lg font-bold text-[#f16f21] hover:text-[#e05a10] transition-colors duration-300">
                  0120-945-990
                </a>
              </div>
              <div className="flex gap-6 text-xs text-gray-500">
                <Link href="/terms" className="hover:text-[#f16f21] transition-colors duration-300">
                  利用規約
                </Link>
                <Link href="/privacy" className="hover:text-[#f16f21] transition-colors duration-300">
                  プライバシーポリシー
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 下部：コピーライト */}
        <div className="text-center">
          <p className="text-gray-500 text-xs">
            © 2025 外壁塗装パートナーズ. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;