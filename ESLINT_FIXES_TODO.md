# ESLint修正タスク

このファイルは、本番デプロイを優先するために一時的にESLintエラーを無視した後の修正タスクリストです。

## 優先度：高（エラー）

### 1. `any`型の修正

以下のファイルで`any`型を適切な型に置き換える必要があります：

#### API Routes
- [ ] `app/api/admin/applications/route.ts:12` - `error: any` → `error: unknown`
- [ ] `app/api/admin/columns/[id]/route.ts:108` - `error: any` → `error: unknown`
- [ ] `app/api/admin/columns/route.ts:12` - `error: any` → `error: unknown`
- [ ] `app/api/admin/diagnoses/route.ts:43,98,183,184` - 各種`any`型を修正
- [ ] `app/api/admin/inquiries/route.ts:11,165` - `error: any` → `error: unknown`
- [ ] `app/api/admin/orders/[id]/route.ts:122` - `error: any` → `error: unknown`
- [ ] `app/api/admin/orders/route.ts:11` - `error: any` → `error: unknown`
- [ ] `app/api/admin/partners/route.ts:13,250,263` - 各種`any`型を修正
- [ ] `app/api/partner/completed/route.ts:113,227` - `error: any` → `error: unknown`
- [ ] `app/api/partner/diagnoses/route.ts:35` - `error: any` → `error: unknown`
- [ ] `app/api/partner/orders/photos/route.ts:102` - `error: any` → `error: unknown`
- [ ] `app/api/partner/orders/route.ts:27,98` - `error: any` → `error: unknown`
- [ ] `app/api/partner/profile/route.ts:138,226` - `error: any` → `error: unknown`
- [ ] `app/api/partner/reviews/route.ts:119` - `error: any` → `error: unknown`

#### Components
- [ ] `app/components/Admin/Columns/ArticleEditorModal.tsx:78` - `e: any` → `e: ChangeEvent<HTMLInputElement>`
- [ ] `app/components/Admin/Partners/PartnerDetailModal.tsx:9,30,249` - 各種`any`型を修正
- [ ] `app/components/Admin/Partners/PartnerFormModal.tsx:8,9` - Partner型を定義
- [ ] `app/components/Admin/Partners/PartnersView.tsx:46,142,183,241` - 各種`any`型を修正

#### Pages
- [ ] `app/evaluation/[token]/page.tsx:14` - `error: any` → `error: unknown`

### 修正例

```typescript
// ❌ 悪い例
} catch (error: any) {
  console.error(error);
}

// ✅ 良い例
} catch (error: unknown) {
  console.error(error);
  if (error instanceof Error) {
    // error.messageなどにアクセス可能
  }
}
```

## 優先度：中（警告）

### 2. 未使用変数の削除

- [ ] `app/api/partner/profile/route.ts:9` - `request`を削除または使用
- [ ] `app/api/partner/profile/route.ts:110` - `email`を削除または使用
- [ ] `app/components/Admin/Columns/ArticleEditorModal.tsx:34` - `isPublished`を削除または使用
- [ ] `app/components/Admin/Columns/ArticleEditorModal.tsx:174` - `title`を削除または使用
- [ ] `app/components/Admin/Columns/SimpleRichEditor.tsx:3` - `useState`をimportから削除
- [ ] `app/evaluation/[token]/page.tsx:8` - `router`を削除または使用
- [ ] `src/application/services/admin.service.ts:2` - `SignOptions`をimportから削除
- [ ] `src/application/services/admin.service.ts:80,127` - `_`を削除
- [ ] `src/presentation/controllers/admin.controller.ts:112` - `_`を削除

### 3. React Hooks依存配列の修正

以下のコンポーネントでuseEffectの依存配列を修正：

