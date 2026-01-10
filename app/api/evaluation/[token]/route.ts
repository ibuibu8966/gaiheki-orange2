import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: トークン検証と受注情報取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // トークンで受注を検索
    const order = await prisma.orders.findUnique({
      where: { evaluation_token: token },
      include: {
        quotations: {
          include: {
            diagnosis_requests: {
              include: {
                customers: {
                  select: {
                    customer_name: true,
                    construction_address: true,
                    customer_rating: true,
                  },
                },
              },
            },
            partners: {
              include: {
                partner_details: {
                  select: {
                    company_name: true,
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
        { success: false, error: "Invalid token" },
        { status: 404 }
      );
    }

    // ステータスが施工完了または評価完了でない場合はエラー
    if (order.order_status !== "COMPLETED" && order.order_status !== "REVIEW_COMPLETED") {
      return NextResponse.json(
        { success: false, error: `受注ステータスが施工完了ではありません（現在: ${order.order_status}）` },
        { status: 400 }
      );
    }

    // 既に評価済みの場合
    const customer = order.quotations.diagnosis_requests.customers;
    if (customer && customer.customer_rating !== null) {
      return NextResponse.json(
        { success: false, error: "この施工は既に評価済みです" },
        { status: 400 }
      );
    }

    // 顧客データがない場合
    if (!customer) {
      return NextResponse.json(
        { success: false, error: "顧客データが見つかりません" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        customerName: customer.customer_name,
        address: customer.construction_address,
        partnerName: order.quotations.partners.partner_details?.company_name || order.quotations.partners.username,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify token",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST: 評価送信
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { rating, reviewTitle, review } = body;

    // バリデーション
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Invalid rating" },
        { status: 400 }
      );
    }

    if (!review || !review.trim()) {
      return NextResponse.json(
        { success: false, error: "Review is required" },
        { status: 400 }
      );
    }

    // トークンで受注を検索
    const order = await prisma.orders.findUnique({
      where: { evaluation_token: token },
      include: {
        quotations: {
          include: {
            diagnosis_requests: {
              include: {
                customers: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 404 }
      );
    }

    const customer = order.quotations.diagnosis_requests.customers;

    // 既に評価済みの場合
    if (customer.customer_rating !== null) {
      return NextResponse.json(
        { success: false, error: "Evaluation already submitted" },
        { status: 400 }
      );
    }

    // トランザクションで更新
    await prisma.$transaction([
      // 顧客テーブルに評価を保存
      prisma.customers.update({
        where: { id: customer.id },
        data: {
          customer_rating: rating,
          customer_review_title: reviewTitle || null,
          customer_review: review,
          customer_review_date: new Date(),
          customer_status: "REVIEW_COMPLETED",
        },
      }),
      // 受注ステータスを評価完了に更新
      prisma.orders.update({
        where: { id: order.id },
        data: {
          order_status: "REVIEW_COMPLETED",
          completion_date: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Evaluation submitted successfully",
    });
  } catch (error) {
    console.error("Evaluation submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit evaluation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
