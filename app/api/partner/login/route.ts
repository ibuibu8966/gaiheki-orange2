import { NextResponse } from 'next/server';

// このルートは廃止予定です。
// 認証はAuth.js (/api/auth/[...nextauth]) で処理されます。
// フロントエンドは signIn("partner-credentials") を使用してください。

export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'このエンドポイントは廃止されました。Auth.js経由でログインしてください。',
    migration: 'Use signIn("partner-credentials") from next-auth/react instead.'
  }, { status: 410 });
}
