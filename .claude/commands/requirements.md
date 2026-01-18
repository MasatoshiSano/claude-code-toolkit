---
allowed-tools: TodoWrite, TodoRead, Read, Write, MultiEdit, Bash(mkdir:*)
description: Create requirements specification for the given task (Stage 1 of Spec-Driven Development)
---

## Context

- Task description: $ARGUMENTS

## Your task

### 1. Create directory

- Create `.tmp` directory if it doesn't exist

### 2. Analyze the user's request

Carefully analyze the provided task description and extract:

- The core problem to be solved
- Implicit requirements not explicitly stated
- Potential edge cases and constraints
- Success criteria

### 3. Check for existing requirements document

Check if `.tmp/requirements.md` already exists:
- If exists: Read the existing document and prepare to merge
- If not exists: Create new document from scratch

### 4. Create or Update Requirements Document

**If creating new document (`.tmp/requirements.md` doesn't exist):**

```markdown
# 要件定義書 - [プロジェクト名]

## 1. 目的

[このプロジェクトの全体目的を明確に記述]

## 2. 機能要件

### 2.1 必須機能

#### [機能名]（追加: YYYY-MM-DD）
- [ ] [機能1の詳細説明]
- [ ] [機能2の詳細説明]

### 2.2 オプション機能

- [ ] [将来的に実装可能な機能]

## 3. 非機能要件

### 3.1 パフォーマンス
- [応答時間、処理速度などの要件]

### 3.2 セキュリティ
- [セキュリティに関する要件]

### 3.3 保守性
- [コードの保守性に関する要件]

### 3.4 互換性
- [既存システムとの互換性要件]

## 4. 制約事項

### 4.1 技術的制約
- [使用技術、ライブラリの制約]

### 4.2 ビジネス制約
- [納期、予算などの制約]

## 5. 成功基準

### 5.1 完了の定義
- [ ] [明確な完了条件1]
- [ ] [明確な完了条件2]

### 5.2 受け入れテスト
- [ユーザーが満足する条件]

## 6. 想定されるリスク
- [実装上のリスクと対策]

## 7. 今後の検討事項
- [設計フェーズで詳細化すべき事項]

## 改訂履歴
- YYYY-MM-DD: 初版作成 - [タスク名]
```

**If updating existing document:**

- Read the existing requirements.md
- Add new feature section under "2.1 必須機能" with current date
- Update "1. 目的" if the new task affects overall project purpose
- Merge new non-functional requirements into existing sections
- Update "5. 成功基準" with new completion criteria
- Add entry to "改訂履歴" section at the bottom
- Preserve all existing content unless it conflicts with new requirements

### 5. Create TODO entry

Use TodoWrite to add "要件定義の完了とレビュー" as a task

### 6. Present to user

Show the created requirements document and ask for:

- Confirmation of understanding
- Any missing requirements
- Approval to proceed to design phase

## Important Notes

- Be thorough in identifying implicit requirements
- Consider both current needs and future extensibility
- Use clear, unambiguous language
- Include measurable success criteria

think hard
