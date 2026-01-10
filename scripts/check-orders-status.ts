import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('案件の状況を確認します...\n');

  try {
    // partner_id = 32の案件を確認
    const orders = await prisma.orders.findMany({
      where: {
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
                customers: {
                  select: {
                    customer_name: true,
                    customer_rating: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log(`加盟店ID 32の案件: 全${orders.length}件\n`);

    const statusCounts: Record<string, number> = {};
    const completedWithReview: number[] = [];
    const completedWithoutReview: number[] = [];

    orders.forEach(order => {
      statusCounts[order.order_status] = (statusCounts[order.order_status] || 0) + 1;

      if (order.order_status === 'COMPLETED') {
        const hasReview = order.quotations.diagnosis_requests.customers.customer_rating !== null;
        if (hasReview) {
          completedWithReview.push(order.id);
        } else {
          completedWithoutReview.push(order.id);
        }
      }
    });

    console.log('ステータス別件数:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}件`);
    });

    console.log(`\n完了済み案件の内訳:`);
    console.log(`  レビュー有り: ${completedWithReview.length}件`);
    console.log(`  レビュー無し: ${completedWithoutReview.length}件`);

    if (completedWithoutReview.length > 0) {
      console.log(`\nレビュー無しの完了案件ID: ${completedWithoutReview.join(', ')}`);
    }

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
