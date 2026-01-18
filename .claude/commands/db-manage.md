---
allowed-tools: Read, Write, Bash(command:*)
description: Database schema management, migrations, optimization, and automation
---

## Context

- Target: $ARGUMENTS (例: "マイグレーション生成" または "スロークエリ分析")
- Skill location: `.claude/skills/database-manager/`

## Trigger Conditions (自動起動の条件)

このスキルは、以下のユーザーリクエストで自動的に起動されます：

- "DBマイグレーションを生成"
- "データベーススキーマを変更"
- "スロークエリを見つけて"
- "インデックスを最適化"
- "データベースをバックアップ"
- "クエリが遅い"
- "マイグレーション失敗を防ぎたい"

## Your task

### 1. ユーザーの意図を理解

以下のどの操作か判断：
- **マイグレーション生成**: Prisma/TypeORMスキーマからSQL生成
- **スロークエリ分析**: パフォーマンス問題の特定
- **インデックス最適化**: 未使用/必要index提案
- **バックアップ**: 自動バックアップ設定

### 2. マイグレーション生成の場合

```bash
cd .claude/skills/database-manager
node scripts/migration-generator.js
```

**期待される出力:**
- 生成されたマイグレーションファイル
- ロールバックSQL
- 実行前の確認事項

### 3. スロークエリ分析の場合

```bash
cd .claude/skills/database-manager
node scripts/query-analyzer.js
```

**期待される出力:**
- スロークエリリスト
- 実行時間
- 改善提案

### 4. インデックス最適化の場合

```bash
cd .claude/skills/database-manager
node scripts/index-optimizer.js
```

**期待される出力:**
- 未使用インデックス
- 必要なインデックス
- クエリ速度改善見込み

### 5. 結果報告

**マイグレーション例:**
```
マイグレーション生成完了:
ファイル: migrations/20260118_add_user_profile.sql

変更内容:
- users テーブルに profile_image カラム追加
- email カラムにユニーク制約追加

ロールバック用SQL: migrations/20260118_rollback.sql

実行コマンド:
node scripts/migration-generator.js --apply
```

**スロークエリ分析例:**
```
スロークエリ検出:
1. SELECT * FROM users WHERE email=... (実行時間: 3.2秒)
   改善策: email カラムにインデックス追加 → 0.05秒に改善

2. SELECT * FROM orders JOIN ... (実行時間: 8.5秒)
   改善策: N+1問題、EagerLoadingで解決 → 0.3秒に改善

予想改善: クエリ速度 10倍向上
```

## Example Usage

**ユーザー:** "データベースのクエリが遅いから最適化したい"

**Claude（このスキルを自動実行）:**
1. スロークエリを分析
2. インデックス不足を検出
3. "2つのスロークエリを検出しました。インデックス追加でクエリ速度を10倍改善できます"
4. マイグレーション生成と適用手順を提案

## Notes

- 対応ORM: Prisma、TypeORM（Sequelizeは将来対応予定）
- バックアップはS3/Azureに自動保存
- マイグレーションは必ずトランザクション内で実行
- データ整合性チェック（外部キー、NULL制約等）を事前実施
