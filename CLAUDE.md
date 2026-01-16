# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Claude Code toolkit containing custom skills/commands that extend Claude Code's capabilities for software development workflows. Commands are defined as markdown files in `.claude/commands/` and can be invoked using `/command-name` syntax.

## Language & Communication

**重要**: このリポジトリで作業する際は、すべての応答を日本語で行ってください。ドキュメント、コミットメッセージ、コードコメント、およびユーザーとのコミュニケーションは日本語で記述します。

## Repository Structure

```
.claude/
├── commands/           # Custom skill definitions (markdown files)
├── skills/             # Agent Skills (advanced, structured skills)
│   ├── spec-driven-development/
│   ├── code-quality-suite/
│   └── technical-blog-generator/
└── settings.local.json # Permission configuration for skills

.tmp/                   # Temporary workspace for spec-driven development
├── requirements.md     # Generated requirements documents
├── design.md          # Generated design documents
└── tasks.md           # Generated task breakdowns
```

## Agent Skills（上級スキル）

**Agent Skills**は、Anthropicの2025年12月発表のオープン標準に準拠した、より高度で構造化されたスキルです。
通常のスキル（`.claude/commands/`）と比較して、以下の特徴があります：

### 通常のSkills vs Agent Skills

| 特性 | 通常のSkills | Agent Skills |
|------|-------------|--------------|
| 定義方法 | Markdownファイル | フォルダ構造（SKILL.md + scripts + templates） |
| 複雑さ | プロンプトベース | スクリプト、リソース、テスト統合 |
| 再利用性 | Claude Code専用 | クロスプラットフォーム対応 |
| バージョン管理 | 基本的 | 詳細（version, tags, dependencies） |
| テスト | 限定的 | testsディレクトリで体系的にテスト可能 |

### 利用可能なAgent Skills

#### 1. spec-driven-development
**場所**: `.claude/skills/spec-driven-development/`

**目的**: 要件定義→詳細設計→タスク分解の3段階ワークフローを統合

**構造**:
```
spec-driven-development/
├── SKILL.md                    # スキル定義
├── templates/
│   ├── requirements-template.md
│   ├── design-template.md
│   └── tasks-template.md
└── examples/
    └── usage-example.md
```

**使用方法**:
```bash
# 通常のスキル（従来）
/spec "新機能の説明"
/requirements "新機能の説明"
/design
/tasks

# Agent Skill版（将来）
agent spec-driven-development "新機能の説明"
```

**特徴**:
- テンプレートベースの一貫した文書生成
- 既存ドキュメントとのマージ機能
- 改訂履歴の自動管理
- 段階的な承認フロー

#### 2. code-quality-suite
**場所**: `.claude/skills/code-quality-suite/`

**目的**: コード品質、セキュリティ、パフォーマンスの包括的分析（`/check`と`/security-audit`を統合）

**構造**:
```
code-quality-suite/
├── SKILL.md
├── scripts/
│   ├── quality-checker.js
│   ├── security-scanner.py
│   ├── performance-analyzer.js
│   └── report-generator.js
├── configs/
│   ├── eslint-rules.json
│   ├── security-rules.yaml
│   ├── performance-thresholds.json
│   └── owasp-checklist.md
└── reports/
    └── [timestamp]/
```

**分析項目**:
- **コード品質**: 構文エラー、複雑度、重複コード、ベストプラクティス
- **セキュリティ**: OWASP Top 10、脆弱性スキャン、シークレット検出、依存関係監査
- **パフォーマンス**: アルゴリズム効率、メモリ管理、バンドルサイズ
- **テストカバレッジ**: Line/Branch/Function coverage
- **アクセシビリティ**: WCAG 2.2準拠チェック

**出力**:
```markdown
# Code Quality Suite Report

Overall Score: 81/100 (Good)

| Category      | Score | Issues |
|---------------|-------|--------|
| Code Quality  | 85    | 26     |
| Security      | 72    | 12     |
| Performance   | 78    | 8      |
```

#### 3. technical-blog-generator
**場所**: `.claude/skills/technical-blog-generator/`

**目的**: コミットから技術ブログ記事を自動生成（`/blog`の拡張版）

