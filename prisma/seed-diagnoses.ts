import { PrismaClient, Prefecture, FloorArea, CurrentSituation, ConstructionType, DiagnosisStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ランダムな要素を選択
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ランダムな日付を生成（過去90日以内）
function randomDate(daysAgo: number = 90): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

const prefectures = [
  Prefecture.Tokyo, Prefecture.Osaka, Prefecture.Kanagawa, Prefecture.Aichi,
  Prefecture.Saitama, Prefecture.Chiba, Prefecture.Hyogo, Prefecture.Hokkaido,
  Prefecture.Fukuoka, Prefecture.Shizuoka, Prefecture.Hiroshima, Prefecture.Miyagi,
  Prefecture.Kyoto, Prefecture.Niigata, Prefecture.Ibaraki
];

const floorAreas = [
  FloorArea.UNDER_80, FloorArea.FROM_80_TO_100, FloorArea.FROM_101_TO_120,
  FloorArea.FROM_121_TO_140, FloorArea.FROM_141_TO_160, FloorArea.FROM_161_TO_180,
  FloorArea.FROM_181_TO_200, FloorArea.FROM_201_TO_250, FloorArea.FROM_251_TO_300
];

const currentSituations = [
  CurrentSituation.MARKET_RESEARCH, CurrentSituation.CONSIDERING_CONSTRUCTION,
  CurrentSituation.COMPARING_CONTRACTORS, CurrentSituation.READY_TO_ORDER
];

const constructionTypes = [
  ConstructionType.EXTERIOR_PAINTING, ConstructionType.ROOF_PAINTING,
  ConstructionType.EXTERIOR_AND_ROOF, ConstructionType.PARTIAL_REPAIR,
  ConstructionType.WATERPROOFING, ConstructionType.SIDING_REPLACEMENT
];

const lastNames = [
  '佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤',
  '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '斎藤', '清水',
  '山崎', '森', '池田', '橋本', '阿部', '石川', '山下', '中島', '石井', '小川'
];

const firstNames = [
  '太郎', '次郎', '三郎', '健一', '浩二', '誠', '武', '勇', '明', '正',
  '花子', '美香', '由美', '智子', '恵子', '直子', '優子', 'さゆり', '真由美', '京子'
];

const cities = [
  '新宿区', '渋谷区', '港区', '世田谷区', '杉並区', '練馬区', '大田区', '江戸川区',
  '北区', '豊島区', '中央区', '千代田区', '品川区', '目黒区', '中野区'
];

const streets = [
  '中央', '本町', '駅前', '大通り', '東', '西', '南', '北', '緑ヶ丘', '桜台',
  '松ヶ丘', '富士見', '旭町', '栄町', '幸町'
];

async function main() {
  console.log('🌱 診断データのシードを開始します...');

  // まず加盟店を作成（診断データには加盟店が必要）
  console.log('📦 加盟店データを作成中...');
  const partners = [];

  for (let i = 0; i < 20; i++) {
    const passwordHash = await bcrypt.hash(`partner${i + 1}`, 12);
    const now = new Date();
    const partner = await prisma.partners.create({
      data: {
        username: `partner${i + 1}`,
        login_email: `partner${i + 1}@example.com`,
        password_hash: passwordHash,
        is_active: true,
        created_at: now,
        updated_at: now,
        partner_details: {
          create: {
            company_name: `${randomChoice(lastNames)}建設株式会社`,
            phone_number: `0${Math.floor(Math.random() * 9) + 1}0-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
            address: `${randomChoice(prefectures)}${randomChoice(cities)}${randomChoice(streets)}${Math.floor(Math.random() * 99) + 1}-${Math.floor(Math.random() * 99) + 1}`,
            representative_name: `${randomChoice(lastNames)} ${randomChoice(firstNames)}`,
            business_description: '外壁塗装、屋根塗装、防水工事など建物の外装工事全般を手掛けております。',
            appeal_text: '創業20年の実績と信頼。お客様の満足を第一に考えた丁寧な施工を心がけています。',
            partners_status: 'ACTIVE',
            created_at: now,
            updated_at: now,
          }
        }
      }
    });
    partners.push(partner);
  }

  console.log(`✅ ${partners.length}件の加盟店を作成しました`);

  // 顧客と診断データを作成
  console.log('📦 顧客データと診断データを作成中...');
  let diagnosisCount = 0;

  for (let i = 0; i < 50; i++) {
    const partner = randomChoice(partners);
    const prefecture = randomChoice(prefectures);
    const createdAt = randomDate(90);

    // 顧客を作成
    const customer = await prisma.customers.create({
      data: {
        partner_id: partner.id,
        customer_name: `${randomChoice(lastNames)} ${randomChoice(firstNames)}`,
        customer_phone: `0${Math.floor(Math.random() * 9) + 1}0-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        customer_email: `customer${i + 1}@example.com`,
        construction_address: `${prefecture}${randomChoice(cities)}${randomChoice(streets)}${Math.floor(Math.random() * 99) + 1}-${Math.floor(Math.random() * 99) + 1}`,
        customer_construction_type: randomChoice(constructionTypes),
        construction_amount: Math.floor(Math.random() * 2000000) + 500000,
        customer_status: 'ORDERED',
        created_at: createdAt,
        updated_at: createdAt,
      }
    });

    // 診断リクエストを作成
    diagnosisCount++;
    const diagnosisNumber = `GH${diagnosisCount.toString().padStart(5, '0')}`;

    // ステータスをランダムに決定（比重をつける）
    let status: DiagnosisStatus;
    const rand = Math.random();
    if (rand < 0.1) {
      status = DiagnosisStatus.DESIGNATED;
    } else if (rand < 0.3) {
      status = DiagnosisStatus.RECRUITING;
    } else if (rand < 0.6) {
      status = DiagnosisStatus.COMPARING;
    } else {
      status = DiagnosisStatus.DECIDED;
    }

    const diagnosis = await prisma.diagnosis_requests.create({
      data: {
        diagnosis_number: diagnosisNumber,
        customer_id: customer.id,
        prefecture: prefecture,
        floor_area: randomChoice(floorAreas),
        current_situation: randomChoice(currentSituations),
        construction_type: randomChoice(constructionTypes),
        status: status,
        created_at: createdAt,
        updated_at: createdAt,
      }
    });

    // 見積もりを作成（ステータスに応じて）
    let quotationCount = 0;
    if (status === DiagnosisStatus.DESIGNATED) {
      quotationCount = 1; // 業者指定の場合は1件
    } else if (status === DiagnosisStatus.RECRUITING) {
      quotationCount = 0; // 募集中は0件
    } else if (status === DiagnosisStatus.COMPARING) {
      quotationCount = Math.floor(Math.random() * 4) + 1; // 1〜4件
    } else if (status === DiagnosisStatus.DECIDED) {
      quotationCount = Math.floor(Math.random() * 5) + 2; // 2〜6件
    }

    const selectedPartners = [];
    for (let j = 0; j < quotationCount; j++) {
      let quotationPartner;
      do {
        quotationPartner = randomChoice(partners);
      } while (selectedPartners.includes(quotationPartner.id));
      selectedPartners.push(quotationPartner.id);

      const baseAmount = Math.floor(Math.random() * 1500000) + 500000;
      const quotationAmount = Math.floor(baseAmount / 10000) * 10000; // 万円単位で丸める

      const isSelected = status === DiagnosisStatus.DECIDED && j === 0; // 決定済みの場合、最初の見積もりを選択

      const quotation = await prisma.quotations.create({
        data: {
          diagnosis_request_id: diagnosis.id,
          partner_id: quotationPartner.id,
          quotation_amount: quotationAmount,
          appeal_text: j % 3 === 0 ? `創業${Math.floor(Math.random() * 30) + 10}年の実績があります。丁寧な施工と迅速な対応をお約束いたします。` : null,
          is_selected: isSelected,
          created_at: new Date(createdAt.getTime() + j * 86400000), // 1日ずつずらす
          updated_at: new Date(createdAt.getTime() + j * 86400000),
        }
      });

      // 決定済みの場合、注文を作成
      if (isSelected) {
        await prisma.orders.create({
          data: {
            quotation_id: quotation.id,
            order_status: 'ORDERED',
            order_date: new Date(createdAt.getTime() + (j + 1) * 86400000),
            created_at: new Date(createdAt.getTime() + (j + 1) * 86400000),
            updated_at: new Date(createdAt.getTime() + (j + 1) * 86400000),
          }
        });
      }
    }

    if ((i + 1) % 10 === 0) {
      console.log(`  処理中... ${i + 1}/50`);
    }
  }

  console.log(`✅ ${diagnosisCount}件の診断データを作成しました`);

  // お問い合わせデータを作成
  console.log('📦 お問い合わせデータを作成中...');
  const customers = await prisma.customers.findMany();

  for (let i = 0; i < 30; i++) {
    const customer = randomChoice(customers);
    const createdAt = randomDate(60);

    await prisma.inquiries.create({
      data: {
        customer_id: customer.id,
        subject: randomChoice([
          '見積もりについて',
          '工事期間について',
          '施工内容の確認',
          '追加工事の相談',
          '支払い方法について',
          'アフターサービスについて',
        ]),
        inquiry_content: randomChoice([
          '見積もりの詳細について教えてください。',
          '工事期間はどのくらいかかりますか？',
          '施工内容について詳しく知りたいです。',
          '追加で屋根の塗装もお願いしたいのですが可能でしょうか？',
          '支払い方法について相談したいです。',
          'アフターサービスの内容を教えてください。',
        ]),
        inquiry_status: randomChoice(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
        admin_memo: Math.random() > 0.5 ? '対応済み' : null,
        created_at: createdAt,
        updated_at: createdAt,
      }
    });
  }

  console.log('✅ 30件のお問い合わせデータを作成しました');

  console.log('\n🎉 診断データのシード完了!');
  console.log('\n📊 作成されたデータ:');
  console.log(`  - 加盟店: ${partners.length}件`);
  console.log(`  - 顧客: 50件`);
  console.log(`  - 診断リクエスト: ${diagnosisCount}件`);
  console.log(`  - お問い合わせ: 30件`);
}

main()
  .catch((e) => {
    console.error('❌ Seedエラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
