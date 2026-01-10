'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ja">
      <head>
        <title>エラーが発生しました</title>
      </head>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
          <h2 className="text-5xl font-bold mb-4 text-gray-900">500</h2>
          <p className="text-xl mb-8 text-gray-700">エラーが発生しました</p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            再試行
          </button>
        </div>
      </body>
    </html>
  )
}
