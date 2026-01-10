import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET: 加盟店一覧取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active' | 'inactive' | null (all)
    const search = searchParams.get('search');

    // クエリ条件を構築
    const where: any = {};

    // ステータスフィルター
    if (status === 'active') {
      where.is_active = true;
    } else if (status === 'inactive') {
      where.is_active = false;
    }

    // 検索条件（会社名、メール、ユーザー名）
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { login_email: { contains: search, mode: 'insensitive' } },
        {
          partner_details: {
            company_name: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    // 加盟店データ取得（詳細情報と対応都道府県を含む）
    const partners = await prisma.partners.findMany({
      where,
      include: {
        partner_details: true,
        partner_prefectures: true,
        _count: {
          select: {
            customers: true,
            quotations: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // レスポンス用にデータを整形
    const formattedPartners = partners.map(partner => ({
      id: partner.id,
      username: partner.username,
      email: partner.login_email,
      companyName: partner.partner_details?.company_name || '未設定',
      phone: partner.partner_details?.phone_number || '未設定',
      address: partner.partner_details?.address || '未設定',
      prefectures: partner.partner_prefectures.map(p => p.supported_prefecture),
      status: partner.is_active ? '表示' : '非表示',
      isActive: partner.is_active,
      detailsStatus: partner.partner_details?.partners_status || 'INACTIVE',
      registrationDate: partner.created_at.toISOString().split('T')[0],
      lastLoginAt: partner.last_login_at?.toISOString() || null,
      customerCount: partner._count.customers,
      quotationCount: partner._count.quotations
    }));

    return NextResponse.json({
      success: true,
      data: formattedPartners,
      count: formattedPartners.length
    });

  } catch (error) {
    console.error('Partners fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch partners',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: 新規加盟店作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      username,
      loginEmail,
      password,
      companyName,
      phone,
      address,
      representativeName,
      prefectures,
      businessDescription,
      appealText,
      websiteUrl,
      faxNumber
    } = body;

    // 必須項目チェック
    if (!username || !loginEmail || !password || !companyName) {
      return NextResponse.json(
        { success: false, error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    // メールアドレス重複チェック
    const existingPartner = await prisma.partners.findUnique({
      where: { login_email: loginEmail }
    });

    if (existingPartner) {
      return NextResponse.json(
        { success: false, error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      );
    }

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, 12);

    // トランザクションで加盟店とその詳細を作成
    const result = await prisma.$transaction(async (tx) => {
      // 加盟店作成
      const partner = await tx.partners.create({
        data: {
          username,
          login_email: loginEmail,
          password_hash: passwordHash,
          is_active: true,
          updated_at: new Date()
        }
      });

      // 加盟店詳細作成
      await tx.partner_details.create({
        data: {
          partner_id: partner.id,
          company_name: companyName,
          phone_number: phone || '',
          address: address || '',
          representative_name: representativeName || '',
          fax_number: faxNumber,
          website_url: websiteUrl,
          business_description: businessDescription || '',
          appeal_text: appealText || '',
          partners_status: 'ACTIVE',
          updated_at: new Date()
        }
      });

      // 対応都道府県作成
      if (prefectures && prefectures.length > 0) {
        await tx.partner_prefectures.createMany({
          data: prefectures.map((pref: string) => ({
            partner_id: partner.id,
            supported_prefecture: pref,
            updated_at: new Date()
          }))
        });
      }

      return partner;
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        username: result.username
      },
      message: '加盟店を登録しました'
    });

  } catch (error) {
    console.error('Partner creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '加盟店の登録に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH: 加盟店更新
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { partnerId, isActive, ...updateData } = body;

    if (!partnerId) {
      return NextResponse.json(
        { success: false, error: 'Partner ID is required' },
        { status: 400 }
      );
    }

    // ステータス更新のみの場合
    if (isActive !== undefined && Object.keys(updateData).length === 0) {
      // トランザクションでpartnersとpartner_detailsの両方を更新
      const updatedPartner = await prisma.$transaction(async (tx) => {
        // partners.is_active を更新
        const partner = await tx.partners.update({
          where: { id: partnerId },
          data: { is_active: isActive, updated_at: new Date() },
          include: {
            partner_details: true
          }
        });

        // partner_details.partners_status も連動して更新
        await tx.partner_details.update({
          where: { partner_id: partnerId },
          data: {
            partners_status: isActive ? 'ACTIVE' : 'INACTIVE',
            updated_at: new Date()
          }
        });

        return partner;
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updatedPartner.id,
          isActive: updatedPartner.is_active,
          companyName: updatedPartner.partner_details?.company_name
        }
      });
    }

    // 詳細情報の更新
    await prisma.$transaction(async (tx) => {
      // ログイン情報の更新
      if (updateData.loginEmail || updateData.password) {
        const partnerUpdate: any = { updated_at: new Date() };
        if (updateData.loginEmail) partnerUpdate.login_email = updateData.loginEmail;
        if (updateData.password) {
          partnerUpdate.password_hash = await bcrypt.hash(updateData.password, 12);
        }
        await tx.partners.update({
          where: { id: partnerId },
          data: partnerUpdate
        });
      }

      // 詳細情報の更新
      if (updateData.companyName || updateData.phone || updateData.address) {
        const detailsUpdate: any = { updated_at: new Date() };
        if (updateData.companyName) detailsUpdate.company_name = updateData.companyName;
        if (updateData.phone) detailsUpdate.phone_number = updateData.phone;
        if (updateData.address) detailsUpdate.address = updateData.address;
        if (updateData.representativeName) detailsUpdate.representative_name = updateData.representativeName;
        if (updateData.businessDescription) detailsUpdate.business_description = updateData.businessDescription;
        if (updateData.appealText) detailsUpdate.appeal_text = updateData.appealText;
        if (updateData.websiteUrl !== undefined) detailsUpdate.website_url = updateData.websiteUrl;
        if (updateData.faxNumber !== undefined) detailsUpdate.fax_number = updateData.faxNumber;

        await tx.partner_details.update({
          where: { partner_id: partnerId },
          data: detailsUpdate
        });
      }

      // 都道府県の更新
      if (updateData.prefectures) {
        await tx.partner_prefectures.deleteMany({
          where: { partner_id: partnerId }
        });
        if (updateData.prefectures.length > 0) {
          await tx.partner_prefectures.createMany({
            data: updateData.prefectures.map((pref: string) => ({
              partner_id: partnerId,
              supported_prefecture: pref,
              updated_at: new Date()
            }))
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: '加盟店情報を更新しました'
    });

  } catch (error) {
    console.error('Partner update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '加盟店の更新に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: 加盟店削除
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('id');

    if (!partnerId) {
      return NextResponse.json(
        { success: false, error: 'Partner ID is required' },
        { status: 400 }
      );
    }

    const id = parseInt(partnerId);

    // トランザクションで関連データを削除してから加盟店を削除
    await prisma.$transaction(async (tx) => {
      // 1. 顧客に紐づく診断依頼の見積もりを削除
      const customers = await tx.customers.findMany({
        where: { partner_id: id },
        select: { id: true }
      });

      if (customers.length > 0) {
        const customerIds = customers.map(c => c.id);

        // 診断依頼のIDを取得
        const diagnosisRequests = await tx.diagnosis_requests.findMany({
          where: { customer_id: { in: customerIds } },
          select: { id: true }
        });

        const diagnosisIds = diagnosisRequests.map(d => d.id);

        if (diagnosisIds.length > 0) {
          // 見積もりに紐づく注文を削除
          await tx.orders.deleteMany({
            where: {
              quotations: {
                diagnosis_request_id: { in: diagnosisIds }
              }
            }
          });

          // 見積もりを削除
          await tx.quotations.deleteMany({
            where: { diagnosis_request_id: { in: diagnosisIds } }
          });
        }

        // 診断依頼を削除
        await tx.diagnosis_requests.deleteMany({
          where: { customer_id: { in: customerIds } }
        });

        // 問い合わせを削除
        await tx.inquiries.deleteMany({
          where: { customer_id: { in: customerIds } }
        });

        // 顧客を削除
        await tx.customers.deleteMany({
          where: { partner_id: id }
        });
      }

      // 2. 加盟店の見積もりに紐づく注文を削除
      const quotations = await tx.quotations.findMany({
        where: { partner_id: id },
        select: { id: true }
      });

      if (quotations.length > 0) {
        await tx.orders.deleteMany({
          where: { quotation_id: { in: quotations.map(q => q.id) } }
        });
      }

      // 3. 加盟店の見積もりを削除
      await tx.quotations.deleteMany({
        where: { partner_id: id }
      });

      // 4. 加盟店の詳細と都道府県を削除（これらはカスケード削除されるが明示的に削除）
      await tx.partner_prefectures.deleteMany({
        where: { partner_id: id }
      });

      await tx.partner_details.deleteMany({
        where: { partner_id: id }
      });

      // 5. 加盟店申請関連を削除
      await tx.partner_application_prefectures.deleteMany({
        where: { partner_id: id }
      });

      // 6. 最後に加盟店を削除
      await tx.partners.delete({
        where: { id }
      });
    });

    return NextResponse.json({
      success: true,
      message: '加盟店を削除しました'
    });

  } catch (error) {
    console.error('Partner deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '加盟店の削除に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
