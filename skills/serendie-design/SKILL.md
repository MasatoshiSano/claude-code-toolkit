---
name: serendie-design
description: 三菱電機のSerendie Design System（@serendie/ui + @serendie/symbols + @serendie/design-token）でUIを実装するための汎用ガイドライン。公式リポジトリに基づくパッケージ名・全33コンポーネント・全92カラートークン・300+アイコンを網羅。実際のプロジェクト（tech-blog）から抽出した再利用可能なデザインパターンを含む。
---

# Serendie Design System ガイドライン

三菱電機のSerendie Design Systemを使ってUIを実装するための汎用skillです。

> **デフォルト動作: 新しいページ・セクション・コンポーネントの実装依頼では、必ず3パターンの候補を提示してから実装に進むこと。**

詳細な情報は `references/` の各ファイルを参照してください。

---

## 0. デフォルト: 3パターン提示ルール

**どのようなUI実装の依頼を受けても、実装前に必ず3パターンの候補を提示する。**

### パターン命名規則

| パターン | 特徴 | 使いどころ |
|---------|------|-----------|
| **Pattern A: フラット型** | シンプル・余白重視・ミニマル | 情報量が少ない、スッキリ見せたい |
| **Pattern B: カード型** | white card + 影 + グリッド | 複数コンテンツを並べる、一覧性を重視 |
| **Pattern C: サイドバー型** | 左メタ情報 + 右コンテンツ | 詳細ページ、属性情報が多い |

### 提示フォーマット

```
## パターン候補

### Pattern A: フラット型
[ASCII or 簡易説明]
特徴: ...

### Pattern B: カード型
[ASCII or 簡易説明]
特徴: ...

### Pattern C: サイドバー型
[ASCII or 簡易説明]
特徴: ...

どのパターンで実装しますか？
```

ユーザーが選択した後、または「まとめて実装」と言った場合にのみコードを書く。

---

## 1. デザイン哲学（serendie.design の雰囲気）

### 基本原則
- **明るく・風通しの良い**: ダーク背景を避け、白・淡青・グラデーションを基調に
- **青はアクセント**: `#0353AA` はボタン・見出し・アイコンなどポイントのみに使用（背景全面は避ける）
- **白いカード**: コンテンツはすべて白のカード（`--colors-sd-system-color-component-surface`）に載せる
- **装飾的な円**: ヒーローセクションには `radial-gradient` の装飾円を重ねてビジュアルを豊かにする

### カラー使用ガイド

```
背景色（ページ・セクション）
  ✅ 白: var(--colors-sd-system-color-component-surface)
  ✅ 淡青: var(--color-primary-100) = #dce8f8
  ✅ 超淡青: #f5f9ff
  ✅ グラデーション: linear-gradient(135deg, #dce8f8 0%, #eef4fd 60%, #f5f9ff 100%)
  ❌ 濃青ベタ塗り: var(--colors-sd-system-color-impression-primary) を背景全面に使わない

アクセント色
  ✅ ボタン背景: var(--colors-sd-system-color-impression-primary)
  ✅ アイコン背景（ライト）: var(--color-primary-100) = #dce8f8
  ✅ アイコン色: var(--colors-sd-system-color-impression-primary)
  ✅ 見出し左ボーダー: var(--colors-sd-system-color-impression-primary)

テキスト
  ✅ メイン: var(--colors-sd-system-color-component-text-primary)
  ✅ サブ: var(--colors-sd-system-color-component-text-secondary)
  ❌ ハードコード色: #333, #666 など使わない
```

---

## 2. 再利用可能なデザインパターン集

### 2.1 ヒーローセクション

```tsx
// ライトブルーグラデーション + 装飾円パターン
<div style={{
  background: "linear-gradient(135deg, #dce8f8 0%, #eef4fd 60%, #f5f9ff 100%)",
  borderRadius: "20px",
  padding: "48px",
  marginBottom: "40px",
  position: "relative",
  overflow: "hidden",
}}>
  {/* 装飾円（右上） */}
  <div style={{
    position: "absolute", right: "-80px", top: "-80px",
    width: "300px", height: "300px", borderRadius: "50%",
    background: "radial-gradient(circle, #b9d1f1 0%, transparent 70%)",
    pointerEvents: "none", opacity: 0.7,
  }} />
  {/* 装飾円（右下） */}
  <div style={{
    position: "absolute", right: "100px", bottom: "-100px",
    width: "260px", height: "260px", borderRadius: "50%",
    background: "radial-gradient(circle, #82ace6 0%, transparent 70%)",
    pointerEvents: "none", opacity: 0.4,
  }} />

  <div style={{ position: "relative", zIndex: 1 }}>
    <p style={{
      fontSize: "0.75rem", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.12em",
      color: "var(--colors-sd-system-color-impression-primary)", margin: "0 0 10px",
    }}>SUBTITLE</p>
    <h1 style={{
      fontSize: "2.25rem", fontWeight: 800, margin: "0 0 14px",
      color: "var(--colors-sd-system-color-component-text-primary)",
    }}>タイトル</h1>
    <p style={{
      fontSize: "0.95rem", margin: 0, maxWidth: "420px", lineHeight: 1.6,
      color: "var(--colors-sd-system-color-component-text-secondary)",
    }}>説明文</p>
  </div>
</div>
```

