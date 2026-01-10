import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/infrastructure/database/prisma.client';
import bcrypt from 'bcrypt';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../src/lib/session';
import { cookies } from 'next/headers';

// GET: 加盟店の会社情報を取得
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

    const partner = await prisma.partners.findUnique({
      where: { id: session.partnerId },
      include: {
        partner_details: true,
        partner_prefectures: true
      }
    });

    if (!partner) {
      return NextResponse.json({
        success: false,
        error: '加盟店情報が見つかりません'
      }, { status: 404 });
    }

    // レビューがある完了案件を取得（reviews/route.tsと同じロジック）
    const completedOrdersWithReviews = await prisma.orders.findMany({
      where: {
        order_status: 'COMPLETED',
        quotations: {
          partner_id: partner.id,
          is_selected: true,
          diagnosis_requests: {
            customers: {
              customer_rating: {
                not: null
              }
            }
          }
        }
      },
      include: {
        quotations: {
          include: {
            diagnosis_requests: {
              include: {
                customers: {
                  select: {
                    customer_rating: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // レビューの平均評価を計算
    const ratings = completedOrdersWithReviews
      .map(order => order.quotations.diagnosis_requests.customers.customer_rating)
      .filter((rating): rating is number => rating !== null);

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

    // 施工完了件数を計算（レビューの有無に関わらず）
    const completedCount = await prisma.orders.count({
      where: {
        quotations: {
          partner_id: partner.id,
          is_selected: true
        },
        order_status: 'COMPLETED'
      }
    });

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
      rating: parseFloat(averageRating.toFixed(1)),
      reviewCount: ratings.length,
      workCount: completedCount,
      serviceAreas: partner.partner_prefectures.map(pp => pp.supported_prefecture),
      invoiceRegistrationNumber: partner.partner_details?.invoice_registration_number || '',
      bankName: partner.partner_details?.bank_name || '',
      bankBranchName: partner.partner_details?.bank_branch_name || '',
      bankAccountType: partner.partner_details?.bank_account_type || '',
      bankAccountNumber: partner.partner_details?.bank_account_number || '',
      bankAccountHolder: partner.partner_details?.bank_account_holder || ''
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
    // セッションからpartnerIdを取得
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.isLoggedIn || !session.partnerId) {
      return NextResponse.json({
        success: false,
        error: 'ログインが必要です'
      }, { status: 401 });
    }

    const currentPartnerId = session.partnerId;

    const body = await request.json();
    const {
      companyName,
      representativeName,
      email,
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
      bankAccountHolder
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

    // partnersテーブルの更新（パスワードとログインメールアドレス）
    const partnersUpdateData: any = {};

    if (newPassword && newPassword.trim() !== '') {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      partnersUpdateData.password_hash = hashedPassword;
    }

    // ログインメールアドレスの変更チェック
    console.log('Current login_email:', partner.login_email);
    console.log('New loginEmail:', loginEmail);
    console.log('Are they different?', loginEmail !== partner.login_email);

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
      console.log('Updating partners with:', partnersUpdateData);
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
          data: serviceAreas.map(area => ({
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

  } catch (error: any) {
    console.error('Profile update error:', error);

    // Prisma unique constraint error
    if (error.code === 'P2002') {
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
