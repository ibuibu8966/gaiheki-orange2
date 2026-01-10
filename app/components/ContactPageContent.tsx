"use client";

import { useState } from "react";
import Link from "next/link";

const ContactPageContent = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert("お問い合わせいただきありがとうございます。\n3営業日以内にご返信させていただきます。");

        // フォームをリセット
        setFormData({
          name: "",
          phone: "",
          email: "",
          subject: "",
          message: ""
        });
      } else {
        alert("送信に失敗しました。もう一度お試しください。");
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert("送信に失敗しました。もう一度お試しください。");
    }
  };

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

        {/* メインコンテンツ */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">お問い合わせ</h1>
          <p className="text-lg text-gray-600">
            外壁塗装に関するご質問やご相談がございましたら、お気軽にお問い合わせください。
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* お問い合わせ先情報 */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">お問い合わせ先</h2>

            <div className="space-y-6">
              {/* 電話でのお問い合わせ */}
              <div className="flex items-start">
                <div className="bg-[#f16f21]/10 p-3 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-[#f16f21]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">お電話でのお問い合わせ</h3>
                  <a href="tel:0120-945-990" className="text-2xl font-bold text-[#f16f21] hover:text-[#e05a10] mb-2 block">0120-945-990</a>
                  <p className="text-sm text-gray-600">受付時間: 9:00-18:00（土日祝除く）</p>
                </div>
              </div>

              {/* メールでのお問い合わせ */}
              <div className="flex items-start">
                <div className="bg-[#f16f21]/10 p-3 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-[#f16f21]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">メールでのお問い合わせ</h3>
                  <p className="text-lg text-gray-700">info@gaiheki-partners.com</p>
                </div>
              </div>

              {/* 所在地 */}
              <div className="flex items-start">
                <div className="bg-[#f16f21]/10 p-3 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-[#f16f21]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">所在地</h3>
                  <p className="text-gray-700">〒113-0023</p>
                  <p className="text-gray-700">東京都文京区向丘2-18-13-2F</p>
                  <p className="text-gray-700 mt-1 text-sm">オムコン株式会社</p>
                </div>
              </div>

              {/* 営業時間 */}
              <div className="flex items-start">
                <div className="bg-[#f16f21]/10 p-3 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-[#f16f21]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">営業時間</h3>
                  <p className="text-gray-700">平日 9:00-18:00</p>
                  <p className="text-gray-700">土日祝 定休日</p>
                </div>
              </div>
            </div>
          </div>

          {/* お問い合わせフォーム */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">お問い合わせフォーム</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* お名前 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="山田太郎"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f16f21] focus:border-[#f16f21]"
                    required
                  />
                </div>

                {/* 電話番号 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="090-1234-5678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f16f21] focus:border-[#f16f21]"
                    required
                  />
                </div>
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f16f21] focus:border-[#f16f21]"
                  required
                />
              </div>

              {/* 件名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  件名 <span className="text-red-500">*</span>
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f16f21] focus:border-[#f16f21]"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="見積もり依頼">見積もり依頼</option>
                  <option value="工事に関する相談">工事に関する相談</option>
                  <option value="料金について">料金について</option>
                  <option value="アフターサービス">アフターサービス</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              {/* お問い合わせ内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="お問い合わせ内容をご記入ください"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f16f21] focus:border-[#f16f21] resize-vertical"
                  required
                />
              </div>

              {/* 送信ボタン */}
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-[#f16f21] hover:bg-[#e05a10] text-white font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  送信する
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPageContent;