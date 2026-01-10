import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/infrastructure/database/prisma.client';
import bcrypt from 'bcrypt';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../src/lib/session';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'メールアドレスとパスワードを入力してください'
      }, { status: 400 });
    }

    // loginEmailでパートナーを検索
    const partner = await prisma.partners.findFirst({
      where: {
        login_email: email,
        is_active: true // アクティブなパートナーのみ
      },
      include: {
        partner_details: true
      }
    });

    if (!partner) {
      return NextResponse.json({
        success: false,
        error: 'ログイン情報が正しくありません'
      }, { status: 401 });
    }

    // パスワードの検証
    const isPasswordValid = await bcrypt.compare(password, partner.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'ログイン情報が正しくありません'
      }, { status: 401 });
    }

    // 最終ログイン日時を更新
    await prisma.partners.update({
      where: { id: partner.id },
      data: { last_login_at: new Date() }
    });

    // セッションを作成して保存
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.partnerId = partner.id;
    session.username = partner.username;
    session.loginEmail = partner.login_email;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      message: 'ログインに成功しました',
      data: {
        id: partner.id,
        username: partner.username,
        loginEmail: partner.login_email,
        companyName: partner.partner_details?.company_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'ログイン処理に失敗しました'
    }, { status: 500 });
  }
}
