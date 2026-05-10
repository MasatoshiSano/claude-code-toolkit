---
name: html2pptx-design
description: "ピクセルパーフェクトなデザイン品質のPowerPointプレゼンテーションをHTML+CSS → Playwright → PPTX で作成する。1つのHTMLソースから『画像版（ピクセルパーフェクト・テキスト編集不可）』と『テキスト編集可能版（テキストボックス＋図形で再構成）』の2ファイルを同時に出力する。トリガー: 「デザインの良いPP/スライドを作って」「プレゼン資料を作りたい」「〇〇の紹介スライドを作って」「編集できるPP/編集可能なスライド」など、見栄えの良いPowerPoint作成を依頼されたとき。"
---

# HTML → Playwright → PPTX デザインスライド作成

HTMLとCSSでスライドを1回設計すると、Playwright経由で **2種類のPPTXを同時に生成** する：

1. **画像版** `<output>.pptx` — 各スライドを 1920×1080 でスクリーンショットしてフルスライドに埋め込んだ、ピクセルパーフェクトだがテキスト編集不可のデッキ。
2. **テキスト編集可能版** `<output>-editable.pptx` — DOM を走査し、`getComputedStyle` から位置・色・フォントサイズを取得して、本物のテキストボックス＋角丸長方形/楕円として再構成したデッキ。PowerPoint上で文字を直接編集できる。グラデーション・擬似要素・transform などは近似/省略されるため、画像版ほどのピクセル一致はしない。

> どちらか一方だけでよい場合は `--no-editable`（画像版のみ）/ `--only-editable`（編集可能版のみ）を付ける。デフォルトは両方出力。

## ワークフロー概要

```
1. HTMLファイル設計 (slides.html)
       ↓
2. Playwright で  (a) 各スライドのスクリーンショット (1920×1080 PNG × N枚)
                  (b) DOM 抽出（テキスト・図形の位置/色/フォント）
       ↓
3. python-pptx で  (a) 画像版 PPTX（PNGをフルスライド埋め込み）
                  (b) 編集可能版 PPTX（テキストボックス＋図形を再構成）
```

## Step 1: slides.html の設計

### ファイル構造の基本

```html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>プレゼンタイトル</title>
<!-- Google Fontsを必ず読み込む -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
/* CSSをここに記述 */
</style>
</head>
<body>
<!-- スライド1 -->
<section class="slide" id="s1">...</section>
<!-- スライド2 -->
<section class="slide" id="s2">...</section>
<!-- ... -->
</body>
</html>
```

### 絶対に守るルール

- スライドは `<section class="slide" id="sN">` (N=1から連番)
- スライドサイズは **1920×1080px** 固定
- `body` は `background: #24324a; display: flex; flex-direction: column; align-items: center; gap: 32px;`
- CSS変数でカラーパレットを定義する (後でテーマ変更しやすくなる)

### カラーパレットの選択

コンテンツに合ったパレットを選ぶ。デフォルトはSerendie(紺+紫)。
詳細なCSSパターンは `references/css-patterns.md` を参照。

**よく使うパレット例:**
- Serendie Blue: `--primary: #174ECC; --accent: #8A42FF;`
- Deep Dark: `--primary: #0B2D7A; --accent: #8A42FF;`
- Green Tech: `--primary: #12A07F; --accent: #1E8FCC;`

### スライドの種類と選択

| スライド種別 | 使用場面 | CSSクラス |
|---|---|---|
| カバー | タイトル・表紙 | グラデーション背景 + `.cover-wrap` |
| チャプター | セクション区切り | `.ch-wrap` + 大きなタイトル |
| フィーチャー | 機能紹介（テキスト＋スクショ） | `.ft-layout` (grid 1:1.55) |
| ワンライナー | 価値提案・インパクト | `.one-liner` (中央揃え大文字) |
| リスト | 箇条書き説明 | `.blist` |
| サンキュー | 最終スライド | グラデーション背景 + `.ty-wrap` |

### スライドの数と構成

