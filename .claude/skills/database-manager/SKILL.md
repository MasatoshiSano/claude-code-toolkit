---
name: database-manager
description:
  Database schema management, migrations, optimization, and automation
version: 1.0.0
author: Claude Code Toolkit
license: MIT
tags:
  - database
  - migration
  - schema
  - optimization
  - sql
  - orm
requires:
  - node>=16
  - prisma or typeorm or sequelize (optional)
  - postgresql or mysql or mongodb (target database)
---

# Database Manager Agent Skill

## 実装状況

**ステータス**: ✅ Phase 1完了 **実装日**: 2026-01-17
**動作保証**: 基本機能（Prisma/TypeORMのみ対応） **実装済み機能**:

- ✅ マイグレーション生成（migration-generator.js）
- ✅ スキーマ分析（schema-analyzer.js）
- ✅ インデックス最適化（index-optimizer.js）
- ✅ クエリ分析（query-analyzer.js）
- ✅
  Prismaマイグレーションテンプレート（templates/prisma/migration-template.sql）
- ✅
  TypeORMマイグレーションテンプレート（templates/typeorm/migration-template.ts）
- ✅ データベース設定（configs/database-config.json）
- ✅ 最適化ルール（configs/optimization-rules.json）

**未実装機能**（Phase 2以降で実装予定）:

- 🚧 ロールバック管理（rollback-manager.js）
- 🚧 データ整合性検証（data-validator.js）
- 🚧 バックアップ自動化（backup-automation.js）
- 🚧 ヘルスチェック（health-checker.js）
- 🚧 Sequelize対応

**動作要件**:

- Node.js >= 16
- Prisma または TypeORM（プロジェクトに応じて）
- データベース接続情報（PostgreSQL/MySQL等）

## Purpose

このスキルは、データベースのスキーマ管理、マイグレーション、最適化を自動化します。Prisma/TypeORM/Sequelize対応、ロールバック戦略、データ整合性検証、パフォーマンス分析を提供します。

## When to Use

- データベーススキーマを変更する時
- 新しいテーブル/カラムを追加する時
- マイグレーションスクリプトを生成したい時
- データベースパフォーマンスを最適化したい時
- バックアップ/リストア戦略を構築したい時
- クエリパフォーマンスを分析したい時

## Architecture

```
scripts/
├── migration-generator.js      # マイグレーション生成
├── rollback-manager.js         # ロールバック管理
├── data-validator.js           # データ整合性検証
├── backup-automation.js        # バックアップ自動化
├── schema-analyzer.js          # スキーマ分析
├── index-optimizer.js          # インデックス最適化
├── query-analyzer.js           # クエリ分析
└── health-checker.js           # ヘルスチェック

templates/
├── prisma/
│   ├── migration-template.sql
│   └── schema-template.prisma
├── typeorm/
│   ├── migration-template.ts
│   └── entity-template.ts
├── sequelize/
│   ├── migration-template.js
│   └── model-template.js
└── raw/
    └── migration-template.sql

configs/
├── database-config.json        # DB接続設定
├── backup-strategy.yaml        # バックアップ戦略
└── optimization-rules.json     # 最適化ルール

examples/
├── add-column-migration.md
├── create-table-migration.md
└── index-optimization.md
```

## Instructions

### Phase 1: Schema Design & Migration Generation

#### 1.1 スキーマ変更の分析

**既存スキーマの確認:**

```bash
# Prismaの場合
agent database-manager analyze-schema --orm=prisma

# TypeORMの場合
agent database-manager analyze-schema --orm=typeorm

# 生SQLの場合
agent database-manager analyze-schema \
  --db=postgresql \
  --host=localhost \
  --database=myapp

# 出力:
# 📊 Database Schema Analysis
#
# Tables: 12
# Total Columns: 87
# Indexes: 34
# Foreign Keys: 18
# Views: 3
#
# Potential Issues:
# ⚠ Table 'users' has no index on 'email' (frequently queried)
# ⚠ Table 'orders' missing 'updated_at' timestamp
# ⚠ Foreign key 'order_user_fk' has no index
```

