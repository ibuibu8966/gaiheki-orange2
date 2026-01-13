import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 入金申請一覧を取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      where.status = status;
    }

    const [depositRequests, totalCount] = await Promise.all([
      prisma.depositRequest.findMany({
        where,
        include: {
          partner: {
            include: {
              partner_details: {
                select: {
                  company_name: true,
                },
              },
            },
          },
          admin: {
            select: {
              username: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.depositRequest.count({ where }),
    ]);

    // データ整形
    const formattedRequests = depositRequests.map((r) => ({
      id: r.id,
      partnerId: r.partner_id,
      companyName: r.partner.partner_details?.company_name || '未設定',
      requestedAmount: r.requested_amount,
      approvedAmount: r.approved_amount,
      status: r.status,
      partnerNote: r.partner_note,
      adminNote: r.admin_note,
      createdAt: r.created_at.toISOString(),
      approvedAt: r.approved_at?.toISOString() || null,
      approvedBy: r.admin?.username || null,
      currentBalance: r.partner.deposit_balance,
    }));

    return NextResponse.json({
      success: true,
      data: {
        depositRequests: formattedRequests,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('Deposit requests fetch error:', error);
    return NextResponse.json(
      { success: false, error: '入金申請一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: 入金申請の承認/却下
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, approved_amount, admin_note } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '申請IDが必要です' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'アクションが不正です' },
        { status: 400 }
      );
    }

    // 申請を取得
    const depositRequest = await prisma.depositRequest.findUnique({
      where: { id },
      include: { partner: true },
    });

    if (!depositRequest) {
      return NextResponse.json(
        { success: false, error: '申請が見つかりません' },
        { status: 404 }
      );
    }

    if (depositRequest.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'この申請は既に処理されています' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      if (!approved_amount || approved_amount <= 0) {
        return NextResponse.json(
          { success: false, error: '承認金額は1円以上で入力してください' },
          { status: 400 }
        );
      }

      // トランザクションで承認処理
      const previousBalance = depositRequest.partner.deposit_balance;
      const newBalance = previousBalance + approved_amount;

      await prisma.$transaction(async (tx) => {
        // 1. 申請を承認
        await tx.depositRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approved_amount,
            admin_note: admin_note || null,
            approved_at: new Date(),
          },
        });

        // 2. 保証金残高を更新
        await tx.partners.update({
          where: { id: depositRequest.partner_id },
          data: {
            deposit_balance: newBalance,
          },
        });

        // 3. 入出金履歴を記録
        await tx.depositHistory.create({
          data: {
            partner_id: depositRequest.partner_id,
            amount: approved_amount,
            type: 'DEPOSIT',
            balance: newBalance,
            description: `入金申請承認 (申請ID: ${id.slice(-8)})`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: '入金申請を承認しました',
        data: {
          approvedAmount: approved_amount,
          previousBalance,
          newBalance,
        },
      });
    } else {
      // 却下処理
      await prisma.depositRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          admin_note: admin_note || null,
          approved_at: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: '入金申請を却下しました',
      });
    }
  } catch (error) {
    console.error('Deposit request update error:', error);
    return NextResponse.json(
      { success: false, error: '入金申請の処理に失敗しました' },
      { status: 500 }
    );
  }
}
