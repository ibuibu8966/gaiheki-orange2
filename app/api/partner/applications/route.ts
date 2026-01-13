import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: 加盟店申請を作成
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

    // 必須フィールドチェック
    if (!companyName || !representativeName || !address || !phone || !email) {
      return NextResponse.json(
        { success: false, error: '必須項目を入力してください' },
        { status: 400 }
      );
    }

    // 申請を作成
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
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: application.id,
        companyName: application.company_name
      }
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
