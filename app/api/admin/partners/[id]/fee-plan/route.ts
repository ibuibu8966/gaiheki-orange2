import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requireAdminAuth } from '@/lib/utils/adminAuth';

// PUT: 料金プラン更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const { error } = await requireAdminAuth();
    if (error) return error;

    const { id } = await params;
    const partnerId = parseInt(id);
    const body = await request.json();

    const { monthly_fee, per_order_fee, per_project_fee, project_fee_rate } = body;

    // パートナーの存在確認
    const partner = await prisma.partners.findUnique({
      where: { id: partnerId },
      include: { fee_plans: true },
    });

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'パートナーが見つかりません' },
        { status: 404 }
      );
    }

    // 料金プランの更新または作成
    if (partner.fee_plans) {
      // 既存の料金プランを更新
      await prisma.fee_plans.update({
        where: { id: partner.fee_plans.id },
        data: {
          monthly_fee: monthly_fee || null,
          per_order_fee: per_order_fee || null,
          per_project_fee: per_project_fee || null,
          project_fee_rate: project_fee_rate || null,
        },
      });
    } else {
      // 新規料金プランを作成
      await prisma.fee_plans.create({
        data: {
          partner_id: partnerId,
          monthly_fee: monthly_fee || null,
          per_order_fee: per_order_fee || null,
          per_project_fee: per_project_fee || null,
          project_fee_rate: project_fee_rate || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: '料金プランを更新しました',
    });
  } catch (error) {
    console.error('Fee plan update error:', error);
    return NextResponse.json(
      { success: false, error: '料金プランの更新に失敗しました' },
      { status: 500 }
    );
  }
}