**構造**:
```
technical-blog-generator/
├── SKILL.md
├── scripts/
│   ├── analyze-commit.js
│   ├── detect-blog-topics.js
│   ├── subdivide-topics.js
│   ├── generate-article.js
│   └── interactive-qa.js
├── templates/
│   ├── beginner-article.md
│   ├── intermediate-article.md
│   └── advanced-article.md
└── examples/
    └── sample-articles/
```

**特徴**:
- **自動テーマ検出**: コミット変更から記事候補を自動抽出
- **初心者向け細分化**: 1記事1テーマで技術を分解
- **対話型生成**: テーマごとにQ&Aで詳細を収集
- **複数記事対応**: 1コミットから複数の記事を生成
- **数値重視**: Before/After、改善率を必ず含める

**記事構成**:
```markdown
# [タイトル] - 初心者でもわかる実装ガイド

## TL;DR
## はじめに
## 問題：なぜこの実装が必要だったのか
## 解決策：[技術名]とは？
## 実装：ステップバイステップで解説
## 結果：どれくらい改善されたか
## 注意点とベストプラクティス
## まとめ
## 次のステップ
```

#### 4. aws-deploy-automation
**場所**: `.claude/skills/aws-deploy-automation/`

**目的**: AWSへのデプロイを自動化・標準化（CDK/CloudFormation/Terraform対応）

**構造**:
```
aws-deploy-automation/
├── SKILL.md
├── scripts/
│   ├── deploy-cdk.js
│   ├── rollback-stack.js
│   └── pre-deploy-validation.js
├── templates/
│   ├── cdk/app-stack.ts
│   └── cloudformation/app-template.yaml
└── configs/
    ├── environments/staging.json
    └── deployment-strategy.yaml
```

**特徴**:
- Infrastructure as Code（IaC）のベストプラクティス
- 環境ごとの設定管理（dev/staging/prod）
- デプロイ前検証とロールバック戦略
- Blue/Green、Canaryデプロイ対応
- CI/CD統合（GitHub Actions、CircleCI）

#### 5. ai-prompt-manager
**場所**: `.claude/skills/ai-prompt-manager/`

**目的**: AI APIプロンプトの管理、バージョン管理、A/Bテスト、パフォーマンス分析

**構造**:
```
ai-prompt-manager/
├── SKILL.md
├── scripts/
│   ├── ab-test-runner.js
│   ├── token-optimizer.js
│   └── performance-analyzer.js
├── templates/
│   └── prompt-template.md
├── prompts/
│   ├── chat/
│   └── completion/
└── configs/
    ├── prompt-registry.json
    └── ab-test-configs.yaml
```

**特徴**:
- プロンプトのバージョン管理とGit連携
- A/Bテストで品質・コスト・速度を比較
- トークン最適化提案（平均15%削減）
- マルチモデル対応（Claude、GPT、Gemini）
- コスト追跡とレポート生成

#### 6. api-contract-validator
**場所**: `.claude/skills/api-contract-validator/`

**目的**: フロントエンドとバックエンド間のAPIコントラクト検証

**構造**:
```
api-contract-validator/
├── SKILL.md
├── scripts/
│   ├── generate-openapi.js
│   ├── breaking-change-detector.js
│   └── generate-client.js
├── templates/
│   ├── openapi-template.yaml
│   └── api-client-template.ts
└── validators/
    ├── request-validator.js
    └── response-validator.js
```

**特徴**:
- OpenAPI/Swagger仕様の自動生成
- 破壊的変更の自動検出
- 型安全なクライアントコード生成（TypeScript/Python/Go）
- モックサーバー生成で開発加速
- CI/CDでコントラクト違反を自動検出

#### 7. e2e-test-generator
**場所**: `.claude/skills/e2e-test-generator/`

**目的**: ユーザーフローからE2Eテストを自動生成（Playwright/Cypress）

**構造**:
```
e2e-test-generator/
├── SKILL.md
├── scripts/
│   ├── flow-recorder.js
│   ├── test-generator.js
│   └── page-object-generator.js
├── templates/
│   ├── playwright/test-template.ts
│   └── cypress/test-template.js
└── examples/
    ├── user-login-flow.md
    └── generated-tests/
```

**特徴**:
- ユーザーフロー定義からテストコード自動生成
- Page Objectパターン適用で保守性向上
- データ駆動テスト対応
- 視覚的回帰テスト（スクリーンショット比較）
- CI/CD統合で並列実行

#### 8. frontend-performance-auditor
**場所**: `.claude/skills/frontend-performance-auditor/`

