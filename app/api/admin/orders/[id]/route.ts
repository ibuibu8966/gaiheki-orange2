import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 受注詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID" },
        { status: 400 }
      );
    }

    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        quotations: {
          include: {
            diagnosis_requests: {
              include: {
                customers: {
                  select: {
                    customer_name: true,
                    customer_email: true,
                    customer_phone: true,
                    construction_address: true,
                    customer_construction_type: true,
                  },
                },
              },
            },
            partners: {
              include: {
                partner_details: {
                  select: {
                    company_name: true,
                    phone_number: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const formattedOrder = {
      id: order.id,
      quotationId: order.quotation_id,
      diagnosisId: order.quotations.diagnosis_requests.diagnosis_number,
      customerId: order.quotations.diagnosis_requests.customer_id,
      customerName: order.quotations.diagnosis_requests.customers.customer_name,
      customerPhone: order.quotations.diagnosis_requests.customers.customer_phone,
      customerEmail: order.quotations.diagnosis_requests.customers.customer_email,
      address: order.quotations.diagnosis_requests.customers.construction_address,
      constructionType: order.quotations.diagnosis_requests.customers.customer_construction_type,
      partnerId: order.quotations.partner_id,
      partnerName: order.quotations.partners.partner_details?.company_name || "未設定",
      partnerPhone: order.quotations.partners.partner_details?.phone_number,
      quotationAmount: order.quotations.quotation_amount,
      constructionStartDate: order.construction_start_date?.toISOString().split("T")[0],
      constructionEndDate: order.construction_end_date?.toISOString().split("T")[0],
      status: order.order_status,
      statusLabel: getStatusLabel(order.order_status),
      partnerMemo: order.partner_memo,
      adminMemo: order.admin_memo,
      orderDate: order.order_date.toISOString().split("T")[0],
      completionDate: order.completion_date?.toISOString().split("T")[0],
      evaluationToken: order.evaluation_token,
      evaluationTokenSentAt: order.evaluation_token_sent_at?.toISOString(),
      prefecture: order.quotations.diagnosis_requests.prefecture,
    };

    return NextResponse.json({
      success: true,
      data: formattedOrder,
    });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH: 受注更新（ステータス、管理者メモ）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { adminMemo, status, completionDate } = body;

    const updateData: any = {
      updated_at: new Date(),
    };

    if (adminMemo !== undefined) {
      updateData.admin_memo = adminMemo;
    }

    if (status !== undefined) {
      updateData.order_status = status;
    }

    if (completionDate !== undefined) {
      updateData.completion_date = completionDate ? new Date(completionDate) : null;
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: updateData,
      include: {
        quotations: {
          include: {
            diagnosis_requests: {
              include: {
                customers: true,
              },
            },
            partners: {
              include: {
                partner_details: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder.id,
        adminMemo: updatedOrder.admin_memo,
        status: updatedOrder.order_status,
        statusLabel: getStatusLabel(updatedOrder.order_status),
        completionDate: updatedOrder.completion_date?.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ORDERED: "受注",
    IN_PROGRESS: "施工中",
    COMPLETED: "施工完了",
    REVIEW_COMPLETED: "評価完了",
    CANCELLED: "キャンセル",
  };
  return labels[status] || status;
}
