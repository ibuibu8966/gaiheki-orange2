"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const scrollToDiagnosisForm = () => {
    if (pathname !== '/') {
      router.push('/#diagnosis-form');
      setTimeout(() => {
        const element = document.getElementById('diagnosis-form');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById('diagnosis-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getLinkClass = (path: string) => {
    const baseClass = "px-3 py-2 text-base font-medium transition-all duration-300";
    const activeClass = "text-[#1B4F72] border-b-2 border-[#1B4F72]";
    const inactiveClass = "text-gray-700 hover:text-[#1B4F72]";

    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  return (
    <>
      {/* トップ情報バー */}
      <div className="bg-[#1B4F72] text-white text-sm py-2 px-4 hidden lg:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <a href="tel:0120-832-103" className="font-bold hover:text-white/80 transition-colors">0120-832-103</a>
            </div>
            <span className="text-white/70">受付時間 8:00〜21:00（年中無休）</span>
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <Link href="/auth/admin-login" className="hover:text-white transition-colors">管理者</Link>
            <span className="text-white/40">/</span>
            <Link href="/auth/partner-login" className="hover:text-white transition-colors">加盟店様</Link>
          </div>
        </div>
      </div>

      {/* メインヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* ロゴ */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <h1 className="font-serif text-xl md:text-2xl font-black text-[#1B4F72] cursor-pointer tracking-wide hover:opacity-80 transition-opacity duration-300">塗装の相談室</h1>
              </Link>
            </div>

            {/* ナビゲーションメニュー */}
            <nav className="hidden lg:flex items-center space-x-6 whitespace-nowrap">
              <Link href="/columns" className={getLinkClass('/columns')}>
                外壁塗装コラム
              </Link>
              <Link href="/partner-registration" className={getLinkClass('/partner-registration')}>
                加盟店募集
              </Link>
              <Link href="/contact" className={getLinkClass('/contact')}>
                お問い合わせ
              </Link>
            </nav>

            {/* CTAボタン */}
            <div className="hidden lg:flex items-center">
              <button
                onClick={scrollToDiagnosisForm}
                className="bg-[#B94040] hover:bg-[#A03636] text-white px-8 py-3 rounded-lg text-base font-bold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                無料相場診断
              </button>
            </div>

            {/* モバイルメニューボタン */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-[#1B4F72] transition-colors duration-300 p-2"
                aria-label="メニュー"
              >
                {isMenuOpen ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* モバイルメニュー */}
          {isMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-3 px-4">
                <Link
                  href="/columns"
                  className="text-gray-700 hover:text-[#1B4F72] py-2 text-base font-medium transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  外壁塗装コラム
                </Link>
                <Link
                  href="/partner-registration"
                  className="text-gray-700 hover:text-[#1B4F72] py-2 text-base font-medium transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  加盟店募集
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-700 hover:text-[#1B4F72] py-2 text-base font-medium transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  お問い合わせ
                </Link>

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-sm text-gray-500 mb-2">ログイン</p>
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/auth/admin-login"
                      className="text-gray-500 hover:text-[#1B4F72] text-base transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      管理者ログイン
                    </Link>
                    <Link
                      href="/auth/partner-login"
                      className="text-gray-500 hover:text-[#1B4F72] text-base transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      加盟店様ログイン
                    </Link>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-3">
                  <p className="text-sm text-gray-500 mb-2">お電話でのご相談</p>
                  <a
                    href="tel:0120-832-103"
                    className="flex items-center justify-center gap-3 bg-[#1B4F72] text-white rounded-xl py-4 px-6 hover:bg-[#154360] transition-colors duration-300"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <div className="text-center">
                      <span className="font-black text-xl">0120-832-103</span>
                      <p className="text-xs opacity-90">8:00-21:00 年中無休</p>
                    </div>
                  </a>
                  <button
                    onClick={() => {
                      scrollToDiagnosisForm();
                      setIsMenuOpen(false);
                    }}
                    className="w-full border-2 border-[#B94040] text-[#B94040] hover:bg-[#B94040] hover:text-white px-6 py-3 rounded-xl text-base font-bold transition-all duration-300 mt-3"
                  >
                    無料相場診断
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
