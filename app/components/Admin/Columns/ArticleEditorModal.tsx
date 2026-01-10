"use client";

import { useState, useEffect } from "react";
import SimpleRichEditor from "./SimpleRichEditor";

interface ArticleEditorModalProps {
  articleId?: number;
  onClose: () => void;
  onSave: () => void;
}

const CATEGORIES = [
  { value: "BASIC_KNOWLEDGE", label: "外壁塗装の基礎知識" },
  { value: "PAINT_TYPES", label: "塗料の種類と特徴" },
  { value: "CASE_STUDIES", label: "施工事例" },
  { value: "MAINTENANCE", label: "メンテナンス" },
  { value: "CONTRACTOR_SELECTION", label: "業者選びのポイント" },
  { value: "COST_ESTIMATE", label: "費用・見積もり" },
  { value: "TROUBLESHOOTING", label: "トラブル対処法" },
  { value: "SEASONAL_WEATHER", label: "季節・天候" },
];

const ArticleEditorModal = ({
  articleId,
  onClose,
  onSave,
}: ArticleEditorModalProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("BASIC_KNOWLEDGE");
  const [content, setContent] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/columns/${articleId}`);
      const result = await response.json();

      if (result.success) {
        setTitle(result.data.title);
        setCategory(result.data.category);
        setContent(result.data.content);
        setThumbnailImage(result.data.thumbnailImage || "");
        setIsPublished(result.data.isPublished);
      }
    } catch (error) {
      console.error("Error fetching article:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish: boolean = false) => {
    if (!title || !content) {
      alert("タイトルと本文は必須です");
      return;
    }

    try {
      setSaving(true);

      const endpoint = articleId
        ? `/api/admin/columns/${articleId}`
        : "/api/admin/columns";

      const method = articleId ? "PATCH" : "POST";

      const payload: any = {
        title,
        category,
        content,
        thumbnailImage: thumbnailImage || null,
        isPublished: publish,
      };

      if (!articleId) {
        // 新規作成時はadminIdとpostNameが必要
        payload.adminId = 1; // TODO: セッションから取得
        payload.postName = generateSlug(title);
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert(articleId ? "記事を更新しました" : "記事を作成しました");
        onSave();
        onClose();
      } else {
        alert(`保存に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving article:", error);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 画像サイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        alert("画像サイズは5MB以下にしてください");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // 画像をリサイズ（最大幅800px）
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          const maxWidth = 800;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // 圧縮してBase64に変換（品質80%）
          const compressedImage = canvas.toDataURL("image/jpeg", 0.8);
          setThumbnailImage(compressedImage);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSlug = (title: string): string => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 7);
    return `article-${timestamp}-${randomStr}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-gray-800">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 bg-white z-50 ${
        isFullscreen ? "" : "bg-opacity-0"
      }`}
    >
      <div className={`h-full flex flex-col ${isFullscreen ? "" : "max-w-7xl mx-auto"}`}>
        {/* ヘッダー */}
        <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {articleId ? "コラム編集" : "新規コラム作成"}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              {isFullscreen ? "通常表示" : "全画面"}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 disabled:bg-gray-400"
            >
              {saving ? "保存中..." : "下書き保存"}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {saving ? "公開中..." : "公開"}
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* タイトル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タイトル *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="記事のタイトルを入力"
              />
            </div>

            {/* カテゴリとサムネイル */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  サムネイル画像
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {thumbnailImage && (
                  <img
                    src={thumbnailImage}
                    alt="Thumbnail preview"
                    className="mt-2 w-32 h-20 object-cover rounded"
                  />
                )}
              </div>
            </div>

            {/* エディタ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                本文 *
              </label>
              <SimpleRichEditor value={content} onChange={setContent} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditorModal;
