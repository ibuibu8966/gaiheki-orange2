import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('指定された診断IDにレビューを追加します...\n');

  const diagnosisNumbers = ['D000028', 'D000019', 'D000004'];

  const reviewData = [
    {
      rating: 5,
      title: '素晴らしい仕上がりです',
      comment: '外壁が見違えるようにきれいになりました。職人さんの技術力の高さを感じました。また次回もお願いしたいです。',
    },
    {
      rating: 4,
      title: '満足しています',
      comment: '丁寧な説明と作業で安心してお任せできました。仕上がりも良く、満足しています。',
    },
    {
      rating: 5,
      title: '期待以上でした',
      comment: '見積もりから施工まで、とても親切に対応していただきました。仕上がりも期待以上で大変満足しています。',
    },
  ];

  try {
    for (let i = 0; i < diagnosisNumbers.length; i++) {
      const diagnosisNumber = diagnosisNumbers[i];
      const review = reviewData[i];

      // 診断リクエストを取得
      const diagnosis = await prisma.diagnosis_requests.findFirst({
        where: {
          diagnosis_number: diagnosisNumber
        },
        include: {
          customers: true,
          quotations: {
            where: {
              is_selected: true
            },
            include: {
              orders: true
            }
          }
        }
      });

      if (!diagnosis) {
        console.log(`⚠ ${diagnosisNumber} が見つかりませんでした`);
        continue;
      }

      const customer = diagnosis.customers;
      const selectedQuotation = diagnosis.quotations.find(q => q.is_selected);

      if (!selectedQuotation) {
        console.log(`⚠ ${diagnosisNumber} に選択された見積もりがありません`);
        continue;
      }

      const order = selectedQuotation.orders;

      if (!order) {
        console.log(`⚠ ${diagnosisNumber} に注文がありません`);
        continue;
      }

      // 注文を完了状態に更新
      await prisma.orders.update({
        where: { id: order.id },
        data: {
          order_status: 'COMPLETED',
          completion_date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
          updated_at: new Date()
        }
      });

      // 顧客にレビューを追加
      await prisma.customers.update({
        where: { id: customer.id },
        data: {
          customer_rating: review.rating,
          customer_review_title: review.title,
          customer_review: review.comment,
          customer_review_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          updated_at: new Date()
        }
      });

      console.log(`✓ ${diagnosisNumber} (${customer.customer_name}様) にレビューを追加しました（評価: ${review.rating}星）`);
    }

    console.log('\nレビューの追加が完了しました！');
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
