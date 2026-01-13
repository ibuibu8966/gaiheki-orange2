"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface ResponsiveSidebarProps {
  title: string;
  menuItems: MenuItem[];
  onLogout: () => void;
  onHomeClick: () => void;
}

export const ResponsiveSidebar = ({
  title,
  menuItems,
  onLogout,
  onHomeClick,
}: ResponsiveSidebarProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // ウィンドウサイズ監視
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setIsCollapsed(width >= 640 && width < 1024);

      // デスクトップではドロワーを閉じる
      if (width >= 640) {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // ESCキーでドロワーを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // サイドバー幅の決定
  const sidebarWidth = isCollapsed && !isMobile ? "w-16" : "w-64";

  return (
    <>
      {/* ハンバーガーメニューボタン（モバイル用） */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed top-4 left-4 z-50
          p-2 rounded-lg bg-white shadow-md
          sm:hidden
          min-h-[44px] min-w-[44px]
          flex items-center justify-center
          active:bg-gray-100 transition-colors
        `}
        aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={isOpen}
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* オーバーレイ（モバイル用） */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40
          sm:hidden
          transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* サイドバー本体 */}
      <aside
        className={`
          fixed sm:sticky top-0 left-0 h-screen z-50 sm:z-auto
          bg-white shadow-lg sm:shadow-sm
          flex flex-col flex-shrink-0
          transition-all duration-300 ease-in-out
          ${sidebarWidth}
          ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        `}
      >
        {/* ヘッダー */}
        <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between min-h-[64px]">
          {(!isCollapsed || isMobile) && (
            <h1 className="text-lg lg:text-xl font-bold text-gray-800 truncate">
              {title}
            </h1>
          )}

          {/* タブレット用折りたたみボタン */}
          {isTablet && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label={isCollapsed ? "メニューを展開" : "メニューを折りたたむ"}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* メニューリスト */}
        <nav className="p-2 lg:p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1 lg:space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setIsOpen(false)}
                    className={`
                      w-full flex items-center
                      px-3 lg:px-4 py-3
                      text-left rounded-lg transition-all
                      min-h-[44px]
                      ${isCollapsed && !isMobile ? "justify-center" : ""}
                      ${isActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                      }
                    `}
                    title={isCollapsed && !isMobile ? item.label : undefined}
                  >
                    <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
                    {(!isCollapsed || isMobile) && (
                      <span className="ml-3 whitespace-nowrap text-sm lg:text-base">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* フッター */}
        <div className="p-2 lg:p-4 border-t border-gray-200 space-y-1 lg:space-y-2">
          <button
            onClick={() => {
              onHomeClick();
              isMobile && setIsOpen(false);
            }}
            className={`
              w-full flex items-center
              px-3 lg:px-4 py-3
              text-left rounded-lg transition-all
              text-gray-700 hover:bg-gray-50 active:bg-gray-100
              min-h-[44px]
              ${isCollapsed && !isMobile ? "justify-center" : ""}
            `}
            title={isCollapsed && !isMobile ? "トップ画面に戻る" : undefined}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {(!isCollapsed || isMobile) && <span className="ml-3 text-sm lg:text-base">トップに戻る</span>}
          </button>
          <button
            onClick={() => {
              onLogout();
              isMobile && setIsOpen(false);
            }}
            className={`
              w-full flex items-center
              px-3 lg:px-4 py-3
              text-left rounded-lg transition-all
              text-gray-700 hover:bg-red-50 hover:text-red-600 active:bg-red-100
              min-h-[44px]
              ${isCollapsed && !isMobile ? "justify-center" : ""}
            `}
            title={isCollapsed && !isMobile ? "ログアウト" : undefined}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {(!isCollapsed || isMobile) && <span className="ml-3 text-sm lg:text-base">ログアウト</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default ResponsiveSidebar;
