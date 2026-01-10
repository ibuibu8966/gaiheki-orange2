import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requirePartnerAuth } from '@/lib/utils/partnerAuth';

// PUT: 請求書ステータス更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const { error, partnerId } = await requirePartnerAuth();
    if (error) return error;

    const { id } = await params;
    const invoiceId = parseInt(id);
    const body = await request.json();
    const { status, payment_date } = body;

    // バリデーション
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'ステータスが指定されていません' },
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

    // 請求書取得
    const invoice = await prisma.customer_invoices.findFirst({
      where: {
        id: invoiceId,
        order: {
          quotations: {
            partner_id: partnerId,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      );
    }

    // ステータス更新
    const updateData: any = {
      status,
    };

    // PAIDの場合は支払日を記録
    if (status === 'PAID') {
      updateData.payment_date = payment_date ? new Date(payment_date) : new Date();
    }

    const updatedInvoice = await prisma.customer_invoices.update({
      where: { id: invoiceId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'ステータスを更新しました',
      data: updatedInvoice,
    });
  } catch (error) {
    console.error('Update invoice status error:', error);
    return NextResponse.json(
      { success: false, error: 'ステータスの更新に失敗しました' },
      { status: 500 }
    );
  }
}
