import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requireAdminAuth } from '@/lib/utils/adminAuth';

// PUT: 会社請求書のステータス更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const { error } = await requireAdminAuth();
    if (error) return error;

    const { id } = await params;
    const invoiceId = parseInt(id);
    const body = await request.json();
    const { status, payment_date } = body;

    // バリデーション
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'ステータスが必要です' },
        { status: 400 }
      );
    }

    const validStatuses = ['DRAFT', 'UNPAID', 'PAID', 'OVERDUE', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: '無効なステータスです' },
        { status: 400 }
      );
    }

    // 請求書を取得
    const invoice = await prisma.company_invoices.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      );
    }

    // ステータス遷移の検証
    if (invoice.status === 'PAID' && status !== 'PAID') {
      return NextResponse.json(
        { success: false, error: '支払い済みの請求書のステータスは変更できません' },
        { status: 400 }
      );
    }

    // 更新データを準備
    const updateData: any = { status };

    // PAIDにする場合は支払日を設定
    if (status === 'PAID') {
      updateData.payment_date = payment_date ? new Date(payment_date) : new Date();
    }

    // ステータスを更新
    const updatedInvoice = await prisma.company_invoices.update({
      where: { id: invoiceId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'ステータスを更新しました',
      data: updatedInvoice,
    });
  } catch (error) {
    console.error('Update company invoice status error:', error);
    return NextResponse.json(
      { success: false, error: 'ステータスの更新に失敗しました' },
      { status: 500 }
    );
  }
}
