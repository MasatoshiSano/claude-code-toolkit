---
allowed-tools: TodoWrite, TodoRead, Read, Write, MultiEdit
description: Sync design.md based on changes to requirements.md
---

## Context

This command synchronizes the design document when requirements have been updated without going through the full `/spec` workflow.

## Your task

### 1. Verify prerequisites

Check that both documents exist:
- `.tmp/requirements.md` - must exist
- `.tmp/design.md` - must exist

If either is missing:
- If requirements.md is missing: inform user to create it first
- If design.md is missing: suggest using `/design` to create initial design

### 2. Analyze changes

Read both documents and identify:
- New functional requirements in requirements.md
- Changed non-functional requirements
- New success criteria
- Updated constraints

### 3. Update design document

Update `.tmp/design.md` to reflect requirement changes:

**Update these sections:**

1. **1.1 システム構成図**: Add new components if needed
2. **1.2 技術スタック**: Update if new technologies are required
3. **2.1 コンポーネント一覧**: Add new components or update dependencies
4. **2.2 各コンポーネントの詳細**: Add detailed design for new components with format:
   ```markdown
   #### [Component Name]（更新: YYYY-MM-DD）
   - **目的**: ...
   - **公開インターフェース**: ...
   - **内部実装方針**: ...
   - **依存コンポーネント**: ...
   ```
5. **3. データフロー**: Update if data flow is affected
6. **4. APIインターフェース**: Add new API definitions
7. **5. エラーハンドリング**: Add new error types if needed
8. **6. セキュリティ設計**: Update security requirements
9. **7. テスト戦略**: Update test coverage if needed
10. **8. パフォーマンス最適化**: Update performance targets
11. **改訂履歴**: Add entry with current date and description of changes

### 4. Identify affected components

List existing components that are affected by the requirement changes and explain what needs to be updated in each.

### 5. Create TODO entry

Use TodoWrite to add "設計ドキュメントの同期完了とレビュー" as a task

### 6. Present to user

Show:
- Summary of requirement changes detected
- List of updated sections in design.md
- List of affected existing components
- Recommendation: "次に `/sync-tasks` を実行してタスクリストを更新してください"

## Important Notes

- Preserve all existing design content unless it conflicts with new requirements
- Clearly mark updated sections with current date
- Focus on architectural impact of requirement changes
- Identify integration points between new and existing components
- Maintain consistency with existing design patterns

think hard