**目的**: フロントエンドパフォーマンスの包括的分析と最適化

**構造**:
```
frontend-performance-auditor/
├── SKILL.md
├── scripts/
│   ├── lighthouse-runner.js
│   ├── web-vitals-analyzer.js
│   ├── bundle-analyzer.js
│   └── image-optimizer.js
├── templates/
│   └── budget-template.json
└── configs/
    └── performance-thresholds.json
```

**特徴**:
- Lighthouse監査とCore Web Vitals分析
- バンドルサイズ分析と最適化提案（平均38%削減）
- 画像最適化（WebP変換、レスポンシブ対応）
- パフォーマンス予算管理
- CI/CDで予算超過を自動検出

### Agent Skills開発のベストプラクティス

1. **SKILL.mdは詳細に**: 目的、使用時期、手順、エラーハンドリング、例を含める
2. **テンプレート活用**: 一貫性のある出力のためのテンプレートを用意
3. **スクリプト分離**: 複雑なロジックはスクリプトファイルに分離
4. **例を豊富に**: Good/Bad examplesで使い方を明示
5. **バージョン管理**: YAML frontmatterでバージョン、依存関係を管理

### 通常のSkillsとの使い分け

**通常のSkills（`.claude/commands/`）を使う場合:**
- 単純なプロンプトテンプレート
- Claude Code専用
- 外部スクリプト不要
- 素早いプロトタイピング

**Agent Skills（`.claude/skills/`）を使う場合:**
- 複雑なロジックやスクリプトが必要
- 複数のツール/ライブラリを統合
- 他のプラットフォームでも使用予定
- チームで共有・再利用
- バージョン管理・テストが重要

## Command Categories

### Spec-Driven Development Workflow
Core workflow for structured feature development:
- `/spec` - Complete 3-stage workflow (requirements → design → tasks)
- `/requirements` - Stage 1: Create requirements specification in `.tmp/requirements.md`
- `/design` - Stage 2: Create detailed design based on requirements in `.tmp/design.md`
- `/tasks` - Stage 3: Break down design into implementable tasks in `.tmp/tasks.md`

**Usage Pattern**: Run `/spec` to execute the full workflow with user approval at each stage, or run individual stages sequentially.

**Important**: All commands automatically merge with existing documents:
- `/requirements` merges new features into existing requirements.md
- `/design` updates existing design.md with new components
- `/tasks` adds new tasks to "進行中の機能" section

### Development Workflow
- `/commit` - Analyze changes and create conventional commits with appropriate emojis（コミット後、技術ブログ記事作成を自動提案）
- `/create-pr` - Automated PR creation with generated title, description, and test plan
- `/create-feature [name]` - Full feature implementation from design to testing to documentation
- `/bugfix [description]` - Fix bugs based on description
- `/fix-issue [number]` - Automatically resolve GitHub issues by analyzing and implementing solutions

### Code Quality & Security
- `/check` - Comprehensive quality, security, and performance analysis
- `/clean` - Code formatting, linting, and auto-fix
- `/optimize [target]` - Performance analysis and optimization (algorithm, memory, network, frontend, database)
- `/security-audit [scope]` - Security vulnerability scanning and compliance checking
- `/dependency-audit` - Dependency security and license compliance analysis

### Documentation
- `/docs [target] [format]` - Generate comprehensive documentation (API, code, user guides, developer docs)
- `/blog` - 前回コミットからの変更を技術ブログ記事のドラフトに変換（複数記事対応、初心者向け）
- `/create-prd` - Generate product requirements documents
- `/add-to-changelog` - Automatically update changelog

### Project Management
- `/todo` - Project task management
- `/milestone-tracker` - Track project milestones
- `/business-scenario` - Business scenario modeling
- `/decision-tree` - Decision optimization
- `/deploy-prep` - Standardize deployment preparation

### Specialized Tools
- `/marp` - Simplify markdown and convert to PDF with Marp
- `/qiita-commit` - Add all changes, create Qiita article, and commit

## Architecture

### Skill Definition Format
Skills are defined as markdown files with YAML frontmatter:
```markdown
---
allowed-tools: TodoWrite, Read, Write, Bash(command:*)
description: Brief description of what the skill does
---

## Context
- Input parameters via $ARGUMENTS

## Your task
Detailed instructions for executing the skill
```

