import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// POST: 評価フォーム発行（トークン生成）
export async function POST(
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

    // 受注の存在確認とステータスチェック
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        quotations: {
          include: {
            diagnosis_requests: {
              include: {
                customers: {
                  select: {
                    customer_email: true,
                    customer_name: true,
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

    // ステータスが施工完了でない場合はエラー
    if (order.order_status !== "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          error: "評価フォームは施工完了状態の受注のみ発行可能です",
        },
        { status: 400 }
      );
    }

    // すでにトークンが発行済みの場合は再利用
    if (order.evaluation_token) {
      const evaluationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/evaluation/${order.evaluation_token}`;

      return NextResponse.json({
        success: true,
        data: {
          token: order.evaluation_token,
          evaluationUrl,
          sentAt: order.evaluation_token_sent_at?.toISOString(),
          message: "既存の評価フォームURLを返しました",
        },
      });
    }

    // トークン生成（32バイトのランダム文字列）
    const token = randomBytes(32).toString("hex");

    // トークンを保存
    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: {
        evaluation_token: token,
        evaluation_token_sent_at: new Date(),
        updated_at: new Date(),
      },
    });

    // 評価フォームURL生成
    const evaluationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/evaluation/${token}`;

    // TODO: ここでメール送信処理を追加
    // const customer = order.quotations.diagnosis_requests.customers;
    // await sendEvaluationEmail(customer.customer_email, customer.customer_name, evaluationUrl);

    return NextResponse.json({
      success: true,
      data: {
        token: updatedOrder.evaluation_token,
        evaluationUrl,
        sentAt: updatedOrder.evaluation_token_sent_at?.toISOString(),
        message: "評価フォームを発行しました",
      },
    });
  } catch (error) {
    console.error("Evaluation form generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate evaluation form",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
