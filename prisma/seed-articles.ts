import { PrismaClient, ArticleCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding articles...");

  // 管理者を取得
  const admin = await prisma.admin.findFirst();

  if (!admin) {
    console.log("No admin found. Please create an admin first.");
    return;
  }

  const articles = [
    {
      admin_id: admin.id,
      title: "外壁塗装の基本知識：初心者向けガイド",
      thumbnail_image: null,
      category: "BASIC_KNOWLEDGE" as ArticleCategory,
      content: `<h2>外壁塗装とは</h2><p>外壁塗装は、住宅の外壁を保護し、美観を維持するために定期的に行う必要があるメンテナンスです。</p>
<h3>外壁塗装の目的</h3><ul><li>建物の保護</li><li>美観の維持</li><li>資産価値の保全</li></ul>
<p>一般的に10〜15年に一度の塗り替えが推奨されています。</p>`,
      is_published: true,
      sort_order: 1,
      post_name: "basic-guide-to-exterior-painting",
      updated_at: new Date(),
    },
    {
      admin_id: admin.id,
      title: "シリコン塗料とウレタン塗料の違いとは？",
      thumbnail_image: null,
      category: "PAINT_TYPES" as ArticleCategory,
      content: `<h2>塗料の種類と特徴</h2><p>外壁塗装に使用される塗料には、様々な種類があります。</p>
<h3>シリコン塗料</h3><p>耐久性に優れ、コストパフォーマンスが高い塗料です。耐用年数は約10〜15年です。</p>
<h3>ウレタン塗料</h3><p>価格が安く、塗りやすいのが特徴です。耐用年数は約8〜10年です。</p>`,
      is_published: true,
      sort_order: 2,
      post_name: "silicon-vs-urethane-paint",
      updated_at: new Date(),
    },
    {
      admin_id: admin.id,
      title: "外壁塗装の施工事例：木造住宅の全面塗り替え",
      thumbnail_image: null,
      category: "CASE_STUDIES" as ArticleCategory,
      content: `<h2>施工事例のご紹介</h2><p>築15年の木造2階建て住宅の全面塗り替え工事を行いました。</p>
<h3>施工内容</h3><ul><li>外壁：シリコン塗料</li><li>屋根：遮熱塗料</li><li>工期：2週間</li><li>費用：120万円</li></ul>
<p>お客様からは「新築のようにきれいになった」と大変ご満足いただきました。</p>`,
      is_published: true,
      sort_order: 3,
      post_name: "case-study-wooden-house",
      updated_at: new Date(),
    },
    {
      admin_id: admin.id,
      title: "外壁のメンテナンス時期の見極め方",
      thumbnail_image: null,
      category: "MAINTENANCE" as ArticleCategory,
      content: `<h2>塗り替え時期のサイン</h2><p>以下の症状が見られたら、塗り替えを検討しましょう。</p>
<ul><li>チョーキング（粉が手につく）</li><li>ひび割れ</li><li>カビ・コケの発生</li><li>塗膜の剥がれ</li><li>色あせ</li></ul>
<p>これらの症状を放置すると、建物の劣化が進行します。</p>`,
      is_published: true,
      sort_order: 4,
      post_name: "maintenance-timing-guide",
      updated_at: new Date(),
    },
    {
      admin_id: admin.id,
      title: "失敗しない塗装業者の選び方5つのポイント",
      thumbnail_image: null,
      category: "CONTRACTOR_SELECTION" as ArticleCategory,
      content: `<h2>優良業者を見極める</h2><p>信頼できる塗装業者を選ぶためのポイントをご紹介します。</p>
<ol><li>実績と資格の確認</li><li>見積もりの詳細さ</li><li>保証内容の充実度</li><li>担当者の対応</li><li>口コミ・評判</li></ol>
<p>複数の業者から見積もりを取り、比較検討することが大切です。</p>`,
      is_published: false,
      sort_order: 5,
      post_name: "how-to-choose-contractor",
      updated_at: new Date(),
    },
    {
      admin_id: admin.id,
      title: "外壁塗装の費用相場と内訳を徹底解説",
      thumbnail_image: null,
      category: "COST_ESTIMATE" as ArticleCategory,
      content: `<h2>費用の目安</h2><p>一般的な2階建て住宅（延床面積30坪）の場合、80〜150万円が相場です。</p>
<h3>費用の内訳</h3><ul><li>足場代：15〜20万円</li><li>高圧洗浄：3〜5万円</li><li>下地処理：5〜10万円</li><li>塗装費用：50〜100万円</li></ul>
<p>使用する塗料のグレードによって大きく変わります。</p>`,
      is_published: false,
      sort_order: 6,
      post_name: "cost-breakdown-guide",
      updated_at: new Date(),
    },
  ];

  for (const article of articles) {
    await prisma.articles.create({
      data: article,
    });
  }

  console.log(`Created ${articles.length} articles`);
  console.log("Seeding articles completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