### 2.2 白いカード（基本）

```tsx
const cardBase: React.CSSProperties = {
  border: "1px solid var(--colors-sd-system-color-component-outline-bright)",
  borderRadius: "12px",
  backgroundColor: "var(--colors-sd-system-color-component-surface)",
  cursor: "pointer",
  transition: "box-shadow 0.2s, border-color 0.2s",
};

// ホバーエフェクト
const hoverOn = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.boxShadow = "var(--shadows-sd-system-elevation-shadow-level3)";
  e.currentTarget.style.borderColor = "var(--colors-sd-system-color-impression-primary)";
};
const hoverOff = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.boxShadow = "none";
  e.currentTarget.style.borderColor = "var(--colors-sd-system-color-component-outline-bright)";
};
```

### 2.3 セクション見出し（左ボーダーアクセント）

```tsx
function SectionHeading({ label, count, accent }: {
  label: string; count: number; accent?: boolean
}) {
  return (
    <h2 style={{
      display: "flex", alignItems: "center", gap: "10px",
      fontSize: "1.05rem", fontWeight: 700,
      color: "var(--colors-sd-system-color-component-text-primary)",
      marginBottom: "12px",
    }}>
      <span style={{
        width: "4px", height: "18px", borderRadius: "2px", flexShrink: 0,
        backgroundColor: accent
          ? "var(--colors-sd-system-color-component-text-secondary)"
          : "var(--colors-sd-system-color-impression-primary)",
      }} />
      {label}
      <span style={{
        fontSize: "0.78rem", fontWeight: 400,
        color: "var(--colors-sd-system-color-component-text-secondary)",
      }}>
        {count}件
      </span>
    </h2>
  );
}
```

### 2.4 アイコン付きカード（グリッド）

```tsx
// アイコン背景（ライトブルー = coming-soon でない場合）
const iconBg: React.CSSProperties = {
  borderRadius: "10px",
  backgroundColor: isComingSoon
    ? "var(--colors-sd-reference-color-scale-gray-100)"
    : "var(--color-primary-100)",      // = #dce8f8（Tailwind @theme カスタム変数）
  color: isComingSoon
    ? "var(--colors-sd-system-color-component-text-secondary)"
    : "var(--colors-sd-system-color-impression-primary)",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
```

### 2.5 サイドナビゲーション（スティッキー）

```tsx
<aside style={{
  width: "192px", flexShrink: 0,
  backgroundColor: "var(--colors-sd-system-color-component-surface)",
  border: "1px solid var(--colors-sd-system-color-component-outline-bright)",
  borderRadius: "16px",
  paddingTop: "20px", paddingBottom: "20px",
  position: "sticky", top: "72px",
  alignSelf: "flex-start",
  maxHeight: "calc(100vh - 88px)", overflowY: "auto",
}}>
  {/* リンクのアクティブスタイル */}
  {/* activeId === id のとき: */}
  {/*   color: var(--colors-sd-system-color-impression-primary) */}
  {/*   borderLeft: 3px solid ... */}
  {/*   backgroundColor: var(--color-primary-100) */}
</aside>
```

### 2.6 アプリ詳細ページ（サイドバー型 = Pattern C）

```tsx
// レスポンシブ: mobile=flex-col (サイドバー上), desktop=flex-row (サイドバー左)
<div className="flex flex-col md:flex-row gap-6 items-start">
  {/* 左サイドバー: アプリメタ情報 */}
  <aside className="w-full md:w-64" style={{
    flexShrink: 0,
    backgroundColor: "var(--colors-sd-system-color-component-surface)",
    border: "1px solid var(--colors-sd-system-color-component-outline-bright)",
    borderRadius: "16px", padding: "24px",
    position: "sticky", top: "72px", alignSelf: "flex-start",
  }}>
    {/* アイコン（大） */}
    {/* タイトル・サブタイトル */}
    {/* バッジ群 */}
    {/* 説明文 */}
    {/* 区切り線 */}
    {/* アクションボタン（縦並び・width:100%） */}
  </aside>

  {/* 右コンテンツ */}
  <div className="flex-1 min-w-0">
    <article style={{
      backgroundColor: "var(--colors-sd-system-color-component-surface)",
      borderRadius: "16px", padding: "32px",
    }}>
      {/* メインコンテンツ */}
    </article>
  </div>
</div>
```

