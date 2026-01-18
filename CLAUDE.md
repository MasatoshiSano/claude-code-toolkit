# CLAUDE.md

Claude Codeがこのリポジトリで作業する際のガイドラインです。

## 言語

**重要**: すべての応答・ドキュメント・コミットメッセージを**日本語**で記述してください。

## リポジトリ概要

Claude Codeの機能を拡張するカスタムスキル/コマンドのツールキットです。

```
.claude/
├── commands/           # 通常のスキル（Markdownファイル）
├── skills/             # Agent Skills（11個実装済み）
│   ├── spec-driven-development/        # 仕様駆動開発
│   ├── code-quality-suite/             # コード品質分析
│   ├── technical-blog-generator/       # 技術ブログ生成
│   ├── aws-cost-optimizer/             # AWSコスト最適化
│   ├── serverless-optimizer/           # サーバーレス最適化
│   ├── database-manager/               # DB管理
│   ├── aws-deploy-automation/          # AWSデプロイ自動化
│   ├── ai-prompt-manager/              # プロンプト管理
│   ├── api-contract-validator/         # APIコントラクト検証
│   ├── e2e-test-generator/             # E2Eテスト生成
│   └── frontend-performance-auditor/   # パフォーマンス監査
├── docs/               # 詳細ドキュメント
└── settings.local.json

.tmp/                   # 仕様駆動開発用ワークスペース
```

## コマンド一覧

### 仕様駆動開発
| コマンド | 説明 |
|---------|------|
| `/spec` | 要件→設計→タスクの完全ワークフロー |
| `/requirements` | 要件定義を生成 |
| `/design` | 詳細設計を生成 |
| `/tasks` | タスク分解を生成 |

### 開発ワークフロー
| コマンド | 説明 |
|---------|------|
| `/commit` | 変更を分析してコミット作成 |
| `/create-pr` | PR自動作成 |
| `/create-feature` | フル機能実装 |
| `/bugfix` | バグ修正 |
| `/fix-issue` | GitHub Issue解決 |

### コード品質
| コマンド | 説明 |
|---------|------|
| `/check` | 品質・セキュリティ・パフォーマンス分析 |
| `/clean` | フォーマット・lint修正 |
| `/optimize` | パフォーマンス最適化 |
| `/security-audit` | セキュリティ監査 |

### ドキュメント
| コマンド | 説明 |
|---------|------|
| `/docs` | ドキュメント生成 |
| `/blog` | 技術ブログ記事生成 |
| `/create-prd` | PRD生成 |

### インフラ・最適化（自動起動対応）
以下のコマンドは、ユーザーの意図を判断して自動的に起動することもできます。

| コマンド | 説明 | トリガー例 |
|---------|------|-----------|
| `/aws-deploy` | AWSデプロイ自動化 | "AWSにデプロイして" |
| `/aws-cost` | AWSコスト最適化 | "コストを削減したい" |
| `/serverless-optimize` | サーバーレス最適化 | "Lambdaが遅い" |
| `/ai-prompt-optimize` | プロンプト最適化 | "AIコストを削減" |
| `/api-contract` | APIコントラクト検証 | "API仕様を生成" |
| `/e2e-test` | E2Eテスト生成 | "テストを自動生成" |
| `/perf-audit` | パフォーマンス監査 | "Core Web Vitals" |
| `/db-manage` | DB管理・最適化 | "マイグレーション生成" |

## 重要な規約

### アクセシビリティ
すべてのアプリケーションは**WCAG 2.2準拠**が必須です。

### デザインシステム
UI作成時は必ず `.claude/commands/serendie-design.md` を最初に参照してください。

### コミット形式
Conventional Commits + 絵文字（例: `feat: 新機能 ✨`）

## 詳細ドキュメント

- [Agent Skills詳細](.claude/docs/agent-skills.md)
- [ワークフローガイド](.claude/docs/workflows.md)
- [規約・ベストプラクティス](.claude/docs/conventions.md)
- [Serendie Design System](.claude/commands/serendie-design.md)
