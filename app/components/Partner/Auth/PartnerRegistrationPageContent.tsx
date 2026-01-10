"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PartnerRegistrationPageContent = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    representativeName: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    businessContent: "",
    appealPoints: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/partner/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/partner-registration/complete');
      } else {
        alert(data.error || '申請の送信に失敗しました');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('申請の送信に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative py-8">
      {/* 背景画像 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{backgroundImage: 'url(/page-bg.jpg)'}}
        ></div>
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-800">加盟店登録フォーム</h1>
          </div>
          <p className="text-gray-600 mb-2">
            「外壁塗装パートナーズ」への掲載をご希望される施工会社様は、以下のフォームにご入力ください。
          </p>
          <p className="text-gray-600">
            ご入力いただいた内容を確認の上、3営業日以内に担当者よりご連絡させていただきます。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {/* 会社情報セクション */}
          <div>
            <div className="flex items-center mb-6">
              <svg className="w-6 h-6 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h2 className="text-xl font-bold text-gray-800">会社情報</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* 会社名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  会社名 <span className="text-red-500">必須</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="株式会社○○塗装"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              {/* 代表者名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  代表者名 <span className="text-red-500">必須</span>
                </label>
                <input
                  type="text"
                  name="representativeName"
                  value={formData.representativeName}
                  onChange={handleInputChange}
                  placeholder="山田 太郎"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
            </div>

            {/* 所在地 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                所在地 <span className="text-red-500">必須</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="東京都渋谷区○○1-2-3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
          </div>

          {/* 連絡先情報セクション */}
          <div>
            <div className="flex items-center mb-6">
              <svg className="w-6 h-6 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-800">連絡先情報</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* 電話番号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  電話番号 <span className="text-red-500">必須</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="03-1234-5678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  メールアドレス <span className="text-red-500">必須</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="info@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
            </div>

            {/* ホームページURL */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
                ホームページURL
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://www.example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* 事業内容・アピールセクション */}
          <div>
            <div className="flex items-center mb-6">
              <svg className="w-6 h-6 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6-4h6m2 5l-3-3 3-3m-6 8.5a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-800">事業内容・アピール</h2>
            </div>

            {/* 事業内容 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6-4h6m2 5l-3-3 3-3m-6 8.5a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                事業内容
              </label>
              <textarea
                name="businessContent"
                value={formData.businessContent}
                onChange={handleInputChange}
                rows={4}
                placeholder="外壁塗装、屋根塗装、防水工事など、具体的な事業内容をご記入ください。"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-vertical"
              />
            </div>

            {/* 自己PR・アピールポイント */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                自己PR・アピールポイント
              </label>
              <textarea
                name="appealPoints"
                value={formData.appealPoints}
                onChange={handleInputChange}
                rows={5}
                placeholder="御社の強みや特徴、お客様へのアピールポイントをご記入ください。こちらの内容は業者紹介ページでも活用させていただきます。"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-vertical"
              />
            </div>
          </div>

          {/* プライバシーポリシー */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">個人情報の取り扱いについて</h3>
            <p className="text-sm text-gray-600">
              ご入力いただいた情報は、加盟店審査の目的のみ利用いたします。お客様の個人情報は適切に管理し、第三者に提供することはございません。
            </p>
          </div>

          {/* 送信ボタン */}
          <div className="text-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`font-bold py-3 px-12 rounded-lg transition-colors text-lg ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {isSubmitting ? '送信中...' : 'この内容で申請する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartnerRegistrationPageContent;