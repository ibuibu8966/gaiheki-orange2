import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <h2 className="text-5xl font-bold mb-4 text-gray-900">404</h2>
      <p className="text-xl mb-8 text-gray-700">ページが見つかりませんでした</p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        ホームに戻る
      </Link>
    </div>
  )
}
