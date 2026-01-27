import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDiagnosisNumber } from '@/lib/utils/diagnosisNumber';
import type { DiagnosisWhereInput } from '@/lib/types';
import { diagnosisFormSchema } from '@/lib/validations/forms';

// POST: 診断依頼新規作成
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Zodバリデーション
    const result = diagnosisFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, phone, email, prefecture, floorArea, currentSituation, constructionType } = result.data;
    const { designatedPartnerId } = body;

    // 診断番号を生成
    const diagnosisNumber = await generateDiagnosisNumber();

    // 診断依頼を作成（顧客情報は直接保存）
    const diagnosis = await prisma.diagnosis_requests.create({
      data: {
        diagnosis_number: diagnosisNumber,
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        prefecture: prefecture,
        floor_area: floorArea || 'UNKNOWN',
        current_situation: currentSituation || 'CONSIDERING_CONSTRUCTION',
        construction_type: constructionType || 'EXTERIOR_PAINTING',
        status: designatedPartnerId ? 'DESIGNATED' : 'RECRUITING',
        designated_partner_id: designatedPartnerId || null,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: diagnosis.id,
        diagnosisNumber: diagnosis.diagnosis_number
      }
    });

  } catch (error) {
    console.error('Diagnosis creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '診断依頼の作成に失敗しました'
      },
      { status: 500 }
    );
  }
}

// GET: 診断依頼一覧取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: DiagnosisWhereInput = {};

    // ステータスフィルター
    if (status && status !== 'all') {
      where.status = status;
    }

    // 検索条件（顧客情報はdiagnosis_requestsに直接保存）
    if (search) {
      where.OR = [
        { customer_name: { contains: search, mode: 'insensitive' } },
        { customer_email: { contains: search, mode: 'insensitive' } },
        { customer_phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const diagnoses = await prisma.diagnosis_requests.findMany({
      where,
      include: {
        designated_partner: {
          include: {
            partner_details: {
              select: {
                company_name: true
              }
            }
          }
        },
        referrals: {
          include: {
            partner: {
              include: {
                partner_details: {
                  select: {
                    company_name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const formattedDiagnoses = diagnoses.map(diag => {
      return {
        id: diag.id,
        diagnosisNumber: diag.diagnosis_number,
        customerName: diag.customer_name,
        customerEmail: diag.customer_email,
        customerPhone: diag.customer_phone,
        address: diag.customer_address,
        prefecture: diag.prefecture,
        floorArea: diag.floor_area,
        currentSituation: diag.current_situation,
        constructionType: diag.construction_type,
        status: diag.status,
        statusLabel: getStatusLabel(diag.status),
        designatedPartnerId: diag.designated_partner_id || null,
        designatedPartnerName: diag.designated_partner?.partner_details?.company_name || null,
        referralCount: diag.referrals.length,
        referrals: diag.referrals.map(r => ({
          id: r.id,
          partnerId: r.partner_id,
          partnerName: r.partner.partner_details?.company_name || '未設定',
          referralFee: r.referral_fee,
          emailSent: r.email_sent
        })),
        createdAt: diag.created_at.toISOString().split('T')[0],
        // ヒアリング情報
        customerEnthusiasm: diag.customer_enthusiasm,
        desiredPartnerCount: diag.desired_partner_count,
        referralFee: diag.referral_fee,
        adminNote: diag.admin_note
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedDiagnoses,
      count: formattedDiagnoses.length
    });

  } catch (error) {
    console.error('Diagnoses fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch diagnoses',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH: 診断依頼更新
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      // 顧客情報
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      // ヒアリング情報
      customerEnthusiasm,
      desiredPartnerCount,
      referralFee,
      adminNote,
      // 診断情報（追加）
      prefecture,
      floorArea,
      currentSituation,
      constructionType,
      status
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Diagnosis ID is required' },
        { status: 400 }
      );
    }

    // 更新データを構築
    const updateData: Record<string, unknown> = {
      updated_at: new Date()
    };

    // 顧客情報
    if (customerName !== undefined) updateData.customer_name = customerName;
    if (customerEmail !== undefined) updateData.customer_email = customerEmail || null;
    if (customerPhone !== undefined) updateData.customer_phone = customerPhone;
    if (customerAddress !== undefined) updateData.customer_address = customerAddress || null;
    // ヒアリング情報
    if (customerEnthusiasm !== undefined) updateData.customer_enthusiasm = customerEnthusiasm;
    if (desiredPartnerCount !== undefined) updateData.desired_partner_count = desiredPartnerCount;
    if (referralFee !== undefined) updateData.referral_fee = referralFee;
    if (adminNote !== undefined) updateData.admin_note = adminNote || null;
    // 診断情報（追加）
    if (prefecture !== undefined) updateData.prefecture = prefecture;
    if (floorArea !== undefined) updateData.floor_area = floorArea;
    if (currentSituation !== undefined) updateData.current_situation = currentSituation;
    if (constructionType !== undefined) updateData.construction_type = constructionType;
    if (status !== undefined) updateData.status = status;

    const updatedDiagnosis = await prisma.diagnosis_requests.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDiagnosis.id,
        diagnosisNumber: updatedDiagnosis.diagnosis_number
      },
      message: '診断情報を更新しました'
    });

  } catch (error) {
    console.error('Diagnosis update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update diagnosis',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DESIGNATED: '指定',
    RECRUITING: '募集中',
    COMPARING: '比較中',
    DECIDED: '決定',
    CANCELLED: 'キャンセル'
  };
  return labels[status] || status;
}
