"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [review, setReview] = useState("");

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/evaluation/${token}`);
      const result = await response.json();

      if (result.success) {
        setValid(true);
        setOrder(result.data);
      } else {
        setValid(false);
        setErrorMessage(result.error || "不明なエラー");
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      setValid(false);
      setErrorMessage("サーバーとの通信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert("評価を選択してください");
      return;
    }

    if (!review.trim()) {
      alert("レビュー内容を入力してください");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/evaluation/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          reviewTitle,
          review,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
      } else {
        alert(`送信に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      alert("送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">エラー</h1>
          <p className="text-gray-600">
            {errorMessage || "このリンクは無効か、すでに使用済みです。"}
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            評価ありがとうございました
          </h1>
          <p className="text-gray-600">
            ご意見をお聞かせいただき、誠にありがとうございます。
            <br />
            今後のサービス向上に役立てさせていただきます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">施工評価フォーム</h1>
            <p className="text-sm text-gray-600 mt-2">
              施工の品質についてご評価ください
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 施工情報 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">施工情報</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">施工業者: </span>
                  <span className="font-medium">{order?.partnerName}</span>
                </div>
                <div>
                  <span className="text-gray-600">施工住所: </span>
                  <span className="font-medium">{order?.address}</span>
                </div>
              </div>
            </div>

            {/* 評価 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                総合評価 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-4xl transition-colors"
                  >
                    {star <= rating ? (
                      <span className="text-yellow-400">★</span>
                    ) : (
                      <span className="text-gray-300">☆</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {rating === 0 && "評価を選択してください"}
                {rating === 1 && "非常に不満"}
                {rating === 2 && "不満"}
                {rating === 3 && "普通"}
                {rating === 4 && "満足"}
                {rating === 5 && "非常に満足"}
              </p>
            </div>

            {/* レビュータイトル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                レビュータイトル
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例：丁寧で迅速な対応でした"
              />
            </div>

            {/* レビュー内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                レビュー内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={6}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="施工の品質、対応の丁寧さ、仕上がりなどについてお聞かせください"
              />
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || rating === 0}
                className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 font-medium"
              >
                {loading ? "送信中..." : "評価を送信"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>お客様の声は、サービス向上のために活用させていただきます。</p>
        </div>
      </div>
    </div>
  );
}
