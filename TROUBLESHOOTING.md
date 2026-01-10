# トラブルシューティングガイド

## 請求書PDF発行機能のエラー対処法

### エラー1: `TypeError: Ro is not a function`

**症状:**
- PDFダウンロードボタンをクリックするとエラーが発生
- `@react-pdf/renderer`の内部エラー

**原因:**
1. PDFDownloadLinkの実装で`url`プロパティを使った副作用処理
2. データ型の不一致（Decimal型がNumber型に変換されていない）

**解決策:**
```typescript
// ❌ 間違った実装
<PDFDownloadLink document={...} fileName={...}>
  {({ loading, url }) => {
    if (url && !loading) {
      setTimeout(() => setSelectedInvoiceForPDF(null), 1000);
    }
    return <Button>...</Button>
  }}
</PDFDownloadLink>

// ✅ 正しい実装
<PDFDownloadLink document={...} fileName={...}>
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
</PDFDownloadLink>
```

### エラー2: `Cannot find module '../lightningcss.linux-x64-gnu.node'`

**症状:**
- 開発サーバー起動時にエラー
- Tailwind CSS v4のネイティブモジュールが見つからない

**原因:**
- `lightningcss`のネイティブバイナリが正しくインストールされていない

**解決策:**
```bash
# node_modulesをクリーンアップして再インストール
cd /home/ubuntu/gaiheki
rm -rf node_modules package-lock.json
npm install
```

### エラー3: `company_settings is null`

**症状:**
- PDFに発行元情報が表示されない
- コンソールに`company_settings is null`のエラー

**原因:**
- データベースに会社情報が登録されていない

**解決策:**
```sql
-- company_settingsテーブルにデータを挿入
INSERT INTO company_settings (
  company_name,
  postal_code,
  address,
  phone,
  email,
  invoice_registration_number,
  bank_name,
  bank_branch_name,
  bank_account_type,
  bank_account_number,
  bank_account_holder,
  created_at,
  updated_at
) VALUES (
  '株式会社サンプル',
  '100-0001',
  '東京都千代田区千代田1-1-1',
  '03-1234-5678',
  'info@example.com',
  'T1234567890123',
  'サンプル銀行',
  '本店',
  '普通',
  '1234567',
  'カ）サンプル',
  NOW(),
  NOW()
);
```

### エラー4: PDFがダウンロードされない

**症状:**
- ボタンをクリックしても何も起こらない
- エラーメッセージも表示されない

**チェックリスト:**
1. ブラウザのコンソールでエラーを確認
2. ネットワークタブでAPIレスポンスを確認
3. 発行済みの請求書を選択しているか確認（下書きはPDF化できません）

**デバッグ手順:**
```javascript
// ブラウザのコンソールで以下を確認
console.log('===== 取得したデータ =====', data.data);
console.log('===== 整形後のPDFデータ =====', pdfData);
```

### エラー5: データ型エラー

**症状:**
- `toLocaleString is not a function`
- `Number is not a function`

**原因:**
- 金額データが文字列やDecimal型のまま渡されている

**解決策:**
```typescript
// すべての金額データをNumber型に変換
const pdfData = {
  total_amount: Number(data.data.total_amount),
  tax_amount: Number(data.data.tax_amount),
  grand_total: Number(data.data.grand_total),
  items: data.data.items.map((item: any) => ({
    description: item.description,
    amount: Number(item.amount),
  })),
};
```

## よくある質問

### Q1: PDFのレイアウトをカスタマイズしたい

**A:** `app/components/Admin/Invoice/CompanyInvoicePDFInvoice.tsx`のスタイル定義を編集してください。

```typescript
const styles = StyleSheet.create({
  title: {
    fontSize: 20, // フォントサイズを変更
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // その他のスタイル...
});
```

### Q2: 複数の請求書を一括でPDFダウンロードしたい

**A:** 現在は1件ずつのダウンロードのみ対応しています。一括ダウンロード機能は今後の改善案として検討中です。

### Q3: PDFにロゴ画像を追加したい

**A:** `@react-pdf/renderer`の`Image`コンポーネントを使用してください。

```typescript
import { Image } from '@react-pdf/renderer';

// PDFコンポーネント内
<View style={styles.header}>
  <Image src="/logo.png" style={{ width: 100, height: 50 }} />
  <Text style={styles.title}>請求書</Text>
</View>
```

### Q4: PDFが文字化けする

**A:** 日本語フォントを追加する必要があります。

```typescript
import { Font } from '@react-pdf/renderer';

// フォントを登録
Font.register({
  family: 'NotoSansJP',
  src: '/fonts/NotoSansJP-Regular.ttf',
});

// スタイルで使用
const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansJP',
  },
});
```

## デバッグツール

### ブラウザのデベロッパーツール

1. **Consoleタブ**
   - エラーメッセージを確認
   - ログ出力を確認

2. **Networkタブ**
   - APIリクエスト/レスポンスを確認
   - ステータスコードを確認

3. **Elementsタブ**
   - DOM構造を確認
   - CSSスタイルを確認

### APIエンドポイントのテスト

```bash
# 請求書詳細を取得
curl -X GET http://localhost:3000/api/admin/invoices/1 \
  -H "Cookie: admin_session=..." \
  | jq .
```

## 連絡先

問題が解決しない場合は、以下の情報を添えて報告してください:

1. エラーメッセージ（コンソールログ）
2. 再現手順
3. 環境情報（ブラウザ、OS）
4. スクリーンショット

## 参考リンク

- [@react-pdf/renderer ドキュメント](https://react-pdf.org/)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [Prisma ドキュメント](https://www.prisma.io/docs)
- [Supabase ドキュメント](https://supabase.com/docs)

