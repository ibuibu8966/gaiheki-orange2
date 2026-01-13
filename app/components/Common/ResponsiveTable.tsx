"use client";

import { useState, useEffect, ReactNode } from "react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
  hideOnMobile?: boolean;
  priority?: number; // モバイルカード表示時の優先度（高いほど上に表示）
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  mobileCardTitle?: (item: T) => ReactNode;
  mobileCardActions?: (item: T) => ReactNode;
}

export function ResponsiveTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField,
  onRowClick,
  isLoading,
  emptyMessage = "データがありません",
  mobileCardTitle,
  mobileCardActions,
}: ResponsiveTableProps<T>) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="mt-2 text-sm text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2 text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  // モバイル: カード形式
  if (isMobile) {
    const sortedColumns = [...columns]
      .filter(col => !col.hideOnMobile || col.priority)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return (
      <div className="space-y-3 px-2 sm:px-0">
        {data.map((item) => (
          <div
            key={String(item[keyField])}
            className={`
              bg-white rounded-lg border border-gray-200 shadow-sm
              overflow-hidden
              ${onRowClick ? "cursor-pointer active:bg-gray-50 transition-colors" : ""}
            `}
            onClick={() => onRowClick?.(item)}
          >
            {/* カードヘッダー（タイトル） */}
            {mobileCardTitle && (
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="font-semibold text-gray-900">
                  {mobileCardTitle(item)}
                </div>
              </div>
            )}

            {/* カードコンテンツ */}
            <div className="px-4 py-3 space-y-2">
              {sortedColumns.map((column) => {
                const value = column.render
                  ? column.render(item)
                  : String(item[column.key as keyof T] ?? "-");

                return (
                  <div key={String(column.key)} className="flex justify-between items-start gap-2">
                    <span className="text-sm text-gray-500 flex-shrink-0">
                      {column.label}
                    </span>
                    <span className="text-sm text-gray-900 text-right font-medium">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* カードアクション */}
            {mobileCardActions && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div onClick={(e) => e.stopPropagation()}>
                  {mobileCardActions(item)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // タブレット・デスクトップ: テーブル形式
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`
                  px-4 lg:px-6 py-3
                  text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.hideOnMobile ? "hidden md:table-cell" : ""}
                `}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr
              key={String(item[keyField])}
              className={`
                ${onRowClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}
              `}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={`
                    px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900
                    ${column.hideOnMobile ? "hidden md:table-cell" : ""}
                  `}
                >
                  {column.render
                    ? column.render(item)
                    : String(item[column.key as keyof T] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResponsiveTable;