### Permission System
`.claude/settings.local.json` defines allowed operations for specific skills using permission patterns like `Skill(name)` and `Bash(command:*)`.

### Temporary Workspace
The `.tmp/` directory serves as a workspace for spec-driven development documents. These files are created progressively through the requirements → design → tasks workflow and are referenced across stages using `@.tmp/filename.md` syntax.

## Common Workflows

### Creating a New Feature
1. Use `/spec "feature description"` to generate requirements, design, and tasks
2. Review and approve each stage when prompted
3. Implement following the generated `.tmp/tasks.md`
4. Use `/commit` to commit changes with proper formatting
5. Use `/create-pr` to create pull request

### Quick Commit & PR
1. Make your code changes
2. Run `/commit` to automatically stage and commit with conventional commit format
3. If blog-worthy content detected, respond to blog creation prompt
4. Run `/create-pr` to create a pull request with auto-generated description

### Technical Blog Creation
コミット後、技術ブログ記事を作成：

**自動提案ワークフロー:**
1. `/commit` でコミット
2. 技術ブログ候補が自動検出される
3. 記事作成を選択（y/N）
4. テーマごとに対話
5. 複数のドラフト記事が`_docs/blog/`に生成される

**手動実行:**
1. `/blog` を実行
2. 前回コミットからの変更を分析
3. 記事候補を提示
4. 対話して記事作成

**特徴:**
- 技術を細分化して初心者にもわかりやすく
- 1記事1テーマ
- 複数記事対応
- Before/After、数値で効果を示す
- すぐに編集・公開できるドラフト品質

### Code Quality Check
1. Run `/check` for comprehensive analysis
2. Address findings
3. Run `/security-audit` for security-specific review
4. Use `/clean` to auto-fix formatting and linting issues

### Incremental Development Workflow
For adding features without running full `/spec`:

**Quick feature addition:**
1. `/requirements "new feature"` - automatically merges with existing requirements
2. `/design` - reads requirements.md and merges with existing design
3. `/tasks` - reads design.md and adds to "進行中の機能" section
4. Begin implementation

**After manual document edits:**
1. Edit `.tmp/requirements.md` manually
2. Run `/design` to update design based on new requirements
3. Run `/tasks` to generate tasks based on updated design
4. Begin implementation

## Best Practices for Document Management

### When to use `/spec` vs individual commands

**Use `/spec` for:**
- Major new features requiring full planning
- Initial project setup
- Complex features affecting multiple components
- Features requiring architectural changes

**Use individual commands for:**
- Small feature additions
- Bug fixes requiring documentation
- Incremental improvements
- Quick iterations

### Document Consistency Rules

1. **Always keep documents synchronized**
   - After editing requirements.md → run `/design` then `/tasks`
   - After editing design.md → run `/tasks`
   - Commands automatically merge with existing content

2. **Track document versions**
   - All documents have "改訂履歴" section
   - Always add entry with date and description of changes
   - Use改訂履歴 to understand document evolution

3. **Task lifecycle management**
   - New tasks go to "🚧 進行中の機能" section
   - Completed tasks move to "✅ 完了した機能" section
   - Keep task history for reference

4. **Component naming consistency**
   - Use same component names across all documents
   - Update component references when renaming
   - Maintain dependency relationships

## Key Conventions

### Accessibility Requirements

**すべてのアプリケーションはWCAG 2.2（Web Content Accessibility Guidelines 2.2）に準拠する必要があります。**

実装時の考慮事項：
- **知覚可能**: コンテンツはすべてのユーザーが知覚できる形で提示
- **操作可能**: UIコンポーネントとナビゲーションは操作可能
- **理解可能**: 情報とUIの操作は理解可能
- **堅牢性**: コンテンツは支援技術を含む様々なユーザーエージェントで解釈可能

主要な要件：
- 適切なセマンティックHTML（見出し、ランドマーク、ARIAラベル）
- キーボードナビゲーション対応
- 十分な色コントラスト比（AA準拠: 4.5:1以上）
- フォーカス表示の明確化
- スクリーンリーダー対応
- レスポンシブデザインとテキストサイズ変更対応

### Design System: Serendie

**このプロジェクトでは、三菱電機のオープンソースデザインシステム「Serendie Design System」を採用します。**

#### 概要
Serendie Design Systemは、汎用性と普遍性を重視した、React環境向けのUIコンポーネントライブラリとデザイントークンシステムです。

