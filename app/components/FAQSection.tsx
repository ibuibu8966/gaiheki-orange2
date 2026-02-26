"use client";

import { useState } from "react";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "塗装の相談室とはどのようなサービスですか？",
      answer: "塗装の相談室は、全国の優良な外壁塗装業者と施工をお考えのお客様をお繋ぎするサービスでございます。厳しい審査基準をクリアした業者のみをご紹介し、お客様に最適な業者選びをサポートいたします。"
    },
    {
      question: "ご相談やお見積りのご依頼に費用はかかりますか？",
      answer: "ご相談、お見積りは完全無料でございます。塗装の相談室へのご相談から業者のご紹介、お見積りまで一切費用はかかりません。どうぞ安心してご利用くださいませ。"
    },
    {
      question: "お見積りを依頼した場合、必ず契約が必要ですか？",
      answer: "いいえ、お見積りをご依頼いただいても契約の義務は一切ございません。複数社からお見積りを取って比較検討していただき、ご納得いただいた業者とご契約ください。"
    },
    {
      question: "お見積りを取得後、お断りしたい場合は代行していただけますか？",
      answer: "はい、お客様に代わって当社スタッフがお断りのご連絡をいたします。直接業者にお断りしづらい場合は、遠慮なくお申し付けください。"
    },
    {
      question: "外壁塗装以外の工事もご依頼できますか？",
      answer: "はい、屋根塗装、防水工事、雨樋工事など外壁塗装に関連する工事も承っております。詳しくはお気軽にご相談くださいませ。"
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* タイトル */}
        <div className="text-center mb-10 md:mb-12">
          <p className="text-[#1B4F72]/60 text-sm font-medium tracking-[0.2em] mb-3 uppercase">FAQ</p>
          <div className="w-16 h-0.5 bg-[#B94040] mx-auto mb-6"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            よくいただくご質問
          </h2>
          <p className="mt-4 text-gray-500 text-base">
            お客様からよくいただくご質問をまとめました
          </p>
        </div>

        {/* FAQ リスト */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg overflow-hidden border-t-4 border-[#1B4F72]"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-5">
                  <span className="bg-[#1B4F72] text-white text-sm font-bold w-8 h-8 rounded flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="font-medium text-lg text-gray-800">{faq.question}</span>
                </div>
                <span className="text-[#1B4F72] text-3xl shrink-0 font-light w-10 h-10 flex items-center justify-center">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <div className="flex gap-5 ml-0">
                    <span className="bg-[#B94040] text-white text-sm font-bold w-8 h-8 rounded flex items-center justify-center shrink-0">
                      A
                    </span>
                    <p className="text-base text-gray-600 leading-relaxed">{faq.answer}</p>
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
