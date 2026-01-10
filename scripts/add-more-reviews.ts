import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('追加のレビューデータを作成します...\n');

  try {
    // partner_id = 32のORDERED案件を取得
    const inProgressOrders = await prisma.orders.findMany({
      where: {
        order_status: 'ORDERED',
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
      take: 4 // 4件追加して合計5件のレビューにする
    });

    if (inProgressOrders.length === 0) {
      console.log('施工中の案件が見つかりませんでした。');
      return;
    }

    console.log(`${inProgressOrders.length}件の案件を完了にしてレビューを追加します...\n`);

    // レビューデータ
    const reviewData = [
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

    // 各案件を完了にしてレビューを追加
    for (let i = 0; i < inProgressOrders.length && i < reviewData.length; i++) {
      const order = inProgressOrders[i];
      const review = reviewData[i];
      const customer = order.quotations.diagnosis_requests.customers;

      // 案件を完了状態に更新
      await prisma.orders.update({
        where: { id: order.id },
        data: {
          order_status: 'COMPLETED',
          completion_date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // 過去60日以内のランダムな日付
          updated_at: new Date()
        }
      });

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

    console.log('\n追加のレビューデータの作成が完了しました！');
    console.log(`合計レビュー件数: ${inProgressOrders.length + 1}件`);
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
