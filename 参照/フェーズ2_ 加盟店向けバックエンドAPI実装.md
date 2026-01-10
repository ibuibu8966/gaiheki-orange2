# フェーズ2: 加盟店向けバックエンドAPI実装

## 前提条件

- フェーズ1（データベースセットアップ）が完了していること
- すべてのテーブルとSeedデータが正常に作成されていること

## 概要

このフェーズでは、加盟店向けのダッシュボードと請求管理機能のバックエンドAPIを実装します。

## タスク

### 1. ダッシュボードAPI

#### 1.1 `GET /api/partner/dashboard`

加盟店のダッシュボードに表示するKPIデータを取得するAPIです。

**クエリパラメータ:**
- `period`: `current_month` | `last_month` | `current_year` | `custom`
- `start_date`: カスタム期間の開始日 (YYYY-MM-DD)
- `end_date`: カスタム期間の終了日 (YYYY-MM-DD)

**レスポンス例:**
```json
{
  "kpi": {
    "inquiries": 15,           // 問い合わせ件数
    "orders": 8,               // 受注件数
    "completed": 5,            // 施工完了件数
    "revenue": 5250000,        // 売上（顧客への請求額合計）
    "unpaid": 1200000          // 未入金額
  },
  "revenue_trend": [
    { "month": "2024-11", "revenue": 3500000 },
    { "month": "2024-12", "revenue": 4200000 },
    { "month": "2025-01", "revenue": 5250000 }
  ],
  "status_distribution": {
    "inquiries": 15,
    "quotations": 10,
    "orders": 8,
    "in_progress": 3,
    "completed": 5
  }
}
```

**実装のポイント:**
- ログイン中の加盟店IDを取得（NextAuth.jsのセッションから）
- 指定期間内の診断依頼、受注、施工完了件数を集計
- 顧客への請求書から売上と未入金額を計算
- 過去12ヶ月の月次売上推移を取得

### 2. 請求書管理API

#### 2.1 `GET /api/partner/invoices`

顧客への請求書一覧を取得します。

**クエリパラメータ:**
- `status`: `DRAFT` | `UNPAID` | `PAID` | `OVERDUE` | `CANCELLED`
- `search`: 検索キーワード（顧客名、案件名）
- `page`: ページ番号
- `limit`: 1ページあたりの件数

**レスポンス例:**
```json
{
  "invoices": [
    {
      "id": 1,
      "invoice_number": "INV-2025-0001",
      "order_id": 10,
      "customer_name": "山田太郎",
      "project_name": "外壁塗装工事",
      "grand_total": 2500000,
      "issue_date": "2025-01-15",
      "due_date": "2025-02-15",
      "status": "UNPAID"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

#### 2.2 `POST /api/partner/invoices`

新しい請求書を作成します。

**リクエストボディ:**
```json
{
  "order_id": 10,
  "issue_date": "2025-01-15",
  "due_date": "2025-02-15",
  "items": [
    {
      "description": "外壁塗装工事一式",
      "quantity": 1,
      "unit": "式",
      "unit_price": 2000000,
      "amount": 2000000
    },
    {
      "description": "足場設置・撤去",
      "quantity": 150,
      "unit": "㎡",
      "unit_price": 1000,
      "amount": 150000
    }
  ]
}
```

**実装のポイント:**
- 請求書番号を自動採番（例: `INV-YYYY-0001`）
- 明細の合計から税抜金額を計算
- 消費税（10%）を自動計算
- 総合計を計算
- ステータスは `DRAFT` で作成

#### 2.3 `GET /api/partner/invoices/[id]`

特定の請求書の詳細を取得します。

**レスポンス例:**
```json
{
  "id": 1,
  "invoice_number": "INV-2025-0001",
  "order_id": 10,
  "customer": {
    "name": "山田太郎",
    "email": "yamada@example.com",
    "phone": "090-1234-5678",
    "address": "東京都新宿区..."
  },
  "issue_date": "2025-01-15",
  "due_date": "2025-02-15",
  "items": [
    {
      "id": 1,
      "description": "外壁塗装工事一式",
      "quantity": 1,
      "unit": "式",
      "unit_price": 2000000,
      "amount": 2000000
    }
  ],
  "total_amount": 2150000,
  "tax_amount": 215000,
  "grand_total": 2365000,
  "status": "UNPAID",
  "payment_date": null
}
```

#### 2.4 `PUT /api/partner/invoices/[id]`

請求書を更新します（下書き状態のみ編集可能）。

**リクエストボディ:**
```json
{
  "issue_date": "2025-01-15",
  "due_date": "2025-02-15",
  "items": [
    {
      "description": "外壁塗装工事一式",
      "quantity": 1,
      "unit": "式",
      "unit_price": 2000000,
      "amount": 2000000
    }
  ]
}
```

**実装のポイント:**
- ステータスが `DRAFT` の場合のみ編集可能
- 既存の明細を削除して新しい明細を登録
- 金額を再計算

#### 2.5 `PUT /api/partner/invoices/[id]/status`

請求書のステータスを更新します。

**リクエストボディ:**
```json
{
  "status": "PAID",
  "payment_date": "2025-02-10"
}
```

**実装のポイント:**
- `DRAFT` → `UNPAID`: 請求書を発行
- `UNPAID` → `PAID`: 入金確認（payment_dateを記録）
- 支払期日を過ぎた `UNPAID` は自動で `OVERDUE` に変更（バッチ処理または取得時に判定）

### 3. ユーティリティ関数

以下のユーティリティ関数を作成してください：

#### 3.1 請求書番号の自動採番

```typescript
async function generateInvoiceNumber(): Promise<string> {
  // INV-YYYY-0001 形式で採番
  // 同一年内で連番を振る
}
```

#### 3.2 消費税計算

```typescript
function calculateTax(amount: number, taxRate: number = 0.1): number {
  return Math.floor(amount * taxRate);
}
```

## エラーハンドリング

すべてのAPIで適切なエラーハンドリングを実装してください：

- 400: バリデーションエラー
- 401: 認証エラー
- 403: 権限エラー（他の加盟店のデータにアクセスしようとした場合）
- 404: リソースが見つからない
- 500: サーバーエラー

## テスト

以下のシナリオをテストしてください：

- [ ] ダッシュボードデータが正しく取得できる
- [ ] 請求書一覧が正しく取得できる
- [ ] 請求書を新規作成できる
- [ ] 請求書詳細が正しく取得できる
- [ ] 下書き状態の請求書を編集できる
- [ ] 請求書のステータスを変更できる
- [ ] 他の加盟店の請求書にアクセスできない

## 完了報告

このフェーズが完了したら、以下を報告してください：

1. 実装したAPIエンドポイント一覧
2. テスト結果
3. 発生した問題と解決方法

次のフェーズに進む準備ができたら教えてください。