#### 1.2 マイグレーションスクリプト生成

**Prismaマイグレーション:**

```bash
# スキーマ変更からマイグレーション生成
agent database-manager generate-migration \
  --orm=prisma \
  --description="Add email verification fields"

# 出力:
# ✓ Analyzing schema changes...
# ✓ Detected changes:
#   - Add column: users.email_verified (boolean)
#   - Add column: users.verification_token (string)
#   - Add index: users.verification_token
#
# ✓ Generated migration: 20260116_add_email_verification.sql
```

**生成されたPrisma Migration:**

```sql
-- prisma/migrations/20260116_add_email_verification/migration.sql

-- AddEmailVerification
-- Add email verification fields to users table

BEGIN;

-- Step 1: Add new columns
ALTER TABLE "users"
ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "verification_token" VARCHAR(255);

-- Step 2: Create index for verification lookup
CREATE INDEX "idx_users_verification_token"
ON "users"("verification_token")
WHERE "verification_token" IS NOT NULL;

-- Step 3: Add constraint for token uniqueness
ALTER TABLE "users"
ADD CONSTRAINT "unique_verification_token"
UNIQUE ("verification_token");

COMMIT;
```

**TypeORM Migration:**

```typescript
// src/migrations/1705395600000-AddEmailVerification.ts
import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex
} from 'typeorm';

export class AddEmailVerification1705395600000 implements MigrationInterface {
  name = 'AddEmailVerification1705395600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add email_verified column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'email_verified',
        type: 'boolean',
        default: false,
        isNullable: false
      })
    );

    // Add verification_token column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'verification_token',
        type: 'varchar',
        length: '255',
        isNullable: true,
        isUnique: true
      })
    );

    // Create index
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_verification_token',
        columnNames: ['verification_token'],
        where: 'verification_token IS NOT NULL'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.dropIndex('users', 'IDX_users_verification_token');

    // Drop columns
    await queryRunner.dropColumn('users', 'verification_token');
    await queryRunner.dropColumn('users', 'email_verified');
  }
}
```

#### 1.3 複雑なマイグレーション

**テーブル作成:**

```bash
agent database-manager generate-migration \
  --orm=prisma \
  --type=create-table \
  --table=products \
  --schema='{
    "id": "uuid primary key",
    "name": "string not null",
    "price": "decimal(10,2) not null",
    "category_id": "uuid references categories(id)",
    "created_at": "timestamp default now()",
    "updated_at": "timestamp default now()"
  }'

# 生成されるマイグレーション:
# - CREATE TABLE products
# - Foreign key to categories
# - Indexes on category_id, created_at
# - Trigger for updated_at auto-update
```

**データ移行を含むマイグレーション:**

```sql
-- Migration: Split 'name' into 'first_name' and 'last_name'

BEGIN;

-- Step 1: Add new columns
ALTER TABLE "users"
ADD COLUMN "first_name" VARCHAR(100),
ADD COLUMN "last_name" VARCHAR(100);

-- Step 2: Migrate existing data
UPDATE "users"
SET
  "first_name" = SPLIT_PART("name", ' ', 1),
  "last_name" = CASE
    WHEN POSITION(' ' IN "name") > 0
    THEN SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)
    ELSE ''
  END
WHERE "name" IS NOT NULL;

-- Step 3: Make new columns NOT NULL after data migration
ALTER TABLE "users"
ALTER COLUMN "first_name" SET NOT NULL,
ALTER COLUMN "last_name" SET NOT NULL;

-- Step 4: Create indexes
CREATE INDEX "idx_users_last_name" ON "users"("last_name");

-- Step 5: Drop old column (after verification)
-- ALTER TABLE "users" DROP COLUMN "name";

COMMIT;
```

