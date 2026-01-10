# フェーズ4: 運営会社向けバックエンドAPI実装

## 前提条件

- フェーズ1〜3が完了していること
- 加盟店向け機能が正常に動作していること

## 概要

このフェーズでは、運営会社向けのダッシュボード、手数料請求管理、設定機能のバックエンドAPIを実装します。

## タスク

### 1. ダッシュボードAPI

#### 1.1 `GET /api/admin/dashboard`

運営会社のダッシュボードに表示する全体KPIデータを取得します。

**クエリパラメータ:**
- `period`: `current_month` | `last_month` | `current_year` | `custom`
- `start_date`: カスタム期間の開始日 (YYYY-MM-DD)
- `end_date`: カスタム期間の終了日 (YYYY-MM-DD)

**レスポンス例:**
```json
{
  "kpi": {
    "total_revenue": 52500000,        // 全加盟店の総売上
    "platform_revenue": 3150000,      // プラットフォーム手数料売上
    "new_partners": 3,                // 新規加盟店数
    "active_partners": 25             // アクティブ加盟店数
  },
  "partner_summary": [
    {
      "partner_id": 1,
      "company_name": "横浜リフォーム株式会社",
      "orders": 8,
      "revenue": 5250000,
      "fees": 315000,
      "unpaid_fees": 0
    }
  ]
}
```

**実装のポイント:**
- 全加盟店の売上を集計
- 各加盟店の手数料を料金プランに基づいて計算
- アクティブ加盟店数（期間内に受注があった加盟店）を集計

### 2. 手数料請求管理API

#### 2.1 `GET /api/admin/invoices`

加盟店への手数料請求書一覧を取得します。

**クエリパラメータ:**
- `status`: `DRAFT` | `UNPAID` | `PAID` | `OVERDUE`
- `partner_id`: 加盟店ID
- `page`: ページ番号
- `limit`: 1ページあたりの件数

**レスポンス例:**
```json
{
  "invoices": [
    {
      "id": 1,
      "invoice_number": "COMP-2025-0001",
      "partner_id": 1,
      "company_name": "横浜リフォーム株式会社",
      "billing_period_start": "2025-01-01",
      "billing_period_end": "2025-01-31",
      "grand_total": 315000,
      "issue_date": "2025-02-01",
      "due_date": "2025-02-20",
      "status": "UNPAID"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

#### 2.2 `POST /api/admin/invoices/generate`

月末の手数料請求データを自動生成します。

**リクエストボディ:**
```json
{
  "billing_period_start": "2025-01-01",
  "billing_period_end": "2025-01-31"
}
```

**レスポンス例:**
```json
{
  "generated": 25,
  "invoices": [
    {
      "partner_id": 1,
      "company_name": "横浜リフォーム株式会社",
      "total_amount": 286364,
      "tax_amount": 28636,
      "grand_total": 315000,
      "items": [
        {
          "description": "月額利用料",
          "amount": 30000
        },
        {
          "description": "受注手数料 (8件)",
          "amount": 40000
        },
        {
          "description": "施工完了手数料 (5件, 5%)",
          "amount": 216364
        }
      ]
    }
  ]
}
```

**実装のポイント:**
- 各加盟店の料金プランを取得
- 指定期間内の受注件数、施工完了件数、施工金額を集計
- 料金プランに基づいて手数料を計算
  - 月額固定: `monthly_fee`
  - 受注ごと: `per_order_fee × 受注件数`
  - 施工完了ごと（固定額）: `per_project_fee × 施工完了件数`
  - 施工完了ごと（料率）: `施工金額合計 × project_fee_rate`
- 消費税を計算
- 請求書データを `company_invoices` と `company_invoice_items` テーブルに保存
- ステータスは `DRAFT` で作成

#### 2.3 `POST /api/admin/invoices/issue`

生成された請求データを一括で発行します。

**リクエストボディ:**
```json
{
  "invoice_ids": [1, 2, 3, 4, 5]
}
```

**実装のポイント:**
- 指定された請求書のステータスを `DRAFT` から `UNPAID` に変更
- 発行日を現在日時に設定
- 支払期日を計算（システム設定の `billing_cycle_payment_day` を参照）

#### 2.4 `GET /api/admin/invoices/[id]`

特定の手数料請求書の詳細を取得します。

**レスポンス例:**
```json
{
  "id": 1,
  "invoice_number": "COMP-2025-0001",
  "partner": {
    "id": 1,
    "company_name": "横浜リフォーム株式会社",
    "email": "yokohama@reform.co.jp",
    "phone": "045-123-4567",
    "address": "神奈川県横浜市..."
  },
  "billing_period_start": "2025-01-01",
  "billing_period_end": "2025-01-31",
  "issue_date": "2025-02-01",
  "due_date": "2025-02-20",
  "items": [
    {
      "id": 1,
      "description": "月額利用料",
      "amount": 30000,
      "related_order_id": null
    },
    {
      "id": 2,
      "description": "受注手数料 (受注ID: 10)",
      "amount": 5000,
      "related_order_id": 10
    }
  ],
  "total_amount": 286364,
  "tax_amount": 28636,
  "grand_total": 315000,
  "status": "UNPAID",
  "payment_date": null
}
```

#### 2.5 `PUT /api/admin/invoices/[id]/status`

手数料請求書のステータスを更新します。

**リクエストボディ:**
```json
{
  "status": "PAID",
  "payment_date": "2025-02-15"
}
```

### 3. 設定管理API

#### 3.1 `GET /api/admin/settings/fee-plans`

料金プラン一覧を取得します。

**レスポンス例:**
```json
{
  "plans": [
    {
      "id": 1,
      "name": "スタンダードプラン",
      "monthly_fee": 30000,
      "per_order_fee": 5000,
      "per_project_fee": null,
      "project_fee_rate": 0.05,
      "is_default": true
    }
  ]
}
```

#### 3.2 `POST /api/admin/settings/fee-plans`

新しい料金プランを作成します。

**リクエストボディ:**
```json
{
  "name": "プレミアムプラン",
  "monthly_fee": 50000,
  "per_order_fee": 3000,
  "per_project_fee": null,
  "project_fee_rate": 0.03,
  "is_default": false
}
```

#### 3.3 `PUT /api/admin/settings/fee-plans/[id]`

料金プランを更新します。

**リクエストボディ:**
```json
{
  "name": "スタンダードプラン",
  "monthly_fee": 35000,
  "per_order_fee": 5000,
  "per_project_fee": null,
  "project_fee_rate": 0.05
}
```

#### 3.4 `GET /api/admin/settings/system`

システム設定を取得します。

**レスポンス例:**
```json
{
  "billing_cycle_closing_day": 31,
  "billing_cycle_payment_day": 20,
  "tax_rate": 0.10
}
```

#### 3.5 `PUT /api/admin/settings/system`

システム設定を更新します。

**リクエストボディ:**
```json
{
  "billing_cycle_closing_day": 31,
  "billing_cycle_payment_day": 25,
  "tax_rate": 0.10
}
```

### 4. ユーティリティ関数

#### 4.1 請求書番号の自動採番

```typescript
async function generateCompanyInvoiceNumber(): Promise<string> {
  // COMP-YYYY-0001 形式で採番
}
```

#### 4.2 手数料計算

```typescript
interface FeePlan {
  monthly_fee: number | null;
  per_order_fee: number | null;
  per_project_fee: number | null;
  project_fee_rate: number | null;
}

