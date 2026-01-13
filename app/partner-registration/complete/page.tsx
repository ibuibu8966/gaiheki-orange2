'use client';

import Link from 'next/link';

export default function PartnerRegistrationCompletePage() {
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* 成功アイコン */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            申請が完了しました
          </h1>

          <p className="text-gray-600 mb-6">
            加盟店登録申請を受け付けました。<br />
            ご入力いただいた内容を確認の上、<br className="sm:hidden" />
            <span className="font-semibold text-orange-500">3営業日以内</span>に担当者よりご連絡させていただきます。
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">今後の流れ</h3>
            <ol className="text-left text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">1</span>
                <span>担当者より審査結果をご連絡</span>
              </li>
              <li className="flex items-start">
                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">2</span>
                <span>ログイン情報の発行</span>
              </li>
              <li className="flex items-start">
                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">3</span>
                <span>保証金のお振込み</span>
              </li>
              <li className="flex items-start">
                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">4</span>
                <span>案件紹介開始</span>
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-colors"
            >
              トップページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
