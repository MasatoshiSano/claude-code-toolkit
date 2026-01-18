# Database Manager - 基本的な使用例

## 1. マイグレーション生成（Prisma）

### 新しいテーブルを追加

```bash
node scripts/migration-generator.js --type=prisma --name=create-users-table
```

**schema.prismaの変更**:
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**生成されるマイグレーション**:
```sql
-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

### マイグレーション実行

```bash
npx prisma migrate dev --name create-users-table
```

## 2. マイグレーション生成（TypeORM）

```bash
node scripts/migration-generator.js --type=typeorm --name=AddUserTable
```

**Entityの定義**:
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

**生成されるマイグレーション**:
```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddUserTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user');
  }
}
```

## 3. インデックス最適化

### クエリからインデックス推奨を取得

```bash
node scripts/index-optimizer.js
```

**出力例**:
```
🔍 Analyzing queries for index recommendations...

📊 Index Optimization Results

Recommended Indexes:
1. CREATE INDEX idx_users_email ON users(email);
   - Used in WHERE clause: 12 queries
   - Used in ORDER BY: 3 queries
   - Estimated improvement: 40-60% faster

2. CREATE INDEX idx_orders_user_id ON orders(user_id);
   - Used in WHERE clause: 8 queries
   - Used in JOIN: 15 queries
   - Estimated improvement: 50-70% faster

3. CREATE INDEX idx_products_category_price ON products(category_id, price);
   - Composite index for common filter
   - Estimated improvement: 30-50% faster

Unused Indexes:
❌ idx_old_status (last used: never)
   - Recommendation: DROP INDEX idx_old_status;
   - Savings: ~50MB storage
```

### プログラムから実行

```javascript
const { analyzeIndexes } = require('./scripts/index-optimizer.js');

async function optimizeIndexes() {
  const queries = [
    'SELECT * FROM users WHERE email = ?',
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    'SELECT * FROM products WHERE category_id = ? AND price > ?'
  ];

  const recommendations = await analyzeIndexes({
    queries,
    database: 'postgresql'
  });

  console.log('\n💡 Recommended Indexes:');
  recommendations.recommended.forEach(rec => {
    console.log(`- ${rec.sql}`);
    console.log(`  Impact: ${rec.estimatedImprovement}`);
  });

  console.log('\n❌ Unused Indexes to Remove:');
  recommendations.unused.forEach(idx => {
    console.log(`- DROP INDEX ${idx.name};`);
  });
}
```

## 4. スロークエリ分析

```bash
node scripts/query-analyzer.js --threshold=100
```

**出力例**:
```
🐌 Slow Query Analysis (threshold: 100ms)

Top 5 Slow Queries:
1. SELECT * FROM orders WHERE status = 'pending'
   - Average Duration: 2,340ms
   - Executions: 1,234
   - Issues:
     ❌ Using SELECT *
     ❌ Missing index on status column
     ⚠️  Large result set (avg 5,000 rows)
   - Recommendations:
     ✓ Add index: CREATE INDEX idx_orders_status ON orders(status);
     ✓ Use specific columns instead of SELECT *
     ✓ Add LIMIT clause if not all rows needed

2. SELECT u.*, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id
   - Average Duration: 1,890ms
   - Issues:
     ⚠️  N+1 query pattern detected
     ❌ Missing index on foreign key
   - Recommendations:
     ✓ Add index: CREATE INDEX idx_orders_user_id ON orders(user_id);
     ✓ Consider materialized view for frequent aggregations
```

### 自動修正提案の適用

```javascript
const { analyzeQuery } = require('./scripts/query-analyzer.js');

const slowQuery = `
  SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC
`;

const analysis = await analyzeQuery(slowQuery, 'postgresql');

if (analysis.recommendations.length > 0) {
  console.log('🔧 Optimized Query:');
  console.log(analysis.optimizedQuery);

  console.log('\n📊 Expected Improvement:');
  console.log(`- ${analysis.improvement}% faster`);
  console.log(`- Reduced rows scanned: ${analysis.rowsReduction}%`);
}
```

**最適化されたクエリ**:
```sql
-- Original (slow)
SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC;

