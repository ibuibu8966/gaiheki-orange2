import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET: Partner設定情報を取得
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.userType !== 'partner') {
      return NextResponse.json(
        { success: false, error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    const partnerId = parseInt(session.user.id);

    const partnerDetails = await prisma.partner_details.findUnique({
      where: { partner_id: partnerId },
    });

    if (!partnerDetails) {
      return NextResponse.json(
        { success: false, error: 'Partner details not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: partnerDetails });
  } catch (error) {
    console.error('Error fetching partner settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partner settings' },
      { status: 500 }
    );
  }
}

// PUT: Partner設定情報を更新
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.userType !== 'partner') {
      return NextResponse.json(
        { success: false, error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    const partnerId = parseInt(session.user.id);

    const data = await request.json();

    // 更新するフィールドを抽出
    const updateData: Record<string, unknown> = {};

    if (data.company_name !== undefined) updateData.company_name = data.company_name;
    if (data.phone_number !== undefined) updateData.phone_number = data.phone_number;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.representative_name !== undefined) updateData.representative_name = data.representative_name;
    if (data.fax_number !== undefined) updateData.fax_number = data.fax_number;
    if (data.website_url !== undefined) updateData.website_url = data.website_url;
    if (data.invoice_registration_number !== undefined) updateData.invoice_registration_number = data.invoice_registration_number;
    if (data.bank_name !== undefined) updateData.bank_name = data.bank_name;
    if (data.bank_branch_name !== undefined) updateData.bank_branch_name = data.bank_branch_name;
    if (data.bank_account_type !== undefined) updateData.bank_account_type = data.bank_account_type;
    if (data.bank_account_number !== undefined) updateData.bank_account_number = data.bank_account_number;
    if (data.bank_account_holder !== undefined) updateData.bank_account_holder = data.bank_account_holder;

    // updated_atを更新
    updateData.updated_at = new Date();

    const updatedPartnerDetails = await prisma.partner_details.update({
      where: { partner_id: partnerId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedPartnerDetails });
  } catch (error) {
    console.error('Error updating partner settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner settings' },
      { status: 500 }
    );
  }
}