### Phase 2: Migration Execution & Rollback

#### 2.1 安全なマイグレーション実行

```bash
# Dry runでプレビュー
agent database-manager migrate \
  --dry-run \
  --environment=staging

# 出力:
# 🔍 Dry Run Mode
#
# Pending migrations (3):
# 1. 20260115_add_user_roles.sql
# 2. 20260116_add_email_verification.sql
# 3. 20260116_optimize_indexes.sql
#
# Estimated execution time: 2.3 seconds
# Affected tables: users, roles, user_roles
# Affected rows: ~15,000
#
# ⚠ Warnings:
# - Migration 2 adds NOT NULL column (requires default or backfill)
# - Migration 3 rebuilds large index (may lock table)
#
# Recommendations:
# - Run during low-traffic period
# - Create backup before execution
# - Monitor lock duration

# バックアップを作成してから実行
agent database-manager migrate \
  --environment=staging \
  --backup \
  --timeout=30s

# 出力:
# 📦 Creating backup...
#   ✓ Backup saved: backups/myapp_20260116_103045.sql
#
# 🚀 Running migrations...
#   ✓ 20260115_add_user_roles.sql (0.8s)
#   ✓ 20260116_add_email_verification.sql (1.2s)
#   ✓ 20260116_optimize_indexes.sql (3.4s)
#
# ✅ All migrations completed successfully
#
# Summary:
# - Executed: 3 migrations
# - Total time: 5.4s
# - Backup: backups/myapp_20260116_103045.sql
```

#### 2.2 ロールバック戦略

```bash
# 最後のマイグレーションをロールバック
agent database-manager rollback \
  --steps=1 \
  --environment=staging

# 出力:
# ⏪ Rolling back migration...
#
# Current migration: 20260116_optimize_indexes
# Rolling back to: 20260116_add_email_verification
#
# Executing down migration:
#   - Dropping index: idx_users_email
#   - Dropping index: idx_orders_user_id
#   - Recreating old indexes
#
# ✓ Rollback completed (2.1s)
#
# ⚠ Note: Some changes may not be fully reversible
# Review the rollback script for data implications

# 特定のマイグレーションまでロールバック
agent database-manager rollback \
  --to=20260115_add_user_roles \
  --confirm

# 完全なデータベースリストア
agent database-manager restore \
  --backup=backups/myapp_20260116_103045.sql \
  --environment=staging
```

**ロールバックスクリプト例:**

```typescript
// TypeORM Down Migration
public async down(queryRunner: QueryRunner): Promise<void> {
  // Reverse order: drop constraints first, then columns

  // 1. Drop indexes
  await queryRunner.dropIndex("users", "IDX_users_verification_token");

  // 2. Drop unique constraint
  await queryRunner.query(`
    ALTER TABLE "users" DROP CONSTRAINT "unique_verification_token"
  `);

  // 3. Drop columns
  await queryRunner.dropColumn("users", "verification_token");
  await queryRunner.dropColumn("users", "email_verified");

  console.log("✓ Rolled back email verification fields");
}
```

### Phase 3: Data Integrity Validation

#### 3.1 マイグレーション後の検証

```bash
# データ整合性チェック
agent database-manager validate \
  --environment=staging

# 出力:
# 🔍 Data Integrity Check
#
# Foreign Keys:
#   ✓ All foreign keys valid (18/18)
#
# NOT NULL Constraints:
#   ✓ No NULL values in NOT NULL columns (87/87)
#
# Unique Constraints:
#   ❌ Duplicate values found in users.email (3 duplicates)
#      - Duplicates: ['test@example.com', 'admin@example.com']
#
# Data Types:
#   ✓ All data types match schema
#
# Indexes:
#   ⚠ Index 'idx_orders_created_at' fragmented (rebuild recommended)
#
# Orphaned Records:
#   ✓ No orphaned foreign key references
#
# Summary: 1 error, 1 warning
```

