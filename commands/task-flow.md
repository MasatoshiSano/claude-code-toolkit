Team Task Scheduler の MCP ツールを使って、以下のリクエストを処理してください：

$ARGUMENTS

## 使えるMCPツール

- **チーム・ユーザー**: `team_list`, `team_get`, `user_list`
- **プロジェクト**: `project_list`, `project_get`, `project_create`, `project_update`, `project_delete`
- **タスク**: `task_list`, `task_get`, `task_create`, `task_update`, `task_delete`, `task_assignee_add`, `task_assignee_remove`
- **アイテム**: `item_list`, `item_get`, `item_create`, `item_update`, `item_delete`, `item_assignee_add`, `item_assignee_remove`
- **マイルストーン**: `milestone_list`, `milestone_create`, `milestone_update`, `milestone_delete`
- **ベースライン**: `baseline_list`, `baseline_create`, `baseline_delete`
- **業務報告**: `work_report_list`, `work_report_create`, `work_report_update`, `work_report_delete`
- **コメント**: `comment_list`, `comment_create`, `comment_update`, `comment_delete`
- **タグ**: `tag_list`, `tag_create`, `tag_delete`
- **依存関係**: `dependency_add`, `dependency_remove`
- **アクティビティ**: `activity_log_list`

## ガイドライン

- まだチームIDやプロジェクトIDが不明な場合は `team_list` → `project_list` の順で確認する
- 複数の操作が必要な場合は順番に実行し、各ステップの結果を簡潔に報告する
- 更新・削除の前に対象を確認してから実行する
