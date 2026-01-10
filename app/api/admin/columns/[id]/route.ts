import { NextRequest, NextResponse } from "next/server";
import { ArticleCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// コラム詳細取得
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        {
          success: false,
          error: "無効なIDです",
        },
        { status: 400 }
      );
    }

    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      include: {
        admins: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error: "記事が見つかりません",
        },
        { status: 404 }
      );
    }

    const formattedArticle = {
      id: article.id,
      title: article.title,
      thumbnailImage: article.thumbnail_image,
      category: article.category,
      categoryLabel: getCategoryLabel(article.category),
      content: article.content,
      isPublished: article.is_published,
      sortOrder: article.sort_order,
      postName: article.post_name,
      author: article.admins.username,
      authorEmail: article.admins.email,
      createdAt: article.created_at.toISOString(),
      updatedAt: article.updated_at.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedArticle,
    });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      {
        success: false,
        error: "記事の取得に失敗しました",
      },
      { status: 500 }
    );
  }
}

// コラム更新
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        {
          success: false,
          error: "無効なIDです",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      title,
      thumbnailImage,
      category,
      content,
      isPublished,
      sortOrder,
      postName,
    } = body;

    const updateData: any = {
      updated_at: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (thumbnailImage !== undefined)
      updateData.thumbnail_image = thumbnailImage;
    if (category !== undefined) updateData.category = category as ArticleCategory;
    if (content !== undefined) updateData.content = content;
    if (isPublished !== undefined) updateData.is_published = isPublished;
    if (sortOrder !== undefined) updateData.sort_order = sortOrder;
    if (postName !== undefined) updateData.post_name = postName;

    const updatedArticle = await prisma.articles.update({
      where: { id: articleId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedArticle.id,
        title: updatedArticle.title,
        isPublished: updatedArticle.is_published,
      },
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      {
        success: false,
        error: "記事の更新に失敗しました",
      },
      { status: 500 }
    );
  }
}

// コラム削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        {
          success: false,
          error: "無効なIDです",
        },
        { status: 400 }
      );
    }

    await prisma.articles.delete({
      where: { id: articleId },
    });

    return NextResponse.json({
      success: true,
      message: "記事を削除しました",
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      {
        success: false,
        error: "記事の削除に失敗しました",
      },
      { status: 500 }
    );
  }
}

function getCategoryLabel(category: ArticleCategory): string {
  const categoryMap: Record<ArticleCategory, string> = {
    BASIC_KNOWLEDGE: "外壁塗装の基礎知識",
    PAINT_TYPES: "塗料の種類と特徴",
    CASE_STUDIES: "施工事例",
    MAINTENANCE: "メンテナンス",
    CONTRACTOR_SELECTION: "業者選びのポイント",
    COST_ESTIMATE: "費用・見積もり",
    TROUBLESHOOTING: "トラブル対処法",
    SEASONAL_WEATHER: "季節・天候",
  };
  return categoryMap[category] || category;
}