**自動修復スクリプト:**

```javascript
// scripts/data-validator.js
async function validateAndFix(options) {
  const issues = await detectIssues();

  for (const issue of issues) {
    switch (issue.type) {
      case 'duplicate_unique':
        // Duplicates in unique column
        if (options.autoFix) {
          await deduplicateRecords(issue.table, issue.column);
        }
        break;

      case 'orphaned_fk':
        // Foreign key pointing to non-existent record
        if (options.autoFix) {
          await cleanupOrphanedRecords(issue.table, issue.fk);
        }
        break;

      case 'fragmented_index':
        // Index needs rebuilding
        if (options.autoFix) {
          await rebuildIndex(issue.index);
        }
        break;
    }
  }
}
```

### Phase 4: Performance Optimization

#### 4.1 インデックス最適化

```bash
# インデックス分析
agent database-manager analyze-indexes \
  --database=myapp \
  --environment=production

# 出力:
# 📊 Index Analysis Report
#
# Unused Indexes (3):
# 1. idx_users_phone
#    Table: users
#    Size: 12 MB
#    Last Used: Never
#    Recommendation: DROP (saves 12 MB)
#
# 2. idx_orders_legacy
#    Table: orders
#    Size: 8 MB
#    Last Used: 45 days ago
#    Recommendation: Consider dropping
#
# Missing Indexes (5):
# 1. users.email
#    Query: SELECT * FROM users WHERE email = ?
#    Frequency: 15,000 queries/hour
#    Estimated speedup: 85%
#    Recommendation: CREATE INDEX idx_users_email ON users(email)
#
# 2. orders.user_id, created_at
#    Query: SELECT * FROM orders WHERE user_id = ? ORDER BY created_at
#    Frequency: 8,000 queries/hour
#    Estimated speedup: 92%
#    Recommendation: CREATE INDEX idx_orders_user_created ON orders(user_id, created_at)
#
# Duplicate Indexes (2):
# 1. idx_users_email and idx_users_email_unique
#    Recommendation: Drop idx_users_email (redundant with unique constraint)
#
# Fragmented Indexes (1):
# 1. idx_orders_created_at
#    Fragmentation: 67%
#    Recommendation: REINDEX idx_orders_created_at
#
# Total Index Size: 245 MB
# Potential Savings: 28 MB
```

**インデックス最適化実行:**

```bash
# 推奨インデックスを自動作成
agent database-manager optimize-indexes \
  --apply \
  --environment=production

# 出力:
# 🔧 Applying Index Optimizations...
#
# Creating missing indexes:
#   ✓ CREATE INDEX idx_users_email ON users(email) (1.2s)
#   ✓ CREATE INDEX idx_orders_user_created ON orders(user_id, created_at) (3.8s)
#
# Dropping unused indexes:
#   ✓ DROP INDEX idx_users_phone (0.3s)
#   ✓ DROP INDEX idx_users_email (redundant) (0.2s)
#
# Rebuilding fragmented indexes:
#   ✓ REINDEX idx_orders_created_at (2.1s)
#
# Summary:
# - Created: 5 indexes
# - Dropped: 3 indexes
# - Rebuilt: 1 index
# - Space saved: 28 MB
# - Estimated performance improvement: 45%
```

#### 4.2 クエリパフォーマンス分析

```bash
# スロークエリ分析
agent database-manager analyze-queries \
  --slow-threshold=1000ms \
  --limit=10

# 出力:
# 🐌 Slow Query Analysis
#
# Top 10 Slow Queries:
#
# 1. Query: SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at
#    Avg Time: 3,450ms
#    Executions: 1,200/hour
#    Total Impact: 4,140 seconds/hour
#    Problem: Full table scan (235,000 rows)
#    Solution: CREATE INDEX idx_orders_status_created ON orders(status, created_at)
#
# 2. Query: SELECT u.*, COUNT(o.id) FROM users u LEFT JOIN orders o ...
#    Avg Time: 2,100ms
#    Executions: 500/hour
#    Total Impact: 1,050 seconds/hour
#    Problem: N+1 query pattern
#    Solution: Use batch loading or eager loading
#
# 3. Query: SELECT * FROM products WHERE name LIKE '%search%'
#    Avg Time: 1,800ms
#    Executions: 800/hour
#    Total Impact: 1,440 seconds/hour
#    Problem: Leading wildcard prevents index usage
#    Solution: Use full-text search (PostgreSQL: tsvector, MySQL: FULLTEXT)
```

