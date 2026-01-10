import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDiagnosisNumber } from '@/lib/utils/diagnosisNumber';

// POST: 診断依頼新規作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, prefecture, floorArea, currentSituation, constructionType, designatedPartnerId } = body;

    if (!name || !phone || !email || !prefecture) {
      return NextResponse.json(
        { success: false, error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // 顧客を作成または取得
    let customer = await prisma.customers.findFirst({
      where: { customer_email: email }
    });

    if (!customer) {
      customer = await prisma.customers.create({
        data: {
          partner_id: designatedPartnerId || 1,
          customer_name: name,
          customer_phone: phone,
          customer_email: email,
          construction_address: prefecture,
          customer_construction_type: constructionType || 'EXTERIOR_PAINTING',
          construction_amount: 0,
          customer_status: 'ORDERED',
          updated_at: new Date()
        }
      });
    }

    // 診断番号を生成
    const diagnosisNumber = await generateDiagnosisNumber();

    // 診断依頼を作成（業者指定があればステータスをDESIGNATEDに）
    const diagnosisData: any = {
      diagnosis_number: diagnosisNumber,
      customer_id: customer.id,
      prefecture: prefecture,
      floor_area: floorArea || 'UNKNOWN',
      current_situation: currentSituation || 'CONSIDERING_CONSTRUCTION',
      construction_type: constructionType || 'EXTERIOR_PAINTING',
      status: designatedPartnerId ? 'DESIGNATED' : 'RECRUITING',
      updated_at: new Date()
    };

    // designated_partner_idフィールドが存在する場合のみ追加
    if (designatedPartnerId) {
      diagnosisData.designated_partner_id = designatedPartnerId;
    }

    const diagnosis = await prisma.diagnosis_requests.create({
      data: diagnosisData
    });

    return NextResponse.json({
      success: true,
      data: {
        id: diagnosis.id,
        diagnosisNumber: diagnosis.diagnosis_number,
        customerId: customer.id
      }
    });

  } catch (error) {
    console.error('Diagnosis creation error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create diagnosis',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : 'No details available'
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

    const where: any = {};

    // ステータスフィルター
    if (status && status !== 'all') {
      where.status = status;
      console.log('Filtering by status:', status);
    }

    // 検索条件
    if (search) {
      where.customers = {
        OR: [
          { customer_name: { contains: search, mode: 'insensitive' } },
          { customer_email: { contains: search, mode: 'insensitive' } },
          { customer_phone: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    console.log('Query where condition:', JSON.stringify(where));
    const diagnoses = await prisma.diagnosis_requests.findMany({
      where,
      include: {
        customers: {
          select: {
            customer_name: true,
            customer_email: true,
            customer_phone: true,
            construction_address: true
          }
        },
        designated_partner: {
          include: {
            partner_details: {
              select: {
                company_name: true
              }
            }
          }
        },
        quotations: {
          include: {
            partners: {
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

    console.log(`Found ${diagnoses.length} diagnoses`);
    const formattedDiagnoses = diagnoses.map(diag => {
      // 見積もりを金額順にソート
      const sortedQuotations = [...diag.quotations].sort((a, b) =>
        a.quotation_amount - b.quotation_amount
      );

      // 最安値を取得
      const lowestAmount = sortedQuotations.length > 0
        ? sortedQuotations[0].quotation_amount
        : null;

      return {
        id: diag.id,
        diagnosisNumber: diag.diagnosis_number,
        customerId: diag.customer_id,
        customerName: diag.customers.customer_name,
        customerEmail: diag.customers.customer_email,
        customerPhone: diag.customers.customer_phone,
        address: diag.customers.construction_address,
        prefecture: diag.prefecture,
        floorArea: diag.floor_area,
        currentSituation: diag.current_situation,
        constructionType: diag.construction_type,
        status: diag.status,
        statusLabel: getStatusLabel(diag.status),
        designatedPartnerId: (diag as any).designated_partner_id || null,
        designatedPartnerName: (diag as any).designated_partner?.partner_details?.company_name || null,
        quotationCount: sortedQuotations.length,
        quotations: sortedQuotations.map(q => ({
          id: q.id,
          partnerId: q.partner_id,
          partnerName: q.partners.partner_details?.company_name || '未設定',
          amount: q.quotation_amount,
          appealText: q.appeal_text,
          isSelected: q.is_selected,
          isLowest: lowestAmount !== null && q.quotation_amount === lowestAmount
        })),
        createdAt: diag.created_at.toISOString().split('T')[0]
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
