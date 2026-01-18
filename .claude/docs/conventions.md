# 規約・ベストプラクティス

## 言語・コミュニケーション

**重要**: このリポジトリでは、すべての応答・ドキュメント・コミットメッセージ・コードコメントを**日本語**で記述します。

## コミットメッセージ

Conventional Commits形式 + 絵文字を使用：

| タイプ | 絵文字 | 説明 |
|--------|--------|------|
| `feat:` | ✨ | 新機能 |
| `fix:` | 🐛 | バグ修正 |
| `docs:` | 📝 | ドキュメント |
| `refactor:` | ♻️ | リファクタリング |
| `test:` | ✅ | テスト |
| `chore:` | 🔧 | メンテナンス |

## ブランチ命名規則

| 用途 | プレフィックス |
|------|----------------|
| 機能開発 | `feature/` または `feat/` |
| バグ修正 | `fix/` または `bugfix/` |
| 緊急修正 | `hotfix/` |
| リファクタリング | `refactor/` |

## アクセシビリティ要件

**すべてのアプリケーションはWCAG 2.2に準拠する必要があります。**

### 4原則
- **知覚可能**: コンテンツはすべてのユーザーが知覚できる形で提示
- **操作可能**: UIコンポーネントとナビゲーションは操作可能
- **理解可能**: 情報とUIの操作は理解可能
- **堅牢性**: 支援技術を含む様々なユーザーエージェントで解釈可能

### 主要要件
- 適切なセマンティックHTML（見出し、ランドマーク、ARIAラベル）
- キーボードナビゲーション対応
- 色コントラスト比 4.5:1以上（AA準拠）
- フォーカス表示の明確化
- スクリーンリーダー対応
- レスポンシブデザイン

## デザインシステム: Serendie

**重要**: UI作成時は必ず `.claude/commands/serendie-design.md` を最初に読んでください。

### 概要
- 三菱電機のオープンソースデザインシステム
- React環境向けUIコンポーネントライブラリ
- W3C Design Token Format Module準拠

### 主な特徴
- 日本の伝統色ベースの5つのカラーテーマ（konjo、asagi、sumire、tsutsuji、kurikawa）
- 300+ SVGアイコン（Serendie Symbols）
- Panda CSSによるユーティリティファーストスタイリング
- WCAG 2.2準拠のアクセシビリティ対応

### 技術要件
- React: 常に最新の安定版を使用
- React 19以降の新機能を積極的に活用
- 非推奨機能（Legacy APIs）は使用禁止

### リソース
- 公式サイト: https://serendie.design/
- GitHub: https://github.com/serendie
- Storybook: https://storybook.serendie.design/

## スキル定義フォーマット

スキルはYAML frontmatter付きのMarkdownファイルで定義：

```markdown
---
allowed-tools: TodoWrite, Read, Write, Bash(command:*)
description: スキルの簡潔な説明
---

## Context
- $ARGUMENTS で入力パラメータを受け取る

## Your task
スキル実行の詳細な指示
```

## 一時ワークスペース

`.tmp/` ディレクトリはspec-driven developmentのワークスペース：
- `requirements.md` - 要件定義
- `design.md` - 詳細設計
- `tasks.md` - タスク分解

`@.tmp/filename.md` 構文で段階間参照。
