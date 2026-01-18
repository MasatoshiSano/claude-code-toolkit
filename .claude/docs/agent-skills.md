# Agent Skills 詳細ガイド

Agent Skillsは、Anthropicの2025年12月発表のオープン標準に準拠した高度な構造化スキルです。

## 通常のSkills vs Agent Skills

| 特性 | 通常のSkills | Agent Skills |
|------|-------------|--------------|
| 定義方法 | Markdownファイル | フォルダ構造（SKILL.md + scripts + templates） |
| 複雑さ | プロンプトベース | スクリプト、リソース、テスト統合 |
| 再利用性 | Claude Code専用 | クロスプラットフォーム対応 |

## 実装済みAgent Skills

| # | スキル名 | 場所 | 概要 |
|---|---------|------|------|
| 1 | spec-driven-development | `.claude/skills/spec-driven-development/` | 要件→設計→タスクの3段階ワークフロー |
| 2 | code-quality-suite | `.claude/skills/code-quality-suite/` | 品質・セキュリティ・パフォーマンス分析 |
| 3 | technical-blog-generator | `.claude/skills/technical-blog-generator/` | コミットから技術ブログ自動生成 |
| 4 | aws-cost-optimizer | `.claude/skills/aws-cost-optimizer/` | AWSコスト分析・最適化（平均30-40%削減） |
| 5 | serverless-optimizer | `.claude/skills/serverless-optimizer/` | Lambda/DynamoDB最適化（平均50%コスト削減） |
| 6 | database-manager | `.claude/skills/database-manager/` | スキーマ管理・マイグレーション・最適化 |
| 7 | aws-deploy-automation | `.claude/skills/aws-deploy-automation/` | IaCデプロイ自動化（CDK/CFn/Terraform） |
| 8 | ai-prompt-manager | `.claude/skills/ai-prompt-manager/` | プロンプトA/Bテスト・最適化 |
| 9 | api-contract-validator | `.claude/skills/api-contract-validator/` | OpenAPI生成・コントラクト検証 |
| 10 | e2e-test-generator | `.claude/skills/e2e-test-generator/` | Playwright/Cypressテスト自動生成 |
| 11 | frontend-performance-auditor | `.claude/skills/frontend-performance-auditor/` | Lighthouse/Web Vitals分析 |

各スキルの詳細は、それぞれのSKILL.mdファイルを参照してください。

## 開発ベストプラクティス

1. **SKILL.mdは詳細に**: 目的、手順、エラーハンドリング、例を含める
2. **テンプレート活用**: 一貫性のある出力のためのテンプレートを用意
3. **スクリプト分離**: 複雑なロジックはスクリプトファイルに分離
4. **例を豊富に**: Good/Bad examplesで使い方を明示

## 使い分け

- **通常のSkills**: 単純なプロンプト、素早いプロトタイピング
- **Agent Skills**: 複雑なロジック、チーム共有、バージョン管理重要
