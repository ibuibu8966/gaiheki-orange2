import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('評価完了案件を確認します...\n');

  try {
    // 評価完了（COMPLETED + レビューあり）の案件を取得
    const orders = await prisma.orders.findMany({
      where: {
        order_status: 'COMPLETED',
        quotations: {
          diagnosis_requests: {
            customers: {
              customer_rating: {
                not: null
              }
            }
          }
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
                    customer_rating: true,
                    customer_review_date: true
                  }
                },
                designated_partner: {
                  select: {
                    id: true,
                    company_name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log(`評価完了案件: 全${orders.length}件\n`);

    orders.forEach(order => {
      const diagnosis = order.quotations.diagnosis_requests;
      const customer = diagnosis.customers;
      const partner = diagnosis.designated_partner;

      console.log(`診断ID: ${diagnosis.diagnosis_number}`);
      console.log(`  顧客名: ${customer.customer_name}`);
      console.log(`  評価: ${customer.customer_rating}星`);
      console.log(`  加盟店ID: ${partner?.id} (${partner?.company_name})`);
      console.log(`  レビュー日: ${customer.customer_review_date}`);
      console.log('');
    });

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
