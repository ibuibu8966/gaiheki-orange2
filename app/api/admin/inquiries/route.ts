import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 問い合わせ一覧取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    // ステータスフィルター
    if (status && status !== 'all') {
      where.inquiry_status = status;
    }

    // 検索条件（顧客情報はinquiriesテーブルに直接保存）
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { inquiry_content: { contains: search, mode: 'insensitive' } },
        { customer_name: { contains: search, mode: 'insensitive' } },
        { customer_email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const inquiries = await prisma.inquiries.findMany({
      where,
      orderBy: {
        created_at: 'desc'
      }
    });

    const formattedInquiries = inquiries.map(inquiry => ({
      id: inquiry.id,
      customerName: inquiry.customer_name,
      customerEmail: inquiry.customer_email,
      customerPhone: inquiry.customer_phone,
      subject: inquiry.subject,
      content: inquiry.inquiry_content,
      status: inquiry.inquiry_status,
      statusLabel: getStatusLabel(inquiry.inquiry_status),
      adminMemo: inquiry.admin_memo,
      createdAt: inquiry.created_at.toISOString(),
      createdDate: inquiry.created_at.toISOString().split('T')[0],
      updatedAt: inquiry.updated_at.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: formattedInquiries,
      count: formattedInquiries.length
    });

  } catch (error) {
    console.error('Inquiries fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inquiries',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: 問い合わせ新規作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // 問い合わせを作成（顧客情報は直接保存）
    const inquiry = await prisma.inquiries.create({
      data: {
        customer_name: name,
        customer_email: email,
        customer_phone: phone || null,
        subject: subject,
        inquiry_content: message,
        inquiry_status: 'PENDING',
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: inquiry.id
      }
    });

  } catch (error) {
    console.error('Inquiry creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create inquiry',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH: 問い合わせステータス更新
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { inquiryId, status, adminMemo } = body;

    if (!inquiryId) {
      return NextResponse.json(
        { success: false, error: 'Inquiry ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.inquiry_status = status;
    if (adminMemo !== undefined) updateData.admin_memo = adminMemo;

    const updatedInquiry = await prisma.inquiries.update({
      where: { id: inquiryId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedInquiry.id,
        status: updatedInquiry.inquiry_status
      }
    });

  } catch (error) {
    console.error('Inquiry update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update inquiry',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: '未対応',
    IN_PROGRESS: '対応中',
    COMPLETED: '完了'
  };
  return labels[status] || status;
}
