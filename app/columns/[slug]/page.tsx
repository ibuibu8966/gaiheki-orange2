"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
}

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      // 全ての公開済み記事を取得してslugで検索
      const response = await fetch("/api/admin/columns?published=true");
      const result = await response.json();

      if (result.success) {
        const foundArticle = result.data.find(
          (a: Article) => a.postName === slug
        );
        setArticle(foundArticle || null);
      }
    } catch (error) {
      console.error("Error fetching article:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            記事が見つかりません
          </h2>
          <Link
            href="/columns"
            className="text-orange-500 hover:text-orange-600"
          >
            コラム一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* パンくずナビ */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-500 transition-colors">
              トップ
            </Link>
            <span>＞</span>
            <Link
              href="/columns"
              className="hover:text-orange-500 transition-colors"
            >
              コラム一覧
            </Link>
            <span>＞</span>
            <span className="text-gray-700 truncate">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* 記事コンテンツ */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* カテゴリ */}
        <div className="mb-4">
          <span className="inline-block px-4 py-2 bg-orange-100 text-orange-600 text-sm font-medium rounded-full">
            {article.categoryLabel}
          </span>
        </div>

        {/* タイトル */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        {/* 日付 */}
        <div className="flex items-center text-gray-500 text-sm mb-8">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {formatDate(article.createdAt)}
        </div>

        {/* サムネイル画像 */}
        {article.thumbnailImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={article.thumbnailImage}
              alt={article.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* 本文 */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          />
        </div>

        {/* 戻るリンク */}
        <div className="mt-12 text-center">
          <Link
            href="/columns"
            className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            コラム一覧に戻る
          </Link>
        </div>
      </article>
    </div>
  );
}
