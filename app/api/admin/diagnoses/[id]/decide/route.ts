import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 業者決定API
 * PUT /api/admin/diagnoses/[id]/decide
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const diagnosisId = parseInt(id);
    const { quotationId } = await request.json();

    if (!quotationId) {
      return NextResponse.json(
        { success: false, error: '見積もりIDが必要です' },
        { status: 400 }
      );
    }

    // トランザクションで処理
    const result = await prisma.$transaction(async (tx) => {
      // 診断案件が存在するか確認
      const diagnosis = await tx.diagnosis_requests.findUnique({
        where: { id: diagnosisId },
        include: {
          quotations: true,
        },
      });

      if (!diagnosis) {
        throw new Error('診断案件が見つかりません');
      }

      // 選択された見積もりが存在するか確認
      const selectedQuotation = diagnosis.quotations.find(
        (q) => q.id === quotationId
      );

      if (!selectedQuotation) {
        throw new Error('見積もりが見つかりません');
      }

      // すべての見積もりのis_selectedをfalseに
      await tx.quotations.updateMany({
        where: {
          diagnosis_request_id: diagnosisId,
        },
        data: {
          is_selected: false,
        },
      });

      // 選択された見積もりのis_selectedをtrueに
      await tx.quotations.update({
        where: { id: quotationId },
        data: { is_selected: true },
      });

      // 診断案件のステータスをDECIDEDに更新
      await tx.diagnosis_requests.update({
        where: { id: diagnosisId },
        data: {
          status: 'DECIDED',
        },
      });

      // 注文レコードを作成
      const now = new Date();
      const order = await tx.orders.create({
        data: {
          quotation_id: quotationId,
          order_status: 'ORDERED',
          created_at: now,
          updated_at: now,
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: '業者を決定しました',
    });
  } catch (error) {
    console.error('業者決定エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: '業者決定に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
