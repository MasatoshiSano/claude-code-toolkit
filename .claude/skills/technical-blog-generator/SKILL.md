---
name: technical-blog-generator
description: Generate beginner-friendly technical blog articles from code commits with automatic topic detection
version: 1.0.0
author: Claude Code Toolkit
license: MIT
tags:
  - blog
  - documentation
  - technical-writing
  - commit-analysis
requires:
  - node>=16
  - git
---

# Technical Blog Generator Agent Skill

## Purpose

このスキルは、コミットからの変更を自動分析し、初心者にもわかりやすい技術ブログ記事を生成します。
技術を細分化し、1記事1テーマで複数の記事を作成します。

## When to Use

- `/commit`実行後、技術ブログ候補が検出された時
- 手動で`/blog`を実行して前回コミットから記事作成
- 実装した機能をブログ記事として共有したい時
- 技術的な学びを文書化したい時

## Architecture

```
scripts/
├── analyze-commit.js       # コミット変更分析
├── detect-blog-topics.js   # ブログテーマ検出
├── subdivide-topics.js     # 初心者向けテーマ細分化
├── generate-article.js     # 記事生成
└── interactive-qa.js       # 対話型Q&A

templates/
├── beginner-article.md     # 初心者向けテンプレート
├── intermediate-article.md # 中級者向けテンプレート
└── advanced-article.md     # 上級者向けテンプレート

examples/
└── sample-articles/
    ├── react-useCallback.md
    ├── performance-optimization.md
    └── typescript-generics.md
```

## Instructions

### Phase 1: Commit Analysis

#### 1.1 Range Detection
デフォルトで前回コミットを分析：
```bash
git diff HEAD~1..HEAD --stat
git diff HEAD~1..HEAD --name-only
git show HEAD --format="%H %s %b"
```

**手動範囲指定も可能:**
```bash
# 特定のコミット範囲
git diff abc123..def456

# 特定のブランチ間
git diff main..feature-branch
```

#### 1.2 Change Extraction
変更内容を抽出：
- **追加行数**: 新規機能の規模把握
- **変更ファイル**: 影響範囲の特定
- **コミットメッセージ**: 意図の理解
- **diff内容**: 具体的な実装内容

```javascript
const changes = {
  files: ['src/hooks/useCallback.ts', 'src/components/Button.tsx'],
  additions: 127,
  deletions: 45,
  message: 'feat: useCallbackでパフォーマンス改善',
  diff: '...'
};
```

### Phase 2: Blog-Worthiness Detection

#### 2.1 Automatic Detection Criteria

**必ず記事化（推奨度: 高）**
- 新機能の実装（100行以上のコード追加）
- 新しいライブラリ・技術の導入
- アーキテクチャの変更
- パフォーマンス改善（数値的な改善がある）
- セキュリティ脆弱性の修正
- 複雑な問題の解決

**記事化推奨（推奨度: 中）**
- 新しいデザインパターンの適用
- リファクタリング（50行以上）
- API統合
- テスト戦略の改善
- ビルド・デプロイの最適化

**記事化可能（推奨度: 低）**
- 有用なユーティリティ関数の追加
- 便利な設定の追加
- バグ修正（興味深い原因がある場合）

**記事化不要**
- タイポ修正
- コメント追加のみ
- フォーマット変更のみ
- 依存関係の単純な更新

#### 2.2 Detection Algorithm

```javascript
function calculateBlogWorthiness(changes) {
  let score = 0;

  // コード量
  if (changes.additions > 100) score += 30;
  else if (changes.additions > 50) score += 20;
  else if (changes.additions > 20) score += 10;

  // キーワード検出
  const keywords = {
    high: ['performance', 'optimization', 'security', 'architecture'],
    medium: ['refactor', 'pattern', 'integration', 'test'],
    low: ['util', 'helper', 'config']
  };

  if (containsKeywords(changes.message, keywords.high)) score += 25;
  if (containsKeywords(changes.message, keywords.medium)) score += 15;
  if (containsKeywords(changes.message, keywords.low)) score += 5;

  // 新しいパッケージ導入
  if (changes.files.includes('package.json')) {
    const newPackages = detectNewPackages(changes.diff);
    score += newPackages.length * 10;
  }

  // 評価: 60点以上で記事化推奨
  return score;
}
```

