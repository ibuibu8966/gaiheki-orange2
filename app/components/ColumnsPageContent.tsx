"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Article {
  id: number;
  title: string;
  thumbnailImage: string | null;
  category: string;
  categoryLabel: string;
  content: string;
  postName: string;
  createdAt: string;
  createdDate: string;
}

const CATEGORY_MAP: Record<string, string> = {
  すべてのカテゴリ: "",
  外壁塗装の基礎知識: "BASIC_KNOWLEDGE",
  塗料の種類と特徴: "PAINT_TYPES",
  施工事例: "CASE_STUDIES",
  メンテナンス: "MAINTENANCE",
  業者選びのポイント: "CONTRACTOR_SELECTION",
  "費用・見積もり": "COST_ESTIMATE",
  トラブル対処法: "TROUBLESHOOTING",
  "季節・天候": "SEASONAL_WEATHER",
};

const ColumnsPageContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべてのカテゴリ");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      // 公開済みの記事のみ取得
      const response = await fetch("/api/admin/columns?published=true");
      const result = await response.json();

      if (result.success) {
        setArticles(result.data);
      } else {
        console.error("Failed to fetch articles:", result.error);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Object.keys(CATEGORY_MAP);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getExcerpt = (html: string, maxLength: number = 100): string => {
    // HTMLタグを削除してテキストのみ抽出
    const text = html.replace(/<[^>]*>/g, "");
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());

    const categoryValue = CATEGORY_MAP[selectedCategory];
    const matchesCategory =
      selectedCategory === "すべてのカテゴリ" ||
      article.category === categoryValue;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen relative py-8">
      {/* 背景画像 */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{backgroundImage: 'url(/page-bg.jpg)'}}
        ></div>
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* パンくずナビ */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link
              href="/"
              className="hover:text-[#f16f21] transition-colors"
            >
              トップ
            </Link>
            <span>＞</span>
            <span className="text-gray-700">外壁塗装コラム</span>
          </nav>
        </div>

        {/* メインコンテンツ */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            外壁・屋根塗装の関連コラム
          </h1>
          <p className="text-lg text-gray-600">
            外壁塗装に関する役立つ情報をお届けします。費用相場から業者選びまで、専門家が詳しく解説します。
          </p>
        </div>

        {/* 検索・フィルターセクション */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 検索バー */}
            <div className="flex-1 relative">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="コラムを検索..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f16f21] focus:border-[#f16f21]"
                />
              </div>
            </div>

            {/* カテゴリフィルター */}
            <div className="lg:w-64">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f16f21] focus:border-[#f16f21] appearance-none bg-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 検索結果数 */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading
              ? "読み込み中..."
              : `${filteredArticles.length}件のコラムが見つかりました`}
          </p>
        </div>

        {/* コラム一覧 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 画像エリア */}
                <div className="aspect-video bg-gray-200 flex items-center justify-center overflow-hidden">
                  {article.thumbnailImage ? (
                    <img
                      src={article.thumbnailImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>

                <div className="p-6">
                  {/* カテゴリとタグ */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-[#f16f21]/10 text-[#f16f21] px-3 py-1 rounded-full text-sm font-medium">
                      {article.categoryLabel}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(article.createdAt)}
                    </span>
                  </div>

                  {/* タイトル */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* 説明文 */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {getExcerpt(article.content, 100)}
                  </p>

                  {/* 詳しく読むリンク */}
                  <Link
                    href={`/columns/${article.postName}`}
                    className="inline-flex items-center text-[#f16f21] hover:text-[#f16f21] font-medium text-sm transition-colors"
                  >
                    詳しく読む
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* 検索結果がない場合 */}
        {!loading && filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.507-.878-6.137-2.32L2 17l4.9-1.063A7.962 7.962 0 0112 15z"
              />
            </svg>
            <p className="text-gray-500 text-lg">
              検索条件に合うコラムが見つかりませんでした。
            </p>
            <p className="text-gray-400 text-sm mt-2">
              検索キーワードやカテゴリを変更してお試しください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnsPageContent;
