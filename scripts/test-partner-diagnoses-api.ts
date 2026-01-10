import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const partnerId = 27; // yokohama@reform.co.jpのID

    console.log('🔍 パートナーID:', partnerId);

    // 加盟店の対応エリアを取得
    const partnerPrefectures = await prisma.partner_prefectures.findMany({
      where: { partner_id: partnerId },
      select: { supported_prefecture: true }
    });

    const supportedPrefectures = partnerPrefectures.map(pp => pp.supported_prefecture);
    console.log('✅ 対応エリア:', supportedPrefectures.join(', '));

    // 対応エリア内の診断依頼を取得（APIと同じロジック）
    const whereCondition: any = {
      prefecture: { in: supportedPrefectures },
      status: {
        notIn: ['DECIDED', 'CANCELLED']
      }
    };

    console.log('\n📋 WHERE条件:', JSON.stringify(whereCondition, null, 2));

    const diagnosisRequests = await prisma.diagnosis_requests.findMany({
      where: whereCondition,
      include: {
        customers: {
          select: {
            customer_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`\n✅ 取得された診断件数: ${diagnosisRequests.length}件\n`);

    diagnosisRequests.forEach((dr, index) => {
      console.log(`${index + 1}. ${dr.diagnosis_number} - ${dr.customers.customer_name} (${dr.status}) - ${dr.prefecture}`);
    });

    // GH00055が含まれているか確認
    const gh00055 = diagnosisRequests.find(dr => dr.diagnosis_number === 'GH00055');
    console.log('\n🎯 GH00055は含まれている:', gh00055 ? '✅ はい' : '❌ いいえ');

    if (gh00055) {
      console.log('GH00055の詳細:');
      console.log('- ステータス:', gh00055.status);
      console.log('- 都道府県:', gh00055.prefecture);
      console.log('- 顧客名:', gh00055.customers.customer_name);
    }

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
