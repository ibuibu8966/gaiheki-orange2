import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 並び替え処理
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId, direction } = body;

    if (!articleId || !direction) {
      return NextResponse.json(
        {
          success: false,
          error: "記事IDと方向が必要です",
        },
        { status: 400 }
      );
    }

    // 現在の記事を取得
    const currentArticle = await prisma.articles.findUnique({
      where: { id: articleId },
    });

    if (!currentArticle) {
      return NextResponse.json(
        {
          success: false,
          error: "記事が見つかりません",
        },
        { status: 404 }
      );
    }

    // 入れ替え対象の記事を取得
    const targetArticle = await prisma.articles.findFirst({
      where: {
        sort_order:
          direction === "up"
            ? { lt: currentArticle.sort_order }
            : { gt: currentArticle.sort_order },
      },
      orderBy: {
        sort_order: direction === "up" ? "desc" : "asc",
      },
    });

    if (!targetArticle) {
      return NextResponse.json(
        {
          success: false,
          error: "これ以上移動できません",
        },
        { status: 400 }
      );
    }

    // sort_orderを入れ替え
    await prisma.$transaction([
      prisma.articles.update({
        where: { id: currentArticle.id },
        data: { sort_order: targetArticle.sort_order, updated_at: new Date() },
      }),
      prisma.articles.update({
        where: { id: targetArticle.id },
        data: { sort_order: currentArticle.sort_order, updated_at: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "並び順を更新しました",
    });
  } catch (error) {
    console.error("Error reordering articles:", error);
    return NextResponse.json(
      {
        success: false,
        error: "並び替えに失敗しました",
      },
      { status: 500 }
    );
  }
}
