'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <h2 className="text-5xl font-bold mb-4 text-gray-900">500</h2>
      <p className="text-xl mb-8 text-gray-700">エラーが発生しました</p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          再試行
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
