# フェーズ2 API動作確認ガイド

## 前提条件

1. **開発サーバーが起動していること**
   ```bash
   npm run dev
   ```
   → http://localhost:3000

2. **データベースに接続できること**
   - `.env` ファイルの `DATABASE_URL` と `DIRECT_URL` が正しく設定されている

3. **Seedデータが投入されていること**
   ```bash
   npm run prisma:seed
   ```

## テスト用加盟店アカウントの作成

現在、Seedデータには管理者アカウントのみ存在します。
加盟店アカウントを手動で作成する必要があります。

### オプション1: Supabaseで直接作成

Supabaseの管理画面から `partners` テーブルにレコードを挿入：

```sql
INSERT INTO partners (username, login_email, password_hash, is_active)
VALUES (
  'test_partner',
  'test@partner.com',
  -- bcryptでハッシュ化した 'password123'
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5xkxRxY6eI5a6',
  true
);
```

### オプション2: 加盟店登録APIを使用

（既存の加盟店登録フローがある場合）

## API動作確認手順

### ステップ1: 認証

加盟店としてログインします。

**リクエスト:**
```bash
curl -X POST http://localhost:3000/api/partner/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@partner.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

**期待される結果:**
- ステータスコード: 200
- レスポンスに `success: true` が含まれる
- セッションCookieが `cookies.txt` に保存される

### ステップ2: ダッシュボードAPI

**リクエスト:**
```bash
curl -X GET http://localhost:3000/api/partner/dashboard?period=current_month \
  -b cookies.txt
```

**期待される結果:**
```json
{
  "success": true,
  "data": {
    "kpi": {
      "inquiries": 0,
      "orders": 0,
      "completed": 0,
      "revenue": 0,
      "unpaid": 0
    },
    "revenue_trend": [...],
    "status_distribution": {...}
  }
}
```

### ステップ3: 請求書作成

まず、テスト用の受注（order）を作成する必要があります。

**注意:** 請求書を作成するには、以下が必要です：
1. 加盟店に紐づく顧客（customer）
2. 診断依頼（diagnosis_request）
3. 見積もり（quotation）
4. 受注（order）

テストデータの作成例については、`scripts/create-test-data.ts` を参照してください。

### ステップ4: 請求書一覧取得

**リクエスト:**
```bash
curl -X GET http://localhost:3000/api/partner/invoices \
  -b cookies.txt
```

**期待される結果:**
```json
{
  "success": true,
  "data": {
    "invoices": [],
    "total": 0,
    "page": 1,
    "limit": 10
  }
}
```

## 確認すべきポイント

### ✅ 認証・認可
- [ ] ログインしていない状態で API にアクセスすると 401 エラーが返る
- [ ] 他の加盟店の請求書にアクセスできない（403エラー）

### ✅ バリデーション
- [ ] 必須項目が不足している場合、400 エラーが返る
- [ ] 不正なステータス値を指定すると 400 エラーが返る

### ✅ ビジネスロジック
- [ ] 請求書番号が自動採番される（INV-2025-0001形式）
- [ ] 消費税が正しく計算される（税抜金額 × 0.1、切り捨て）
- [ ] 下書き状態の請求書のみ編集できる
- [ ] 1つの受注に対して複数の請求書を作成できない

### ✅ データ整合性
- [ ] 請求書を削除すると明細も削除される（CASCADE）
- [ ] トランザクションが正しく動作する

## トラブルシューティング

### エラー: 「認証が必要です」

**原因:** セッションCookieが設定されていない

**解決策:**
1. 加盟店ログインAPIを実行
2. レスポンスヘッダーの `Set-Cookie` を確認
3. 以降のリクエストで Cookie を含める

### エラー: 「受注が見つかりません」

**原因:** テストデータが不足している

**解決策:**
1. 加盟店に紐づく顧客を作成
2. 診断依頼を作成
3. 見積もりを作成
4. 受注を作成

### エラー: 「データベース接続エラー」

**原因:** 環境変数の設定ミス

**解決策:**
1. `.env` ファイルを確認
2. Supabaseプロジェクトが起動しているか確認
3. `npx prisma db push` を再実行

## 次のステップ

APIの動作確認が完了したら：

1. **フェーズ3**: 加盟店向けフロントエンドの実装
2. **フェーズ4**: 運営会社向けバックエンドAPIの実装
3. **フェーズ5**: 運営会社向けフロントエンドの実装

各フェーズの詳細は `参照/` ディレクトリ内のドキュメントを参照してください。