### 2.7 バッジ・タグ

```tsx
// カテゴリバッジ（青）
<span style={{
  borderRadius: "9999px",
  backgroundColor: "var(--colors-sd-system-color-impression-primary)",
  color: "var(--colors-sd-system-color-impression-on-primary)",
  padding: "2px 10px", fontSize: "0.72rem", fontWeight: 500,
}}>カテゴリ名</span>

// レベルバッジ（淡青）
<span style={{
  borderRadius: "9999px",
  backgroundColor: "var(--color-primary-100)",
  color: "var(--colors-sd-system-color-impression-primary)",
  padding: "2px 10px", fontSize: "0.72rem", fontWeight: 500,
}}>LV.1</span>
```

### 2.8 グループ切り替えトグル（レベル別 / カテゴリ別）

```tsx
<div style={{
  display: "flex", alignItems: "center", gap: "3px",
  borderRadius: "8px",
  border: "1px solid var(--colors-sd-system-color-component-outline-bright)",
  padding: "3px",
  backgroundColor: "var(--colors-sd-system-color-component-surface)",
}}>
  {(["level", "category"] as const).map((g) => (
    <button key={g} onClick={() => setGroupBy(g)} style={{
      padding: "5px 14px", borderRadius: "5px",
      fontSize: "0.8rem", fontWeight: groupBy === g ? 600 : 400,
      border: "none", cursor: "pointer",
      backgroundColor: groupBy === g
        ? "var(--colors-sd-system-color-impression-primary)" : "transparent",
      color: groupBy === g
        ? "white" : "var(--colors-sd-system-color-component-text-secondary)",
      transition: "all 0.15s",
    }}>
      {g === "level" ? "レベル別" : "カテゴリ別"}
    </button>
  ))}
</div>
```

---

## 3. ページタイプ別パターンカタログ

### 3.1 一覧ページ（カタログ・インデックス）

**Pattern A: フラット型**
```
[フィルター/ソートバー]
[カードグリッド 3列]
  [card][card][card]
  [card][card][card]
```

**Pattern B: サイドバー型（ナビ + グリッド）**
```
[サイドバーナビ] | [ヒーローセクション         ]
192px           | [レベル別/カテゴリ別トグル]
sticky          | [カードグリッド              ]
                | [ビジョンマップ              ]
```
← このプロジェクトのメインページはこれ

**Pattern C: 全幅テーブル型**
```
[フィルターチップ群]
[テーブル: 名前 | カテゴリ | レベル | アクション]
```

### 3.2 詳細ページ（アプリ・記事・プロフィール）

**Pattern A: 縦積み型**
```
[ヘッダー: アイコン + タイトル + バッジ + ボタン]
[バナー/カバー画像]
[タブ: 概要 | 使い方 | ...]
[本文]
```

**Pattern B: ヒーロー型**
```
[ヒーロー: 左タイトル + 右バナーパネル]
[サマリーカード]
[タブコンテンツ]
[本文]
```

**Pattern C: サイドバー型** ← このプロジェクトの `/apps/[slug]` はこれ
```
[サイドバー260px] | [本文カード              ]
アイコン(large)   | バナー（あれば）
タイトル          | サマリーカード
バッジ群          | タブ: 概要 | 使い方
説明文            | 目次
-----             | 本文
アプリを開く →    |
使い方            |
```
モバイル: サイドバーが上部に表示（Tailwind `flex-col md:flex-row`）

### 3.3 フォームページ（登録・編集）

**Pattern A: シングルカラム**
```
[ページタイトル]
[フォームカード]
  TextField: 名前
  Select: カテゴリ
  [タグ選択]
  MDEditor: 説明
  [保存ボタン]
```

**Pattern B: 2カラム（左フォーム + 右プレビュー）**
```
[フォーム    ] | [リアルタイムプレビュー]
```

**Pattern C: ステップ型（ウィザード）**
```
[Step 1: 基本情報] → [Step 2: 詳細] → [Step 3: 確認・保存]
```

---

## 4. 技術基盤（必須事項）

### 4.1 パッケージ名

| 用途 | パッケージ名 | 誤りやすい名前 |
|------|--------------|----------------|
| UIコンポーネント | `@serendie/ui` | ❌ `@serendie/serendie` |
| アイコン | `@serendie/symbols` | ❌ `@serendie/serendie-symbols` |
| デザイントークン | `@serendie/design-token` | - |

### 4.2 CSS変数

