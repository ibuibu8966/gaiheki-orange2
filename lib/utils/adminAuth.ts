import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  sessionId?: number;
  adminId: number;
  role: string;
}

export async function requireAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      ),
      adminId: null,
    };
  }

  try {
    // JWTトークンを検証
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    if (!decoded.adminId) {
      return {
        error: NextResponse.json(
          { success: false, error: '認証が必要です' },
          { status: 401 }
        ),
        adminId: null,
      };
    }

    return {
      error: null,
      adminId: decoded.adminId,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      error: NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      ),
      adminId: null,
    };
  }
}
