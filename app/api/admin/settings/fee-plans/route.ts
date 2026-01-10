import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requireAdminAuth } from '@/lib/utils/adminAuth';

// GET: 料金プラン一覧取得
export async function GET() {
  try {
    // 認証チェック
    const { error } = await requireAdminAuth();
    if (error) return error;

    const plans = await prisma.fee_plans.findMany({
      orderBy: {
        created_at: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        plans: plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          monthly_fee: plan.monthly_fee,
          per_order_fee: plan.per_order_fee,
          per_project_fee: plan.per_project_fee,
          project_fee_rate: plan.project_fee_rate,
          is_default: plan.is_default,
        })),
      },
    });
  } catch (error) {
    console.error('Get fee plans error:', error);
    return NextResponse.json(
      { success: false, error: '料金プラン一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 料金プラン作成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const { error } = await requireAdminAuth();
    if (error) return error;

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

    // デフォルトプランの場合、他のデフォルトを解除
    if (is_default) {
      await prisma.fee_plans.updateMany({
        where: { is_default: true },
        data: { is_default: false },
      });
    }

    // 料金プランを作成
    const plan = await prisma.fee_plans.create({
      data: {
        name,
        monthly_fee: monthly_fee || null,
        per_order_fee: per_order_fee || null,
        per_project_fee: per_project_fee || null,
        project_fee_rate: project_fee_rate || null,
        is_default: is_default || false,
      },
    });

    return NextResponse.json({
      success: true,
      message: '料金プランを作成しました',
      data: plan,
    });
  } catch (error) {
    console.error('Create fee plan error:', error);
    return NextResponse.json(
      { success: false, error: '料金プランの作成に失敗しました' },
      { status: 500 }
    );
  }
}
