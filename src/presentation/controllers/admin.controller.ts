import { NextRequest, NextResponse } from 'next/server';
import { IAdminService } from '../../application/services/admin.service.interface';
import { AdminLoginDto } from '../../domain/entities/admin.entity';

export class AdminController {
  constructor(private adminService: IAdminService) {}

  async login(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { username, password } = body;

      // バリデーション
      if (!username || !password) {
        return NextResponse.json(
          { error: 'ユーザー名とパスワードは必須です' },
          { status: 400 }
        );
      }

      const loginData: AdminLoginDto = { username, password };
      const result = await this.adminService.login(loginData);

      if (!result.success) {
        return NextResponse.json(
          { error: result.message },
          { status: 401 }
        );
      }

      // レスポンスを作成
      const response = NextResponse.json(
        {
          message: 'ログインに成功しました',
          admin: result.admin
        },
        { status: 200 }
      );

      // HTTPOnly Cookieにトークンを設定
      response.cookies.set('admin-token', result.token!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24時間
        path: '/',
      });

      return response;
    } catch (error) {
      console.error('Admin login controller error:', error);
      return NextResponse.json(
        { error: 'サーバーエラーが発生しました' },
        { status: 500 }
      );
    }
  }

  async logout(request: NextRequest): Promise<NextResponse> {
    try {
      const token = request.cookies.get('admin-token')?.value;

      if (token) {
        await this.adminService.logout(token);
      }

      // レスポンスを作成
      const response = NextResponse.json(
        { message: 'ログアウトしました' },
        { status: 200 }
      );

      // Cookieを削除
      response.cookies.set('admin-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      });

      return response;
    } catch (error) {
      console.error('Admin logout controller error:', error);
      return NextResponse.json(
        { error: 'サーバーエラーが発生しました' },
        { status: 500 }
      );
    }
  }

  async me(request: NextRequest): Promise<NextResponse> {
    try {
      const token = request.cookies.get('admin-token')?.value;

      if (!token) {
        return NextResponse.json(
          { error: '認証が必要です' },
          { status: 401 }
        );
      }

      const admin = await this.adminService.validateToken(token);

      if (!admin) {
        return NextResponse.json(
          { error: '無効なトークンです' },
          { status: 401 }
        );
      }

      const { passwordHash: _, ...adminData } = admin;

      return NextResponse.json(
        { admin: adminData },
        { status: 200 }
      );
    } catch (error) {
      console.error('Admin me controller error:', error);
      return NextResponse.json(
        { error: 'サーバーエラーが発生しました' },
        { status: 500 }
      );
    }
  }
}