典型的な15〜20枚構成:
1. カバー (グラデーション背景)
2. ワンライナー (価値提案)
3. チャプター (セクション1)
4〜7. フィーチャースライド (機能紹介)
8. チャプター (セクション2)
9〜12. フィーチャースライド
13. まとめ
14. サンキュー

## Step 2: PPTX 生成（画像版＋編集可能版）

このスキルの `scripts/render_slides.py` を使用する。グローバルインストール時のパスは `~/.claude/skills/html2pptx-design/scripts/render_slides.py`（プロジェクト直下に同名スキルがあればそちらを優先）。

```bash
python ~/.claude/skills/html2pptx-design/scripts/render_slides.py \
  ./slides.html \
  ./output.pptx
# -> ./output.pptx          (画像版・ピクセルパーフェクト)
# -> ./output-editable.pptx (テキスト編集可能版)
```

スライド枚数を指定する場合（省略時は自動検出）:
```bash
python ~/.claude/skills/html2pptx-design/scripts/render_slides.py \
  ./slides.html ./output.pptx --total 15
```

片方だけ欲しいとき:
```bash
python ... ./slides.html ./output.pptx --no-editable     # 画像版のみ
python ... ./slides.html ./output.pptx --only-editable   # 編集可能版のみ
```

※ Windowsで実行する場合は `~/.claude/skills/...` を `%USERPROFILE%\.claude\skills\...` に読み替える。

スクリーンショットは `./slides-png/slide-01.png` 〜 に保存され、2つのPPTXが自動生成される。

### 依存関係の確認

```bash
pip install playwright python-pptx
python -m playwright install chromium
```

## Step 3: 確認と調整

1. 生成された **両方の** PPTX をPowerPointで開いて確認
   - 画像版: テキストが見切れていないか、コントラストは十分か
   - 編集可能版: 図形と文字の重なり・はみ出しがないか（DOM近似なのでズレが出ることがある）
2. 問題があればHTMLのCSSを修正して `render_slides.py` を再実行
3. 編集可能版の崩れがどうしても直らない箇所は、PowerPoint上で直接微調整する（編集可能版はそのための叩き台）

### 編集可能版がうまく組まれやすいHTMLの書き方

- テキストはなるべく **末端要素**（子に別の `<div>` を持たない要素）に直接入れる。色付きハイライトは `<span>`/`<b>`/`<code>` などのインライン要素で。
- 背景は `background-color`（単色）を使うと図形の塗りに変換されやすい。グラデーションは先頭の色だけが拾われる。
- `::before` / `::after` の装飾、`box-shadow` のグロー、`transform: rotate()` などは編集可能版では失われる（画像版では再現される）。
- 角丸は `border-radius`、円形は `border-radius:50%`（縦横が近い要素）で楕円図形として再構成される。

## よくあるデザインパターン

詳細は `references/css-patterns.md` を参照。

### コンテンツスライドの共通ヘッダー

```html
<section class="slide" id="s2">
  <div class="header">
    <div class="title-wrap">
      <div class="bar"></div>
      <div><div class="t">スライドタイトル</div><div class="st">サブタイトル</div></div>
    </div>
    <div class="logo"><div class="dot"></div>APP NAME</div>
  </div>
  <div class="content">
    <!-- ここにコンテンツ -->
  </div>
  <div class="brandline"><span class="bl-dot"></span>AppName</div>
  <div class="pager">02 / 15</div>
</section>
```

### 画像の埋め込み

スクリーンショット等を表示する場合は `.shot` クラスで囲む:

```html
<div class="shot" style="flex:1;">
  <img src="../screenshots/screen.png" alt="">
</div>
```

## 設計上の注意点

- **Google Fonts使用**: ローカルフォントを使わず、Noto Sans JP + Interを使う
- **スライドはposition:relative + overflow:hidden**: 要素がはみ出しても切り取られる
- **テキストの最小サイズ**: 本文は16px以上、見出しは32px以上
- **スクリーンショット内の画像パス**: HTMLから見た相対パスで指定する
- **Playwrightフォント待機**: `await page.wait_for_timeout(1500)` でフォント読み込みを待機