-- Optimized
SELECT id, user_id, total, status, created_at
FROM orders
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 100;
-- + CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
```

## 5. データ整合性検証

```bash
node scripts/data-validator.js
```

**出力例**:
```
🔍 Validating data integrity...

✓ Foreign Key Constraints: OK
✓ Unique Constraints: OK
✓ Not Null Constraints: OK

⚠️  Issues Found:
1. Orphaned Records
   - Table: order_items
   - Count: 45 records
   - Issue: References non-existent orders
   - Fix: DELETE FROM order_items WHERE order_id NOT IN (SELECT id FROM orders);

2. Duplicate Values
   - Table: users
   - Column: email
   - Count: 3 duplicates
   - Issue: Should be unique but isn't
   - Fix: ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

3. NULL Values in Required Fields
   - Table: products
   - Column: price
   - Count: 12 records
   - Fix: UPDATE products SET price = 0 WHERE price IS NULL;
          ALTER TABLE products ALTER COLUMN price SET NOT NULL;
```

## 6. バックアップの自動化

### S3へのバックアップ

```bash
node scripts/backup-manager.js --destination=s3 --bucket=my-db-backups
```

**出力例**:
```
📦 Creating database backup...

Database: production_db
Size: 2.3 GB
Compression: gzip

⬆️  Uploading to S3...
Bucket: my-db-backups
Key: backups/production_db-2026-01-18-09-30-00.sql.gz

✓ Backup completed successfully
Location: s3://my-db-backups/backups/production_db-2026-01-18-09-30-00.sql.gz
Duration: 3m 45s
```

### 自動バックアップスケジュール

```javascript
const cron = require('node-cron');
const { createBackup } = require('./scripts/backup-manager.js');

// 毎日午前3時にバックアップ
cron.schedule('0 3 * * *', async () => {
  console.log('🕐 Starting scheduled backup...');

  await createBackup({
    destination: 's3',
    bucket: 'my-db-backups',
    retention: 30 // 30日間保持
  });

  console.log('✓ Scheduled backup completed');
});
```

### バックアップからのリストア

```bash
node scripts/backup-manager.js --restore --source=s3://my-db-backups/backups/production_db-2026-01-18.sql.gz
```

## 7. スキーマ変更の安全性チェック

```javascript
const { validateMigration } = require('./scripts/migration-validator.js');

async function safeMigrate() {
  const migration = `
    ALTER TABLE users DROP COLUMN legacy_field;
    ALTER TABLE orders ADD COLUMN shipping_address TEXT;
  `;

  const validation = await validateMigration(migration);

  if (validation.hasBreakingChanges) {
    console.error('❌ Breaking changes detected:');
    validation.breakingChanges.forEach(change => {
      console.error(`  - ${change.description}`);
      console.error(`    Impact: ${change.impact}`);
    });

    console.log('\n💡 Recommended approach:');
    console.log(validation.safeAlternative);
  } else {
    console.log('✓ Migration is safe to apply');
  }
}
```

**安全な移行手順の提案**:
```
Breaking Change: Dropping column 'legacy_field'
Impact: May break existing queries

Recommended Safe Migration:
1. Add new column with default value
2. Backfill data with migration script
3. Update application code to use new column
4. Remove old column in separate migration after deployment
```

## 8. パフォーマンスモニタリング

```javascript
const { monitorPerformance } = require('./scripts/performance-monitor.js');

// リアルタイムモニタリング
monitorPerformance({
  interval: 5000, // 5秒ごと
  thresholds: {
    slowQuery: 100, // 100ms以上
    connectionPool: 80 // 80%使用率以上
  },
  onAlert: (alert) => {
    console.error(`⚠️ ${alert.type}: ${alert.message}`);

    if (alert.type === 'SLOW_QUERY') {
      console.log(`Query: ${alert.query}`);
      console.log(`Duration: ${alert.duration}ms`);
    }
  }
});
```

**モニタリング出力**:
```
📊 Database Performance Monitor

Active Connections: 45 / 100 (45%)
Query Rate: 1,234 queries/sec
Average Query Time: 12ms
Slow Queries (>100ms): 3

⚠️ Alerts:
- Connection pool at 85% capacity
- Slow query detected: SELECT * FROM large_table (2,340ms)
```
