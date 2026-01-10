# Gaiheki プロジェクト デプロイ手順

このドキュメントでは、GaihekiプロジェクトをVercel + Supabaseでデプロイする手順を説明します。

## 前提条件

- GitHubリポジトリにコードがプッシュされていること
- Supabaseアカウントとプロジェクトが作成されていること
- Vercelアカウントが作成されていること

## デプロイ手順

### 1. Supabaseの設定

#### 1.1 Supabaseプロジェクトの作成（未作成の場合）

1. [supabase.com](https://supabase.com) にログイン
2. 「New project」をクリック
3. プロジェクト名を入力（例: gaiheki-production）
4. データベースパスワードを設定（強力なパスワードを推奨）
5. リージョンを選択（推奨: Northeast Asia (Tokyo) - ap-northeast-1）
6. 「Create new project」をクリック

#### 1.2 データベース接続情報の取得

1. Supabaseダッシュボードで「Settings」→「Database」を開く
2. 「Connection string」セクションで以下を確認：
   - **Session mode (for Prisma)**: `DATABASE_URL` として使用
   - **Direct connection**: `DIRECT_URL` として使用

例：
```
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres"
```

#### 1.3 データベースのマイグレーション

ローカル環境で以下を実行：

```bash
# 環境変数を設定（本番用のDATABASE_URLとDIRECT_URLを使用）
# .env.productionファイルを作成するか、直接環境変数を設定

# Prismaクライアントの生成
npm run prisma:generate

# マイグレーションの実行
npm run prisma:migrate:deploy

# 初期管理者アカウントの作成
npm run admin:create
```

**重要**: マイグレーションは本番データベースに対して実行されるため、慎重に行ってください。

### 2. Vercelの設定

#### 2.1 プロジェクトのインポート

1. [vercel.com](https://vercel.com) にログイン
2. 「Add New」→「Project」をクリック
3. GitHubリポジトリを選択（gaiheki）
4. 「Import」をクリック

#### 2.2 プロジェクト設定

- **Framework Preset**: Next.js（自動検出される）
- **Root Directory**: `.`（デフォルト）
- **Build Command**: 自動設定される（`vercel.json`で上書き）
- **Install Command**: 自動設定される

#### 2.3 環境変数の設定

「Environment Variables」セクションで以下を設定：

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Supabaseのセッションプーリング接続文字列 | Production |
| `DIRECT_URL` | Supabaseの直接接続文字列 | Production |
| `JWT_SECRET` | 強力なランダム文字列（下記参照） | Production |
| `JWT_EXPIRES_IN` | `24h` | Production |
| `BCRYPT_SALT_ROUNDS` | `12` | Production |
| `DEFAULT_ADMIN_EMAIL` | 管理者メールアドレス | Production |
| `DEFAULT_ADMIN_USERNAME` | 管理者ユーザー名 | Production |
| `DEFAULT_ADMIN_PASSWORD` | 管理者パスワード | Production |
| `NEXTAUTH_URL` | `https://yourdomain.vercel.app` | Production |
| `NEXTAUTH_SECRET` | 強力なランダム文字列（下記参照） | Production |
| `NODE_ENV` | `production` | Production |

**強力なランダム文字列の生成方法**:
```bash
# Linuxまたは macOS
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

#### 2.4 デプロイの実行

1. 「Deploy」をクリック
2. デプロイが完了するまで待機（通常3-5分）
3. デプロイが成功したら、「Visit」をクリックしてサイトを確認

### 3. デプロイ後の確認

#### 3.1 データベース接続の確認

1. デプロイされたサイトにアクセス
2. `/auth/admin-login` にアクセス
3. 設定した管理者アカウントでログインを試行

#### 3.2 機能テスト

以下の機能が正常に動作することを確認：

- [ ] 管理者ログイン
- [ ] 加盟店ログイン
- [ ] 加盟店登録申請
- [ ] 診断依頼の表示
- [ ] コラム記事の表示
- [ ] エリア別加盟店検索

### 4. トラブルシューティング

#### ビルドエラーが発生する場合

1. Vercelのログを確認
2. `npm run build` がローカルで成功することを確認
3. 環境変数が正しく設定されているか確認

#### データベース接続エラーが発生する場合

1. `DATABASE_URL` と `DIRECT_URL` が正しいか確認
2. Supabaseプロジェクトが起動しているか確認
3. IPアドレス制限が設定されていないか確認（Supabaseダッシュボード）

#### Prismaエラーが発生する場合

```bash
# ローカルでマイグレーションを再実行
npm run prisma:migrate:deploy

# Prismaクライアントを再生成
npm run prisma:generate
```

### 5. カスタムドメインの設定（オプション）

1. Vercelダッシュボードで「Settings」→「Domains」を開く
2. カスタムドメインを追加
3. DNSレコードを設定（VercelがCNAMEまたはAレコードを表示）
4. SSL証明書が自動的に発行されるまで待機

### 6. 継続的デプロイ

GitHubのメインブランチにプッシュすると、自動的にVercelにデプロイされます。

- **本番環境**: `main` ブランチへのプッシュ
- **プレビュー環境**: プルリクエストごとに自動生成

### 7. データベースのバックアップ

Supabaseは自動的に毎日バックアップを取得しますが、重要なデータの変更前には手動バックアップを推奨します。

```bash
# pg_dumpを使用したバックアップ
pg_dump "postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres" > backup.sql
```

### 8. モニタリング

- **Vercel Analytics**: デプロイメントとパフォーマンスの監視
- **Supabase Dashboard**: データベースのパフォーマンスと使用量
- **Vercel Logs**: アプリケーションログの確認

## セキュリティ推奨事項

1. **環境変数の管理**
   - `.env` ファイルを絶対にコミットしない
   - 本番環境の環境変数は強力なランダム文字列を使用

2. **データベースのセキュリティ**
   - 定期的にバックアップを取得
   - 必要に応じてIPアドレス制限を設定

3. **管理者アカウント**
   - 強力なパスワードを設定
   - デフォルトの管理者アカウントは初回ログイン後に変更

4. **アップデート**
   - 定期的に依存関係を更新 (`npm update`)
   - セキュリティアップデートを優先的に適用

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
