import { NextRequest, NextResponse } from "next/server";
import { InquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// 問い合わせ詳細取得
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inquiryId = parseInt(id);

    if (isNaN(inquiryId)) {
      return NextResponse.json(
        {
          success: false,
          error: "無効なIDです",
        },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiries.findUnique({
      where: { id: inquiryId },
      include: {
        customers: {
          select: {
            customer_name: true,
            customer_email: true,
          },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json(
        {
          success: false,
          error: "問い合わせが見つかりません",
        },
        { status: 404 }
      );
    }

    const formattedInquiry = {
      id: inquiry.id,
      customerName: inquiry.customers.customer_name,
      customerEmail: inquiry.customers.customer_email,
      customerPhone: "",
      subject: inquiry.subject,
      content: inquiry.inquiry_content,
      status: inquiry.inquiry_status,
      statusLabel: getStatusLabel(inquiry.inquiry_status),
      adminMemo: inquiry.admin_memo,
      createdAt: inquiry.created_at.toISOString(),
      createdDate: inquiry.created_at.toISOString().split("T")[0],
    };

    return NextResponse.json({
      success: true,
      data: formattedInquiry,
    });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "問い合わせの取得に失敗しました",
      },
      { status: 500 }
    );
  }
}

// 問い合わせ更新（ステータス、管理者メモ）
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inquiryId = parseInt(id);

    if (isNaN(inquiryId)) {
      return NextResponse.json(
        {
          success: false,
          error: "無効なIDです",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, adminMemo } = body;

    const updateData: {
      inquiry_status?: InquiryStatus;
      admin_memo?: string | null;
      updated_at: Date;
    } = {
      updated_at: new Date(),
    };

    if (status !== undefined) {
      updateData.inquiry_status = status as InquiryStatus;
    }

    if (adminMemo !== undefined) {
      updateData.admin_memo = adminMemo || null;
    }

    const updatedInquiry = await prisma.inquiries.update({
      where: { id: inquiryId },
      data: updateData,
      include: {
        customers: {
          select: {
            customer_name: true,
            customer_email: true,
          },
        },
      },
    });

    const formattedInquiry = {
      id: updatedInquiry.id,
      customerName: updatedInquiry.customers.customer_name,
      customerEmail: updatedInquiry.customers.customer_email,
      customerPhone: "",
      subject: updatedInquiry.subject,
      content: updatedInquiry.inquiry_content,
      status: updatedInquiry.inquiry_status,
      statusLabel: getStatusLabel(updatedInquiry.inquiry_status),
      adminMemo: updatedInquiry.admin_memo,
      createdAt: updatedInquiry.created_at.toISOString(),
      createdDate: updatedInquiry.created_at.toISOString().split("T")[0],
    };

    return NextResponse.json({
      success: true,
      data: formattedInquiry,
    });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "問い合わせの更新に失敗しました",
      },
      { status: 500 }
    );
  }
}

function getStatusLabel(status: InquiryStatus): string {
  const statusMap: Record<InquiryStatus, string> = {
    PENDING: "未対応",
    IN_PROGRESS: "対応中",
    COMPLETED: "対応完了",
  };
  return statusMap[status] || status;
}
