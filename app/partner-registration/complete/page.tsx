import Link from "next/link";

export default function PartnerRegistrationCompletePage() {
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* 成功アイコン */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* メッセージ */}
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            申請が完了しました
          </h1>
          <p className="text-gray-600 mb-8">
            ご入力いただいた内容を確認の上、3営業日以内に担当者よりご連絡させていただきます。
          </p>

          {/* トップページへ戻るボタン */}
          <Link
            href="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
