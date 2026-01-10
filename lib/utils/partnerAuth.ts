import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/src/lib/session';
import { NextResponse } from 'next/server';

/**
 * 加盟店のセッションを取得
 */
export async function getPartnerSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  return session;
}

/**
 * 加盟店の認証チェック
 * 認証されていない場合は401エラーを返す
 */
export async function requirePartnerAuth() {
  const session = await getPartnerSession();

  if (!session.isLoggedIn || !session.partnerId) {
    return {
      error: NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      ),
      partnerId: null,
    };
  }

  return {
    error: null,
    partnerId: session.partnerId,
  };
}
