# Serendie Design System トラブルシューティング

Serendie利用時によく発生する問題と解決策。

---

## import / モジュール関連

### `Module not found: @serendie/serendie`

**原因**: パッケージ名が間違い。

**対応**:
```bash
npm uninstall @serendie/serendie
npm install @serendie/ui
```

`import` 文も修正：
```typescript
// ❌
import { Button } from '@serendie/serendie'
// ✅
import { Button } from '@serendie/ui'
```

### `has no exported member 'SomeIcon'`

**原因**: アイコン名が実在しない。

**対応**: `references/icons.md` の「よくある誤りと対応」を参照。または：

```bash
node --input-type=module -e "import('@serendie/symbols').then(m => console.log(Object.keys(m).sort().join('\n')))"
```

### `Cannot use import statement outside a module` / CJSエラー

**原因**: Serendie UIはESM専用（CJS非対応）。

**対応**:
- `package.json` に `"type": "module"` を追加、または
- モダンバンドラー（Vite, webpack 5+）を使用
- Node.jsでテストする場合は `.mjs` 拡張子、または `--experimental-vm-modules`

---

## スタイリング関連

### CSS変数が効かない（色が表示されない）

**原因1**: プレフィックスが間違っている

```css
/* ❌ 公式ドキュメントに書かれている形式（実ビルドには存在しない） */
background: var(--sd-system-color-impression-primary);

/* ✅ 実際のCSS変数名 */
background: var(--colors-sd-system-color-impression-primary);
```

**原因2**: `tokens.css` が読み込まれていない

`src/main.tsx` を確認：

```typescript
// 必ずこの順序
import '@serendie/design-token/tokens.css'
import '@serendie/ui/styles.css'
import './index.css'
```

**原因3**: package export pathから読み込んでいない

```typescript
// ❌ dist直接パス
import '@serendie/design-token/dist/tokens.css'
// ✅ package exports経由
import '@serendie/design-token/tokens.css'
```

### キャメルケース vs ケバブケース混同

Pandaがキャメルケースをケバブケースに変換する：

```
内部トークン:  sd.system.color.impression.onPrimary
CSS変数:      --colors-sd-system-color-impression-on-primary
                                                  ^^^^^^^^^^^
                                                  ケバブケース化
```

---

## テーマ関連

### テーマが切り替わらない

**チェック1**: `<html>` 要素の `data-panda-theme` 属性

```html
<!-- index.html -->
<html lang="ja" data-panda-theme="konjo">
```

**チェック2**: `@layer` 宣言が `index.css` の先頭にある

```css
@layer reset, base, tokens, recipes, utilities;

/* その後にカスタムスタイル */
```

**チェック3**: 動的切り替えコード

```typescript
document.documentElement.setAttribute('data-panda-theme', 'asagi')
```

### 特定のコンポーネントだけテーマが効かない

Ark UIのheadlessコンポーネントは propに渡されたstyleが優先。CSS変数を上書きしているインラインstyleを確認。

---

## コンポーネントAPI関連

### `Property 'variant' does not exist on Button`

**原因**: Buttonのpropは `styleType`（`variant` ではない）。

```tsx
// ❌
<Button variant="primary">
// ✅
<Button styleType="filled">
```

値のマッピング:
| 一般的な名前 | Serendie |
|--------------|----------|
| `primary` | `filled` |
| `secondary` | `outlined` |
| `text` | `ghost` |

### `CircularProgress is not exported`

**原因**: Serendie UIに `CircularProgress` は存在しない。

**対応**: `ProgressIndicatorIndeterminate` を使用：

```tsx
import { ProgressIndicatorIndeterminate } from '@serendie/ui'

<ProgressIndicatorIndeterminate type="circular" size="medium" />
```

### Selectの値が反映されない

**原因**: Ark UIベースのSelectは `value` / `onValueChange` が配列形式。

```tsx
// ❌
<Select value={selectedValue} onValueChange={(v) => setValue(v)} />

// ✅
<Select
  value={[selectedValue]}                       // 配列
  onValueChange={(d) => setValue(d.value[0])}  // d.value は配列
/>
```

### ModalDialogが閉じない

**原因**: `onOpenChange` を実装していない、または `onButtonClick` だけで閉じようとしている。

```tsx
<ModalDialog
  isOpen={open}
  onButtonClick={() => {
    handleSubmit()
    setOpen(false)   // submit時は明示的に閉じる
  }}
  onOpenChange={(d) => {
    if (!d.open) setOpen(false)   // 外側クリック・Escなどで閉じる
  }}
  ...
/>
```

---

## TypeScript関連

### `Cannot find module '@serendie/ui'` (TS2307)

**原因**: パッケージがインストールされていない、または `node_modules` が壊れている。

**対応**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### JSON importのエラー (`Cannot find module '/xxx.json'`)

プロジェクトルートのJSONを import したい場合、絶対パス `/xxx.json` は TypeScript が解決できない。

**対応**: Viteの `import.meta.glob` を使う：

