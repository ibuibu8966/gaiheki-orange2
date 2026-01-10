import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/infrastructure/database/prisma.client';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../src/lib/session';
import { cookies } from 'next/headers';

// GET: 診断依頼一覧を取得
export async function GET(request: NextRequest) {
  try {
    // セッションからpartnerIdを取得
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.isLoggedIn || !session.partnerId) {
      return NextResponse.json({
        success: false,
        error: 'ログインが必要です'
      }, { status: 401 });
    }

    const partnerId = session.partnerId;

    // URLパラメータからステータスフィルタを取得
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // 加盟店の対応エリアを取得
    const partnerPrefectures = await prisma.partner_prefectures.findMany({
      where: { partner_id: partnerId },
      select: { supported_prefecture: true }
    });

    const supportedPrefectures = partnerPrefectures.map(pp => pp.supported_prefecture);

    // 対応エリア内の診断依頼、または自社が指定された案件を取得
    const whereCondition: any = {
      OR: [
        // 1. 対応エリア内の案件
        {
          prefecture: { in: supportedPrefectures }
        },
        // 2. 自社が指定業者として指定された案件（エリア外でも表示）
        {
          designated_partner_id: partnerId,
          status: 'DESIGNATED'
        }
      ]
    };

    // ステータスフィルタの処理
    if (statusFilter && statusFilter !== 'DECIDED' && statusFilter !== 'CANCELLED') {
      // 特定のステータスのみ表示
      whereCondition.status = statusFilter;
    } else {
      // フィルタなしの場合は DECIDED と CANCELLED を除外
      whereCondition.status = {
        notIn: ['DECIDED', 'CANCELLED']
      };
    }

    const diagnosisRequests = await prisma.diagnosis_requests.findMany({
      where: whereCondition,
      include: {
        customers: {
          select: {
            customer_name: true,
            customer_phone: true,
            customer_email: true
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
            },
            orders: {
              select: {
                partner_memo: true,
                order_status: true
              }
            }
          },
          orderBy: {
            quotation_amount: 'asc' // 金額順にソート
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // レスポンスデータを整形
    const formattedData = diagnosisRequests.map(dr => {
      const myQuotation = dr.quotations.find(q => q.partner_id === partnerId);
      const otherQuotations = dr.quotations.filter(q => q.partner_id !== partnerId);

      return {
        id: dr.id,
        diagnosisNumber: dr.diagnosis_number,
        prefecture: dr.prefecture,
        floorArea: dr.floor_area,
        currentSituation: dr.current_situation,
        constructionType: dr.construction_type,
        status: dr.status,
        createdAt: dr.created_at,
        updatedAt: dr.updated_at,
        // 業者決定時のみ顧客情報を表示
        customer: dr.status === 'DECIDED' && myQuotation?.is_selected ? {
          name: dr.customers.customer_name,
          phone: dr.customers.customer_phone,
          email: dr.customers.customer_email
        } : null,
        // 自分の見積もり
        myQuotation: myQuotation ? {
          id: myQuotation.id,
          amount: myQuotation.quotation_amount,
          appealText: myQuotation.appeal_text,
          isSelected: myQuotation.is_selected,
          createdAt: myQuotation.created_at,
          order: myQuotation.orders ? {
            memo: myQuotation.orders.partner_memo,
            status: myQuotation.orders.order_status
          } : null
        } : null,
        // 他社の見積もり（見積もり比較中以降のみ）
        otherQuotations: ['COMPARING', 'DECIDED'].includes(dr.status) ?
          otherQuotations.map(q => ({
            companyName: q.partners.partner_details?.company_name || '非公開',
            amount: q.quotation_amount,
            createdAt: q.created_at
          })) : [],
        // 見積もり総数
        quotationCount: dr.quotations.length
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('Diagnosis requests fetch error:', error);
    return NextResponse.json({
      success: false,
      error: '診断依頼の取得に失敗しました'
    }, { status: 500 });
  }
}
