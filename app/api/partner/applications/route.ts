import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: パートナー申請を新規作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName,
      representativeName,
      address,
      phone,
      email,
      website,
      businessContent,
      appealPoints
    } = body;

    // 必須フィールドのバリデーション
    if (!companyName || !representativeName || !address || !phone || !email) {
      return NextResponse.json(
        { success: false, error: '必須項目を入力してください' },
        { status: 400 }
      );
    }

    // メールアドレスの重複チェック
    const existingApplication = await prisma.partner_applications.findFirst({
      where: {
        email: email,
        application_status: {
          in: ['UNDER_REVIEW', 'APPROVED']
        }
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'このメールアドレスは既に申請済みです' },
        { status: 400 }
      );
    }

    // 申請をデータベースに保存
    const application = await prisma.partner_applications.create({
      data: {
        company_name: companyName,
        representative_name: representativeName,
        address: address,
        phone_number: phone,
        email: email,
        website_url: website || null,
        business_description: businessContent || '',
        self_pr: appealPoints || '',
        application_status: 'UNDER_REVIEW',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: { id: application.id }
    });

  } catch (error) {
    console.error('Partner application error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '申請の送信に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
