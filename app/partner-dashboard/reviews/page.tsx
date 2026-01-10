"use client";

import { useState, useEffect } from "react";

// 工事内容のラベルマッピング
const CONSTRUCTION_TYPE_LABELS: Record<string, string> = {
  EXTERIOR_PAINTING: "外壁塗装",
  ROOF_PAINTING: "屋根塗装",
  EXTERIOR_AND_ROOF: "外壁・屋根塗装",
  PARTIAL_REPAIR: "部分補修",
  WATERPROOFING: "防水工事",
  SIDING_REPLACEMENT: "サイディング張替",
  FULL_REPLACEMENT: "全面張替",
  PAINTING: "外壁塗装",
  RENOVATION: "リフォーム",
  REPAIR: "修繕",
  OTHER: "その他"
};

interface Review {
  id: number;
  customerName: string;
  rating: number;
  reviewTitle: string | null;
  reviewComment: string | null;
  constructionType: string;
  contractAmount: number;
  completionDate: string | null;
  reviewDate: string | null;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  // フィルタ・検索
  const [ratingFilter, setRatingFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // データ取得
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (ratingFilter) params.append('rating', ratingFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/partner/reviews?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setReviews(result.data);
        setAverageRating(result.averageRating);
        setTotalCount(result.totalCount);
      } else {
        alert(result.error || 'レビュー情報の取得に失敗しました');
      }
    } catch (error) {
      console.error('Reviews fetch error:', error);
      alert('レビュー情報の取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [ratingFilter]);

  // 検索ボタンクリック
  const handleSearch = () => {
    fetchReviews();
  };

  // 星の表示
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">口コミ情報管理</h2>

        {/* 総合評価カード */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">総合評価</h3>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold text-blue-600">
              {averageRating.toFixed(1)}
            </div>
            <div>
              {renderStars(Math.round(averageRating))}
              <p className="text-sm text-gray-600 mt-1">
                全{totalCount}件のレビュー
              </p>
            </div>
          </div>
        </div>

        {/* フィルタと検索 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 評価フィルタ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                評価で絞り込み
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setRatingFilter("")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    ratingFilter === ""
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  すべて
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setRatingFilter(rating.toString())}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      ratingFilter === rating.toString()
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span className="text-yellow-400">★</span>
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            {/* 検索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索（顧客名・コメント・工事内容）
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="検索キーワードを入力"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  検索
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* レビュー一覧 */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">読み込み中...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">
                {ratingFilter || searchQuery
                  ? "条件に一致するレビューが見つかりませんでした"
                  : "まだレビューがありません"}
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {review.customerName}
                    </h4>
                    {renderStars(review.rating)}
                    <span className="text-sm font-medium text-gray-900">
                      {review.rating}.0
                    </span>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>レビュー日: {review.reviewDate ? new Date(review.reviewDate).toLocaleDateString('ja-JP') : '-'}</div>
                  </div>
                </div>

                {review.reviewTitle && (
                  <h5 className="text-base font-semibold text-gray-900 mb-2">
                    {review.reviewTitle}
                  </h5>
                )}

                {review.reviewComment && (
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {review.reviewComment}
                  </p>
                )}

                <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">工事内容：</span>
                    <span className="font-medium text-gray-900 ml-1">
                      {CONSTRUCTION_TYPE_LABELS[review.constructionType] || review.constructionType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">契約金額：</span>
                    <span className="font-medium text-gray-900 ml-1">
                      ¥{review.contractAmount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">施工完了日：</span>
                    <span className="font-medium text-gray-900 ml-1">
                      {review.completionDate ? new Date(review.completionDate).toLocaleDateString('ja-JP') : '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
