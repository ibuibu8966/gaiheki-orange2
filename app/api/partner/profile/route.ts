import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { auth } from '@/auth';

// GET: 加盟店の会社情報を取得
export async function GET() {
  try {
    // 認証チェック（middlewareで行われるが、partnerIdの取得のため）
    const session = await auth();
    if (!session || session.user.userType !== 'partner') {
      return NextResponse.json({
        success: false,
        error: 'ログインが必要です'
      }, { status: 401 });
    }
    const partnerId = parseInt(session.user.id);

    const partner = await prisma.partners.findUnique({
      where: { id: partnerId },
      include: {
        partner_details: true,
        partner_prefectures: true,
        _count: {
          select: {
            referrals: true
          }
        }
      }
    });

    if (!partner) {
      return NextResponse.json({
        success: false,
        error: '加盟店情報が見つかりません'
      }, { status: 404 });
    }

    const profileData = {
      id: partner.id,
      companyName: partner.partner_details?.company_name || '',
      representativeName: partner.partner_details?.representative_name || '',
      phone: partner.partner_details?.phone_number || '',
      fax: partner.partner_details?.fax_number || '',
      website: partner.partner_details?.website_url || '',
      address: partner.partner_details?.address || '',
      businessHours: partner.partner_details?.business_hours || '',
      holidays: partner.partner_details?.closed_days || '',
      businessContent: partner.partner_details?.business_description || '',
      appeal: partner.partner_details?.appeal_text || '',
      loginEmail: partner.login_email,
      rating: 0,
      reviewCount: 0,
      workCount: partner._count.referrals,
      serviceAreas: partner.partner_prefectures.map(pp => pp.supported_prefecture),
      invoiceRegistrationNumber: partner.partner_details?.invoice_registration_number || '',
      bankName: partner.partner_details?.bank_name || '',
      bankBranchName: partner.partner_details?.bank_branch_name || '',
      bankAccountType: partner.partner_details?.bank_account_type || '',
      bankAccountNumber: partner.partner_details?.bank_account_number || '',
      bankAccountHolder: partner.partner_details?.bank_account_holder || '',
      depositBalance: partner.deposit_balance,
      monthlyDesiredLeads: partner.monthly_desired_leads ?? 0
    };

    return NextResponse.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'プロフィール情報の取得に失敗しました'
    }, { status: 500 });
  }
}

// PATCH: 加盟店の会社情報を更新
export async function PATCH(request: NextRequest) {
  try {
    // 認証チェック（middlewareで行われるが、partnerIdの取得のため）
    const session = await auth();
    if (!session || session.user.userType !== 'partner') {
      return NextResponse.json({
        success: false,
        error: 'ログインが必要です'
      }, { status: 401 });
    }
    const currentPartnerId = parseInt(session.user.id);

    const body = await request.json();
    const {
      companyName,
      representativeName,
      phone,
      fax,
      website,
      address,
      businessHours,
      holidays,
      businessContent,
      appeal,
      loginEmail,
      newPassword,
      serviceAreas,
      invoiceRegistrationNumber,
      bankName,
      bankBranchName,
      bankAccountType,
      bankAccountNumber,
      bankAccountHolder,
      monthlyDesiredLeads
    } = body;

    // パートナーの存在確認
    const partner = await prisma.partners.findUnique({
      where: { id: currentPartnerId },
      include: { partner_details: true }
    });

    if (!partner) {
      return NextResponse.json({
        success: false,
        error: '加盟店情報が見つかりません'
      }, { status: 404 });
    }

    // partnersテーブルの更新（パスワード、ログインメールアドレス、月間希望件数）
    const partnersUpdateData: Record<string, string | number | null> = {};

    if (newPassword && newPassword.trim() !== '') {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      partnersUpdateData.password_hash = hashedPassword;
    }

    if (monthlyDesiredLeads !== undefined) {
      partnersUpdateData.monthly_desired_leads = monthlyDesiredLeads === 0 ? null : monthlyDesiredLeads;
    }

    if (loginEmail && loginEmail !== partner.login_email) {
      // 既に使用されていないか確認
      const existingPartner = await prisma.partners.findFirst({
        where: {
          login_email: loginEmail,
          id: { not: currentPartnerId }
        }
      });

      if (existingPartner) {
        return NextResponse.json({
          success: false,
          error: 'このログインメールアドレスは既に使用されています'
        }, { status: 400 });
      }

      partnersUpdateData.login_email = loginEmail;
    }

    if (Object.keys(partnersUpdateData).length > 0) {
      await prisma.partners.update({
        where: { id: currentPartnerId },
        data: partnersUpdateData
      });
    }

    // partner_detailsを更新
    if (partner.partner_details) {
      await prisma.partner_details.update({
        where: { partner_id: currentPartnerId },
        data: {
          company_name: companyName,
          representative_name: representativeName,
          phone_number: phone,
          fax_number: fax || null,
          website_url: website || null,
          address,
          business_hours: businessHours || null,
          closed_days: holidays || null,
          business_description: businessContent,
          appeal_text: appeal,
          invoice_registration_number: invoiceRegistrationNumber || null,
          bank_name: bankName || null,
          bank_branch_name: bankBranchName || null,
          bank_account_type: bankAccountType || null,
          bank_account_number: bankAccountNumber || null,
          bank_account_holder: bankAccountHolder || null
        }
      });
    }

    // 対応エリアを更新
    if (serviceAreas && Array.isArray(serviceAreas)) {
      // 既存の対応エリアを削除
      await prisma.partner_prefectures.deleteMany({
        where: { partner_id: currentPartnerId }
      });

      // 新しい対応エリアを追加
      if (serviceAreas.length > 0) {
        await prisma.partner_prefectures.createMany({
          data: serviceAreas.map((area: string) => ({
            partner_id: currentPartnerId,
            supported_prefecture: area,
            updated_at: new Date()
          }))
        });
      }
    }

    const updatedPartner = await prisma.partners.findUnique({
      where: { id: currentPartnerId },
      include: { partner_details: true }
    });

    return NextResponse.json({
      success: true,
      message: '会社情報を更新しました',
      data: updatedPartner
    });

  } catch (error) {
    console.error('Profile update error:', error);

    // Prisma unique constraint error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'このログインメールアドレスは既に使用されています'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: '会社情報の更新に失敗しました'
    }, { status: 500 });
  }
}
