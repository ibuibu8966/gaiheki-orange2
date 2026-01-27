"use client";

import { useState, useEffect } from "react";
import ArticleEditorModal from "./ArticleEditorModal";
import { ResponsiveTable } from "../../Common/ResponsiveTable";

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
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">コラム管理</h2>
          </div>

          {/* ツールバー */}
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* ステータスフィルター */}
              <div className="flex flex-wrap gap-2">
                {["すべて", "表示", "非表示"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-4 py-3 min-h-[44px] rounded-md text-sm font-medium transition-colors ${
                      statusFilter === filter
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100"
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
                className="bg-gray-800 text-white px-4 py-3 min-h-[44px] rounded-md text-sm font-medium hover:bg-gray-700 active:bg-gray-900 transition-colors w-full sm:w-auto"
              >
                新規作成
              </button>

              {/* 検索バー */}
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="コラム検索..."
                  className="pl-3 pr-10 py-3 min-h-[44px] border border-gray-300 rounded-md text-sm w-full sm:w-64"
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
          <div className="p-4 sm:p-0">
            <ResponsiveTable
              data={filteredArticles}
              keyField="id"
              isLoading={loading}
              emptyMessage="記事がありません"
              columns={[
                {
                  key: "thumbnailImage",
                  label: "サムネイル",
                  hideOnMobile: true,
                  render: (a) =>
                    a.thumbnailImage ? (
                      <img
                        src={a.thumbnailImage}
                        alt={a.title}
                        className="w-16 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-700">
                        No Image
                      </div>
                    ),
                },
                {
                  key: "title",
                  label: "タイトル",
                  priority: 10,
                  render: (a) => (
                    <div className="truncate max-w-xs font-medium">{a.title}</div>
                  ),
                },
                {
                  key: "categoryLabel",
                  label: "カテゴリ",
                  priority: 7,
                },
                {
                  key: "isPublished",
                  label: "ステータス",
                  priority: 8,
                  render: (a) => (
                    <select
                      value={a.isPublished ? "表示" : "非表示"}
                      onChange={(e) =>
                        handleStatusChange(a.id, e.target.value === "表示")
                      }
                      onClick={(e) => e.stopPropagation()}
                      className={`px-3 py-2 min-h-[36px] text-xs font-medium rounded-md border-0 ${
                        a.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <option value="表示">表示</option>
                      <option value="非表示">非表示</option>
                    </select>
                  ),
                },
                {
                  key: "createdDate",
                  label: "作成日",
                  priority: 6,
                },
              ]}
              onRowClick={(a) => {
                setSelectedArticleId(a.id);
                setShowEditor(true);
              }}
              mobileCardTitle={(a) => (
                <div className="flex items-center gap-3">
                  {a.thumbnailImage ? (
                    <img
                      src={a.thumbnailImage}
                      alt={a.title}
                      className="w-12 h-8 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                      No
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{a.title}</div>
                    <div className="text-xs text-gray-700">{a.categoryLabel}</div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-md flex-shrink-0 ${
                      a.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {a.isPublished ? "表示" : "非表示"}
                  </span>
                </div>
              )}
              mobileCardActions={(a) => {
                const index = filteredArticles.findIndex((art) => art.id === a.id);
                return (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReorder(a.id, "up")}
                      disabled={index === 0}
                      className="flex-1 py-2 text-center text-gray-600 font-medium min-h-[44px] hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                    >
                      ↑ 上へ
                    </button>
                    <button
                      onClick={() => handleReorder(a.id, "down")}
                      disabled={index === filteredArticles.length - 1}
                      className="flex-1 py-2 text-center text-gray-600 font-medium min-h-[44px] hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                    >
                      ↓ 下へ
                    </button>
                    <button
                      onClick={() => {
                        setSelectedArticleId(a.id);
                        setShowEditor(true);
                      }}
                      className="flex-1 py-2 text-center text-primary font-medium min-h-[44px] hover:bg-primary/10 rounded transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="flex-1 py-2 text-center text-red-600 font-medium min-h-[44px] hover:bg-red-50 rounded transition-colors"
                    >
                      削除
                    </button>
                  </div>
                );
              }}
            />
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
