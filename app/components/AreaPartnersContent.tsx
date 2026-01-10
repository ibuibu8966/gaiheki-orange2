"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Partner {
  id: number;
  companyName: string;
  address: string;
  phoneNumber: string;
  appealText: string;
  businessDescription: string;
  websiteUrl: string | null;
  averageRating: number;
  reviewCount: number;
}

interface AreaPartnersContentProps {
  prefecture: string;
  prefectureName: string;
}

const AreaPartnersContent = ({ prefecture, prefectureName }: AreaPartnersContentProps) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, [prefecture]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/areas/${prefecture}`);
      const result = await response.json();

      if (result.success) {
        setPartners(result.data);
      } else {
        console.error("Failed to fetch partners:", result.error);
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#e5e7eb" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fill="url(#half)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)} ({partners.find(p => p.averageRating === rating)?.reviewCount || 0}件)
        </span>
      </div>
    );
  };

  if (loading) {
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
          <div className="text-center">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

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
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-[#f16f21] transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            ホームに戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {prefectureName}の外壁塗装業者
          </h1>
          <p className="text-lg text-gray-600">
            {prefectureName}で外壁塗装に対応している信頼できる業者 {partners.length}社をご紹介
          </p>
        </div>

        {/* 加盟店一覧 */}
        {partners.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              現在、{prefectureName}に対応している加盟店はありません。
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* 会社名と評価 */}
                  <div className="mb-3">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {partner.companyName}
                    </h2>
                    {renderStars(partner.averageRating)}
                  </div>

                      {/* 住所と電話番号 */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{partner.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <span className="text-gray-700">{partner.phoneNumber}</span>
                        </div>
                      </div>

                      {/* アピール文章 */}
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {partner.appealText}
                      </p>

                  {/* ボタン */}
                  <div className="flex gap-3">
                    <Link
                      href={`/partners/${partner.id}`}
                      className="bg-[#f16f21] hover:bg-[#e05a10] text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      詳細を見る
                    </Link>
                    {partner.websiteUrl && (
                      <a
                        href={partner.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
                      >
                        公式サイト
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaPartnersContent;