- [ ] `app/columns/[slug]/page.tsx:26` - `fetchArticle`を依存配列に追加
- [ ] `app/components/Admin/Applications/ApplicationsView.tsx:34` - `fetchApplications`を依存配列に追加
- [ ] `app/components/Admin/Columns/ArticleEditorModal.tsx:41` - `fetchArticle`を依存配列に追加
- [ ] `app/components/Admin/Columns/ColumnsView.tsx:30` - `fetchArticles`を依存配列に追加
- [ ] `app/components/Admin/Diagnoses/DiagnosesView.tsx:74` - `fetchDiagnoses`を依存配列に追加
- [ ] `app/components/Admin/Inquiries/InquiriesView.tsx:33` - `fetchInquiries`を依存配列に追加
- [ ] `app/components/Admin/Inquiries/InquiryDetailModal.tsx:36` - `fetchInquiryDetail`を依存配列に追加
- [ ] `app/components/Admin/Orders/OrderDetailModal.tsx:44` - `fetchOrderDetail`を依存配列に追加
- [ ] `app/components/Admin/Orders/OrdersView.tsx:36` - `fetchOrders`を依存配列に追加
- [ ] `app/components/Admin/Partners/PartnerDetailModal.tsx:38` - `fetchPartnerDetail`を依存配列に追加
- [ ] `app/components/Admin/Partners/PartnersView.tsx:51` - `fetchPartners`を依存配列に追加
- [ ] `app/components/AreaPartnersContent.tsx:30` - `fetchPartners`を依存配列に追加
- [ ] `app/components/PartnerDetailContent.tsx:46` - `fetchPartnerDetail`を依存配列に追加
- [ ] `app/evaluation/[token]/page.tsx:24` - `verifyToken`を依存配列に追加
- [ ] `app/partner-dashboard/completed/page.tsx:73` - `fetchCompletedOrders`を依存配列に追加
- [ ] `app/partner-dashboard/diagnoses/page.tsx:97` - `fetchDiagnoses`を依存配列に追加
- [ ] `app/partner-dashboard/orders/page.tsx:75` - `fetchOrders`を依存配列に追加
- [ ] `app/partner-dashboard/reviews/page.tsx:63` - `fetchReviews`を依存配列に追加

### 修正例

```typescript
// ❌ 悪い例
useEffect(() => {
  fetchData();
}, []); // fetchDataが依存配列にない

// ✅ 良い例1: useCallbackを使用
const fetchData = useCallback(async () => {
  // ...
}, [依存する変数]);

useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ 良い例2: useEffect内で定義
useEffect(() => {
  const fetchData = async () => {
    // ...
  };
  fetchData();
}, [依存する変数]);
```

## 優先度：低（パフォーマンス最適化）

### 4. `<img>`を`next/image`の`<Image>`に置き換え

以下のファイルで`<img>`タグを`next/image`の`<Image>`コンポーネントに置き換え：

- [ ] `app/admin-dashboard/columns/preview/page.tsx:43`
- [ ] `app/columns/[slug]/page.tsx:140`
- [ ] `app/components/Admin/Columns/ArticleEditorModal.tsx:285`
- [ ] `app/components/Admin/Columns/ColumnsView.tsx:237`
- [ ] `app/components/ColumnsPageContent.tsx:215`
- [ ] `app/partner-dashboard/completed/page.tsx:431`
- [ ] `app/partner-dashboard/orders/page.tsx:438`

### 修正例

```typescript
// ❌ 悪い例
<img src="/image.jpg" alt="説明" />

// ✅ 良い例
import Image from 'next/image';
<Image src="/image.jpg" alt="説明" width={500} height={300} />
```

## デプロイ後のタスク

1. [ ] 上記のESLintエラーをすべて修正
2. [ ] `next.config.ts`から`ignoreDuringBuilds: true`を削除
3. [ ] ローカルで`npm run lint`を実行してエラーがないことを確認
4. [ ] ローカルで`npm run build`を実行して成功することを確認
5. [ ] 修正をコミット＆プッシュして再デプロイ

## 参考リンク

- [TypeScript: unknown vs any](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown)
- [React Hooks: useEffect依存配列](https://react.dev/reference/react/useEffect#parameters)
- [Next.js: Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