### Phase 3: Topic Subdivision (初心者向け細分化)

**重要**: 技術を細分化して素人にもわかるように

#### 3.1 Subdivision Principles

**1記事1テーマ:**
```
❌ 悪い例: 「Reactのパフォーマンス最適化」
   → 広すぎて初心者は理解困難

✅ 良い例: 以下に細分化
1. 「useCallbackを使って関数の再生成を防ぐ方法」
2. 「useMemoでコンポーネントの再計算を減らす」
3. 「React.memoで不要な再レンダリングを防ぐ」
```

**専門用語は説明:**
```
❌ 「メモ化を使用してパフォーマンスを向上」
✅ 「メモ化（一度計算した結果を保存して再利用する技術）を使用してパフォーマンスを向上」
```

**具体的なコード例を含む粒度:**
```
各記事は10-30行のコード例で説明可能なサイズ
```

**初心者が実践できるレベル:**
```
読んだ後、すぐに自分のコードに適用できる内容
```

#### 3.2 Topic Extraction Example

**Input:**
```
Commit: "feat: Reactパフォーマンス最適化を実施"
Changes:
- useCallback追加 (3箇所)
- useMemo追加 (2箇所)
- React.memo追加 (1箇所)
- Performance improvement: 200ms → 50ms
```

**Output Topics:**
```markdown
📝 技術ブログの作成候補を検出しました：

1. **useCallbackで関数の再生成を防ぐ方法**（推奨度: 高）
   - 対象読者: React初心者
   - 推定文字数: 1500-2000字
   - 学べること: 不要な関数再生成を防ぐ基本パターン
   - 数値効果: クリック応答時間 200ms → 80ms

2. **useMemoでコンポーネントの再計算を減らす**（推奨度: 高）
   - 対象読者: React初心者
   - 推定文字数: 1500-2000字
   - 学べること: 重い計算結果をキャッシュする方法
   - 数値効果: フィルタリング処理 150ms → 30ms

3. **React.memoで不要な再レンダリングを防ぐ**（推奨度: 中）
   - 対象読者: React中級者
   - 推定文字数: 1200-1500字
   - 学べること: コンポーネント全体のメモ化
   - 数値効果: 子コンポーネントの再レンダリング 5回 → 1回
```

### Phase 4: User Interaction

#### 4.1 Topic Selection Prompt

```
これらの記事を作成しますか？
[1] すべて作成 (3記事)
[2] 選択して作成
[3] 作成しない

選択: _
```

**[1] すべて作成の場合:**
→ Phase 5: Article Generationへ（全トピック）

**[2] 選択して作成の場合:**
```
作成する記事を選択してください（カンマ区切り）:
[1] useCallbackで関数の再生成を防ぐ方法
[2] useMemoでコンポーネントの再計算を減らす
[3] React.memoで不要な再レンダリングを防ぐ

選択: 1,2
```

**[3] 作成しないの場合:**
→ 終了

#### 4.2 Per-Topic Dialogue

各トピックごとに対話：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
記事 1/2: useCallbackで関数の再生成を防ぐ方法
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

この記事について質問させてください。

Q1: このuseCallbackを使うことになったきっかけは何ですか？
（例: パフォーマンス問題、コードレビュー指摘、リファクタリング）

User: パフォーマンス問題で、ボタンクリック時にラグがありました

Q2: 具体的にどのような問題が発生していましたか？

User: リスト内の各アイテムにボタンがあり、クリックするたびに全リストが再レンダリングされていました

