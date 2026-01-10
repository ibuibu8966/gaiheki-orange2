import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: コラム記事一覧取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const published = searchParams.get('published');
    const search = searchParams.get('search');

    const where: any = {};

    // カテゴリフィルター
    if (category && category !== 'all') {
      where.category = category;
    }

    // 公開状態フィルター
    if (published === 'true') {
      where.is_published = true;
    } else if (published === 'false') {
      where.is_published = false;
    }

    // 検索条件
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { post_name: { contains: search, mode: 'insensitive' } }
      ];
    }

    const articles = await prisma.articles.findMany({
      where,
      include: {
        admins: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: [
        { sort_order: 'asc' },
        { created_at: 'desc' }
      ]
    });

    const formattedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      thumbnailImage: article.thumbnail_image,
      category: article.category,
      categoryLabel: getCategoryLabel(article.category),
      content: article.content,
      isPublished: article.is_published,
      publishStatus: article.is_published ? '公開' : '下書き',
      sortOrder: article.sort_order,
      postName: article.post_name,
      author: article.admins.username,
      authorEmail: article.admins.email,
      createdAt: article.created_at.toISOString(),
      createdDate: article.created_at.toISOString().split('T')[0],
      updatedAt: article.updated_at.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: formattedArticles,
      count: formattedArticles.length
    });

  } catch (error) {
    console.error('Articles fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch articles',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: 新規記事作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      adminId,
      title,
      thumbnailImage,
      category,
      content,
      isPublished,
      sortOrder,
      postName
    } = body;

    if (!adminId || !title || !category || !content || !postName) {
      return NextResponse.json(
        { success: false, error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    const newArticle = await prisma.articles.create({
      data: {
        admin_id: adminId,
        title,
        thumbnail_image: thumbnailImage,
        category,
        content,
        is_published: isPublished || false,
        sort_order: sortOrder || 0,
        post_name: postName,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newArticle.id,
        title: newArticle.title,
        postName: newArticle.post_name
      }
    });

  } catch (error) {
    console.error('Article creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create article',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH: 記事更新
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { articleId, ...updateData } = body;

    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 }
      );
    }

    const updatedArticle = await prisma.articles.update({
      where: { id: articleId },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedArticle.id,
        title: updatedArticle.title
      }
    });

  } catch (error) {
    console.error('Article update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update article',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: 記事削除
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');

    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 }
      );
    }

    await prisma.articles.delete({
      where: { id: parseInt(articleId) }
    });

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Article deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete article',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    BASIC_KNOWLEDGE: '基礎知識',
    PAINT_TYPES: '塗料の種類',
    CASE_STUDIES: '施工事例',
    MAINTENANCE: 'メンテナンス',
    CONTRACTOR_SELECTION: '業者選び',
    COST_ESTIMATE: '費用・見積もり',
    TROUBLESHOOTING: 'トラブル対策',
    SEASONAL_WEATHER: '季節・天候'
  };
  return labels[category] || category;
}
