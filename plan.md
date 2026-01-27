# Vercelログイン問題 - 完全修正計画

## 問題の症状
- ログインAPIは成功（signIn returns `ok: true`）
- しかしセッションクッキー（`authjs.session-token`）がブラウザに保存されない
- ページリダイレクト後、認証されていない状態になる

---

## 確定した問題点（重大度順）

### 1. 【高】クッキー設定が明示的でない
**ファイル**: `auth.ts`

現在の設定には`cookies`オプションが完全に欠落している。NextAuth v5では本番環境で明示的なクッキー設定が推奨される。

### 2. 【高】AUTH_URLがVercelに設定されていない
**場所**: Vercel環境変数

AUTH_URLがないため、NextAuthがクッキーのドメインを正しく推論できない。

### 3. 【高】signIn後の即座のリダイレクト
**ファイル**: `app/components/Admin/Auth/AdminLoginPageContent.tsx`

`window.location.href`で即座にリダイレクトしているが、クッキーがブラウザに反映される前にリダイレクトしている可能性がある。

### 4. 【中】getTokenでsecretを明示指定
**ファイル**: `middleware.ts`

NextAuth v5ではgetTokenにsecretを明示的に渡す必要がない（内部で自動取得）。

### 5. 【中】不要な環境変数が残存
**ファイル**: `.env`

`JWT_SECRET`と`SESSION_SECRET`はNextAuth v5では不要。`AUTH_SECRET`のみが必要。

### 6. 【低】token.subが設定されていない
**ファイル**: `auth.ts`

JWT標準の`sub`クレームが設定されていない。

---

## 修正手順

### Step 1: auth.tsにクッキー設定を追加

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  // ... 既存の設定
})
```

### Step 2: middleware.tsのgetTokenを修正

```typescript
const token = await getToken({ req })  // secretパラメータを削除
```

### Step 3: Vercel環境変数に追加（ユーザー作業）

```
AUTH_URL=https://gaiheki-orange2.vercel.app
```

### Step 4: ログインコンポーネントのリダイレクト処理改善

signIn成功後、少し遅延を入れてからリダイレクトする（クッキー反映待ち）

```typescript
if (result?.ok) {
  // クッキーが確実に設定されるまで少し待つ
  await new Promise(resolve => setTimeout(resolve, 100));
  window.location.href = "/admin-dashboard";
}
```

### Step 5: 不要な環境変数の整理（オプション）

`.env`から以下を削除（NextAuth v5では不要）:
- `JWT_SECRET`
- `SESSION_SECRET`

---

## 実装順序

1. auth.ts - クッキー設定とセッション有効期限を追加
2. middleware.ts - getTokenからsecretパラメータを削除
3. AdminLoginPageContent.tsx - リダイレクト前の遅延追加
4. PartnerLoginPageContent.tsx - 同様の修正
5. **ユーザー作業**: VercelにAUTH_URL環境変数を追加
6. 再デプロイして検証

---

## 検証方法

1. Vercelにデプロイ後、ブラウザの開発者ツールでNetwork → Cookiesを確認
2. `/api/auth/callback/admin-credentials`のレスポンスに`Set-Cookie`ヘッダーがあるか確認
3. ログイン後、`authjs.session-token`（または`__Secure-authjs.session-token`）がブラウザに保存されているか確認