**クエリ最適化提案:**

```sql
-- Before: N+1 Query
-- User controller makes 1 query for users, then N queries for each user's orders
SELECT * FROM users;
-- Then for each user:
SELECT * FROM orders WHERE user_id = ?;

-- After: Batch Loading
SELECT * FROM users;
SELECT * FROM orders WHERE user_id IN (?, ?, ?, ...);

-- Or: Single JOIN Query
SELECT
  u.*,
  JSON_AGG(o.*) as orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id;
```

### Phase 5: Backup & Disaster Recovery

#### 5.1 自動バックアップ戦略

```yaml
# configs/backup-strategy.yaml
backup_strategy:
  schedule:
    - type: full
      frequency: daily
      time: '02:00'
      retention: 7 days

    - type: incremental
      frequency: hourly
      retention: 24 hours

    - type: snapshot
      frequency: before_migration
      retention: 3 snapshots

  storage:
    primary: s3://backups/myapp/
    replica: azure://backups-replica/myapp/

  compression: gzip
  encryption: aes-256

  verification:
    test_restore: weekly
    integrity_check: daily
```

**バックアップ実行:**

```bash
# 手動バックアップ
agent database-manager backup \
  --type=full \
  --output=s3://backups/myapp/

# 出力:
# 📦 Creating Full Backup...
#
# Database: myapp_production
# Size: 2.4 GB
# Tables: 12
#
# Progress:
#   ✓ users (450 MB) [█████████████████████] 100%
#   ✓ orders (890 MB) [█████████████████████] 100%
#   ✓ products (320 MB) [█████████████████████] 100%
#   ... (9 more tables)
#
# Compressing... (gzip -9)
#   Compressed size: 680 MB (71% reduction)
#
# Encrypting... (AES-256)
#   ✓ Encrypted
#
# Uploading to S3...
#   ✓ s3://backups/myapp/myapp_20260116_020000.sql.gz.enc
#   ✓ Replica: azure://backups-replica/myapp/myapp_20260116_020000.sql.gz.enc
#
# Verifying backup integrity...
#   ✓ Checksum matches
#
# ✅ Backup completed successfully
# Location: s3://backups/myapp/myapp_20260116_020000.sql.gz.enc
# Size: 680 MB
# Duration: 4m 32s
```

#### 5.2 リストア

```bash
# バックアップからリストア
agent database-manager restore \
  --backup=s3://backups/myapp/myapp_20260116_020000.sql.gz.enc \
  --environment=staging \
  --confirm

# 出力:
# ⚠ WARNING: This will replace the entire staging database
# Current database will be backed up to: backups/staging_before_restore_20260116.sql
#
# Confirm restore? [y/N]: y
#
# 📥 Restoring Database...
#
# Downloading backup...
#   ✓ Downloaded from S3 (680 MB)
#
# Decrypting...
#   ✓ Decrypted (AES-256)
#
# Decompressing...
#   ✓ Decompressed (2.4 GB)
#
# Creating safety backup of current database...
#   ✓ backups/staging_before_restore_20260116.sql
#
# Dropping existing database...
#   ✓ Dropped
#
# Restoring from backup...
#   Progress: [█████████████████████] 100%
#
# Verifying restore...
#   ✓ Row counts match
#   ✓ Constraints valid
#   ✓ Indexes rebuilt
#
# ✅ Restore completed successfully
# Duration: 6m 15s
```

