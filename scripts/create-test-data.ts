import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 テストデータを作成中...');

  // 1. テスト用加盟店アカウントを作成
  const passwordHash = await bcrypt.hash('password123', 12);

  const partner = await prisma.partners.upsert({
    where: { login_email: 'test@partner.com' },
    update: {},
    create: {
      username: 'test_partner',
      login_email: 'test@partner.com',
      password_hash: passwordHash,
      is_active: true,
      fee_plan_id: 1, // スタンダードプラン
      updated_at: new Date(),
    },
  });

  console.log('✅ テスト用加盟店を作成しました:', {
    id: partner.id,
    username: partner.username,
    email: partner.login_email,
  });

  // 2. 加盟店詳細を作成
  const partnerDetail = await prisma.partner_details.upsert({
    where: { partner_id: partner.id },
    update: {},
    create: {
      partner_id: partner.id,
      company_name: 'テスト塗装株式会社',
      phone_number: '03-1234-5678',
      address: '東京都渋谷区テスト1-2-3',
      representative_name: 'テスト 太郎',
      business_description: 'テスト用の加盟店です',
      appeal_text: 'テストデータとして作成されました',
      partners_status: 'ACTIVE',
      updated_at: new Date(),
    },
  });

  console.log('✅ 加盟店詳細を作成しました');

  // 3. テスト用顧客を作成
  const customer = await prisma.customers.create({
    data: {
      partner_id: partner.id,
      customer_name: '山田太郎',
      customer_phone: '090-1234-5678',
      customer_email: 'yamada@example.com',
      construction_address: '東京都新宿区西新宿1-1-1',
      customer_construction_type: 'EXTERIOR_AND_ROOF',
      construction_amount: 2500000,
      customer_status: 'ORDERED',
      updated_at: new Date(),
    },
  });

  console.log('✅ テスト用顧客を作成しました:', {
    id: customer.id,
    name: customer.customer_name,
  });

  // 4. 診断依頼を作成
  const diagnosisRequest = await prisma.diagnosis_requests.create({
    data: {
      diagnosis_number: `TEST-${Date.now()}`,
      customer_id: customer.id,
      designated_partner_id: partner.id,
      prefecture: 'Tokyo',
      floor_area: 'FROM_101_TO_120',
      current_situation: 'READY_TO_ORDER',
      construction_type: 'EXTERIOR_AND_ROOF',
      status: 'DECIDED',
      updated_at: new Date(),
    },
  });

  console.log('✅ 診断依頼を作成しました:', {
    id: diagnosisRequest.id,
    number: diagnosisRequest.diagnosis_number,
  });

  // 5. 見積もりを作成
  const quotation = await prisma.quotations.create({
    data: {
      diagnosis_request_id: diagnosisRequest.id,
      partner_id: partner.id,
      quotation_amount: 2500000,
      appeal_text: 'テスト用の見積もりです',
      is_selected: true,
      updated_at: new Date(),
    },
  });

  console.log('✅ 見積もりを作成しました:', {
    id: quotation.id,
    amount: quotation.quotation_amount,
  });

  // 6. 受注を作成
  const order = await prisma.orders.create({
    data: {
      quotation_id: quotation.id,
      construction_amount: 2500000,
      construction_start_date: new Date('2025-01-10'),
      construction_end_date: new Date('2025-02-28'),
      order_status: 'COMPLETED',
      order_date: new Date('2025-01-01'),
      completion_date: new Date('2025-02-28'),
      updated_at: new Date(),
    },
  });

  console.log('✅ 受注を作成しました:', {
    id: order.id,
    status: order.order_status,
  });

  console.log('\n🎉 テストデータの作成完了!');
  console.log('\n📋 作成されたデータ:');
  console.log('┌─────────────────┬────────────────────────────────────┐');
  console.log('│ 項目            │ 値                                 │');
  console.log('├─────────────────┼────────────────────────────────────┤');
  console.log(`│ 加盟店ID        │ ${partner.id.toString().padEnd(34)} │`);
  console.log(`│ ログインメール  │ test@partner.com${' '.repeat(16)} │`);
  console.log(`│ パスワード      │ password123${' '.repeat(21)} │`);
  console.log(`│ 顧客ID          │ ${customer.id.toString().padEnd(34)} │`);
  console.log(`│ 受注ID          │ ${order.id.toString().padEnd(34)} │`);
  console.log('└─────────────────┴────────────────────────────────────┘');
  console.log('\n次のステップ:');
  console.log('1. 加盟店としてログイン: POST /api/partner/login');
  console.log('2. ダッシュボード確認: GET /api/partner/dashboard');
  console.log(`3. 請求書作成: POST /api/partner/invoices (order_id: ${order.id})`);
}

main()
  .catch((e) => {
    console.error('❌ エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
