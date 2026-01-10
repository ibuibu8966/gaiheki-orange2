"use client";

import { useState, useEffect } from "react";
import ArticleEditorModal from "./ArticleEditorModal";

interface Article {
  id: number;
  title: string;
  thumbnailImage: string | null;
  category: string;
  categoryLabel: string;
  isPublished: boolean;
  status: string;
  sortOrder: number;
  createdDate: string;
}

const ColumnsView = () => {
  const [statusFilter, setStatusFilter] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticleId, setSelectedArticleId] = useState<number | undefined>(
    undefined
  );
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, [statusFilter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      let url = "/api/admin/columns?";

      if (statusFilter === "表示") {
        url += "published=true";
      } else if (statusFilter === "非表示") {
        url += "published=false";
      }

      const response = await fetch(url);
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

  const handleStatusChange = async (articleId: number, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/columns/${articleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished }),
      });

      const result = await response.json();

      if (result.success) {
        fetchArticles();
      } else {
        alert(`ステータス更新に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("ステータス更新に失敗しました");
    }
  };

  const handleReorder = async (articleId: number, direction: "up" | "down") => {
    try {
      const response = await fetch("/api/admin/columns/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ articleId, direction }),
      });

      const result = await response.json();

      if (result.success) {
        fetchArticles();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error reordering:", error);
      alert("並び替えに失敗しました");
    }
  };

  const handleDelete = async (articleId: number) => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      const response = await fetch(`/api/admin/columns/${articleId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        alert("削除しました");
        fetchArticles();
      } else {
        alert(`削除に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("削除に失敗しました");
    }
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">コラム管理</h2>
          </div>

          {/* ツールバー */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {/* ステータスフィルター */}
              <div className="flex space-x-2">
                {["すべて", "表示", "非表示"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      statusFilter === filter
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* 新規作成ボタン */}
              <button
                onClick={() => {
                  setSelectedArticleId(undefined);
                  setShowEditor(true);
                }}
                className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                新規作成
              </button>

              {/* 検索バー */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="コラム検索..."
                  className="pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm w-64"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
              </div>
            </div>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">読み込み中...</div>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">記事がありません</div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      サムネイル
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      タイトル
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      カテゴリ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      並び替え
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredArticles.map((article, index) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {article.thumbnailImage ? (
                          <img
                            src={article.thumbnailImage}
                            alt={article.title}
                            className="w-16 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                        <div className="truncate">{article.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {article.categoryLabel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={article.isPublished ? "表示" : "非表示"}
                          onChange={(e) =>
                            handleStatusChange(
                              article.id,
                              e.target.value === "表示"
                            )
                          }
                          className={`px-3 py-1 text-xs font-medium rounded-md border-0 ${
                            article.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <option value="表示">表示</option>
                          <option value="非表示">非表示</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {article.createdDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleReorder(article.id, "up")}
                            disabled={index === 0}
                            className="p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                            title="上へ"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => handleReorder(article.id, "down")}
                            disabled={index === filteredArticles.length - 1}
                            className="p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                            title="下へ"
                          >
                            ↓
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedArticleId(article.id);
                              setShowEditor(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showEditor && (
        <ArticleEditorModal
          articleId={selectedArticleId}
          onClose={() => setShowEditor(false)}
          onSave={() => {
            fetchArticles();
          }}
        />
      )}
    </>
  );
};

export default ColumnsView;
