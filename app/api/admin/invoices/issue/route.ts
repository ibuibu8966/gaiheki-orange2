import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requireAdminAuth } from '@/lib/utils/adminAuth';

// POST: 請求書を一括発行
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const { error } = await requireAdminAuth();
    if (error) return error;

    const body = await request.json();
    const { invoice_ids } = body;

    // バリデーション
    if (!invoice_ids || !Array.isArray(invoice_ids) || invoice_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: '発行する請求書IDの配列が必要です' },
        { status: 400 }
      );
    }

    // 指定された請求書を取得
    const invoices = await prisma.company_invoices.findMany({
      where: {
        id: {
          in: invoice_ids,
        },
        status: 'DRAFT', // 下書きのみ発行可能
      },
    });

    if (invoices.length === 0) {
      return NextResponse.json(
        { success: false, error: '発行可能な請求書が見つかりません' },
        { status: 404 }
      );
    }

    // 一括でステータスを更新
    await prisma.company_invoices.updateMany({
      where: {
        id: {
          in: invoices.map((inv) => inv.id),
        },
      },
      data: {
        status: 'UNPAID',
        issue_date: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${invoices.length}件の請求書を発行しました`,
      data: {
        issued: invoices.length,
      },
    });
  } catch (error) {
    console.error('Issue company invoices error:', error);
    return NextResponse.json(
      { success: false, error: '請求書の発行に失敗しました' },
      { status: 500 }
    );
  }
}
