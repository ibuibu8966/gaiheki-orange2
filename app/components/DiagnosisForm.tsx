"use client";

import { useState } from "react";
import Image from "next/image";

const DiagnosisForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    prefecture: "",
    floorArea: "",
    currentSituation: "",
    constructionType: "",
    phone: "",
    email: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/diagnoses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert(`診断依頼を受け付けました。\n診断番号: ${result.data.diagnosisNumber}\n\n業者からの見積もりをお待ちください。`);

        // フォームをリセット
        setFormData({
          name: "",
          prefecture: "",
          floorArea: "",
          currentSituation: "",
          constructionType: "",
          phone: "",
          email: ""
        });
      } else {
        alert("送信に失敗しました。もう一度お試しください。");
      }
    } catch (error) {
      console.error("Error submitting diagnosis:", error);
      alert("送信に失敗しました。もう一度お試しください。");
    }
  };

  return (
    <section id="diagnosis-form" className="bg-white py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* 左側: タイトルとキャンペーン */}
          <div className="lg:w-2/5 text-center lg:text-left">
            {/* How much? アイコン */}
            <div className="mb-4">
              <div className="inline-block">
                <p className="text-[#f16f21] text-sm font-medium mb-2">How much?</p>
                <div className="w-20 h-20 mx-auto lg:mx-0 bg-[#f16f21]/10 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#f16f21]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* タイトル */}
            <p className="text-gray-600 text-sm mb-2">
              ＼ 簡単<span className="text-[#f16f21] text-2xl font-bold mx-1">10</span>秒相場CHECK ／
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-gray-800">外壁塗装の</span><br />
              <span className="text-[#f16f21]">相場を診断</span>
            </h2>

            {/* キャンペーンバナー */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 inline-block">
              <div className="flex items-center justify-center gap-3">
                <div className="w-14 h-14 rounded overflow-hidden shrink-0">
                  <Image
                    src="/images/amazon-gift.jpg"
                    alt="Amazonギフト券"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-600">相場診断でAmazonギフト券</p>
                  <p className="text-2xl font-bold text-gray-800">1000<span className="text-sm font-normal">円分</span></p>
                  <p className="text-[#f16f21] text-sm font-bold">プレゼント中！</p>
                </div>
              </div>
            </div>
          </div>

          {/* 右側: フォーム */}
          <div className="lg:w-3/5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* お名前 */}
              <div className="flex items-center">
                <label className="w-24 sm:w-32 text-sm text-gray-700 shrink-0">
                  お名前
                </label>
                <span className="text-[#f16f21] text-xs mr-2 sm:mr-4 shrink-0">必須</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="山田 太郎"
                  className="flex-1 min-w-0 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f16f21] focus:border-[#f16f21] text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              {/* 都道府県 */}
              <div className="flex items-center">
                <label className="w-24 sm:w-32 text-sm text-gray-700 shrink-0">
                  都道府県
                </label>
                <span className="text-[#f16f21] text-xs mr-2 sm:mr-4 shrink-0">必須</span>
                <select
                  name="prefecture"
                  value={formData.prefecture}
                  onChange={handleInputChange}
                  className="flex-1 min-w-0 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f16f21] focus:border-[#f16f21] text-gray-900"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="Hokkaido">北海道</option>
                  <option value="Aomori">青森県</option>
                  <option value="Iwate">岩手県</option>
                  <option value="Miyagi">宮城県</option>
                  <option value="Akita">秋田県</option>
                  <option value="Yamagata">山形県</option>
                  <option value="Fukushima">福島県</option>
                  <option value="Ibaraki">茨城県</option>
                  <option value="Tochigi">栃木県</option>
                  <option value="Gunma">群馬県</option>
                  <option value="Saitama">埼玉県</option>
                  <option value="Chiba">千葉県</option>
                  <option value="Tokyo">東京都</option>
                  <option value="Kanagawa">神奈川県</option>
                  <option value="Niigata">新潟県</option>
                  <option value="Toyama">富山県</option>
                  <option value="Ishikawa">石川県</option>
                  <option value="Fukui">福井県</option>
                  <option value="Yamanashi">山梨県</option>
                  <option value="Nagano">長野県</option>
                  <option value="Gifu">岐阜県</option>
                  <option value="Shizuoka">静岡県</option>
                  <option value="Aichi">愛知県</option>
                  <option value="Mie">三重県</option>
                  <option value="Shiga">滋賀県</option>
                  <option value="Kyoto">京都府</option>
                  <option value="Osaka">大阪府</option>
                  <option value="Hyogo">兵庫県</option>
                  <option value="Nara">奈良県</option>
                  <option value="Wakayama">和歌山県</option>
                  <option value="Tottori">鳥取県</option>
                  <option value="Shimane">島根県</option>
                  <option value="Okayama">岡山県</option>
                  <option value="Hiroshima">広島県</option>
                  <option value="Yamaguchi">山口県</option>
                  <option value="Tokushima">徳島県</option>
                  <option value="Kagawa">香川県</option>
                  <option value="Ehime">愛媛県</option>
                  <option value="Kochi">高知県</option>
                  <option value="Fukuoka">福岡県</option>
                  <option value="Saga">佐賀県</option>
                  <option value="Nagasaki">長崎県</option>
                  <option value="Kumamoto">熊本県</option>
                  <option value="Oita">大分県</option>
                  <option value="Miyazaki">宮崎県</option>
                  <option value="Kagoshima">鹿児島県</option>
                  <option value="Okinawa">沖縄県</option>
                </select>
              </div>

              {/* 延面積 */}
              <div className="flex items-center">
                <label className="w-24 sm:w-32 text-sm text-gray-700 shrink-0">
                  延面積
                </label>
                <span className="text-[#f16f21] text-xs mr-2 sm:mr-4 shrink-0">必須</span>
                <select
                  name="floorArea"
                  value={formData.floorArea}
                  onChange={handleInputChange}
                  className="flex-1 min-w-0 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f16f21] focus:border-[#f16f21] text-gray-900"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="UNKNOWN">分からない</option>
                  <option value="UNDER_80">80㎡未満</option>
                  <option value="FROM_80_TO_100">80〜100㎡</option>
                  <option value="FROM_100_TO_120">100〜120㎡</option>
                  <option value="FROM_120_TO_140">120〜140㎡</option>
                  <option value="FROM_140_TO_160">140〜160㎡</option>
                  <option value="FROM_160_TO_180">160〜180㎡</option>
                  <option value="FROM_180_TO_200">180〜200㎡</option>
                  <option value="OVER_200">200㎡以上</option>
                </select>
              </div>

              {/* 現在の状況 */}
              <div className="flex items-center">
                <label className="w-24 sm:w-32 text-sm text-gray-700 shrink-0">
                  現在の状況
                </label>
                <span className="text-[#f16f21] text-xs mr-2 sm:mr-4 shrink-0">必須</span>
                <select
                  name="currentSituation"
                  value={formData.currentSituation}
                  onChange={handleInputChange}
                  className="flex-1 min-w-0 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f16f21] focus:border-[#f16f21] text-gray-900"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="MARKET_RESEARCH">情報収集中</option>
                  <option value="CONSIDERING_CONSTRUCTION">工事を検討中</option>
                  <option value="COMPARING_CONTRACTORS">業者を比較中</option>
                  <option value="READY_TO_ORDER">すぐに発注したい</option>
                </select>
              </div>

              {/* 工事箇所 */}
              <div className="flex items-center">
                <label className="w-24 sm:w-32 text-sm text-gray-700 shrink-0">
                  工事箇所
                </label>
                <span className="text-[#f16f21] text-xs mr-2 sm:mr-4 shrink-0">必須</span>
                <select
                  name="constructionType"
                  value={formData.constructionType}
                  onChange={handleInputChange}
                  className="flex-1 min-w-0 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f16f21] focus:border-[#f16f21] text-gray-900"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="EXTERIOR_PAINTING">外壁塗装</option>
                  <option value="ROOF_PAINTING">屋根塗装</option>
                  <option value="EXTERIOR_AND_ROOF">外壁・屋根塗装</option>
                  <option value="PARTIAL_REPAIR">部分補修</option>
                  <option value="WATERPROOFING">防水工事</option>
                  <option value="SIDING_REPLACEMENT">サイディング張替</option>
                  <option value="FULL_REPLACEMENT">全面改装</option>
                </select>
              </div>

              {/* 携帯電話番号 */}
              <div className="flex items-start">
                <label className="w-24 sm:w-32 text-sm text-gray-700 shrink-0 pt-3">
                  携帯電話番号
                </label>
                <span className="text-[#f16f21] text-xs mr-2 sm:mr-4 pt-3 shrink-0">必須</span>
                <div className="flex-1 min-w-0">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="例: 08012345678"
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f16f21] focus:border-[#f16f21] text-gray-900 placeholder-gray-400"
                    required
                  />
                  <p className="text-xs text-[#f16f21] mt-1">
                    ※こちらの携帯電話番号にSMSメール概算相場価格と<br />
                    小冊子のダウンロードリンクをお送りしますのでお間違えのないようにご入力ください。
                  </p>
                </div>
              </div>

              {/* メールアドレス */}
              <div className="flex items-center">
                <label className="w-24 sm:w-32 text-sm text-gray-700 shrink-0">
                  メールアドレス
                </label>
                <span className="text-gray-400 text-xs mr-2 sm:mr-4 shrink-0">任意</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="例: example@example.com"
                  className="flex-1 min-w-0 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f16f21] focus:border-[#f16f21] text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* 利用規約 */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#f16f21] underline hover:no-underline">利用規約</a>
                  と
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#f16f21] underline hover:no-underline">プライバシーポリシー</a>
                  に同意して、
                </p>
              </div>

              {/* 送信ボタン */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#f16f21] hover:bg-[#e05a10] text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span className="bg-white text-[#f16f21] text-sm font-bold px-2 py-0.5 rounded">無料</span>
                  今すぐ相場を診断する
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiagnosisForm;
