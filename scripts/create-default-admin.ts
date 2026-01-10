import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultAdmin() {
  try {
    // 既存の管理者アカウントをチェック
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('デフォルトの管理者アカウントは既に存在します');
      return;
    }

    // パスワードをハッシュ化
    const passwordHash = await bcrypt.hash('admin123', 12);

    // デフォルトの管理者アカウントを作成
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        email: 'admin@gaiheki.com',
        passwordHash,
        role: 'SUPER_ADMIN',
      },
    });

    console.log('デフォルトの管理者アカウントが作成されました:');
    console.log(`ID: ${admin.id}`);
    console.log(`ユーザー名: ${admin.username}`);
    console.log(`メール: ${admin.email}`);
    console.log(`ロール: ${admin.role}`);
    console.log('パスワード: admin123');
  } catch (error) {
    console.error('管理者アカウントの作成に失敗しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultAdmin();