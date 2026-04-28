# Claude Code Toolkit

Claude Code用の高度なAgent Skillsコレクション - 開発ワークフローを自動化・最適化するための統合ツールキット

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org/)

## 概要

Claude Code Toolkitは、[Anthropic Agent Skills標準（2025年12月発表）](https://docs.anthropic.com)に準拠した、プロフェッショナル向けAgent Skillsの統合パッケージです。5つの主要スキルと共通ユーティリティを提供し、AWS開発、AI最適化、API設計、E2Eテスト、パフォーマンス監査を自動化します。

加えて、**WSL2 + Docker Engine（Docker Desktop不使用） + Playwright MCP** によるClaude Code連携開発環境の構築ガイド（実装完了・検証済み）も同梱しています。詳細は [📦 WSL開発環境構築ガイド](#-wsl開発環境構築ガイド検証済み) を参照してください。

## ✨ 実装済みAgent Skills

### 1. 🚀 aws-deploy-automation
**AWSデプロイ自動化** - CDK/CloudFormation/Terraform対応

- Infrastructure as Code（IaC）ベストプラクティス
- 環境別設定管理（dev/staging/production）
- デプロイ前検証・ロールバック戦略
- Blue/Green・Canaryデプロイ対応

📦 **場所**: `.claude/skills/aws-deploy-automation/`

### 2. 🤖 ai-prompt-manager
**AIプロンプト管理・最適化** - A/Bテスト・トークン最適化

- プロンプトのバージョン管理
- A/Bテストで品質・コスト・速度を比較
- トークン最適化提案（平均15%削減）
- マルチモデル対応（Claude、GPT、Gemini）

📦 **場所**: `.claude/skills/ai-prompt-manager/`

### 3. 🔗 api-contract-validator
**APIコントラクト検証** - OpenAPI/Swagger対応

- OpenAPI仕様の自動生成
- 破壊的変更の自動検出
- 型安全なクライアントコード生成（TypeScript/Python/Go）
- モックサーバー生成

📦 **場所**: `.claude/skills/api-contract-validator/`

### 4. 🧪 e2e-test-generator
**E2Eテスト自動生成** - Playwright/Cypress対応

- ユーザーフロー定義からテストコード生成
- Page Objectパターン適用
- データ駆動テスト対応
- 視覚的回帰テスト

📦 **場所**: `.claude/skills/e2e-test-generator/`

### 5. ⚡ frontend-performance-auditor
**フロントエンドパフォーマンス分析** - Lighthouse/Web Vitals対応

- Lighthouse監査自動化
- Core Web Vitals分析
- バンドルサイズ分析（平均38%削減）
- パフォーマンス予算管理

📦 **場所**: `.claude/skills/frontend-performance-auditor/`

## 📦 WSL開発環境構築ガイド（検証済み）

Windows上でClaude Code + Playwright MCPを使ったWeb開発環境を構築するための、実装完了・動作検証済みの手順書を同梱しています。

**構成**: Windows 10/11 → WSL2 → Ubuntu 24.04 LTS → Docker Engine（Desktop不使用） + Playwright MCP

**主な特徴**:

- 🐳 **Docker Desktop不要**: WSL2内にDocker Engineを直接インストール（systemd管理）
- 🎭 **Playwright MCP統合**: Claude Codeから直接ブラウザ操作（スクショ・スクレイピング）
- ✅ **実体験ベースのハマりポイント記載**: `--executable-path`必須、`-s user`スコープ、wsl.conf書式エラー対処など
- 📋 **仕様駆動開発スタイル**: 要件 → 設計 → タスクの3点セット（合計約950行）

| ドキュメント | 内容 |
|---|---|
| [`docs/wsl-setup/requirements.md`](docs/wsl-setup/requirements.md) | 要件定義（決定事項・成功基準・実装時の重要な知見） |
| [`docs/wsl-setup/design.md`](docs/wsl-setup/design.md) | 詳細設計（システム構成図・技術スタック・エラーハンドリング） |
| [`docs/wsl-setup/tasks.md`](docs/wsl-setup/tasks.md) | タスクリスト（4フェーズ14タスクの実行可能な手順書） |

## 🛠️ 共通ユーティリティ

すべてのスキルが共有する高品質ユーティリティ（127テスト全てパス）:

- **Logger** - Winston統合ログシステム
- **ErrorHandler** - 統一エラーハンドリング
- **CLIParser** - Yargs統合CLI引数パーサー
- **ConfigLoader** - JSON/YAML設定読み込み、環境変数展開
- **ProgressBar** - cli-progress統合プログレスバー

## 🚀 クイックスタート

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/claude-code-toolkit/claude-code-toolkit.git
cd claude-code-toolkit

# 依存関係をインストール
npm install
```

### 使用方法（2つの方法）

#### 方法1: Claudeに自然言語で指示（推奨）✨

**Claudeが自動的に適切なAgent Skillを判断・実行します：**

```
あなた: "このアプリをAWSにデプロイして"
→ Claudeが自動的に aws-deploy-automation を実行

あなた: "AIのコストを削減したい"
→ Claudeが自動的に ai-prompt-manager を実行

あなた: "ログイン機能のE2Eテストを作成して"
→ Claudeが自動的に e2e-test-generator を実行
```

**利用可能な自動起動コマンド:**
- `/aws-deploy` - AWSデプロイ自動化
- `/aws-cost` - AWSコスト分析・削減
- `/serverless-optimize` - Lambda/DynamoDB最適化
- `/ai-prompt-optimize` - プロンプト最適化・A/Bテスト
- `/api-contract` - APIコントラクト検証・OpenAPI生成
- `/e2e-test` - E2Eテスト自動生成
- `/perf-audit` - パフォーマンス監査
- `/db-manage` - データベース管理・最適化

#### 方法2: スクリプトを直接実行

各スキルは独立して使用できます：

```bash
# AWSデプロイ
cd .claude/skills/aws-deploy-automation
node scripts/deploy-cdk.js <stack-name> <app-path> <environment>

# AIプロンプトA/Bテスト
cd .claude/skills/ai-prompt-manager
node scripts/ab-test-runner.js

# API仕様生成
cd .claude/skills/api-contract-validator
node scripts/generate-openapi.js

# E2Eテスト生成
cd .claude/skills/e2e-test-generator
node scripts/test-generator.js

# パフォーマンス監査
cd .claude/skills/frontend-performance-auditor
node scripts/lighthouse-runner.js https://example.com
```

## 📚 ドキュメント

各スキルの詳細ドキュメント：

- [aws-deploy-automation/README.md](.claude/skills/aws-deploy-automation/README.md)
- [ai-prompt-manager/README.md](.claude/skills/ai-prompt-manager/README.md)
- [api-contract-validator/README.md](.claude/skills/api-contract-validator/README.md)
- [e2e-test-generator/README.md](.claude/skills/e2e-test-generator/README.md)
- [frontend-performance-auditor/README.md](.claude/skills/frontend-performance-auditor/README.md)

WSL開発環境構築ガイド（[専用セクション参照](#-wsl開発環境構築ガイド検証済み)）:
- [要件定義](docs/wsl-setup/requirements.md) / [詳細設計](docs/wsl-setup/design.md) / [タスク分解（手順書）](docs/wsl-setup/tasks.md)

## 🏗️ プロジェクト構造

```
claude-code-toolkit/
├── .claude/skills/
│   ├── utils/                              # 共通ユーティリティ（127テストパス）
│   ├── aws-deploy-automation/              # AWSデプロイ自動化
│   ├── ai-prompt-manager/                  # AIプロンプト管理
│   ├── api-contract-validator/             # APIコントラクト検証
│   ├── e2e-test-generator/                 # E2Eテスト生成
│   └── frontend-performance-auditor/       # パフォーマンス監査
├── docs/
│   └── wsl-setup/                          # WSL+Docker+Playwright MCP環境構築ガイド
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
├── CLAUDE.md                               # Claude Code プロジェクト設定
├── package.json                            # npm workspaces設定
└── README.md                               # このファイル
```

## 🧪 テスト

```bash
# 全テストを実行
npm test

# 特定のスキルをテスト
cd .claude/skills/utils && npm test
```

## 📋 要件

- **Node.js**: >= 16.0.0
- **npm**: >= 7.0.0（workspaces対応）
- **AWS CLI**: >= 2.0（aws-deploy-automationで使用）
- **Terraform**: >= 1.0（オプション、aws-deploy-automationで使用）
- **AWS CDK**: >= 2.0（オプション、aws-deploy-automationで使用）

## 🤝 コントリビューション

コントリビューションを歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'feat: Add amazing feature'`）
4. ブランチをプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを作成

### コーディング規約

- **ESLint**: Airbnb JavaScript Style Guide準拠
- **Prettier**: コードフォーマット自動化
- **Conventional Commits**: コミットメッセージ形式
- **テストカバレッジ**: 80%以上必須

## 📝 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)を参照

## 🙏 謝辞

- [Anthropic](https://www.anthropic.com/) - Claude Code・Agent Skills標準
- すべてのオープンソースコントリビューター

## 📞 サポート

- **Issues**: [GitHub Issues](https://github.com/claude-code-toolkit/claude-code-toolkit/issues)
- **ディスカッション**: [GitHub Discussions](https://github.com/claude-code-toolkit/claude-code-toolkit/discussions)

---

**Built with ❤️ using Claude Code**
