# Gaiheki - 管理者ログイン機能

レイヤードアーキテクチャを採用した管理者ログイン機能の実装

## 🏗️ アーキテクチャ

### レイヤード構成
```
src/
├── domain/                 # ドメインレイヤー
│   ├── entities/          # エンティティ
│   └── repositories/      # リポジトリインターフェース
├── infrastructure/        # インフラレイヤー
│   ├── database/         # データベース接続
│   ├── repositories/     # リポジトリ実装
│   └── factories/        # DI用ファクトリ
├── application/          # アプリケーションレイヤー
│   └── services/         # ビジネスロジック
└── presentation/         # プレゼンテーションレイヤー
    └── controllers/      # コントローラー
```

## 🚀 セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
```bash
cp .env.example .env
```

`.env`を編集して、実際の値を設定してください：

#### Supabase接続設定
```env
# Supabase Session pooler (ポート5432を使用)
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

# JWT設定
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# パスワードハッシュ
BCRYPT_SALT_ROUNDS=12
```

> **注意**: Supabaseでは**Session pooler（ポート5432）**を使用してください。Transaction pooler（ポート6543）はPrismaのPREPARE文に対応していません。

### 3. データベースのセットアップ

#### オプション A: マイグレーション使用（推奨）
```bash
# マイグレーションを実行（初回は自動的にseedも実行されます）
npm run prisma:migrate

# または、手動でseedを実行
npm run prisma:seed
```

#### オプション B: スキーマプッシュ（開発環境のみ）
```bash
# データベースにスキーマを直接適用
npm run prisma:db:push

# seedデータを投入
npm run prisma:seed
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

## 🔑 ログイン情報

seedで作成される管理者アカウント：

| ユーザー名 | メールアドレス | パスワード | ロール |
|------------|----------------|------------|--------|
| `admin` | admin@gaiheki.com | `admin123` | SUPER_ADMIN |
| `dev_admin` | dev@gaiheki.com | `dev123` | ADMIN |
| `operator` | operator@gaiheki.com | `operator123` | OPERATOR |

アクセス先：`http://localhost:3000/auth/admin-login`

## 📚 利用可能なスクリプト

### 基本コマンド
- `npm run dev` - 開発サーバー起動
- `npm run build` - 本番用ビルド
- `npm run start` - 本番サーバー起動
- `npm run lint` - ESLintチェック

### Prismaコマンド
- `npm run prisma:generate` - Prismaクライアント生成
- `npm run prisma:db:push` - スキーマをDBに適用
- `npm run prisma:migrate` - マイグレーション実行
- `npm run prisma:migrate:deploy` - 本番マイグレーション実行
- `npm run prisma:migrate:status` - マイグレーション状態確認
- `npm run prisma:migrate:reset` - マイグレーションリセット
- `npm run prisma:seed` - seedデータ投入
- `npm run prisma:studio` - Prisma Studio起動

### 管理者アカウント
- `npm run admin:create` - デフォルト管理者作成（レガシー）

## 🛡️ セキュリティ機能

- JWT認証
- HTTPOnlyクッキー
- セッション管理
- パスワードハッシュ化（bcrypt）
- 管理者アカウントの分離

## 🔌 API エンドポイント

- `POST /api/admin/login` - 管理者ログイン
- `POST /api/admin/logout` - 管理者ログアウト
- `GET /api/admin/me` - 管理者情報取得

## 🗃️ データベーススキーマ

### 管理者テーブル (`admins`)
- `id` - 主キー
- `username` - ユーザー名（ユニーク）
- `email` - メールアドレス（ユニーク）
- `password_hash` - パスワードハッシュ
- `role` - 管理者ロール（SUPER_ADMIN, ADMIN, OPERATOR）
- `is_active` - アクティブ状態
- `last_login_at` - 最終ログイン日時
- `created_at` - 作成日時
- `updated_at` - 更新日時

### 管理者セッションテーブル (`admin_sessions`)
- `id` - セッションID
- `admin_id` - 管理者ID（外部キー）
- `expires_at` - 有効期限
- `created_at` - 作成日時

## 📋 マイグレーション & Seed

### 利用可能なマイグレーション
1. **20241217000001_init_admin_tables** - 管理者テーブルの初期作成
2. **20241217000002_seed_default_admin** - デフォルト管理者アカウントの作成

### マイグレーションコマンド
```bash
# 新しいマイグレーションを作成
npx prisma migrate dev --name migration_name

# 本番環境でマイグレーションを実行
npx prisma migrate deploy

# マイグレーション状態を確認
npx prisma migrate status

# マイグレーションをリセット（開発環境のみ）
npx prisma migrate reset
```

### Seedデータ

Prismaのseed機能により、以下のデータが自動的に作成されます：

#### 管理者アカウント
- **Super Admin**: 全権限を持つ最高管理者
- **Admin**: 一般的な管理機能を持つ管理者  
- **Operator**: 限定的な操作権限を持つオペレーター

#### Seed実行方法
```bash
# マイグレーション実行時に自動実行
npm run prisma:migrate

# 手動でseed実行
npm run prisma:seed

# データベースリセット後のseed実行
npm run prisma:migrate:reset --skip-seed=false
```

#### 環境変数での設定
`.env.local`で以下の値をカスタマイズできます：
```env
DEFAULT_ADMIN_EMAIL="admin@yourcompany.com"
DEFAULT_ADMIN_PASSWORD="your_secure_password"
```

## 🛠️ 技術スタック

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, レイヤードアーキテクチャ
- **Database**: PostgreSQL (Supabase), Prisma ORM
- **Authentication**: JWT, bcrypt
- **Development**: ESLint, TypeScript, Turbopack

## ☁️ Supabaseインフラ

### データベース情報
- **Provider**: Supabase PostgreSQL
- **Region**: AWS ap-northeast-1 (Tokyo)
- **Connection**: Session pooler（ポート5432）
- **Tables**: 14テーブル
  - 管理者関連: `admins`, `admin_sessions`
  - ビジネス関連: `partners`, `customers`, `articles`
  - 取引関連: `partner_applications`, `diagnosis_requests`, `quotations`, `orders`
  - その他: `partner_details`, `partner_prefectures`, etc.

### 接続確認
```bash
# Prisma経由でデータベース接続確認
npx prisma db pull

# Prisma Studioで確認
npm run prisma:studio
```

---

## オリジナルのNext.jsプロジェクト情報

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.