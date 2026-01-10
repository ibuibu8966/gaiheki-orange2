import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requireAdminAuth } from '@/lib/utils/adminAuth';

// GET: 運営会社情報取得
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const { error } = await requireAdminAuth();
    if (error) return error;

    // 会社情報を取得（1件のみ）
    const companySettings = await prisma.company_settings.findFirst();

    return NextResponse.json({
      success: true,
      data: companySettings,
    });
  } catch (error) {
    console.error('Company settings fetch error:', error);
    return NextResponse.json(
      { success: false, error: '会社情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: 運営会社情報更新
export async function PUT(request: NextRequest) {
  try {
    // 認証チェック
    const { error } = await requireAdminAuth();
    if (error) return error;

    const body = await request.json();

    const {
      company_name,
      postal_code,
      address,
      phone,
      email,
      invoice_registration_number,
      bank_name,
      bank_branch_name,
      bank_account_type,
      bank_account_number,
      bank_account_holder,
    } = body;

    // 既存の会社情報を確認
    const existingSettings = await prisma.company_settings.findFirst();

    let companySettings;

    if (existingSettings) {
      // 更新
      companySettings = await prisma.company_settings.update({
        where: { id: existingSettings.id },
        data: {
          company_name,
          postal_code,
          address,
          phone,
          email,
          invoice_registration_number,
          bank_name,
          bank_branch_name,
          bank_account_type,
          bank_account_number,
          bank_account_holder,
        },
      });
    } else {
      // 新規作成
      companySettings = await prisma.company_settings.create({
        data: {
          company_name,
          postal_code,
          address,
          phone,
          email,
          invoice_registration_number,
          bank_name,
          bank_branch_name,
          bank_account_type,
          bank_account_number,
          bank_account_holder,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: companySettings,
      message: '会社情報を更新しました',
    });
  } catch (error) {
    console.error('Company settings update error:', error);
    return NextResponse.json(
      { success: false, error: '会社情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}
