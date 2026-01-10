import { PrismaClient, OrderStatus, Prefecture, FloorArea, CurrentSituation, ConstructionType, DiagnosisStatus, CustomerConstructionType, CustomerStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ランダムな要素を取得するヘルパー関数
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// ランダムな日付を生成（過去30日から未来30日の範囲）
function getRandomDate(daysOffset: number = 30): Date {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * daysOffset * 2) - daysOffset;
  const date = new Date(today);
  date.setDate(date.getDate() + randomDays);
  return date;
}

// ランダムな金額を生成
function getRandomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min) * 10000;
}

async function main() {
  console.log('🌱 注文データのシードを開始...');

  // パートナーアカウントを作成
  const partnerPassword = await bcrypt.hash('partner123', 12);

  const partners = [];
  const partnerNames = [
    { company: '東京塗装株式会社', username: 'tokyo_paint', email: 'tokyo@paint.co.jp' },
    { company: '大阪外壁工業', username: 'osaka_wall', email: 'osaka@wall.co.jp' },
    { company: '横浜リフォームセンター', username: 'yokohama_reform', email: 'yokohama@reform.co.jp' },
    { company: '名古屋建装', username: 'nagoya_kensou', email: 'nagoya@kensou.co.jp' },
    { company: '福岡外装サービス', username: 'fukuoka_gaisou', email: 'fukuoka@gaisou.co.jp' },
  ];

  for (const { company, username, email } of partnerNames) {
    const partner = await prisma.partners.upsert({
      where: { username },
      update: {},
      create: {
        username,
        login_email: email,
        password_hash: partnerPassword,
        is_active: true,
        updated_at: new Date(),
        partner_details: {
          create: {
            company_name: company,
            phone_number: `0${Math.floor(Math.random() * 9 + 1)}0-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
            address: `${getRandomElement(Object.values(Prefecture))}サンプル市サンプル町1-2-3`,
            representative_name: `代表${Math.floor(Math.random() * 1000)}`,
            business_description: `${company}は高品質な外壁塗装サービスを提供しています。`,
            appeal_text: '確かな技術と豊富な実績で、お客様のご要望にお応えします。',
            partners_status: 'ACTIVE',
            updated_at: new Date(),
          }
        }
      },
    });
    partners.push(partner);
  }

  console.log(`✅ ${partners.length}件のパートナーを作成しました`);

  // 顧客データと注文データを作成
  const orderStatuses = Object.values(OrderStatus);
  const prefectures = Object.values(Prefecture);
  const floorAreas = Object.values(FloorArea);
  const currentSituations = Object.values(CurrentSituation);
  const constructionTypes = Object.values(ConstructionType);
  const customerConstructionTypes = Object.values(CustomerConstructionType);

  const numberOfOrders = 50; // 作成する注文数

  for (let i = 0; i < numberOfOrders; i++) {
    const partner = getRandomElement(partners);
    const orderStatus = getRandomElement(orderStatuses);
    const constructionType = getRandomElement(customerConstructionTypes);
    const prefecture = getRandomElement(prefectures);

    // 注文日（過去60日以内）
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 60));

    // 工事開始日・完了日を設定（ステータスに応じて）
    let constructionStartDate: Date | null = null;
    let constructionEndDate: Date | null = null;
    let completionDate: Date | null = null;

    if (orderStatus !== 'ORDERED') {
      constructionStartDate = new Date(orderDate);
      constructionStartDate.setDate(constructionStartDate.getDate() + Math.floor(Math.random() * 10 + 5));
    }

    if (orderStatus === 'IN_PROGRESS') {
      constructionEndDate = new Date(constructionStartDate!);
      constructionEndDate.setDate(constructionEndDate.getDate() + Math.floor(Math.random() * 20 + 10));
    }

    if (orderStatus === 'COMPLETED' || orderStatus === 'REVIEW_COMPLETED') {
      constructionEndDate = new Date(constructionStartDate!);
      constructionEndDate.setDate(constructionEndDate.getDate() + Math.floor(Math.random() * 15 + 7));
      completionDate = new Date(constructionEndDate);
      completionDate.setDate(completionDate.getDate() + Math.floor(Math.random() * 3 + 1));
    }

    // 顧客を作成
    const customer = await prisma.customers.create({
      data: {
        partner_id: partner.id,
        customer_name: `顧客${String(i + 1).padStart(3, '0')}`,
        customer_phone: `090-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        customer_email: `customer${i + 1}@example.com`,
        construction_address: `${prefecture}サンプル市サンプル町${Math.floor(Math.random() * 100 + 1)}-${Math.floor(Math.random() * 20 + 1)}-${Math.floor(Math.random() * 20 + 1)}`,
        customer_construction_type: constructionType,
        construction_amount: getRandomAmount(80, 300),
        construction_completed_at: completionDate,
        customer_status: orderStatus === 'ORDERED' ? 'ORDERED' :
                        orderStatus === 'IN_PROGRESS' ? 'IN_PROGRESS' :
                        orderStatus === 'COMPLETED' ? 'COMPLETED' :
                        orderStatus === 'REVIEW_COMPLETED' ? 'REVIEW_COMPLETED' : 'ORDERED',
        customer_completion_date: completionDate,
        updated_at: new Date(),
      }
    });

    // 診断依頼を作成
    const diagnosisRequest = await prisma.diagnosis_requests.create({
      data: {
        diagnosis_number: `D${String(i + 1).padStart(6, '0')}`,
        customer_id: customer.id,
        prefecture,
        floor_area: getRandomElement(floorAreas),
        current_situation: getRandomElement(currentSituations),
        construction_type: getRandomElement(constructionTypes),
        status: 'DECIDED',
        updated_at: new Date(),
      }
    });

    // 見積もりを作成（選択されたもの）
    const quotation = await prisma.quotations.create({
      data: {
        diagnosis_request_id: diagnosisRequest.id,
        partner_id: partner.id,
        quotation_amount: customer.construction_amount,
        appeal_text: '高品質な施工をお約束いたします。お客様のご要望に丁寧にお応えします。',
        is_selected: true,
        updated_at: new Date(),
      }
    });

    // 注文を作成
    await prisma.orders.create({
      data: {
        quotation_id: quotation.id,
        partner_memo: i % 3 === 0 ? '順調に進んでいます' : undefined,
        admin_memo: i % 5 === 0 ? '要確認案件' : undefined,
        construction_start_date: constructionStartDate,
        construction_end_date: constructionEndDate,
        order_status: orderStatus,
        order_date: orderDate,
        completion_date: completionDate,
        updated_at: new Date(),
      }
    });

    if ((i + 1) % 10 === 0) {
      console.log(`📝 ${i + 1}/${numberOfOrders} 件の注文データを作成中...`);
    }
  }

  console.log(`✅ ${numberOfOrders}件の注文データを作成しました`);
  console.log('\n📊 ステータス別の内訳:');

  for (const status of orderStatuses) {
    const count = await prisma.orders.count({
      where: { order_status: status }
    });
    console.log(`  - ${status}: ${count}件`);
  }

  console.log('\n🎉 シード完了!');
  console.log('\n💡 パートナーログイン情報:');
  console.log('┌─────────────────────┬──────────────────────┬─────────────┐');
  console.log('│ ユーザー名          │ メールアドレス       │ パスワード  │');
  console.log('├─────────────────────┼──────────────────────┼─────────────┤');
  for (const { username, email } of partnerNames) {
    console.log(`│ ${username.padEnd(19)} │ ${email.padEnd(20)} │ partner123  │`);
  }
  console.log('└─────────────────────┴──────────────────────┴─────────────┘');
}

main()
  .catch((e) => {
    console.error('❌ シードエラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });