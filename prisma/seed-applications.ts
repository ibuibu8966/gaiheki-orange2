import { PrismaClient, ApplicationStatus, Prefecture } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting applications seed...');

  // 管理者を取得
  const admin = await prisma.admin.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  if (!admin) {
    console.error('❌ 管理者が見つかりません。先に seed.ts を実行してください。');
    process.exit(1);
  }

  // デモ申請データ
  const applications = [
    {
      company_name: '東京塗装工業株式会社',
      representative_name: '山田太郎',
      address: '東京都渋谷区道玄坂1-2-3 渋谷ビル5F',
      phone_number: '03-1234-5678',
      email: 'info@tokyo-tosou.co.jp',
      website_url: 'https://www.tokyo-tosou.co.jp',
      business_description: '外壁塗装・屋根塗装を中心に、住宅リフォーム全般を手掛けております。創業30年の実績と経験を活かし、お客様に最適な施工プランをご提案いたします。',
      self_pr: '自社職人による高品質な施工と、アフターフォローの充実が強みです。年間施工実績200件以上、お客様満足度98%を誇ります。',
      application_status: ApplicationStatus.APPROVED,
      admin_memo: '実績豊富で信頼できる業者。積極的に紹介したい。',
      review_notes: '書類審査、実績確認完了。問題なし。',
      reviewed_by: admin.id,
      reviewed_at: new Date('2025-01-15T10:30:00'),
      updated_at: new Date('2025-01-15T10:30:00'),
      prefectures: [Prefecture.Tokyo, Prefecture.Kanagawa, Prefecture.Saitama]
    },
    {
      company_name: '大阪リフォームサービス',
      representative_name: '田中花子',
      address: '大阪府大阪市北区梅田2-4-9 梅田ゲートタワー10F',
      phone_number: '06-9876-5432',
      email: 'contact@osaka-reform.jp',
      website_url: 'https://www.osaka-reform.jp',
      business_description: '大阪を中心に、外壁・屋根塗装、防水工事を専門としています。最新の塗装技術と高品質な塗料を使用し、長持ちする施工を提供します。',
      self_pr: '無料診断・見積もりはもちろん、カラーシミュレーションも実施。お客様のイメージを形にします。',
      application_status: ApplicationStatus.UNDER_REVIEW,
      admin_memo: null,
      review_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      updated_at: new Date('2025-02-08T09:00:00'),
      prefectures: [Prefecture.Osaka, Prefecture.Hyogo, Prefecture.Kyoto]
    },
    {
      company_name: '横浜ホームペイント',
      representative_name: '佐藤一郎',
      address: '神奈川県横浜市西区みなとみらい3-5-1 横浜ランドマークタワー15F',
      phone_number: '045-123-4567',
      email: 'info@yokohama-paint.com',
      website_url: null,
      business_description: '横浜市を拠点に、戸建て住宅の外壁塗装を専門に行っています。地域密着型のサービスで、きめ細やかな対応を心がけています。',
      self_pr: '地元横浜で15年の実績。ご近所への配慮を徹底し、クレームゼロを継続中です。',
      application_status: ApplicationStatus.APPROVED,
      admin_memo: '地域密着で評判が良い。横浜エリアの案件に優先的に紹介。',
      review_notes: '実績確認済み。対応も丁寧で問題なし。',
      reviewed_by: admin.id,
      reviewed_at: new Date('2025-02-01T14:20:00'),
      updated_at: new Date('2025-02-01T14:20:00'),
      prefectures: [Prefecture.Kanagawa]
    },
    {
      company_name: '名古屋外壁メンテナンス',
      representative_name: '鈴木健太',
      address: '愛知県名古屋市中区栄3-18-1 ナディアパーク8F',
      phone_number: '052-987-6543',
      email: 'support@nagoya-gaiheki.jp',
      website_url: 'https://www.nagoya-gaiheki.jp',
      business_description: '名古屋市内を中心に、外壁塗装・防水工事・屋根リフォームを手掛けています。一級塗装技能士が在籍し、高品質な仕上がりをお約束します。',
      self_pr: '最長15年保証で安心。施工後の定期点検も実施しています。',
      application_status: ApplicationStatus.REJECTED,
      admin_memo: '過去にクレームあり。現時点では提携見送り。',
      review_notes: '顧客からのクレーム履歴を確認。改善が見られるまで保留。',
      reviewed_by: admin.id,
      reviewed_at: new Date('2025-01-20T16:45:00'),
      updated_at: new Date('2025-01-20T16:45:00'),
      prefectures: [Prefecture.Aichi, Prefecture.Gifu]
    },
    {
      company_name: '福岡ペイントプロ',
      representative_name: '高橋美咲',
      address: '福岡県福岡市博多区博多駅前2-19-24 博多大博ビル7F',
      phone_number: '092-555-7890',
      email: 'contact@fukuoka-paintpro.com',
      website_url: 'https://www.fukuoka-paintpro.com',
      business_description: '福岡県内全域対応可能。外壁塗装、屋根塗装、防水工事のプロフェッショナル集団です。',
      self_pr: 'IoT技術を活用した施工管理システムで、リアルタイムに進捗確認が可能です。',
      application_status: ApplicationStatus.UNDER_REVIEW,
      admin_memo: '新しい技術を導入していて興味深い。実績を確認中。',
      review_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      updated_at: new Date('2025-02-06T11:30:00'),
      prefectures: [Prefecture.Fukuoka, Prefecture.Saga, Prefecture.Kumamoto]
    },
    {
      company_name: '北海道塗装サービス',
      representative_name: '伊藤雄二',
      address: '北海道札幌市中央区北5条西2-5 JRタワーオフィスプラザさっぽろ12F',
      phone_number: '011-234-5678',
      email: 'info@hokkaido-paint.jp',
      website_url: 'https://www.hokkaido-paint.jp',
      business_description: '北海道の厳しい気候に対応した塗装工事が得意です。断熱・防寒対策も万全です。',
      self_pr: '寒冷地特有の施工ノウハウで、長期間建物を保護します。冬季施工も対応可能。',
      application_status: ApplicationStatus.APPROVED,
      admin_memo: '北海道エリアでは貴重な業者。積極的に活用したい。',
      review_notes: '寒冷地施工の実績豊富。特殊な技術を持っている。',
      reviewed_by: admin.id,
      reviewed_at: new Date('2025-01-25T11:00:00'),
      updated_at: new Date('2025-01-25T11:00:00'),
      prefectures: [Prefecture.Hokkaido]
    },
    {
      company_name: 'ペイントスタジオ沖縄',
      representative_name: '仲村健',
      address: '沖縄県那覇市おもろまち1-3-31 那覇新都心メディアビル6F',
      phone_number: '098-876-5432',
      email: 'info@paintstudio-okinawa.jp',
      website_url: null,
      business_description: '沖縄の高温多湿な環境に適した塗装を提供。塩害対策も万全です。',
      self_pr: '海辺の建物の塗装実績多数。耐久性の高い塗料選定に自信があります。',
      application_status: ApplicationStatus.UNDER_REVIEW,
      admin_memo: null,
      review_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      updated_at: new Date('2025-02-07T15:00:00'),
      prefectures: [Prefecture.Okinawa]
    },
    {
      company_name: '仙台ホームリノベーション',
      representative_name: '佐々木翔太',
      address: '宮城県仙台市青葉区中央1-2-3 仙台トラストタワー18F',
      phone_number: '022-345-6789',
      email: 'info@sendai-renovation.jp',
      website_url: 'https://www.sendai-renovation.jp',
      business_description: '東北地方を中心に、住宅リフォーム全般を手掛けています。外壁塗装は特に力を入れている分野です。',
      self_pr: '震災復興支援から始まった会社です。地域への恩返しの気持ちで丁寧な仕事を心がけています。',
      application_status: ApplicationStatus.APPROVED,
      admin_memo: '社会的責任を果たしている優良企業。信頼できる。',
      review_notes: '実績、評判ともに問題なし。',
      reviewed_by: admin.id,
      reviewed_at: new Date('2025-02-05T09:15:00'),
      updated_at: new Date('2025-02-05T09:15:00'),
      prefectures: [Prefecture.Miyagi, Prefecture.Fukushima, Prefecture.Yamagata]
    }
  ];

  // データ挿入
  for (const app of applications) {
    const { prefectures, ...applicationData } = app;

    // 既存データをチェック
    const existing = await prisma.partner_applications.findFirst({
      where: { email: applicationData.email }
    });

    if (existing) {
      console.log(`⏭️  ${applicationData.company_name} は既に存在します。スキップします。`);
      continue;
    }

    const application = await prisma.partner_applications.create({
      data: applicationData
    });

    // 対応都道府県を追加
    for (const prefecture of prefectures) {
      await prisma.partner_application_prefectures.upsert({
        where: {
          partner_id_supported_prefecture: {
            partner_id: application.id,
            supported_prefecture: prefecture
          }
        },
        update: {},
        create: {
          partner_id: application.id,
          supported_prefecture: prefecture
        }
      });
    }

    console.log(`✅ ${application.company_name} を登録しました (ステータス: ${application.application_status})`);
  }

  console.log('🎉 Applications seed完了!');
  console.log(`\n📊 統計:`);
  console.log(`- 承認済み: ${applications.filter(a => a.application_status === ApplicationStatus.APPROVED).length}件`);
  console.log(`- 審査中: ${applications.filter(a => a.application_status === ApplicationStatus.UNDER_REVIEW).length}件`);
  console.log(`- 却下: ${applications.filter(a => a.application_status === ApplicationStatus.REJECTED).length}件`);
}

main()
  .catch((e) => {
    console.error('❌ Seedエラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
