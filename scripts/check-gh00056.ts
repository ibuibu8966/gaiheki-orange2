import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // GH00056を検索
    const diagnosis = await prisma.diagnosis_requests.findFirst({
      where: {
        diagnosis_number: 'GH00056'
      },
      include: {
        customers: true,
        designated_partner: {
          include: {
            partner_details: true
          }
        }
      }
    });

    if (!diagnosis) {
      console.log('❌ GH00056が見つかりません');
      return;
    }

    console.log('✅ GH00056の情報:');
    console.log('診断番号:', diagnosis.diagnosis_number);
    console.log('都道府県:', diagnosis.prefecture);
    console.log('ステータス:', diagnosis.status);
    console.log('指定業者ID:', diagnosis.designated_partner_id);
    console.log('指定業者名:', diagnosis.designated_partner?.partner_details?.company_name || 'なし');
    console.log('顧客名:', diagnosis.customers.customer_name);
    console.log('作成日:', diagnosis.created_at);

    // yokohama@reform.co.jpのパートナー情報を取得
    const partner = await prisma.partners.findUnique({
      where: {
        login_email: 'yokohama@reform.co.jp'
      },
      include: {
        partner_details: true,
        partner_prefectures: true
      }
    });

    if (partner) {
      console.log('\n✅ 横浜リフォームセンター情報:');
      console.log('パートナーID:', partner.id);
      console.log('対応エリア:', partner.partner_prefectures.map(p => p.supported_prefecture).join(', '));

      const supportedPrefectures = partner.partner_prefectures.map(p => p.supported_prefecture);
      const isInSupportedArea = supportedPrefectures.includes(diagnosis.prefecture);

      console.log('\n📍 GH00056の都道府県がパートナーの対応エリアに含まれている:', isInSupportedArea ? '✅ はい' : '❌ いいえ');
      console.log('指定業者がこのパートナー:', diagnosis.designated_partner_id === partner.id ? '✅ はい' : '❌ いいえ');
    }

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
