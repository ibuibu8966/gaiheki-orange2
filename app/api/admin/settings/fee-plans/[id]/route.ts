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
    const planId = parseInt(id);
    const body = await request.json();
    const { name, monthly_fee, per_order_fee, per_project_fee, project_fee_rate, is_default } =
      body;

    // バリデーション
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'プラン名が必要です' },
        { status: 400 }
      );
    }

    // プランの存在確認
    const existingPlan = await prisma.fee_plans.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: '料金プランが見つかりません' },
        { status: 404 }
      );
    }

    // デフォルトプランの場合、他のデフォルトを解除
    if (is_default && !existingPlan.is_default) {
      await prisma.fee_plans.updateMany({
        where: { is_default: true },
        data: { is_default: false },
      });
    }

    // 料金プランを更新
    const updatedPlan = await prisma.fee_plans.update({
      where: { id: planId },
      data: {
        name,
        monthly_fee: monthly_fee !== undefined ? monthly_fee : null,
        per_order_fee: per_order_fee !== undefined ? per_order_fee : null,
        per_project_fee: per_project_fee !== undefined ? per_project_fee : null,
        project_fee_rate: project_fee_rate !== undefined ? project_fee_rate : null,
        is_default: is_default !== undefined ? is_default : existingPlan.is_default,
      },
    });

    return NextResponse.json({
      success: true,
      message: '料金プランを更新しました',
      data: updatedPlan,
    });
  } catch (error) {
    console.error('Update fee plan error:', error);
    return NextResponse.json(
      { success: false, error: '料金プランの更新に失敗しました' },
      { status: 500 }
    );
  }
}