```typescript
const outputs = import.meta.glob('/amplify_outputs.json', { eager: true })
const data = outputs['/amplify_outputs.json'] as SomeType | undefined
```

---

## Tailwind CSS との混在

### Tailwind 削除後にクラス名が JSX に残ってデザイン崩壊

**症状**: CSS ファイルは 200 で配信されるのに、`mb-10`, `text-3xl`, `grid-cols-4` 等が無視されレイアウトが 1 列になる、見出しが太字にならない。

**原因**: プロジェクトを Tailwind から Panda CSS に移行する途中で、`tailwind.config.ts` / `postcss.config.mjs` を削除したが JSX に Tailwind クラスが残っている。CSS は出力されるが Tailwind 由来の class はビルドされない。

**診断**:
```bash
# 1. Tailwind を削除済みか
ls postcss.config.mjs tailwind.config.{ts,js} 2>/dev/null
grep -E "@tailwindcss/postcss|^\\s*\"tailwindcss\"" package.json

# 2. JSX で Tailwind クラスが使われているか
grep -rE 'className="[^"]*\b(mb-|p-|text-|grid-cols-|flex|bg-)' src/ | head

# 3. globals.css に Tailwind の @import / @tailwind ディレクティブがあるか
head -5 src/app/globals.css
```

**修復**:

A) **Tailwind v4 を残しつつ Panda 共存**:
```bash
# 1. config 復元
git checkout HEAD -- tailwind.config.ts postcss.config.mjs

# 2. 依存追加（typography は追加しない！→ 理由は下記参照）
npm install -D tailwindcss @tailwindcss/postcss

# 3. globals.css 先頭に @import を追加
sed -i '1i\@import "tailwindcss";' src/app/globals.css

# 4. リビルド
npm run build
```

> **⚠️ @tailwindcss/typography を使わない**: `@tailwindcss/typography` v0.5.x は Tailwind v3 専用。Tailwind v4 環境で `npm install` すると `prose` クラスがスタイルを全く適用しないサイレントバグが発生する。
> → Markdown コンテンツのスタイリングは **`.md-prose` カスタムクラス**を使うこと（下記参照）。

B) **Tailwind を完全廃止 → 全 JSX を Panda に書き換える**: 大規模リファクタが必要。`grep -rE 'className=' src/ | wc -l` で件数を見積もる。

### `.md-prose` — Markdown コンテンツのスタイリングパターン（typography 代替）

`prose prose-gray max-w-none` の代わりに `className="md-prose"` を使う。`globals.css` に定義：

```css
/* src/app/globals.css */
.md-prose {
  line-height: 1.85;
  color: var(--colors-sd-system-color-component-text-primary);
}
.md-prose p { margin: 0 0 1.1em; }
.md-prose h2 {
  font-size: 1.2rem; font-weight: 700; margin: 1.6em 0 0.6em;
  padding-left: 12px;
  border-left: 4px solid var(--colors-sd-system-color-impression-primary);
}
.md-prose h3 {
  font-size: 1.05rem; font-weight: 700; margin: 1.2em 0 0.4em;
  padding-left: 10px;
  border-left: 3px solid var(--color-primary-100);
}
.md-prose ul { padding-left: 1.6em; margin: 0.6em 0; }
.md-prose li { margin-bottom: 0.35em; }
.md-prose code {
  font-size: 0.88em; padding: 2px 6px;
  background: var(--color-primary-100); border-radius: 4px;
}
.md-prose pre code { background: transparent; padding: 0; }
.md-prose pre {
  padding: 16px; border-radius: 8px;
  background: #1a1a2e; color: #e2e8f0; overflow-x: auto;
}
.md-prose blockquote {
  border-left: 4px solid var(--color-primary-100);
  margin: 0; padding: 8px 16px;
  background: #f5f9ff; border-radius: 0 8px 8px 0;
}
.md-prose table { width: 100%; border-collapse: collapse; }
.md-prose th, .md-prose td {
  border: 1px solid var(--colors-sd-system-color-component-outline-bright);
  padding: 8px 12px; text-align: left;
}
.md-prose th { background: var(--color-primary-100); font-weight: 600; }
.md-prose svg, .md-prose img { max-width: 100%; height: auto; }
```

JSX では `react-markdown` + `className="md-prose"` を組み合わせる：
```tsx
import ReactMarkdown from "react-markdown";
<div className="md-prose">
  <ReactMarkdown>{markdown}</ReactMarkdown>
</div>
```

### panda codegen が走っていない

**症状**: `src/styled-system/` ディレクトリが空 / 存在しない。Panda の `recipes` / `utilities` を使うコンポーネントが効かない。

**診断**:
```bash
ls -la src/styled-system/recipes.mjs 2>/dev/null
grep '"prepare"' package.json
```

**修復**:
```bash
# package.json に prepare を追加
npm pkg set scripts.prepare="panda codegen"

# 強制実行
npx panda codegen

# 確認
ls src/styled-system/
```

---

## OpenNext / SSR デプロイ関連

