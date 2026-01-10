"use client";

import { useState } from "react";

interface DesignatedDiagnosisFormProps {
  partnerId: number;
  partnerName: string;
  supportedPrefectures?: string[]; // 対応エリアのリスト（英語の都道府県コード）
  onSuccess?: () => void;
}

const DesignatedDiagnosisForm = ({ partnerId, partnerName, supportedPrefectures, onSuccess }: DesignatedDiagnosisFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    prefecture: "",
    floorArea: "UNKNOWN",
    currentSituation: "CONSIDERING_CONSTRUCTION",
    constructionType: "EXTERIOR_PAINTING"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const prefectures = [
    { name: "北海道", value: "Hokkaido" },
    { name: "青森県", value: "Aomori" },
    { name: "岩手県", value: "Iwate" },
    { name: "宮城県", value: "Miyagi" },
    { name: "秋田県", value: "Akita" },
    { name: "山形県", value: "Yamagata" },
    { name: "福島県", value: "Fukushima" },
    { name: "茨城県", value: "Ibaraki" },
    { name: "栃木県", value: "Tochigi" },
    { name: "群馬県", value: "Gunma" },
    { name: "埼玉県", value: "Saitama" },
    { name: "千葉県", value: "Chiba" },
    { name: "東京都", value: "Tokyo" },
    { name: "神奈川県", value: "Kanagawa" },
    { name: "新潟県", value: "Niigata" },
    { name: "富山県", value: "Toyama" },
    { name: "石川県", value: "Ishikawa" },
    { name: "福井県", value: "Fukui" },
    { name: "山梨県", value: "Yamanashi" },
    { name: "長野県", value: "Nagano" },
    { name: "岐阜県", value: "Gifu" },
    { name: "静岡県", value: "Shizuoka" },
    { name: "愛知県", value: "Aichi" },
    { name: "三重県", value: "Mie" },
    { name: "滋賀県", value: "Shiga" },
    { name: "京都府", value: "Kyoto" },
    { name: "大阪府", value: "Osaka" },
    { name: "兵庫県", value: "Hyogo" },
    { name: "奈良県", value: "Nara" },
    { name: "和歌山県", value: "Wakayama" },
    { name: "鳥取県", value: "Tottori" },
    { name: "島根県", value: "Shimane" },
    { name: "岡山県", value: "Okayama" },
    { name: "広島県", value: "Hiroshima" },
    { name: "山口県", value: "Yamaguchi" },
    { name: "徳島県", value: "Tokushima" },
    { name: "香川県", value: "Kagawa" },
    { name: "愛媛県", value: "Ehime" },
    { name: "高知県", value: "Kochi" },
    { name: "福岡県", value: "Fukuoka" },
    { name: "佐賀県", value: "Saga" },
    { name: "長崎県", value: "Nagasaki" },
    { name: "熊本県", value: "Kumamoto" },
    { name: "大分県", value: "Oita" },
    { name: "宮崎県", value: "Miyazaki" },
    { name: "鹿児島県", value: "Kagoshima" },
    { name: "沖縄県", value: "Okinawa" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/diagnoses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          designatedPartnerId: partnerId
        })
      });

      const result = await response.json();

      console.log("=== API Response ===");
      console.log(JSON.stringify(result, null, 2));
      console.log("===================");

      if (result.success) {
        alert(`${partnerName}への診断依頼を受け付けました。\n診断番号: ${result.data.diagnosisNumber}\n\n担当者から3営業日以内にご連絡させていただきます。`);
        setFormData({
          name: "",
          phone: "",
          email: "",
          prefecture: "",
          floorArea: "UNKNOWN",
          currentSituation: "CONSIDERING_CONSTRUCTION",
          constructionType: "EXTERIOR_PAINTING"
        });
        if (onSuccess) onSuccess();
      } else {
        console.error("=== API Error ===");
        console.error(JSON.stringify(result, null, 2));
        console.error("=================");
        alert(`診断依頼の送信に失敗しました。\n\nエラーメッセージ:\n${result.message || result.error}\n\nブラウザのコンソール(F12)を開いて詳細をコピーしてください。`);
      }
    } catch (error) {
      console.error("Diagnosis submission error:", error);
      alert(`診断依頼の送信に失敗しました。\n\nエラー: ${error instanceof Error ? error.message : '不明なエラー'}\n\n詳細はコンソールをご確認ください。`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {partnerName}への無料診断申込
        </h2>
        <p className="text-sm text-gray-600">
          こちらの業者を指定して診断依頼を行います。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 氏名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f16f21]"
            placeholder="山田 太郎"
          />
        </div>

        {/* 電話番号 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            電話番号 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f16f21]"
            placeholder="090-1234-5678"
          />
        </div>

        {/* メールアドレス */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f16f21]"
            placeholder="example@email.com"
          />
        </div>

        {/* 都道府県 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            都道府県 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.prefecture}
            onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f16f21]"
          >
            <option value="">選択してください</option>
            {prefectures
              .filter(pref => !supportedPrefectures || supportedPrefectures.length === 0 || supportedPrefectures.includes(pref.value))
              .map((pref) => (
                <option key={pref.value} value={pref.value}>
                  {pref.name}
                </option>
              ))}
          </select>
          {supportedPrefectures && supportedPrefectures.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              ※ この業者の対応エリアのみ表示しています
            </p>
          )}
        </div>

        {/* 延床面積 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            延床面積
          </label>
          <select
            value={formData.floorArea}
            onChange={(e) => setFormData({ ...formData, floorArea: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f16f21]"
          >
            <option value="UNKNOWN">わからない</option>
            <option value="UNDER_80">80㎡未満</option>
            <option value="FROM_80_TO_100">80〜100㎡</option>
            <option value="FROM_101_TO_120">101〜120㎡</option>
            <option value="FROM_121_TO_140">121〜140㎡</option>
            <option value="FROM_141_TO_160">141〜160㎡</option>
            <option value="FROM_161_TO_180">161〜180㎡</option>
            <option value="FROM_181_TO_200">181〜200㎡</option>
            <option value="FROM_201_TO_250">201〜250㎡</option>
            <option value="FROM_251_TO_300">251〜300㎡</option>
            <option value="FROM_301_TO_500">301〜500㎡</option>
            <option value="OVER_501">501㎡以上</option>
          </select>
        </div>

        {/* 現在の状況 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            現在の状況
          </label>
          <select
            value={formData.currentSituation}
            onChange={(e) => setFormData({ ...formData, currentSituation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f16f21]"
          >
            <option value="MARKET_RESEARCH">情報収集中</option>
            <option value="CONSIDERING_CONSTRUCTION">工事を検討中</option>
            <option value="COMPARING_CONTRACTORS">業者を比較中</option>
            <option value="READY_TO_ORDER">すぐに発注したい</option>
          </select>
        </div>

        {/* 工事種類 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            工事種類
          </label>
          <select
            value={formData.constructionType}
            onChange={(e) => setFormData({ ...formData, constructionType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f16f21]"
          >
            <option value="EXTERIOR_PAINTING">外壁塗装</option>
            <option value="ROOF_PAINTING">屋根塗装</option>
            <option value="EXTERIOR_AND_ROOF">外壁・屋根塗装</option>
            <option value="PARTIAL_REPAIR">部分補修</option>
            <option value="WATERPROOFING">防水工事</option>
            <option value="SIDING_REPLACEMENT">サイディング張替</option>
            <option value="FULL_REPLACEMENT">全面改装</option>
          </select>
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#f16f21] hover:bg-[#e05a10]"
          }`}
        >
          {isSubmitting ? "送信中..." : "この業者に診断を申し込む"}
        </button>
      </form>
    </div>
  );
};

export default DesignatedDiagnosisForm;
