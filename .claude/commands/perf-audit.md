---
allowed-tools: Read, Write, Bash(command:*)
description: Frontend performance analysis with Lighthouse and Web Vitals
---

## Context

- Target: $ARGUMENTS (例: "https://example.com を監査" または "パフォーマンス分析")
- Skill location: `.claude/skills/frontend-performance-auditor/`

## Trigger Conditions (自動起動の条件)

このスキルは、以下のユーザーリクエストで自動的に起動されます：

- "サイトのパフォーマンスを分析して"
- "Lighthouse監査を実行"
- "Core Web Vitalsをチェック"
- "バンドルサイズを削減したい"
- "ページ読み込みが遅い"
- "SEOスコアを改善"
- "Webパフォーマンスを最適化"

## Your task

### 1. ユーザーの意図を理解

以下のどの操作か判断：
- **Lighthouse監査**: 包括的なパフォーマンス分析
- **Core Web Vitals分析**: LCP/FID/CLS測定
- **バンドル分析**: JavaScriptバンドルサイズ分析

### 2. Lighthouse監査の場合

```bash
cd .claude/skills/frontend-performance-auditor
node scripts/lighthouse-runner.js <URL>
```

**期待される出力:**
- Performance スコア
- Accessibility スコア
- SEO スコア
- Best Practices スコア
- 改善提案リスト

### 3. Core Web Vitals分析の場合

```bash
cd .claude/skills/frontend-performance-auditor
node scripts/web-vitals-analyzer.js <URL>
```

**期待される出力:**
- LCP（Largest Contentful Paint）
- FID（First Input Delay）
- CLS（Cumulative Layout Shift）
- 各指標の評価（Good/Needs Improvement/Poor）

### 4. バンドル分析の場合

```bash
cd .claude/skills/frontend-performance-auditor
node scripts/bundle-analyzer.js
```

**期待される出力:**
- 総バンドルサイズ
- 最大ファイル
- 削減可能サイズ
- 最適化提案

### 5. 結果報告と改善提案

**例:**
```
Lighthouseスコア:
- Performance: 65点 → 目標90点以上
- Accessibility: 92点
- SEO: 88点

改善提案:
1. 未使用JavaScriptを削除（予想削減: 1.2MB）
2. 画像をWebP形式に変換（予想削減: 38%）
3. Tree-shakingを有効化
4. Code splittingを導入

実行すれば、スコア65→90、読み込み時間5.8秒→2.1秒に改善見込み
```

## Example Usage

**ユーザー:** "このWebサイトのパフォーマンスを改善したい"

**Claude（このスキルを自動実行）:**
1. "URLを教えてください" → ユーザー: "https://example.com"
2. Lighthouse監査を実行
3. "Performanceスコア65点です。バンドルサイズが大きいため、Tree-shakingと画像最適化で90点まで改善できます"
4. 具体的な実装手順を提案

## Notes

- Chrome Headlessを使用してLighthouse実行
- パフォーマンス予算管理機能あり
- CI/CDに統合して継続的監視可能
- レポートはHTML/JSON/CSV形式で出力
