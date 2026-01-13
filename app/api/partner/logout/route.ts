import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // セッションCookieを削除
    cookieStore.delete('gaiheki_partner_session');

    return NextResponse.json({
      success: true,
      message: 'ログアウトしました'
    });
  } catch (error) {
    console.error('Partner logout error:', error);
    return NextResponse.json(
      { success: false, error: 'ログアウトに失敗しました' },
      { status: 500 }
    );
  }
}