#### 技術要件

**React: 常に最新の安定版を使用してください。**

- 新規プロジェクト: 最新の安定版Reactを採用
- 既存プロジェクト: 定期的に最新版へアップデート
- React 19以降の新機能を積極的に活用（React Compiler、Server Components、Actions等）
- 非推奨機能（Legacy APIs）は使用禁止

依存関係の更新確認：
```bash
# 最新版の確認
npm outdated react react-dom

# アップデート
npm install react@latest react-dom@latest
```

#### インストール

```bash
# デザイントークン
npm install @serendie/design-token

# UIコンポーネント（React）
npm install @serendie/ui
```

#### 主要な特徴

**1. デザイントークン**
- W3C Design Token Format Moduleに準拠
- リファレンストークンとシステムトークンの2層構造
- CSS変数として利用可能

```css
@import "@serendie/design-token/tokens.css";

h1 {
  font-size: var(--sd-reference-typography-scale-expanded-large);
  color: var(--sd-system-color-impression-primary);
}
```

**2. テーマシステム**
5つのカラーテーマを提供（日本の伝統色ベース）：
- `konjo` (紺青)
- `asagi` (浅葱)
- `sumire` (菫)
- `tsutsuji` (躑躅)
- `kurikawa` (栗皮)

テーマ切り替え：
```html
<html data-panda-theme="asagi"></html>
```

**3. アイコン**
- Serendie Symbols: 300+のSVGアイコン
- OutlinedとFilledの2スタイル

**4. スタイリング**
- Panda CSSを採用
- ユーティリティファーストのアプローチ

**5. Figma連携**
- Code Connect対応
- デザインファイルから直接コードスニペットを確認可能
- デザインとコードの一貫性を保証

#### アクセシビリティ対応
- 十分なコントラスト比を確保したアクセシブルなカラーテーマ
- ブランドとプラットフォームに適した書体
- 判読可能なタイプスケール
- キーボードナビゲーション対応コンポーネント

#### リソース
- 公式サイト: https://serendie.design/
- GitHub: https://github.com/serendie
- Storybook: https://storybook.serendie.design/

#### 実装ガイドライン
1. **コンポーネント選択**: Serendie UIのコンポーネントを優先的に使用
2. **デザイントークン使用**: カスタムスタイル定義時はSerendieのデザイントークンを参照
3. **テーマ対応**: すべてのUIは5つのテーマすべてで適切に表示されること
4. **Figma連携**: デザインとコードの整合性を常に確認
5. **アクセシビリティ**: Serendieのアクセシビリティガイドラインに従う

#### 詳細ガイドライン

**重要: UI作成時の必須事項**

UIやデザインに関する作業を行う際は、**必ず最初に** `.claude/commands/serendie-design.md` **を読んでから実装してください。**

- **Webで検索しない**: Serendie Design Systemの情報はWebで調べるのではなく、必ずこのローカルファイルを参照すること
- **ファイルの参照が最優先**: すべてのUI/デザイン作業の前に、このファイルを読んで最新のガイドラインを確認すること
- **実装指示の遵守**: ファイル内の「Claude に対する指示（Skill としての挙動）」セクションに従って実装すること

このファイルには以下の内容が含まれています：
- ブランドアイデンティティ
- デザインシステムアーキテクチャ
- カラーパレット、タイポグラフィ、レイアウトの詳細
- UIコンポーネントの使用方法
- アイコンとアニメーション
- Figma連携のワークフロー
- コード実装の原則とベストプラクティス
- Claude Code用の具体的な実装指示

### Spec-Driven Development
Documents in Japanese follow a structured format:
- Requirements: Functional/non-functional requirements, constraints, success criteria, risks
- Design: Architecture, components, data flow, API interfaces, error handling, security
- Tasks: Phased implementation plan with dependencies, completion criteria, time estimates

### Commit Messages
Commands use Conventional Commits format with emojis:
- `feat: description ✨` - New features
- `fix: description 🐛` - Bug fixes
- `docs: description 📝` - Documentation
- `refactor: description ♻️` - Refactoring
- `test: description ✅` - Tests
- `chore: description 🔧` - Maintenance

### Branch Naming
- Features: `feature/` or `feat/`
- Fixes: `fix/` or `bugfix/`
- Hotfixes: `hotfix/`
- Refactoring: `refactor/`
