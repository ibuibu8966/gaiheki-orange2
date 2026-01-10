import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding inquiries...');

  // 既存の顧客を取得
  const customers = await prisma.customers.findMany({
    take: 5,
  });

  if (customers.length === 0) {
    console.log('No customers found. Please seed customers first.');
    return;
  }

  const now = new Date();

  // 問い合わせサンプルデータ
  const inquiries = [
    {
      customer_id: customers[0].id,
      subject: '外壁塗装の見積もりについて',
      inquiry_content: '外壁塗装の見積もりをお願いしたいのですが、どのような流れになりますか？また、費用の目安を教えていただけますでしょうか。',
      inquiry_status: 'PENDING' as const,
      admin_memo: null,
      updated_at: now,
    },
    {
      customer_id: customers[1]?.id || customers[0].id,
      subject: '屋根の修理について相談',
      inquiry_content: '屋根に雨漏りがあり、修理をお願いしたいです。どのくらいの期間で対応可能でしょうか？',
      inquiry_status: 'IN_PROGRESS' as const,
      admin_memo: '担当者から連絡済み。現地調査日程調整中。',
      updated_at: now,
    },
    {
      customer_id: customers[2]?.id || customers[0].id,
      subject: '防水工事の相談',
      inquiry_content: 'ベランダの防水工事を検討しています。見積もりをお願いできますか？',
      inquiry_status: 'PENDING' as const,
      admin_memo: null,
      updated_at: now,
    },
    {
      customer_id: customers[3]?.id || customers[0].id,
      subject: '施工後のアフターサービスについて',
      inquiry_content: '先月施工していただいた外壁塗装ですが、一部気になる箇所があります。確認していただけますか？',
      inquiry_status: 'IN_PROGRESS' as const,
      admin_memo: '加盟店に連絡済み。来週訪問予定。',
      updated_at: now,
    },
    {
      customer_id: customers[4]?.id || customers[0].id,
      subject: '塗装の色について',
      inquiry_content: '外壁塗装の色で迷っています。サンプルを見せていただくことは可能でしょうか？',
      inquiry_status: 'COMPLETED' as const,
      admin_memo: 'カタログ送付済み。顧客了承。',
      updated_at: now,
    },
    {
      customer_id: customers[0].id,
      subject: '見積もり内容の確認',
      inquiry_content: '先日いただいた見積もりの内容について、いくつか質問があります。電話で相談させていただけますか？',
      inquiry_status: 'COMPLETED' as const,
      admin_memo: '電話対応完了。見積もり内容説明済み。',
      updated_at: now,
    },
    {
      customer_id: customers[1]?.id || customers[0].id,
      subject: '施工日程の変更について',
      inquiry_content: '予定していた施工日程を変更したいのですが、可能でしょうか？',
      inquiry_status: 'IN_PROGRESS' as const,
      admin_memo: '加盟店と調整中。',
      updated_at: now,
    },
    {
      customer_id: customers[2]?.id || customers[0].id,
      subject: '追加工事の相談',
      inquiry_content: '現在進行中の外壁塗装に加えて、屋根の塗装も検討しています。追加で対応可能でしょうか？',
      inquiry_status: 'PENDING' as const,
      admin_memo: null,
      updated_at: now,
    },
  ];

  // 問い合わせを作成
  for (const inquiry of inquiries) {
    await prisma.inquiries.create({
      data: inquiry,
    });
  }

  console.log(`Created ${inquiries.length} inquiries`);
  console.log('Seeding inquiries completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
