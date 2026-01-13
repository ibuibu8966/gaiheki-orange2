"use client";

import { ReactNode, useEffect } from "react";

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  full: "sm:max-w-[90vw]",
};

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "lg",
}: ResponsiveModalProps) {
  // ESCキーで閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* モーダルコンテナ */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className={`
            relative w-full bg-white
            sm:rounded-lg shadow-xl
            transform transition-all
            max-h-[100vh] sm:max-h-[90vh]
            overflow-hidden
            ${sizeClasses[size]}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className="sticky top-0 z-10 bg-white px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 pr-8 truncate">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="
                absolute right-4 top-4
                p-2 rounded-lg
                text-gray-400 hover:text-gray-600 hover:bg-gray-100
                transition-colors
                min-h-[44px] min-w-[44px]
                flex items-center justify-center
              "
              aria-label="閉じる"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* コンテンツ */}
          <div className="px-4 sm:px-6 py-4 overflow-y-auto max-h-[calc(100vh-140px)] sm:max-h-[calc(90vh-140px)]">
            {children}
          </div>

          {/* フッター */}
          {footer && (
            <div className="sticky bottom-0 bg-white px-4 sm:px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                {footer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResponsiveModal;