### Phase 6: Health Monitoring

#### 6.1 データベースヘルスチェック

```bash
# ヘルスチェック実行
agent database-manager health-check \
  --environment=production

# 出力:
# 🏥 Database Health Check
#
# Connection:
#   ✓ Connected to myapp_production
#   ✓ Latency: 2ms
#
# Replication:
#   ✓ Primary: db-primary-1
#   ✓ Replicas: 2 active, 0 lagging
#   ✓ Replication lag: 0.5s (acceptable)
#
# Storage:
#   ✓ Database size: 2.4 GB
#   ✓ Available space: 45 GB (95% free)
#   ⚠ WAL size: 8.2 GB (consider archiving)
#
# Performance:
#   ✓ Active connections: 25/100
#   ✓ Cache hit ratio: 98.5% (excellent)
#   ⚠ Temp files created: 150 MB/hour (investigate queries)
#
# Locks:
#   ✓ No long-running locks
#   ✓ No deadlocks detected
#
# Vacuum Status (PostgreSQL):
#   ⚠ Table 'orders' last vacuumed: 5 days ago (recommend VACUUM)
#   ✓ Autovacuum: enabled
#
# Recommendations:
# 1. Archive old WAL files to free 8 GB
# 2. Investigate queries creating temp files
# 3. Run VACUUM on 'orders' table
#
# Overall Health: GOOD (2 warnings)
```

## Error Handling

### Level 1: Recoverable Errors

- **マイグレーション競合**: 最新のスキーマを取得してマージ
- **一時的な接続エラー**: リトライ（指数バックオフ）

### Level 2: User Intervention Required

- **破壊的マイグレーション**: 確認プロンプト、バックアップ必須
- **データ損失の可能性**: 手動レビュー要求

### Level 3: Critical Errors

- **マイグレーション失敗**: 自動ロールバック、アラート送信
- **データ整合性エラー**: 実行中止、詳細ログ出力

## Performance Notes

- **並列マイグレーション**: 依存関係のないマイグレーションは並列実行
- **バッチ処理**: 大量データ更新はバッチ処理で負荷分散
- **インデックス作成**: `CONCURRENTLY`オプションでロックを最小化

## Dependencies

- Node.js >= 16
- Prisma >= 4.0 または TypeORM >= 0.3 または Sequelize >= 6.0
- PostgreSQL >= 12 または MySQL >= 8.0 または MongoDB >= 5.0
- AWS CLI (S3バックアップ用)

## Best Practices

1. **マイグレーションの原子性**: トランザクション内で実行
2. **ロールバック可能性**: すべてのマイグレーションにdownスクリプト
3. **本番前テスト**: stagingで十分にテスト
4. **バックアップ必須**: 本番マイグレーション前に必ずバックアップ
5. **段階的実行**: 大きな変更は複数のマイグレーションに分割

## Related Skills

- `aws-deploy-automation`: データベースをIaCでプロビジョニング
- `code-quality-suite`: マイグレーションコードの品質チェック

## Examples

### ✅ Good Example: Safe Migration

```bash
Input: agent database-manager migrate --backup --dry-run

Output:
✓ Backup created: backups/myapp_20260116.sql
✓ Dry run completed: 3 migrations, 2.3s estimated
✓ No warnings detected
Recommendation: ✅ Safe to proceed
```

### ❌ Bad Example: Risky Migration

```bash
Input: agent database-manager migrate --no-backup

Output:
❌ ERROR: Cannot proceed without backup
Breaking changes detected:
- DROP COLUMN users.legacy_id (data loss)
- ALTER COLUMN orders.amount (type change)

Recommendation: ❌ Create backup first
```

## Notes

- マイグレーションは不可逆的な変更を含む可能性あり
- 本番環境では必ずバックアップを取得
- 大規模テーブルの変更は低トラフィック時に実行