Q3: useCallback導入後、どのくらい改善されましたか？

User: クリックからレンダリング完了まで200msから50msになりました

Q4: 実装時に困ったことや注意すべき点はありましたか？

User: 依存配列を正しく設定するのに注意が必要でした。最初、空配列にしたら古いstateを参照してバグりました

✅ 回答ありがとうございます。記事を生成します...
```

### Phase 5: Article Generation

#### 5.1 Article Structure (Beginner Template)

```markdown
# [記事タイトル] - 初心者でもわかる実装ガイド

## TL;DR（この記事の要約）
- [3行で要約]
- [Before/After、数値での改善]
- [読者が得られる知識]

## はじめに

こんな経験はありませんか？
> [読者が共感できる具体的な問題]

この記事では、[解決策]を使って[問題]を解決する方法を、
初心者の方にもわかりやすく解説します。

**この記事で学べること:**
- ✅ [学べること1]
- ✅ [学べること2]
- ✅ [学べること3]

**想定読者:**
- [対象読者のレベル]
- [前提知識]

**所要時間:** 約10分

---

## 問題：なぜこの実装が必要だったのか

### 具体的な状況

[実装前の具体的な状況を説明]

```typescript
// ❌ Before: 問題のあるコード
[実装前のコード]
```

### 何が問題だったのか

1. **[問題点1]**: [詳細説明]
2. **[問題点2]**: [詳細説明]

**数値で見る問題:**
- [Before]: [具体的な数値]
- [影響]: [ユーザー体験への影響]

---

## 解決策：[技術名]とは？

### 基本的な説明

[専門用語を使わずに説明]

**簡単に言うと:**
> [一言で説明]

### いつ使うべきか

- ✅ [使用すべきケース1]
- ✅ [使用すべきケース2]
- ❌ [使うべきでないケース1]
- ❌ [使うべきでないケース2]

---

## 実装：ステップバイステップで解説

### Step 1: [ステップ1の説明]

```typescript
// ✅ After: 改善後のコード
[改善後のコード - Part 1]
```

**ポイント:**
- 📌 [重要なポイント1]
- 📌 [重要なポイント2]

### Step 2: [ステップ2の説明]

```typescript
[改善後のコード - Part 2]
```

**注意点:**
⚠️ [よくある間違い]
✅ [正しい方法]

### Step 3: [ステップ3の説明]

```typescript
[改善後のコード - Part 3]
```

---

## 結果：どれくらい改善されたか

### パフォーマンスの改善

| 指標 | Before | After | 改善率 |
|------|--------|-------|--------|
| [指標1] | [値] | [値] | [%] |
| [指標2] | [値] | [値] | [%] |

### Before/After 比較

**Before:**
```typescript
[改善前のコード全体]
```

**After:**
```typescript
[改善後のコード全体]
```

---

## 注意点とベストプラクティス

### よくある間違い

#### ❌ 間違い 1: [間違いの説明]
```typescript
[間違ったコード例]
```

**なぜダメか:** [理由]

**正しい方法:**
```typescript
[正しいコード例]
```

### ベストプラクティス

1. **[ベストプラクティス1]**
   - [説明]
   - [例]

2. **[ベストプラクティス2]**
   - [説明]
   - [例]

---

## まとめ

この記事では、[技術]を使って[問題]を解決する方法を解説しました。

**ポイント振り返り:**
- ✅ [ポイント1]
- ✅ [ポイント2]
- ✅ [ポイント3]

**数値での成果:**
- [改善項目]: [Before] → [After] ([改善率]改善)

---

## 次のステップ

この知識を活かして、次は以下に挑戦してみましょう：
- 📚 [関連技術1]
- 📚 [関連技術2]
- 📚 [発展的なトピック]

---

## 参考リソース

- [公式ドキュメント]
- [関連記事]
- [サンプルコード（GitHub）]

---