### `_next/static/*.css` が CloudFront で 404 になる

**症状**: SSR (`https://<domain>/`) は HTML を返すが、HTML 中の `<link href="/_next/static/css/*.css">` が 404 になりスタイルが当たらない。

**原因**: OpenNext は SSR Lambda（`server-functions/`）と静的アセット（`assets/`）を別々に出力する。Lambda は `/_next/static/*` を serve しない。

**修復**:
```bash
# 1. assets/ を S3 にアップロード
aws s3 sync .open-next/assets/ s3://<content-bucket>/assets/ \
  --delete --cache-control 'public, max-age=31536000, immutable'

# 2. CloudFront に /_next/* behavior を追加（CDK）
#    - origins.S3BucketOrigin.withOriginAccessControl(bucket, { originPath: "/assets" })
#    - additionalBehaviors: { "/_next/*": { origin: nextOrigin, cachePolicy: CACHING_OPTIMIZED } }
```

### 静的画像 (`/apps/*/icon.svg` 等) が SSR Lambda 経由で 404

**原因**: OpenNext の SSR Lambda は `public/` 配下を自動配信しない。

**修復**: CloudFront に静的アセット経路の behavior を追加：
```typescript
const staticOrigin = origins.S3BucketOrigin.withOriginAccessControl(
  contentBucket,
  { originPath: "/public" }
);
additionalBehaviors: {
  "/images/*": { origin: staticOrigin, ... },
  "/apps/*/icon.svg": { origin: staticOrigin, ... },
  "/apps/*/banner.{svg,png}": { origin: staticOrigin, ... },
  // 必要なパターンを列挙（/apps/* 全部だと SSR detail page と衝突する）
}
```

---

## 企業プロキシ環境（社内 PC + WSL + Cisco AnyConnect 等）

### `npm install` / `docker pull` が TLS エラー

**症状**:
- `npm error code UNABLE_TO_GET_ISSUER_CERT_LOCALLY`
- `docker: ... x509: certificate signed by unknown authority`

**修復**:
```bash
# 1. 社内ルート CA を Windows 証明書ストアからエクスポート
powershell -NoProfile -Command 'Get-ChildItem Cert:\LocalMachine\Root | Where-Object { $_.Subject -match "MELCO|Mitsubishi" } | Export-Certificate -FilePath C:\temp\corp-ca.crt -Type CERT'

# 2. WSL に登録
sudo cp /mnt/c/temp/corp-ca.crt /usr/local/share/ca-certificates/corp-ca.crt
sudo update-ca-certificates

# 3. npm proxy を設定（Tailwind v4 等のインストールに必須）
npm config set proxy http://<corp-proxy>:<port>
npm config set https-proxy http://<corp-proxy>:<port>

# 4. ~/.bashrc 先頭（interactive check 前）に環境変数を追加
# WSL の bash -c は非対話のため、case $- in *i*) の前に export する必要あり
```

### WSL から AWS に到達できない（VPN 配下）

**症状**: WSL 内で `aws sts get-caller-identity` がタイムアウト。

**原因**: Cisco AnyConnect 等の VPN クライアントが WSL の NAT サブネット (172.x.x.x) からの送信を弾く。

**修復**: `wsl-vpnkit` (sakai135/wsl-vpnkit) を別ディストロとして import し、gvproxy で Windows ホストネットワーク経由のトンネルを張る。

### Docker BuildKit が public.ecr.aws の TLS 検証で失敗

**症状**: `failed to fetch anonymous token: ... tls: failed to verify certificate`

**修復**: `DOCKER_BUILDKIT=0` で legacy builder を使う（BuildKit は dockerd の CA とは別の trust store を持つ場合がある）：
```bash
DOCKER_BUILDKIT=0 docker build -t <name> .
```

---

## ビルド・バンドル関連

### バンドルサイズが大きい

**原因**: アイコンやコンポーネントを一括importしている。

**対応**: 必ず個別import：

```tsx
// ❌ 巨大なバンドル
import * as Symbols from '@serendie/symbols'

// ✅ Tree Shaking有効
import { SerendieSymbolHome, SerendieSymbolClose } from '@serendie/symbols'
```

### Panda CSSのビルドエラー

`panda.config.ts` の設定を確認：
- プリセットに `@serendie/ui/preset` が入っているか
- `include` パターンがsrcを含むか

---

## 診断用コマンド集

### 使用中のSerendieパッケージバージョン

```bash
npm ls @serendie/ui @serendie/symbols @serendie/design-token
```

### 実際のCSS変数を確認

```bash
grep -E "^\s+--colors-sd-" node_modules/@serendie/design-token/dist/tokens.css | head -30
```

### UIコンポーネントの一覧

```bash
node --input-type=module -e "import('@serendie/ui').then(m => console.log(Object.keys(m).sort().join('\n')))"
```

### アイコンの一覧

```bash
node --input-type=module -e "import('@serendie/symbols').then(m => console.log(Object.keys(m).sort().join('\n')))"
```
