import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 過去6ヶ月分のテストデータを作成中...');

  // 追加の加盟店を作成
  const partner1 = await prisma.partners.upsert({
    where: { login_email: 'historical1@partner.com' },
    update: {},
    create: {
      username: 'historical_partner_1',
      login_email: 'historical1@partner.com',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5isl/IVTx6WPO', // password123
      is_active: true,
      fee_plan_id: 1,
      created_at: new Date('2024-11-01'),
      updated_at: new Date(),
    },
  });

  const partner2 = await prisma.partners.upsert({
    where: { login_email: 'historical2@partner.com' },
    update: {},
    create: {
      username: 'historical_partner_2',
      login_email: 'historical2@partner.com',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5isl/IVTx6WPO', // password123
      is_active: true,
      fee_plan_id: 1,
      created_at: new Date('2025-03-15'),
      updated_at: new Date(),
    },
  });

  console.log('✅ 加盟店を作成しました');

  // 加盟店詳細を作成
  await prisma.partner_details.upsert({
    where: { partner_id: partner1.id },
    update: {},
    create: {
      partner_id: partner1.id,
      company_name: '大阪塗装工業株式会社',
      phone_number: '06-1234-5678',
      address: '大阪府大阪市北区梅田1-1-1',
      representative_name: '田中 一郎',
      business_description: '高品質な外壁塗装サービスを提供しています',
      appeal_text: '丁寧な仕事が自慢です',
      partners_status: 'ACTIVE',
      updated_at: new Date(),
    },
  });

  await prisma.partner_details.upsert({
    where: { partner_id: partner2.id },
    update: {},
    create: {
      partner_id: partner2.id,
      company_name: '東京外壁プロ',
      phone_number: '03-9876-5432',
      address: '東京都千代田区丸の内1-1-1',
      representative_name: '鈴木 次郎',
      business_description: '高品質な外壁塗装サービスを提供しています',
      appeal_text: '丁寧な仕事が自慢です',
      partners_status: 'ACTIVE',
      updated_at: new Date(),
    },
  });

  console.log('✅ 加盟店詳細を作成しました');

  // 既存の加盟店を取得
  const existingPartner = await prisma.partners.findFirst({
    where: { login_email: 'test@partner.com' },
  });

  const partners = [existingPartner, partner1, partner2].filter(Boolean);

  console.log(`✅ ${partners.length}店舗の加盟店でデータを作成します`);

  // 過去6ヶ月分のデータを作成
  const now = new Date();
  let customerCounter = 1000;

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0);

    console.log(`\n📅 ${monthStart.getFullYear()}/${monthStart.getMonth() + 1}月のデータを作成中...`);

    for (const partner of partners) {
      if (!partner) continue;

      // 月ごとに見積数を変動させる（5-10件）
      const quotationsCount = 5 + Math.floor(Math.random() * 6);

      for (let i = 0; i < quotationsCount; i++) {
        // 見積作成日：その月の1-28日のランダムな日
        const quotationDate = new Date(
          monthStart.getFullYear(),
          monthStart.getMonth(),
          1 + Math.floor(Math.random() * 27),
          Math.floor(Math.random() * 24),
          Math.floor(Math.random() * 60)
        );

        // 見積金額：150万〜500万円
        const quotationAmount = 1500000 + Math.floor(Math.random() * 3500000);

        // 顧客作成
        const customer = await prisma.customers.create({
          data: {
            partner_id: partner.id,
            customer_name: `顧客${customerCounter}様`,
            customer_phone: `090-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
            customer_email: `customer${customerCounter}@example.com`,
            construction_address: ['東京都新宿区', '大阪府大阪市', '神奈川県横浜市'][Math.floor(Math.random() * 3)] + `${Math.floor(Math.random() * 9 + 1)}-${Math.floor(Math.random() * 9 + 1)}-${Math.floor(Math.random() * 9 + 1)}`,
            customer_construction_type: ['EXTERIOR_PAINTING', 'ROOF_PAINTING', 'EXTERIOR_AND_ROOF'][Math.floor(Math.random() * 3)] as any,
            construction_amount: quotationAmount,
            customer_status: Math.random() < 0.6 ? (Math.random() < 0.7 ? 'COMPLETED' : 'ORDERED') : 'ORDERED' as any,
            created_at: quotationDate,
            updated_at: quotationDate,
          },
        });

        customerCounter++;

        // 診断依頼作成
        const diagnosisRequest = await prisma.diagnosis_requests.create({
          data: {
            diagnosis_number: `D-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            customer_id: customer.id,
            designated_partner_id: partner.id,
            prefecture: ['Tokyo', 'Osaka', 'Kanagawa'][Math.floor(Math.random() * 3)] as any,
            floor_area: ['FROM_80_TO_100', 'FROM_101_TO_120', 'FROM_121_TO_140', 'FROM_141_TO_160'][Math.floor(Math.random() * 4)] as any,
            current_situation: 'READY_TO_ORDER',
            construction_type: ['EXTERIOR_PAINTING', 'ROOF_PAINTING', 'EXTERIOR_AND_ROOF'][Math.floor(Math.random() * 3)] as any,
            status: 'DECIDED',
            created_at: new Date(quotationDate.getTime() - 86400000),
            updated_at: new Date(quotationDate.getTime() - 86400000),
          },
        });

        // 見積作成
        const quotation = await prisma.quotations.create({
          data: {
            diagnosis_request_id: diagnosisRequest.id,
            partner_id: partner.id,
            quotation_amount: quotationAmount,
            appeal_text: '丁寧な施工でお客様にご満足いただけるよう努めます',
            is_selected: true,
            created_at: quotationDate,
            updated_at: quotationDate,
          },
        });

        // 受注するかどうか（60%の確率）
        if (Math.random() < 0.6) {
          // 受注日：見積から1-14日後（次の月にまたがる場合もある）
          const orderDate = new Date(quotationDate.getTime() + (1 + Math.floor(Math.random() * 14)) * 86400000);

          // 受注作成
          const order = await prisma.orders.create({
            data: {
              quotation_id: quotation.id,
              order_status: Math.random() < 0.7 ? 'COMPLETED' : 'IN_PROGRESS' as any,
              order_date: orderDate,
              construction_start_date: new Date(orderDate.getTime() + 3 * 86400000),
              construction_end_date: new Date(orderDate.getTime() + 14 * 86400000),
              construction_amount: quotationAmount,
              created_at: orderDate,
              updated_at: orderDate,
            },
          });

          // 完了するかどうか（70%の確率）
          if (Math.random() < 0.7) {
            // 完了日：受注から7-21日後
            const completionDate = new Date(orderDate.getTime() + (7 + Math.floor(Math.random() * 15)) * 86400000);

            // 注文を完了状態に更新
            await prisma.orders.update({
              where: { id: order.id },
              data: {
                order_status: 'COMPLETED',
                completion_date: completionDate,
                updated_at: completionDate,
              },
            });

            // 顧客請求書作成
            const dueDate = new Date(completionDate.getTime() + 30 * 86400000); // 30日後
            const isPaid = Math.random() < 0.7;
            await prisma.customer_invoices.create({
              data: {
                order_id: order.id,
                invoice_number: `INV-${completionDate.getFullYear()}${String(completionDate.getMonth() + 1).padStart(2, '0')}${String(completionDate.getDate()).padStart(2, '0')}-${String(order.id).padStart(6, '0')}`,
                issue_date: completionDate,
                due_date: dueDate,
                total_amount: quotationAmount,
                tax_amount: Math.floor(quotationAmount * 0.1),
                grand_total: Math.floor(quotationAmount * 1.1),
                status: isPaid ? 'PAID' : 'UNPAID' as any,
                payment_date: isPaid ? dueDate : null,
                created_at: completionDate,
                updated_at: completionDate,
              },
            });
          }
        }
      }

      console.log(`  ✅ ${partner.login_email}: ${quotationsCount}件の見積を作成`);
    }
  }

  console.log('\n🎉 過去データの作成が完了しました！');
  console.log('\n📊 データ確認用クエリを実行中...');

  // 月次データを確認
  const monthlyData = await prisma.$queryRaw<any[]>`
    SELECT
      TO_CHAR(q.created_at, 'YYYY/MM') AS month,
      COUNT(DISTINCT q.id) AS quotations,
      COUNT(DISTINCT o.id) FILTER (WHERE o.order_date IS NOT NULL) AS orders,
      COUNT(DISTINCT o.id) FILTER (WHERE o.order_status IN ('COMPLETED', 'REVIEW_COMPLETED')) AS completed,
      COALESCE(SUM(ci.grand_total), 0) AS total_revenue
    FROM quotations q
    LEFT JOIN orders o ON q.id = o.quotation_id
    LEFT JOIN customer_invoices ci ON o.id = ci.order_id
    WHERE q.created_at >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY TO_CHAR(q.created_at, 'YYYY/MM')
    ORDER BY month
  `;

  console.table(monthlyData);
}

main()
  .catch((e) => {
    console.error('❌ エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