**タグ:** #[技術1] #[技術2] #[技術3] #初心者向け

**作成日:** YYYY-MM-DD
**コミット:** [commit hash]
```

#### 5.2 Multiple Article Generation

各トピックごとに：
1. 対話を実施
2. 記事を生成
3. `_docs/blog/YYYY-MM-DD-[slug].md`に保存
4. 次のトピックへ

**出力例:**
```
✅ 記事生成完了！

生成された記事:
1. _docs/blog/2025-01-16-use-callback-guide.md
2. _docs/blog/2025-01-16-use-memo-guide.md

各記事は以下の構成です:
- TL;DR（要約）
- 問題の説明
- 解決策の詳細
- ステップバイステップ実装
- Before/After比較
- 数値での改善効果
- 注意点とベストプラクティス
- まとめと次のステップ

すぐに編集・公開できる品質です！
```

### Phase 6: Post-Generation Options

```
記事作成が完了しました。次のアクションを選択してください：

[1] 記事をブラウザでプレビュー
[2] 記事を編集
[3] Qiita/Zennにエクスポート
[4] 完了

選択: _
```

## Error Handling

### Level 1: Recoverable Errors

- **コミット履歴なし**: 最初のコミットの場合、全ファイルを分析
- **変更量が少ない**: 複数コミットを結合して分析

### Level 2: User Intervention Required

- **ブログテーマ不明確**: ユーザーに手動でテーマを入力してもらう
- **技術スタック不明**: ユーザーに使用技術を確認

### Level 3: Critical Errors

- **git未初期化**: gitリポジトリの初期化を要求
- **出力ディレクトリ書き込み不可**: 権限エラー通知

## Performance Notes

- **大量のコミット**: 最新5件までを分析対象に制限
- **並列記事生成**: トピックごとに順次生成（対話があるため並列化不可）
- **キャッシング**: 同じコミット範囲の分析結果をキャッシュ

## Dependencies

- Node.js >= 16
- Git (コミット分析用)
- Write権限（`_docs/blog/`ディレクトリへの書き込み）

## Best Practices

1. **コミット直後に実行**: 記憶が新しいうちに対話
2. **複数記事を恐れない**: 1記事1テーマで細分化
3. **数値を含める**: Before/After、改善率を必ず記載
4. **初心者目線**: 専門用語は必ず説明
5. **すぐ公開できる品質**: 軽微な編集のみで公開可能なレベル

## Related Skills

- `/commit`: コミット後に自動的にブログ提案
- `/docs`: より包括的なドキュメント生成
- `/create-prd`: 製品要求仕様書の生成

## Examples

### ✅ Good Example 1: Performance Optimization

```bash
Input: git commit -m "feat: useCallbackでパフォーマンス改善"

Output:
- Topic detected: "useCallbackで関数の再生成を防ぐ方法"
- Dialogue completed with 4 Q&A
- Article generated: 2000 words
- Before/After: 200ms → 50ms (75% improvement)
- Published to: _docs/blog/2025-01-16-use-callback-guide.md
```

### ✅ Good Example 2: Multiple Topics

```bash
Input: git commit -m "feat: React全般のパフォーマンス最適化"

Output:
Detected 3 topics:
1. useCallback (高)
2. useMemo (高)
3. React.memo (中)

User selected: All
→ 3 articles generated
```

### ❌ Bad Example: Vague Commit

```bash
Input: git commit -m "fix"

Output:
❌ ブログ記事候補が検出されませんでした。

理由:
- コミットメッセージが不明確
- 変更量が少ない（5行）
- 技術的な学びが不明

推奨:
- より詳細なコミットメッセージを記述
- 複数のコミットをまとめて分析
```

## Notes

- 記事は`_docs/blog/`に保存（.gitignoreに追加推奨）
- 対話なしの自動生成モードも実装可能（CI/CD用）
- Qiita/Zenn形式へのエクスポート機能は今後追加予定
