---
allowed-tools: TodoWrite, TodoRead, Read, Write, MultiEdit
description: Sync tasks.md based on changes to design.md
---

## Context

This command synchronizes the task list when design has been updated without going through the full `/spec` workflow.

## Your task

### 1. Verify prerequisites

Check that both documents exist:
- `.tmp/design.md` - must exist
- `.tmp/tasks.md` - must exist

If either is missing:
- If design.md is missing: inform user to create it first with `/design`
- If tasks.md is missing: suggest using `/tasks` to create initial task list

### 2. Analyze design changes

Read design.md and identify:
- New components added since last task generation
- Updated components (check "改訂履歴" section)
- Changes in data flow
- New API interfaces
- Updated dependencies

### 3. Read existing tasks

Read `.tmp/tasks.md` and identify:
- Currently active features in "🚧 進行中の機能" section
- Completed features in "✅ 完了した機能" section
- Existing task patterns and structure

### 4. Generate new tasks for design changes

For each new or updated component:
1. Determine if it requires a new feature section or updates to existing tasks
2. Create phase-based task breakdown:
   - Phase 1: 準備・調査
   - Phase 2: 実装
   - Phase 3: 検証・テスト
   - Phase 4: 仕上げ

### 5. Update tasks document

Add new feature section to "🚧 進行中の機能" with format:

```markdown
### [機能名] - YYYY-MM-DD

#### 概要
- 総タスク数: [数]
- 推定作業時間: [時間/日数]
- 優先度: [高/中/低]
- **設計変更に伴う追加**: Yes

#### タスク一覧

##### Phase 1: 準備・調査
[タスク詳細]

##### Phase 2: 実装
[タスク詳細]

##### Phase 3: 検証・テスト
[タスク詳細]

##### Phase 4: 仕上げ
[タスク詳細]

#### 実装順序
[順序の説明]

#### 既存コンポーネントへの影響
- [コンポーネント名]: [影響内容と必要な対応]
```

### 6. Register tasks in TodoWrite

Extract main tasks and register them using TodoWrite tool with appropriate priorities

### 7. Present to user

Show:
- Summary of design changes detected
- List of new tasks generated
- List of existing tasks that may need updates
- Priority recommendations based on dependencies

## Important Notes

- Preserve all existing tasks in both "進行中" and "完了" sections
- Tasks should be commit-sized (1-4 hours each)
- Include clear completion criteria for each task
- Consider dependencies on existing tasks
- Highlight integration work with existing components

think hard
