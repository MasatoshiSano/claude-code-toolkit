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
└── settings.local.json # Permission configuration for skills

.tmp/                   # Temporary workspace for spec-driven development
├── requirements.md     # Generated requirements documents
├── design.md          # Generated design documents
└── tasks.md           # Generated task breakdowns
```

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
