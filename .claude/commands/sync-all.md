---
allowed-tools: TodoWrite, TodoRead, Read, Write, MultiEdit, Skill(sync-design), Skill(sync-tasks)
description: Sync all specification documents (requirements → design → tasks)
---

## Context

This command performs a complete synchronization of all specification documents when changes have been made outside the normal `/spec` workflow.

Use this when:
- You've updated requirements.md and want to propagate changes through design and tasks
- You want to ensure all specification documents are consistent
- You've made manual edits to requirements and need everything updated

## Your task

### 1. Verify all documents exist

Check that all three documents exist:
- `.tmp/requirements.md`
- `.tmp/design.md`
- `.tmp/tasks.md`

If any are missing:
- List which documents are present and which are missing
- Suggest running the appropriate command to create missing documents:
  - Missing requirements.md: run `/requirements`
  - Missing design.md: run `/design`
  - Missing tasks.md: run `/tasks`
- Do not proceed if any documents are missing

### 2. Analyze requirements changes

Read `.tmp/requirements.md` and identify:
- Recent changes in "改訂履歴" section
- New functional requirements
- Updated non-functional requirements
- Changes to success criteria

### 3. Execute sync-design

Execute `/sync-design` command to synchronize design with requirements:
- This will update design.md based on requirement changes
- Wait for completion before proceeding

### 4. Execute sync-tasks

Execute `/sync-tasks` command to synchronize tasks with design:
- This will update tasks.md based on design changes
- Wait for completion

### 5. Verify consistency

After both syncs complete:
- Check that all three documents reference consistent features
- Verify that component names are consistent across documents
- Confirm that改訂履歴 sections are updated in all documents

### 6. Create summary report

Generate a summary report showing:
```markdown
# 仕様ドキュメント同期レポート

## 実行日時
YYYY-MM-DD HH:MM

## 同期された変更

### requirements.md → design.md
- [変更内容のリスト]

### design.md → tasks.md
- [変更内容のリスト]

## 影響を受けたコンポーネント
- [コンポーネント名]: [影響内容]

## 追加されたタスク
- [タスク名]: [優先度]

## 推奨される次のアクション
1. [アクション1]
2. [アクション2]
```

### 7. Create TODO entry

Use TodoWrite to add "仕様ドキュメント全体の同期完了とレビュー" as a task

### 8. Present to user

Show the summary report and ask for:
- Confirmation that changes look correct
- Whether to proceed with implementation based on updated tasks
- Any additional adjustments needed

## Important Notes

- This is a cascading sync: requirements → design → tasks
- All existing content is preserved unless there are conflicts
- Changes are cumulative - previous updates are retained
- Review the changes carefully before starting implementation
- Consider creating a git commit after successful sync

## Usage Examples

```bash
# Sync everything after manual requirements update
/sync-all

# Typical workflow for quick updates
1. Edit .tmp/requirements.md manually
2. Run /sync-all
3. Review changes
4. Start implementation based on updated tasks
```

think hard
