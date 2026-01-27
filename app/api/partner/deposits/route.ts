import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { auth } from '@/auth';

// 銀行口座設定のキー一覧
const BANK_SETTING_KEYS = [
  'bank_name',
  'branch_name',
  'account_type',
  'account_number',
  'account_holder',
];

// GET: 入金申請履歴と振込先情報を取得
export async function GET(request: NextRequest) {
  try {
    // 認証チェック（middlewareで行われるが、partnerIdの取得のため）
    const session = await auth();
    if (!session || session.user.userType !== 'partner') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    const partnerId = parseInt(session.user.id);

    // 振込先銀行口座情報を取得
    const bankSettings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: BANK_SETTING_KEYS,
        },
      },
    });

    const bankInfo: Record<string, string> = {};
    bankSettings.forEach((setting) => {
      bankInfo[setting.key] = setting.value;
    });

    // クエリパラメータ取得
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 入金申請履歴を取得
    const [depositRequests, totalCount] = await Promise.all([
      prisma.depositRequest.findMany({
        where: { partner_id: partnerId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.depositRequest.count({
        where: { partner_id: partnerId },
      }),
    ]);

    // データ整形
    const formattedRequests = depositRequests.map((r) => ({
      id: r.id,
      requestedAmount: r.requested_amount,
      approvedAmount: r.approved_amount,
      status: r.status,
      partnerNote: r.partner_note,
      adminNote: r.admin_note,
      createdAt: r.created_at.toISOString(),
      approvedAt: r.approved_at?.toISOString() || null,
    }));

    // 現在の保証金残高を取得
    const partner = await prisma.partners.findUnique({
      where: { id: partnerId },
      select: { deposit_balance: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        bankInfo,
        depositBalance: partner?.deposit_balance || 0,
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
      { success: false, error: '入金申請履歴の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 新規入金申請を作成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック（middlewareで行われるが、partnerIdの取得のため）
    const session = await auth();
    if (!session || session.user.userType !== 'partner') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    const partnerId = parseInt(session.user.id);

    const body = await request.json();
    const { requested_amount, partner_note } = body;

    if (!requested_amount || requested_amount <= 0) {
      return NextResponse.json(
        { success: false, error: '申請金額は1円以上で入力してください' },
        { status: 400 }
      );
    }

    // 入金申請を作成
    const depositRequest = await prisma.depositRequest.create({
      data: {
        partner_id: partnerId,
        requested_amount,
        partner_note: partner_note || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: depositRequest.id,
        requestedAmount: depositRequest.requested_amount,
        status: depositRequest.status,
        createdAt: depositRequest.created_at.toISOString(),
      },
      message: '入金申請を送信しました',
    });
  } catch (error) {
    console.error('Deposit request creation error:', error);
    return NextResponse.json(
      { success: false, error: '入金申請の作成に失敗しました' },
      { status: 500 }
    );
  }
}
