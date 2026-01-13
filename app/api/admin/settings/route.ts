import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 銀行口座設定のキー一覧
const BANK_SETTING_KEYS = [
  'bank_name',
  'branch_name',
  'account_type',
  'account_number',
  'account_holder',
];

// GET: システム設定を取得
export async function GET() {
  try {
    const settings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: BANK_SETTING_KEYS,
        },
      },
    });

    // キー/バリュー形式に変換
    const settingsMap: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });

    return NextResponse.json({
      success: true,
      data: settingsMap,
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'システム設定の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: システム設定を更新
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: '設定データが不正です' },
        { status: 400 }
      );
    }

    // 各設定を更新（upsert）
    const updates = [];
    for (const key of BANK_SETTING_KEYS) {
      if (settings[key] !== undefined) {
        updates.push(
          prisma.systemSettings.upsert({
            where: { key },
            create: {
              key,
              value: settings[key],
              description: getSettingDescription(key),
            },
            update: {
              value: settings[key],
            },
          })
        );
      }
    }

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: 'システム設定を更新しました',
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { success: false, error: 'システム設定の更新に失敗しました' },
      { status: 500 }
    );
  }
}

function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    bank_name: '振込先銀行名',
    branch_name: '振込先支店名',
    account_type: '口座種別（普通/当座）',
    account_number: '口座番号',
    account_holder: '口座名義',
  };
  return descriptions[key] || '';
}
