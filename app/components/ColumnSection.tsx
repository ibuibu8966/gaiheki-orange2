"use client";

import { useEffect, useState, useCallback, memo } from "react";
import Image from "next/image";
import Link from "next/link";

interface Article {
  id: number;
  title: string;
  thumbnailImage: string | null;
  category: string;
  categoryLabel: string;
  postName: string;
}

interface CategoryGroup {
  key: string;
  label: string;
  title: string;
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  { key: 'COST_ESTIMATE', label: '費用・見積もり', title: '外壁塗装の費用・見積もりに関連するコラム' },
  { key: 'BASIC_KNOWLEDGE', label: '基礎知識', title: '外壁塗装の基礎知識に関連するコラム' },
  { key: 'PAINT_TYPES', label: '塗料の種類', title: '外壁塗装の塗料の種類に関連するコラム' },
  { key: 'CASE_STUDIES', label: '施工事例', title: '外壁塗装の施工事例に関連するコラム' },
  { key: 'CONTRACTOR_SELECTION', label: '業者選び', title: '外壁塗装の業者選びに関連するコラム' },
  { key: 'MAINTENANCE', label: 'メンテナンス', title: '外壁塗装のメンテナンスに関連するコラム' },
  { key: 'TROUBLESHOOTING', label: 'トラブル対策', title: '外壁塗装のトラブル対策に関連するコラム' },
  { key: 'SEASONAL_WEATHER', label: '季節・天候', title: '外壁塗装の季節・天候に関連するコラム' },
];

// カード コンポーネント（メモ化）
const ColumnCard = memo(({ article }: { article: Article }) => (
  <Link href={`/columns/${article.postName}`} className="group cursor-pointer block">
    <div className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden mb-3">
      {article.thumbnailImage ? (
        <Image
          src={article.thumbnailImage}
          alt={article.title}
          fill
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4874c] to-[#b06a3b]"></div>
      )}
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
        <div className="bg-[#d4874c]/90 px-4 py-2 rounded text-center">
          <p className="text-sm font-bold line-clamp-2">{article.title}</p>
        </div>
        <p className="text-xs mt-2 bg-black/40 px-2 py-1 rounded">{article.categoryLabel}</p>
      </div>
    </div>
    <h3 className="text-sm text-gray-800 leading-relaxed group-hover:text-[#f16f21] transition-colors line-clamp-2">
      {article.title}
    </h3>
  </Link>
));

ColumnCard.displayName = 'ColumnCard';

// カテゴリセクション コンポーネント（メモ化）
interface CategorySectionProps {
  category: CategoryGroup;
  articles: Article[];
  currentIndex: number;
  onNavigate: (categoryKey: string, direction: 'prev' | 'next') => void;
}

const CategorySectionItem = memo(({ category, articles, currentIndex, onNavigate }: CategorySectionProps) => {
  if (articles.length === 0) return null;

  const displayArticles = articles.slice(currentIndex, currentIndex + 3);
  const showNavigation = articles.length > 3;

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        {category.title}
      </h3>
      <div className="relative flex items-center">
        {/* 左矢印 */}
        {showNavigation && (
          <button
            type="button"
            onClick={() => onNavigate(category.key, 'prev')}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors mr-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* カード */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayArticles.map((article, idx) => (
            <ColumnCard key={`${category.key}-${idx}`} article={article} />
          ))}
        </div>

        {/* 右矢印 */}
        {showNavigation && (
          <button
            type="button"
            onClick={() => onNavigate(category.key, 'next')}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors ml-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});

CategorySectionItem.displayName = 'CategorySectionItem';

const ColumnSection = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryIndices, setCategoryIndices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/admin/columns?published=true');
        const data = await response.json();
        if (data.success) {
          setArticles(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // カテゴリごとに記事をグループ化
  const getArticlesByCategory = useCallback((categoryKey: string) => {
    return articles.filter(a => a.category === categoryKey);
  }, [articles]);

  // ナビゲーション関数（ページネーション方式）
  const handleNavigate = useCallback((categoryKey: string, direction: 'prev' | 'next') => {
    const categoryArticles = articles.filter(a => a.category === categoryKey);
    const totalCount = categoryArticles.length;
    if (totalCount <= 3) return;

    const maxPage = Math.ceil(totalCount / 3) - 1;

    setCategoryIndices(prev => {
      const currentIndex = prev[categoryKey] || 0;
      const currentPage = Math.floor(currentIndex / 3);
      let newPage: number;

      if (direction === 'next') {
        newPage = currentPage >= maxPage ? 0 : currentPage + 1;
      } else {
        newPage = currentPage <= 0 ? maxPage : currentPage - 1;
      }

      return { ...prev, [categoryKey]: newPage * 3 };
    });
  }, [articles]);

  if (loading) {
    return (
      <section className="bg-white py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  // 記事があるカテゴリのみ表示
  const categoriesWithArticles = CATEGORY_GROUPS.filter(
    cat => getArticlesByCategory(cat.key).length > 0
  );

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* メインタイトル */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-1.5 h-10 bg-[#f16f21]"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            外壁・屋根塗装の関連コラム
          </h2>
          <p className="hidden md:block text-[#d4a574] text-sm ml-4">
            外壁塗装のコラムを紹介します
          </p>
        </div>

        {/* カテゴリごとのセクション */}
        {categoriesWithArticles.map((category) => (
          <CategorySectionItem
            key={category.key}
            category={category}
            articles={getArticlesByCategory(category.key)}
            currentIndex={categoryIndices[category.key] || 0}
            onNavigate={handleNavigate}
          />
        ))}

        {/* コラム一覧へのリンク */}
        <div className="text-center mt-12">
          <Link
            href="/columns"
            className="inline-flex items-center justify-center bg-white border-2 border-[#f16f21] text-[#f16f21] font-bold py-3 px-8 rounded-lg hover:bg-[#f16f21] hover:text-white transition-all duration-300"
          >
            コラム一覧を見る
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ColumnSection;
