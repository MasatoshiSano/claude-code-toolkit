---
allowed-tools: Read, Write, Bash(command:*)
description: Generate end-to-end tests automatically from user flows with Playwright/Cypress
---

## Context

- Target: $ARGUMENTS (例: "ログインフローのテスト生成" または "E2Eテスト作成")
- Skill location: `.claude/skills/e2e-test-generator/`

## Trigger Conditions (自動起動の条件)

このスキルは、以下のユーザーリクエストで自動的に起動されます：

- "E2Eテストを自動生成して"
- "ログインフローのテストを作成"
- "ユーザーフローからテストコード生成"
- "Playwrightテストを作成"
- "Cypressテストを生成"
- "テストコードを自動で書いて"
- "画面操作のテスト自動化"

## Your task

### 1. ユーザーの意図を理解

以下を確認：
- テスト対象のユーザーフロー（ログイン、購入フロー等）
- フレームワーク（Playwright / Cypress）
- 既存のフロー定義ファイルの有無

### 2. ユーザーフロー定義の確認または作成

ユーザーフロー定義がない場合、Markdownで定義を作成：

```markdown
# ログインフロー

1. https://example.com を開く
2. メールアドレス欄に "user@example.com" を入力
3. パスワード欄に "password123" を入力
4. "ログイン" ボタンをクリック
5. "ダッシュボード" が表示されることを確認
```

### 3. テストコード生成

```bash
cd .claude/skills/e2e-test-generator
node scripts/test-generator.js --flow=user-login-flow.md --framework=playwright
```

### 4. 結果報告

生成されたテストコードの概要：
- ファイルパス
- テストケース数
- 実行コマンド
- カバーする操作ステップ

### 5. テスト実行方法の案内

```bash
# Playwrightの場合
npx playwright test

# Cypressの場合
npx cypress run
```

## Example Usage

**ユーザー:** "ログイン機能のE2Eテストを自動で作成して"

**Claude（このスキルを自動実行）:**
1. "ログインフローを教えてください" → ユーザーが説明
2. Markdown形式でユーザーフロー定義を作成
3. Playwrightテストコードを生成
4. "tests/e2e/login.spec.ts を生成しました。npx playwright test で実行できます"

## Notes

- Page Objectパターンを適用して保守性向上
- データ駆動テストにも対応
- 視覚的回帰テスト（スクリーンショット比較）も可能
- CI/CD統合で並列実行可能