```css
/* ✅ 主要変数（Panda CSS生成） */
var(--colors-sd-system-color-impression-primary)       /* #0353AA konjo blue */
var(--colors-sd-system-color-impression-on-primary)    /* white */
var(--colors-sd-system-color-component-surface)        /* white card background */
var(--colors-sd-system-color-component-outline-bright) /* border color */
var(--colors-sd-system-color-component-text-primary)   /* main text */
var(--colors-sd-system-color-component-text-secondary) /* sub text */
var(--shadows-sd-system-elevation-shadow-level3)       /* hover shadow */

/* ✅ Tailwind @theme カスタム変数（globals.css で定義） */
var(--color-primary-100)  /* = #dce8f8 ライトブルー背景・アイコン背景 */
var(--color-primary-500)  /* = #0353aa */

/* ❌ 危険: primary-container は primary と同色（konjoテーマ） */
/* var(--colors-sd-system-color-impression-primary-container) */
/* → アイコン背景などには var(--color-primary-100) を使うこと */
```

### 4.3 CSS import順序

```typescript
// src/app/layout.tsx
import '@serendie/design-token/tokens.css'
import '@serendie/ui/styles.css'
import './globals.css'
```

```css
/* src/app/globals.css */
@import "tailwindcss";
@layer reset, base, tokens, recipes, utilities;

@theme {
  --color-primary-100: #dce8f8;
  --color-primary-500: #0353aa;
}
```

### 4.4 テーマ

```html
<html lang="ja" data-panda-theme="konjo">
```

### 4.5 コンポーネントAPI

```tsx
// Button
<Button styleType="filled" size="medium">保存</Button>
// styleType: "filled" | "outlined" | "ghost" | "rectangle"

// Select
<Select
  label="カテゴリ"
  items={[{ label: "収集", value: "収集" }]}
  value={[selected]}                          // ← 配列
  onValueChange={(d) => setSelected(d.value[0])}
/>

// TextField
<TextField label="名前" value={v} onChange={e => setV(e.target.value)} fullWidth />
```

---

## 5. プリフライトチェック

`npm run build` 後に目視確認：

- [ ] CSS変数が DOM に反映: `getComputedStyle(document.documentElement).getPropertyValue('--colors-sd-system-color-impression-primary')` が空でない
- [ ] `<html data-panda-theme="konjo">` が設定されている
- [ ] アイコンが SVG として描画されている（「？」や1文字フォールバックではない）
- [ ] 背景がモノクロでない（白カード・淡青アクセントが見える）
- [ ] モバイル幅でサイドバーが上部に表示される（Pattern C の場合）

```bash
# Playwright でスクショ確認
# browser_navigate(url) → browser_take_screenshot → 視認
# browser_resize(width=480) → モバイル確認
```

---

## 6. トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| 全体が濃青になる | `primary-container` を背景に使用 | `--color-primary-100` (#dce8f8) に変更 |
| カードに影がない | ホバー時のみ shadow | 初期は `boxShadow: "none"` が正常 |
| タグがスクロールしない | `maxHeight` + `overflowY: "auto"` を忘れ | 追加する |
| モバイルでサイドバーが横並び | Tailwind `md:flex-row` が効いていない | `flex-col md:flex-row` を確認 |
| Tailwind クラスが効かない | pipeline 未設定 | `@import "tailwindcss"` + `@tailwindcss/postcss` を確認 |

詳細: `references/troubleshooting.md`

---

## 7. Claude への動作指示

1. **UI実装依頼を受けたら必ず3パターン（A/B/C）を提示し、ユーザーの選択を待ってから実装する**
2. デザインは serendie.design の雰囲気（明るい・風通しの良い・青をアクセントのみに）に合わせる
3. 背景に濃青ベタ塗りを使わない → 白カード or 淡青グラデーション
4. `--colors-sd-system-color-impression-primary-container` は primary と同色（konjo）→ `--color-primary-100` を使う
5. アイコン背景は `var(--color-primary-100)` + アイコン色は `var(--colors-sd-system-color-impression-primary)`
6. Tailwind は「配置」、@serendie/ui は「コンポーネント」として役割分担
7. レスポンシブは Tailwind `flex-col md:flex-row` で対応
8. ハードコード色・サイズを使わず CSS変数を使用
9. 不明な場合は `references/` を参照、または Storybook (https://storybook.serendie.design) で確認

---

## 8. 参照ファイル

| ファイル | 内容 |
|---------|------|
| `references/components.md` | 全コンポーネントAPI詳細 |
| `references/icons.md` | SerendieSymbol命名規則とよく使うアイコン一覧 |
| `references/colors-tokens.md` | CSS変数・カラートークン完全一覧 |
| `references/troubleshooting.md` | トラブルシューティング詳細 |

- ガイドライン: https://serendie.design
- Storybook: https://storybook.serendie.design
- GitHub: https://github.com/serendie
