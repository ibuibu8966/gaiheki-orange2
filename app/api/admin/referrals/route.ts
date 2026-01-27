import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendReferralNotificationEmail } from '@/lib/utils/email';
import type { ReferralWhereInput } from '@/lib/types';

// POST: 紹介を作成（保証金から引き落とし、メール送信）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { diagnosisId, partnerId, referralFee } = body;

    if (!diagnosisId || !partnerId) {
      return NextResponse.json(
        { success: false, error: '診断IDと加盟店IDは必須です' },
        { status: 400 }
      );
    }

    // 診断情報を取得
    const diagnosis = await prisma.diagnosis_requests.findUnique({
      where: { id: diagnosisId },
    });

    if (!diagnosis) {
      return NextResponse.json(
        { success: false, error: '診断が見つかりません' },
        { status: 404 }
      );
    }

    // 加盟店情報を取得
    const partner = await prisma.partners.findUnique({
      where: { id: partnerId },
      include: { partner_details: true },
    });

    if (!partner) {
      return NextResponse.json(
        { success: false, error: '加盟店が見つかりません' },
        { status: 404 }
      );
    }

    // 紹介料を決定（リクエストで指定されていない場合は診断のデフォルト値）
    const fee = referralFee || diagnosis.referral_fee || 30000;

    // 保証金残高チェック
    if (partner.deposit_balance < fee) {
      return NextResponse.json(
        {
          success: false,
          error: '保証金残高が不足しています',
          currentBalance: partner.deposit_balance,
          requiredFee: fee
        },
        { status: 400 }
      );
    }

    // 既に紹介が存在するかチェック
    const existingReferral = await prisma.referral.findUnique({
      where: {
        diagnosis_id_partner_id: {
          diagnosis_id: diagnosisId,
          partner_id: partnerId,
        },
      },
    });

    if (existingReferral) {
      return NextResponse.json(
        { success: false, error: 'この加盟店には既に紹介済みです' },
        { status: 400 }
      );
    }

    // トランザクションで紹介作成、保証金引き落とし、履歴記録を実行
    const previousBalance = partner.deposit_balance;
    const newBalance = previousBalance - fee;

    const result = await prisma.$transaction(async (tx) => {
      // 1. 紹介を作成
      const referral = await tx.referral.create({
        data: {
          diagnosis_id: diagnosisId,
          partner_id: partnerId,
          referral_fee: fee,
        },
      });

      // 2. 保証金残高を更新
      await tx.partners.update({
        where: { id: partnerId },
        data: {
          deposit_balance: newBalance,
          monthly_leads_count: { increment: 1 },
        },
      });

      // 3. 入出金履歴を記録
      await tx.depositHistory.create({
        data: {
          partner_id: partnerId,
          amount: -fee,
          type: 'DEDUCTION',
          balance: newBalance,
          description: `案件紹介料 (${diagnosis.diagnosis_number})`,
          diagnosis_id: diagnosisId,
        },
      });

      return referral;
    });

    // メール送信（非同期で実行、失敗してもAPIは成功として返す）
    const emailSent = await sendReferralNotificationEmail({
      partnerEmail: partner.login_email,
      partnerCompanyName: partner.partner_details?.company_name || 'パートナー',
      diagnosisNumber: diagnosis.diagnosis_number,
      customerName: diagnosis.customer_name,
      customerPhone: diagnosis.customer_phone,
      customerAddress: diagnosis.customer_address,
      prefecture: diagnosis.prefecture,
      constructionType: diagnosis.construction_type,
      floorArea: diagnosis.floor_area,
      adminNote: diagnosis.admin_note,
      referralFee: fee,
      remainingBalance: newBalance,
    });

    // メール送信状態を更新
    if (emailSent) {
      await prisma.referral.update({
        where: { id: result.id },
        data: {
          email_sent: true,
          email_sent_at: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        referralId: result.id,
        referralFee: fee,
        previousBalance,
        newBalance,
        emailSent,
      },
      message: '紹介を作成しました',
    });
  } catch (error) {
    console.error('Referral creation error:', error);
    return NextResponse.json(
      { success: false, error: '紹介の作成に失敗しました' },
      { status: 500 }
    );
  }
}

// GET: 紹介一覧を取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const diagnosisId = searchParams.get('diagnosis_id');
    const partnerId = searchParams.get('partner_id');

    const where: ReferralWhereInput = {};
    if (diagnosisId) where.diagnosis_id = parseInt(diagnosisId);
    if (partnerId) where.partner_id = parseInt(partnerId);

    const referrals = await prisma.referral.findMany({
      where,
      include: {
        diagnosis: {
          select: {
            id: true,
            diagnosis_number: true,
            customer_name: true,
            prefecture: true,
            construction_type: true,
          },
        },
        partner: {
          include: {
            partner_details: {
              select: {
                company_name: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const formattedReferrals = referrals.map((r) => ({
      id: r.id,
      diagnosisId: r.diagnosis_id,
      diagnosisNumber: r.diagnosis.diagnosis_number,
      customerName: r.diagnosis.customer_name,
      partnerId: r.partner_id,
      partnerName: r.partner.partner_details?.company_name || '未設定',
      referralFee: r.referral_fee,
      emailSent: r.email_sent,
      createdAt: r.created_at.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedReferrals,
    });
  } catch (error) {
    console.error('Referrals fetch error:', error);
    return NextResponse.json(
      { success: false, error: '紹介一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
