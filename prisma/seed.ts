import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // デフォルト管理者のパスワードをハッシュ化
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  // デフォルト管理者アカウントを作成（既存の場合はスキップ）
  const defaultAdmin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {}, // 既存の場合は更新しない
    create: {
      username: 'admin',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@gaiheki.com',
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log('✅ デフォルト管理者アカウントが作成されました:', {
    id: defaultAdmin.id,
    username: defaultAdmin.username,
    email: defaultAdmin.email,
    role: defaultAdmin.role,
  });

  // 追加の管理者アカウント（開発用）
  const devAdminPassword = await bcrypt.hash('dev123', 12);
  const devAdmin = await prisma.admin.upsert({
    where: { username: 'dev_admin' },
    update: {},
    create: {
      username: 'dev_admin',
      email: 'dev@gaiheki.com',
      passwordHash: devAdminPassword,
      role: AdminRole.ADMIN,
      isActive: true,
    },
  });

  console.log('✅ 開発用管理者アカウントが作成されました:', {
    id: devAdmin.id,
    username: devAdmin.username,
    email: devAdmin.email,
    role: devAdmin.role,
  });

  // オペレーター用アカウント（開発用）
  const operatorPassword = await bcrypt.hash('operator123', 12);
  const operator = await prisma.admin.upsert({
    where: { username: 'operator' },
    update: {},
    create: {
      username: 'operator',
      email: 'operator@gaiheki.com',
      passwordHash: operatorPassword,
      role: AdminRole.OPERATOR,
      isActive: true,
    },
  });

  console.log('✅ オペレーターアカウントが作成されました:', {
    id: operator.id,
    username: operator.username,
    email: operator.email,
    role: operator.role,
  });

  // 期限切れセッションのクリーンアップ
  const deletedSessions = await prisma.adminSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  console.log(`🧹 期限切れセッション ${deletedSessions.count} 件を削除しました`);


  console.log('🎉 Seed完了!');

  // アカウント情報一覧を表示
  console.log('\n📋 作成されたアカウント:');
  console.log('┌────────────┬─────────────────────┬─────────────┬─────────────┐');
  console.log('│ ユーザー名 │ メールアドレス      │ パスワード  │ ロール      │');
  console.log('├────────────┼─────────────────────┼─────────────┼─────────────┤');
  console.log('│ admin      │ admin@gaiheki.com   │ admin123    │ SUPER_ADMIN │');
  console.log('│ dev_admin  │ dev@gaiheki.com     │ dev123      │ ADMIN       │');
  console.log('│ operator   │ operator@gaiheki.com│ operator123 │ OPERATOR    │');
  console.log('└────────────┴─────────────────────┴─────────────┴─────────────┘');
}

main()
  .catch((e) => {
    console.error('❌ Seedエラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });