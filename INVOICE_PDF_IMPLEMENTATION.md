# 請求書PDF発行機能 実装ドキュメント

## 概要

Admin側の請求書管理画面（`/admin-dashboard/billing`）で、INVOYと同様の仕様でPDFダウンロードができる機能を実装しました。

## 実装内容

### 1. 新規作成ファイル

#### `app/components/Admin/Invoice/CompanyInvoicePDFInvoice.tsx`
INVOYスタイルの請求書PDFコンポーネント

**主な機能:**
- 発行元情報（会社名、住所、電話番号、インボイス登録番号）
- 請求先情報（加盟店名、住所、電話番号）
- 請求書番号、発行日、支払期日、請求期間
- 請求明細テーブル（品目、数量、単価、金額）
- 小計、消費税（10%）、合計金額
- 振込先情報（銀行名、支店名、口座種別、口座番号、口座名義）
- プロフェッショナルなレイアウトとスタイリング

**データ構造:**
```typescript
interface InvoiceData {
  invoice_number: string;
  issue_date: string;
  due_date: string;
  billing_period_start: string;
  billing_period_end: string;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  items: InvoiceItem[];
  partner: Partner;
  company_settings?: CompanySettings;
}
```

### 2. 修正ファイル

#### `app/api/admin/invoices/[id]/route.ts`
請求書詳細取得APIエンドポイントの修正

**変更点:**
- `company_settings`テーブルから発行元情報を取得
- パートナー情報のフィールド名を修正
  - `email` → `login_email`
  - `phone` → `phone_number`
- すべての金額データを`Number()`で明示的に変換
- レスポンスに`company_settings`を追加

#### `app/admin-dashboard/billing/page.tsx`
請求書管理画面の修正

**変更点:**
- PDFコンポーネントを`CompanyInvoicePDFInvoice`に変更
- パートナー側と同じパターンでPDFDownloadLinkを実装
- `url`を使った副作用処理を削除（エラーの原因）
- データ整形時にすべてのフィールドを`Number()`で変換
- `items`配列の各要素も明示的に変換
- コンソールログを追加してデバッグしやすく

**修正前の問題点:**
```typescript
// ❌ 問題のあったコード
{({ loading, url }) => {
  if (url && !loading) {
    setTimeout(() => setSelectedInvoiceForPDF(null), 1000);
  }
  return <Button>...</Button>
}}
```

**修正後:**
```typescript
// ✅ 修正後のコード
{({ loading }) => (
  <Button
    onClick={() => {
      if (!loading) {
        setTimeout(() => setSelectedInvoiceForPDF(null), 1000);
      }
    }}
  >
    {loading ? 'PDF生成中...' : 'PDFダウンロード'}
  </Button>
)}
```

### 3. データベース

#### `company_settings`テーブル
発行元の会社情報を管理

**必要なフィールド:**
- `company_name`: 会社名
- `postal_code`: 郵便番号
- `address`: 住所
- `phone`: 電話番号
- `email`: メールアドレス
- `invoice_registration_number`: インボイス登録番号
- `bank_name`: 銀行名
- `bank_branch_name`: 支店名
- `bank_account_type`: 口座種別（普通/当座）
- `bank_account_number`: 口座番号
- `bank_account_holder`: 口座名義

## エラー修正

### 修正1: `TypeError: Ro is not a function`

**原因:**
- `@react-pdf/renderer`のPDFDownloadLinkで`url`プロパティを使った副作用処理
- データ型の不一致（Decimal型がそのまま渡されていた）

**解決策:**
1. パートナー側と同じパターンでPDFDownloadLinkを実装
2. すべての金額データを`Number()`で明示的に変換
3. API側でもDecimal型→Number型変換を実施

### 修正2: データ構造の不一致

**原因:**
- APIから返されるデータ構造とPDFコンポーネントが期待する構造が異なる
- `invoice_items`のフィールド名が不一致

**解決策:**
1. APIレスポンスに`company_settings`を追加
2. パートナー情報のフィールド名を統一
3. `items`配列の各要素を明示的に変換

## テスト手順

### 1. 環境構築
```bash
cd /home/ubuntu/gaiheki
npm install
npm run prisma:generate
npm run dev
```

### 2. 動作確認
1. 管理画面にログイン
2. `/admin-dashboard/billing`にアクセス
3. 発行済みの請求書を選択
4. 「選択した請求書をPDFダウンロード」ボタンをクリック
5. PDFがダウンロードされることを確認

### 3. デバッグ
ブラウザのコンソール（F12 → Console）で以下のログを確認:
- `===== 取得したデータ =====`
- `===== 整形後のPDFデータ =====`

## 今後の改善案

### 機能追加
1. **複数請求書の一括PDF生成**
   - 現在は1件ずつのみ
   - ZIPファイルでまとめてダウンロード

2. **PDFレイアウトのカスタマイズ**
   - 複数のテンプレートから選択
   - ロゴ画像の追加

3. **メール送信機能**
   - PDFを自動でメール送信
   - 送信履歴の管理

### パフォーマンス改善
1. **PDFキャッシュ**
   - 一度生成したPDFをキャッシュ
   - 再生成の負荷を軽減

2. **バックグラウンド生成**
   - 大量のPDFを非同期で生成
   - 進捗状況の表示

## 参考資料

- [@react-pdf/renderer ドキュメント](https://react-pdf.org/)
- [INVOY 請求書テンプレート](https://go.invoy.jp/template/docs/invoice/)
- [インボイス制度対応](https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice.htm)

## トラブルシューティング

### エラー: `TypeError: Ro is not a function`
- PDFDownloadLinkの実装を確認
- データ型を確認（すべてNumber型に変換されているか）

### エラー: `company_settings is null`
- データベースに会社情報が登録されているか確認
- APIレスポンスに`company_settings`が含まれているか確認

### PDFが生成されない
- ブラウザのコンソールでエラーを確認
- ネットワークタブでAPIレスポンスを確認
- データ構造が正しいか確認

## 変更履歴

### 2025-10-22
- 初版作成
- INVOYスタイルの請求書PDF機能を実装
- `TypeError: Ro is not a function`エラーを修正
- パートナー側と同じパターンでPDFDownloadLinkを実装

