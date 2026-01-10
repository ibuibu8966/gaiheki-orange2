import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requireAdminAuth } from '@/lib/utils/adminAuth';

// GET: システム設定取得
export async function GET() {
  try {
    // 認証チェック
    const { error } = await requireAdminAuth();
    if (error) return error;

    // システム設定を取得（1件のみ）
    const settings = await prisma.system_settings.findFirst();

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'システム設定が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        billing_cycle_closing_day: settings.billing_cycle_closing_day,
        billing_cycle_payment_day: settings.billing_cycle_payment_day,
        tax_rate: settings.tax_rate,
      },
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    return NextResponse.json(
      { success: false, error: 'システム設定の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: システム設定更新
export async function PUT(request: NextRequest) {
  try {
    // 認証チェック
    const { error } = await requireAdminAuth();
    if (error) return error;

    const body = await request.json();
    const { billing_cycle_closing_day, billing_cycle_payment_day, tax_rate } = body;

    // バリデーション
    if (
      billing_cycle_closing_day === undefined ||
      billing_cycle_payment_day === undefined ||
      tax_rate === undefined
    ) {
      return NextResponse.json(
        { success: false, error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    if (
      billing_cycle_closing_day < 1 ||
      billing_cycle_closing_day > 31 ||
      billing_cycle_payment_day < 1 ||
      billing_cycle_payment_day > 31
    ) {
      return NextResponse.json(
        { success: false, error: '締日と支払日は1〜31の範囲で指定してください' },
        { status: 400 }
      );
    }

    if (tax_rate < 0 || tax_rate > 1) {
      return NextResponse.json(
        { success: false, error: '税率は0〜1の範囲で指定してください' },
        { status: 400 }
      );
    }

    // 既存の設定を取得
    const existingSettings = await prisma.system_settings.findFirst();

    let updatedSettings;
    if (existingSettings) {
      // 更新
      updatedSettings = await prisma.system_settings.update({
        where: { id: existingSettings.id },
        data: {
          billing_cycle_closing_day,
          billing_cycle_payment_day,
          tax_rate,
        },
      });
    } else {
      // 作成（初回のみ）
      updatedSettings = await prisma.system_settings.create({
        data: {
          billing_cycle_closing_day,
          billing_cycle_payment_day,
          tax_rate,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'システム設定を更新しました',
      data: updatedSettings,
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    return NextResponse.json(
      { success: false, error: 'システム設定の更新に失敗しました' },
      { status: 500 }
    );
  }
}
