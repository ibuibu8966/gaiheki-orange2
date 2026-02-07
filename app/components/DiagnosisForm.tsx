"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { diagnosisFormSchema, DiagnosisFormData } from "@/lib/validations/forms";
import { FormError } from "./Common/FormError";

const DiagnosisForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DiagnosisFormData>({
    resolver: zodResolver(diagnosisFormSchema),
    defaultValues: {
      name: "",
      prefecture: "",
      floorArea: "",
      currentSituation: "",
      constructionType: "",
      phone: "",
      email: ""
    }
  });

  const onSubmit = async (data: DiagnosisFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/diagnoses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert(`診断依頼を受け付けました。\n診断番号: ${result.data.diagnosisNumber}\n\n業者からの見積もりをお待ちください。`);
        reset();
      } else {
        alert("送信に失敗しました。もう一度お試しください。");
      }
    } catch (error) {
      console.error("Error submitting diagnosis:", error);
      alert("送信に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="diagnosis-form" className="bg-gray-50">
      {/* 紺ヘッダーバナー */}
      <div className="bg-gradient-to-r from-[#1B4F72] to-[#154360] py-10 px-4 text-center">
        <p className="text-white/70 text-sm tracking-[0.2em] mb-2 uppercase">Free Diagnosis</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          外壁塗装の相場を無料診断
        </h2>
        <p className="text-white/80 text-base">
          お住まいの情報をご入力いただくだけで、概算費用をお知らせいたします
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6">
        {/* キャンペーンバナー */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-md flex items-center justify-center gap-4">
          <div className="w-14 h-14 rounded overflow-hidden shrink-0">
            <Image
              src="/images/amazon-gift.jpg"
              alt="Amazonギフト券"
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs text-gray-600">相場診断でAmazonギフト券</p>
            <p className="text-2xl font-bold text-gray-800">1,000<span className="text-sm font-normal">円分</span></p>
            <p className="text-[#B94040] text-sm font-bold">プレゼント実施中</p>
          </div>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-12">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* お名前 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                お名前 <span className="text-[#B94040] text-sm ml-1">必須</span>
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="山田 太郎"
                className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F72] focus:border-[#1B4F72] text-gray-900 placeholder-gray-400"
              />
              <FormError message={errors.name?.message} />
            </div>

            {/* 都道府県 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                都道府県 <span className="text-[#B94040] text-sm ml-1">必須</span>
              </label>
              <select
                {...register("prefecture")}
                className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F72] focus:border-[#1B4F72] text-gray-900"
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
              <FormError message={errors.prefecture?.message} />
            </div>

            {/* 延面積 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                延面積 <span className="text-[#B94040] text-sm ml-1">必須</span>
              </label>
              <select
                {...register("floorArea")}
                className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F72] focus:border-[#1B4F72] text-gray-900"
              >
                <option value="">選択してください</option>
                <option value="UNKNOWN">分からない</option>
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
              <FormError message={errors.floorArea?.message} />
            </div>

            {/* 現在の状況 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                現在の状況 <span className="text-[#B94040] text-sm ml-1">必須</span>
              </label>
              <select
                {...register("currentSituation")}
                className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F72] focus:border-[#1B4F72] text-gray-900"
              >
                <option value="">選択してください</option>
                <option value="MARKET_RESEARCH">情報収集中</option>
                <option value="CONSIDERING_CONSTRUCTION">工事を検討中</option>
                <option value="COMPARING_CONTRACTORS">業者を比較中</option>
                <option value="READY_TO_ORDER">すぐに発注したい</option>
              </select>
              <FormError message={errors.currentSituation?.message} />
            </div>

            {/* 工事箇所 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                工事箇所 <span className="text-[#B94040] text-sm ml-1">必須</span>
              </label>
              <select
                {...register("constructionType")}
                className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F72] focus:border-[#1B4F72] text-gray-900"
              >
                <option value="">選択してください</option>
                <option value="EXTERIOR_PAINTING">外壁塗装</option>
                <option value="ROOF_PAINTING">屋根塗装</option>
                <option value="SCAFFOLDING_WORK">足場工事</option>
                <option value="WATERPROOFING">防水工事</option>
                <option value="LARGE_SCALE_WORK">大規模工事</option>
                <option value="INTERIOR_WORK">内装工事</option>
                <option value="EXTERIOR_WORK">外構工事</option>
                <option value="OTHER">その他</option>
              </select>
              <FormError message={errors.constructionType?.message} />
            </div>

            {/* 携帯電話番号 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                携帯電話番号 <span className="text-[#B94040] text-sm ml-1">必須</span>
              </label>
              <input
                type="tel"
                {...register("phone")}
                placeholder="例: 08012345678"
                className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F72] focus:border-[#1B4F72] text-gray-900 placeholder-gray-400"
              />
              <FormError message={errors.phone?.message} />
              <p className="text-xs text-gray-600 mt-1">
                ※こちらの携帯電話番号にSMSメール概算相場価格と<br />
                小冊子のダウンロードリンクをお送りしますのでお間違えのないようにご入力ください。
              </p>
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-gray-500 text-sm ml-1">任意</span>
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="例: example@example.com"
                className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F72] focus:border-[#1B4F72] text-gray-900 placeholder-gray-400"
              />
              <FormError message={errors.email?.message} />
            </div>

            {/* 利用規約 */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#1B4F72] underline hover:no-underline">利用規約</a>
                と
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#1B4F72] underline hover:no-underline">プライバシーポリシー</a>
                に同意して、
              </p>
            </div>

            {/* 送信ボタン */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#B94040] hover:bg-[#A03636] text-white font-bold py-5 px-8 rounded-full text-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="bg-white text-[#B94040] text-base font-bold px-3 py-1 rounded">無料</span>
                {isSubmitting ? "送信中..." : "相場診断を申し込む"}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* 電話相談オプション */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-base text-gray-600 mb-4">お電話でのお問い合わせも承っております</p>
              <a
                href="tel:0120-945-990"
                className="inline-flex items-center justify-center gap-3 bg-white border-2 border-[#1B4F72] text-[#1B4F72] hover:bg-[#1B4F72] hover:text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                0120-945-990
              </a>
              <p className="text-sm text-gray-500 mt-2">受付時間 8:00〜21:00（年中無休）</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default DiagnosisForm;
