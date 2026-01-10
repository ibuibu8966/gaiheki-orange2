import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// GET: 加盟店申込一覧取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | null
    const search = searchParams.get('search');

    const where: any = {};

    // ステータスフィルター
    if (status && status !== 'all') {
      where.application_status = status;
    }

    // 検索条件
    if (search) {
      where.OR = [
        { company_name: { contains: search, mode: 'insensitive' } },
        { representative_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone_number: { contains: search, mode: 'insensitive' } }
      ];
    }

    const applications = await prisma.partner_applications.findMany({
      where,
      include: {
        partner_application_prefectures: true,
        admins: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const formattedApplications = applications.map(app => ({
      id: app.id,
      companyName: app.company_name,
      representativeName: app.representative_name,
      email: app.email,
      phone: app.phone_number,
      address: app.address,
      websiteUrl: app.website_url,
      businessDescription: app.business_description,
      selfPr: app.self_pr,
      status: app.application_status,
      statusLabel: getStatusLabel(app.application_status),
      prefectures: app.partner_application_prefectures.map(p => p.supported_prefecture),
      adminMemo: app.admin_memo,
      reviewNotes: app.review_notes,
      reviewedBy: app.admins?.username,
      reviewedAt: app.reviewed_at?.toISOString(),
      applicationDate: app.created_at.toISOString().split('T')[0]
    }));

    return NextResponse.json({
      success: true,
      data: formattedApplications,
      count: formattedApplications.length
    });

  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch applications',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH: 申込ステータス更新
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { applicationId, status, adminMemo, reviewNotes, reviewedBy } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, error: 'Application ID and status are required' },
        { status: 400 }
      );
    }

    // 申請情報を取得
    const application = await prisma.partner_applications.findUnique({
      where: { id: applicationId },
      include: {
        partner_application_prefectures: true
      }
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // トランザクションで処理
    const result = await prisma.$transaction(async (tx) => {
      // ステータスを更新
      const updatedApplication = await tx.partner_applications.update({
        where: { id: applicationId },
        data: {
          application_status: status,
          admin_memo: adminMemo,
          review_notes: reviewNotes,
          reviewed_by: reviewedBy,
          reviewed_at: new Date()
        }
      });

      // 承認の場合、Partnersテーブルに登録
      if (status === 'APPROVED') {
        // 既にPartnersテーブルに登録されているか確認
        const existingPartner = await tx.partners.findUnique({
          where: { login_email: application.email }
        });

        if (!existingPartner) {
          // ランダムな初期パスワードを生成（後でパスワード設定機能を追加する想定）
          const tempPassword = Math.random().toString(36).slice(-12);
          const passwordHash = await bcrypt.hash(tempPassword, 10);

          // Partnersテーブルに登録
          const newPartner = await tx.partners.create({
            data: {
              username: application.company_name,
              login_email: application.email,
              password_hash: passwordHash,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            }
          });

          // Partner詳細情報を登録
          await tx.partner_details.create({
            data: {
              partner_id: newPartner.id,
              company_name: application.company_name,
              phone_number: application.phone_number,
              address: application.address,
              representative_name: application.representative_name,
              website_url: application.website_url,
              business_description: application.business_description,
              appeal_text: application.self_pr,
              partners_status: 'INACTIVE', // 最初は非公開
              created_at: new Date(),
              updated_at: new Date()
            }
          });

          // 対応都道府県を登録
          if (application.partner_application_prefectures.length > 0) {
            await tx.partner_prefectures.createMany({
              data: application.partner_application_prefectures.map((p) => ({
                partner_id: newPartner.id,
                supported_prefecture: p.supported_prefecture,
                created_at: new Date(),
                updated_at: new Date()
              }))
            });
          }
        }
      }

      // ステータス変更履歴を記録
      await tx.application_status_histories.create({
        data: {
          application_id: applicationId,
          previous_status: application.application_status,
          new_status: status,
          changed_by: reviewedBy || 1,
          change_reason: reviewNotes || null,
          created_at: new Date()
        }
      });

      return updatedApplication;
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        status: result.application_status
      }
    });

  } catch (error) {
    console.error('Application update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update application',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    UNDER_REVIEW: '審査中',
    APPROVED: '承認済み',
    REJECTED: '却下'
  };
  return labels[status] || status;
}
