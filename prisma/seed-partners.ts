import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding partners data...');

  // 加盟店データ
  const partnersData = [
    {
      username: 'yamada_tosou',
      email: 'info@yamada-tosou.co.jp',
      password: 'password123',
      companyName: '株式会社山田塗装',
      phone: '03-1234-5678',
      address: '東京都新宿区西新宿1-1-1',
      representativeName: '山田太郎',
      businessDescription: '外壁塗装を専門とする総合リフォーム会社です。',
      appealText: '地域密着で20年以上の実績があります。',
      prefectures: ['Tokyo', 'Kanagawa', 'Saitama']
    },
    {
      username: 'tanaka_kensou',
      email: 'contact@tanaka-kensou.com',
      password: 'password123',
      companyName: '田中建装株式会社',
      phone: '06-9876-5432',
      address: '大阪府大阪市北区梅田2-2-2',
      representativeName: '田中次郎',
      businessDescription: '大阪を中心に外壁・屋根塗装を行っています。',
      appealText: '高品質な塗料と丁寧な施工が自慢です。',
      prefectures: ['Osaka', 'Hyogo', 'Kyoto']
    },
    {
      username: 'sato_tosou',
      email: 'info@sato-tosou.jp',
      password: 'password123',
      companyName: '佐藤塗装工業',
      phone: '045-1111-2222',
      address: '神奈川県横浜市西区みなとみらい3-3-3',
      representativeName: '佐藤三郎',
      businessDescription: '横浜エリアを中心に活動しています。',
      appealText: '創業30年の信頼と実績。',
      prefectures: ['Kanagawa', 'Tokyo']
    }
  ];

  for (const partnerData of partnersData) {
    const passwordHash = await bcrypt.hash(partnerData.password, 12);

    // 加盟店作成
    const partner = await prisma.partners.upsert({
      where: { login_email: partnerData.email },
      update: {},
      create: {
        username: partnerData.username,
        login_email: partnerData.email,
        password_hash: passwordHash,
        is_active: true,
        updated_at: new Date()
      }
    });

    console.log(`Created partner: ${partner.username}`);

    // 加盟店詳細作成
    await prisma.partner_details.upsert({
      where: { partner_id: partner.id },
      update: {},
      create: {
        partner_id: partner.id,
        company_name: partnerData.companyName,
        phone_number: partnerData.phone,
        address: partnerData.address,
        representative_name: partnerData.representativeName,
        business_description: partnerData.businessDescription,
        appeal_text: partnerData.appealText,
        partners_status: 'ACTIVE',
        updated_at: new Date()
      }
    });

    console.log(`Created partner details for: ${partnerData.companyName}`);

    // 対応都道府県作成
    for (const prefecture of partnerData.prefectures) {
      await prisma.partner_prefectures.upsert({
        where: {
          partner_id_supported_prefecture: {
            partner_id: partner.id,
            supported_prefecture: prefecture as any
          }
        },
        update: {},
        create: {
          partner_id: partner.id,
          supported_prefecture: prefecture as any,
          updated_at: new Date()
        }
      });
    }

    console.log(`Added prefectures for: ${partnerData.companyName}`);
  }

  console.log('✅ Partners seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