interface ActivityData {
  order_count: number;
  project_count: number;
  project_total_amount: number;
}

function calculateFees(plan: FeePlan, activity: ActivityData): number {
  let total = 0;
  
  // 月額固定
  if (plan.monthly_fee) {
    total += plan.monthly_fee;
  }
  
  // 受注ごと
  if (plan.per_order_fee) {
    total += plan.per_order_fee * activity.order_count;
  }
  
  // 施工完了ごと（固定額）
  if (plan.per_project_fee) {
    total += plan.per_project_fee * activity.project_count;
  }
  
  // 施工完了ごと（料率）
  if (plan.project_fee_rate) {
    total += Math.floor(activity.project_total_amount * plan.project_fee_rate);
  }
  
  return total;
}
```

#### 4.3 支払期日計算

```typescript
function calculateDueDate(issueDate: Date, paymentDay: number): Date {
  // 発行日の翌月の指定日を返す
  const dueDate = new Date(issueDate);
  dueDate.setMonth(dueDate.getMonth() + 1);
  dueDate.setDate(paymentDay);
  return dueDate;
}
```

## エラーハンドリング

すべてのAPIで適切なエラーハンドリングを実装してください：

- 400: バリデーションエラー
- 401: 認証エラー
- 403: 権限エラー（管理者以外がアクセスした場合）
- 404: リソースが見つからない
- 500: サーバーエラー

## テスト

以下のシナリオをテストしてください：

- [ ] ダッシュボードデータが正しく取得できる
- [ ] 手数料請求書一覧が正しく取得できる
- [ ] 請求データを自動生成できる
- [ ] 手数料が正しく計算される
- [ ] 請求書を一括発行できる
- [ ] 請求書詳細が正しく取得できる
- [ ] 請求書のステータスを変更できる
- [ ] 料金プランを作成・更新できる
- [ ] システム設定を取得・更新できる

## 完了報告

このフェーズが完了したら、以下を報告してください：

1. 実装したAPIエンドポイント一覧
2. テスト結果
3. 発生した問題と解決方法

次のフェーズに進む準備ができたら教えてください。

