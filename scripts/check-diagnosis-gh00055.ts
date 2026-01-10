import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // GH00055を検索
    const diagnosis = await prisma.diagnosis_requests.findFirst({
      where: {
        diagnosis_number: 'GH00055'
      },
      include: {
        customers: true,
        quotations: {
          include: {
            partners: {
              include: {
                partner_details: true
              }
            }
          }
        }
      }
    });

    if (!diagnosis) {
      console.log('❌ GH00055が見つかりません');
      return;
    }

    console.log('✅ GH00055の情報:');
    console.log('診断ID:', diagnosis.id);
    console.log('診断番号:', diagnosis.diagnosis_number);
    console.log('都道府県:', diagnosis.prefecture);
    console.log('ステータス:', diagnosis.status);
    console.log('顧客名:', diagnosis.customers.customer_name);
    console.log('作成日:', diagnosis.created_at);
    console.log('\n見積もり情報:');
    diagnosis.quotations.forEach(q => {
      console.log(`- ${q.partners.partner_details?.company_name || '不明'}: ¥${q.quotation_amount.toLocaleString()}`);
    });

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

    if (!partner) {
      console.log('\n❌ yokohama@reform.co.jpのパートナーが見つかりません');
      return;
    }

    console.log('\n✅ yokohama@reform.co.jpのパートナー情報:');
    console.log('パートナーID:', partner.id);
    console.log('会社名:', partner.partner_details?.company_name);
    console.log('対応エリア:', partner.partner_prefectures.map(p => p.supported_prefecture).join(', '));

    // 診断の都道府県がパートナーの対応エリアに含まれているか確認
    const supportedPrefectures = partner.partner_prefectures.map(p => p.supported_prefecture);
    const isInSupportedArea = supportedPrefectures.includes(diagnosis.prefecture);

    console.log('\n📍 診断の都道府県:', diagnosis.prefecture);
    console.log('対応エリアに含まれている:', isInSupportedArea ? '✅ はい' : '❌ いいえ');

    // フィルタ条件をシミュレート
    console.log('\n🔍 APIフィルタ条件チェック:');
    console.log('1. ステータスがDECIDEDまたはCANCELLED:', ['DECIDED', 'CANCELLED'].includes(diagnosis.status));
    console.log('2. 対応エリア内:', isInSupportedArea);

    if (['DECIDED', 'CANCELLED'].includes(diagnosis.status)) {
      console.log('\n⚠️ このステータスはパートナー画面のデフォルトフィルタで除外されます');
    }

    if (!isInSupportedArea) {
      console.log('\n⚠️ この診断はパートナーの対応エリア外です');
    }

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
