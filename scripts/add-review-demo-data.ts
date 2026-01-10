import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('レビューデモデータの追加を開始します...');

  try {
    // 既存の完了済み案件を取得（partner_id = 32）
    const completedOrders = await prisma.orders.findMany({
      where: {
        order_status: 'COMPLETED',
        quotations: {
          partner_id: 32,
          is_selected: true
        }
      },
      include: {
        quotations: {
          include: {
            diagnosis_requests: {
              include: {
                customers: true
              }
            }
          }
        }
      },
      take: 5
    });

    if (completedOrders.length === 0) {
      console.log('完了済み案件が見つかりませんでした。');
      return;
    }

    console.log(`${completedOrders.length}件の完了済み案件にレビューを追加します...`);

    // レビューデータ
    const reviewData = [
      {
        rating: 5,
        title: '大変満足しています',
        comment: '職人さんの技術が素晴らしく、仕上がりが予想以上でした。丁寧な作業と綺麗な仕上がりに大変満足しています。また機会があればお願いしたいです。',
      },
      {
        rating: 4,
        title: '良い仕事をしてくれました',
        comment: '工事は順調に進み、仕上がりも良好です。スタッフの対応も親切で安心してお任せできました。少し工期が延びたのが残念でしたが、全体的には満足しています。',
      },
      {
        rating: 5,
        title: 'プロの仕事でした',
        comment: '見積もりから施工まで、すべてにおいてプロフェッショナルな対応でした。説明も分かりやすく、質問にも丁寧に答えてくれました。仕上がりも完璧です。',
      },
      {
        rating: 3,
        title: '普通でした',
        comment: '特に問題はありませんでしたが、期待していたほどではありませんでした。仕上がりは普通です。価格相応だと思います。',
      },
      {
        rating: 5,
        title: '最高の仕上がり',
        comment: '外壁の色も美しく、近所から褒められるほどの仕上がりです。担当者の方も親身になって相談に乗ってくれました。本当にありがとうございました。',
      },
    ];

    // 各案件にレビューを追加
    for (let i = 0; i < completedOrders.length; i++) {
      const order = completedOrders[i];
      const review = reviewData[i];
      const customer = order.quotations.diagnosis_requests.customers;

      // 顧客テーブルにレビュー情報を追加
      await prisma.customers.update({
        where: { id: customer.id },
        data: {
          customer_rating: review.rating,
          customer_review_title: review.title,
          customer_review: review.comment,
          customer_review_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 過去30日以内のランダムな日付
          updated_at: new Date()
        }
      });

      console.log(`✓ ${customer.customer_name}様のレビューを追加しました（評価: ${review.rating}星）`);
    }

    console.log('\nレビューデモデータの追加が完了しました！');
  } catch (error) {
    console.error('エラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
