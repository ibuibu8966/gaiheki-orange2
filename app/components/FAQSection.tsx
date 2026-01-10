"use client";

import { useState } from "react";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "外壁塗装パートナーズってなに？",
      answer: "外壁塗装パートナーズは、全国の優良な外壁塗装業者と施工をお考えのお客様をマッチングするサービスです。厳しい審査基準をクリアした業者のみをご紹介し、お客様に最適な業者選びをサポートいたします。"
    },
    {
      question: "相談や、お見積りを依頼すると費用はかかるの？",
      answer: "ご相談、お見積りは完全無料です。外壁塗装パートナーズへのご相談から業者のご紹介、お見積りまで一切費用はかかりません。安心してご利用ください。"
    },
    {
      question: "見積もり依頼したら必ず契約しないといけないの？",
      answer: "いいえ、見積もりをご依頼いただいても契約の義務は一切ございません。複数社からお見積りを取って比較検討していただき、ご納得いただいた業者とご契約ください。"
    },
    {
      question: "見積もりを取得したけど断りたい。代わりに断ってもらえますか？",
      answer: "はい、お客様に代わって当社スタッフがお断りのご連絡をいたします。直接業者に断りづらい場合は、遠慮なくお申し付けください。"
    },
    {
      question: "外壁塗装以外の工事も依頼できる？",
      answer: "はい、屋根塗装、防水工事、雨樋工事など外壁塗装に関連する工事も承っております。詳しくはお気軽にご相談ください。"
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#faf6f1] py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* タイトル */}
        <div className="flex items-center gap-4 mb-10 md:mb-12">
          <div className="w-1.5 h-10 bg-[#f16f21]"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            よくある質問
          </h2>
          <p className="hidden md:block text-[#d4a574] text-sm ml-4">
            外壁塗装パートナーズのよくある質問についてお答えします
          </p>
        </div>

        {/* FAQ リスト */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden border-l-4 border-[#f16f21]"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-5">
                  <span className="bg-[#f16f21] text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
                    Q
                  </span>
                  <span className="font-medium text-gray-800">{faq.question}</span>
                </div>
                <span className="text-gray-300 text-2xl flex-shrink-0 font-light">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <div className="flex gap-5 ml-0">
                    <span className="bg-gray-500 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
                      A
                    </span>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
