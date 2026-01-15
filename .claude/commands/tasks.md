---
allowed-tools: TodoWrite, TodoRead, Read, Write, MultiEdit
description: Break down design into implementable tasks (Stage 3 of Spec-Driven Development)
---

## Context

- Requirements: @.tmp/requirements.md
- Design document: @.tmp/design.md

## Your task

### 1. Verify prerequisites

- Check that both `.tmp/requirements.md` and `.tmp/design.md` exist
- If not, inform user to complete previous stages first

### 2. Analyze design document

Read and understand the design thoroughly to identify all implementation tasks

### 3. Check for existing tasks document

Check if `.tmp/tasks.md` already exists:
- If exists: Read the existing document and prepare to add new feature section
- If not exists: Create new document from scratch

### 4. Create or Update Task List Document

**If creating new document (`.tmp/tasks.md` doesn't exist):**

```markdown
# タスクリスト

## 🚧 進行中の機能

### [機能名] - YYYY-MM-DD

#### 概要
- 総タスク数: [数]
- 推定作業時間: [時間/日数]
- 優先度: [高/中/低]

#### タスク一覧

##### Phase 1: 準備・調査

###### Task 1.1: [タスク名]

- [ ] [具体的な作業項目1]
- [ ] [具体的な作業項目2]
- [ ] [具体的な作業項目3]
- **完了条件**: [明確な完了条件]
- **依存**: [依存するタスク または なし]
- **推定時間**: [時間]

###### Task 1.2: [タスク名]

- [ ] [具体的な作業項目1]
- [ ] [具体的な作業項目2]
- **完了条件**: [明確な完了条件]
- **依存**: [依存するタスク]
- **推定時間**: [時間]

##### Phase 2: 実装

###### Task 2.1: [機能名]の実装

- [ ] [実装項目1]
- [ ] [実装項目2]
- [ ] [実装項目3]
- **完了条件**: [明確な完了条件]
- **依存**: [依存するタスク]
- **推定時間**: [時間]

##### Phase 3: 検証・テスト

###### Task 3.1: [検証項目]

- [ ] [テスト項目1]
- [ ] [テスト項目2]
- **完了条件**: [明確な完了条件]
- **依存**: [依存するタスク]
- **推定時間**: [時間]

##### Phase 4: 仕上げ

###### Task 4.1: [仕上げ項目]

- [ ] [仕上げ作業1]
- [ ] [仕上げ作業2]
- **完了条件**: [明確な完了条件]
- **依存**: [依存するタスク]
- **推定時間**: [時間]

#### 実装順序

1. Phase 1から順次実行
2. 並行実行可能なタスクは並行で実行
3. 依存関係を考慮した実装順序

#### リスクと対策

- [特定されたリスク]: [対策方法]

#### 注意事項

- 各タスクはコミット単位で完結させる
- タスク完了時は必要に応じて品質チェックを実行
- 不明点は実装前に確認する

## ✅ 完了した機能

(完了した機能はここに移動)
```

**If updating existing document:**

- Read the existing tasks.md
- Add new feature section under "🚧 進行中の機能" section with current date
- Keep existing "進行中の機能" sections as they are
- Keep "✅ 完了した機能" section intact
- When a feature is completed, manually move it from "進行中" to "完了した機能" section
- Format for adding new feature:
  ```markdown
  ### [新機能名] - YYYY-MM-DD

  #### 概要
  - 総タスク数: [数]
  - 推定作業時間: [時間/日数]
  - 優先度: [高/中/低]

  #### タスク一覧
  [新しいタスクを記載]
  ```

### 5. Register tasks in TodoWrite

Extract main tasks (Phase level or important tasks) and register them using TodoWrite tool with appropriate priorities

### 6. Present to user

Show the task breakdown and:

- Explain the implementation order
- Highlight any critical paths
- Ask for approval to begin implementation

## Important Notes

- Tasks should be commit-sized (completable in 1-4 hours)
- Include clear completion criteria for each task
- Consider parallel execution opportunities
- Include testing tasks throughout, not just at the end

think hard
