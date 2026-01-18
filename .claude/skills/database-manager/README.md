# Database Manager

Comprehensive database schema management, migrations, optimization, and query analysis for modern ORMs and SQL databases.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Related Documentation](#related-documentation)

## Overview

**Status**: ✅ Phase 1 Complete (2026-01-17)
**Supported ORMs**: Prisma, TypeORM (Sequelize: Phase 2)
**Supported Databases**: PostgreSQL, MySQL, SQLite

This skill automates database schema management, generates safe migrations, optimizes indexes, and analyzes query performance.

## ✨ Features

### Migration Generation

- ✅ Prisma migration generation
- ✅ TypeORM migration generation
- 🚧 Sequelize migration generation (Phase 2)
- ✅ Safe migration templates (with rollback)
- ✅ Data migration support

### Schema Analysis

- ✅ Schema structure analysis
- ✅ Foreign key validation
- ✅ NOT NULL constraint checking
- ✅ Unique constraint validation
- ✅ Orphaned record detection

### Index Optimization

- ✅ Unused index detection
- ✅ Missing index suggestions
- ✅ Duplicate index identification
- ✅ Fragmented index rebuilding
- ✅ Composite index recommendations

### Query Analysis

- ✅ Slow query detection
- ✅ N+1 query pattern identification
- ✅ Full table scan detection
- ✅ Query optimization suggestions

### Backup & Recovery

- 🚧 Automated backup strategies (Phase 2)
- 🚧 Point-in-time recovery (Phase 2)
- 🚧 Backup verification (Phase 2)

## 📦 Installation

### Option 1: Workspace Installation (Recommended)

```bash
# Install all skills in the monorepo
cd claude-code-toolkit
npm install
```

### Option 2: Standalone Installation

```bash
# Install this skill independently
cd .claude/skills/database-manager
npm install

# Install peer dependencies based on your ORM
npm install prisma --save-dev  # For Prisma projects
# OR
npm install typeorm --save  # For TypeORM projects
```

### Prerequisites

- Node.js >= 16
- Prisma >= 4.0 or TypeORM >= 0.3 (project dependency)
- Database access (PostgreSQL/MySQL/SQLite)

### Database Permissions

Ensure your database user has these permissions:

```sql
-- PostgreSQL
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_user;
GRANT CREATE ON SCHEMA public TO your_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO your_user;

-- MySQL
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON database_name.* TO 'your_user'@'localhost';
```

## 🚀 Quick Start

### 1. Analyze Schema

```bash
# Prisma
node scripts/schema-analyzer.js --orm=prisma

# TypeORM
node scripts/schema-analyzer.js --orm=typeorm
```

### 2. Generate Migration

```bash
# Add a new column
node scripts/migration-generator.js \
  --orm=prisma \
  --description="Add email verification fields"
```

### 3. Optimize Indexes

```bash
node scripts/index-optimizer.js --schema=prisma/schema.prisma
```

### 4. Analyze Queries

```bash
node scripts/query-analyzer.js queries.sql --db-type=postgres
```

## 📖 Usage Examples

### Example 1: Create Table Migration (Prisma)

```bash
# Generate migration for a new table
node scripts/migration-generator.js \
  --orm=prisma \
  --type=create-table \
  --table=products \
  --schema='{
    "id": "uuid primary key",
    "name": "string not null",
    "price": "decimal(10,2) not null",
    "category_id": "uuid references categories(id)"
  }'

# Output:
# ✓ Generated migration: prisma/migrations/20260116_create_products/migration.sql
# ✓ Migration includes:
#   - CREATE TABLE products
#   - Foreign key to categories
#   - Indexes on category_id
```

### Example 2: Add Column Migration (TypeORM)

```bash
# Generate TypeORM migration
node scripts/migration-generator.js \
  --orm=typeorm \
  --description="Add email verification"

# Output:
# ✓ Generated: src/migrations/1705395600000-AddEmailVerification.ts
# ✓ Includes up() and down() methods
# ✓ Ready to run: npm run typeorm migration:run
```

### Example 3: Index Optimization

```bash
# Analyze and optimize indexes
node scripts/index-optimizer.js \
  --database=myapp \
  --environment=production

# Output:
# Unused Indexes (3):
# 1. idx_users_phone (12 MB) - Never used
#    Recommendation: DROP
#
# Missing Indexes (5):
# 1. users.email - 15,000 queries/hour
#    Recommendation: CREATE INDEX idx_users_email ON users(email)
#    Estimated speedup: 85%
#
# Total Potential Savings: 28 MB
# Estimated Performance Improvement: 45%
```

### Example 4: Slow Query Analysis

```bash
# Analyze slow queries
node scripts/query-analyzer.js \
  --slow-threshold=1000ms \
  --limit=10

# Output:
# Top 10 Slow Queries:
# 1. SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at
#    Avg Time: 3,450ms
#    Executions: 1,200/hour
#    Problem: Full table scan (235,000 rows)
#    Solution: CREATE INDEX idx_orders_status_created ON orders(status, created_at)
```

## ⚙️ Configuration

### Database Configuration

Edit `configs/database-config.json`:

```json
{
  "connections": {
    "development": {
      "type": "postgresql",
      "host": "localhost",
      "port": 5432,
      "database": "myapp_dev",
      "username": "dev_user",
      "password": "${DATABASE_PASSWORD}"
    },
    "production": {
      "type": "postgresql",
      "host": "db.example.com",
      "port": 5432,
      "database": "myapp_prod",
      "username": "prod_user",
      "ssl": true
    }
  },
  "migration": {
    "directory": "prisma/migrations",
    "tableName": "_migrations",
    "transactional": true
  }
}
```

### Optimization Rules

Edit `configs/optimization-rules.json`:

```json
{
  "indexes": {
    "unused_days_threshold": 90,
    "min_size_mb_to_drop": 5,
    "fragmentation_threshold": 0.5
  },
  "queries": {
    "slow_threshold_ms": 1000,
    "n_plus_one_threshold": 10
  }
}
```

## 🔧 Troubleshooting

### Error: Schema file not found

**Cause**: Prisma schema file not at default location

**Solution**:

```bash
# Specify custom schema path
node scripts/schema-analyzer.js \
  --orm=prisma \
  --schema=./custom/path/schema.prisma
```

### Error: Migration already exists

**Cause**: Migration with same name already generated

**Solution**:

```bash
# Use a more specific description
node scripts/migration-generator.js \
  --orm=prisma \
  --description="Add email_verified column to users table"
```

### Error: Database connection refused

**Cause**: Database not running or incorrect credentials

**Solution**:

1. Verify database is running:

```bash
# PostgreSQL
pg_isready -h localhost -p 5432

# MySQL
mysql -h localhost -u root -p -e "SELECT 1;"
```

2. Check connection string in `.env`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### Error: Permission denied on table

**Cause**: Database user lacks necessary permissions

**Solution**:

```sql
-- PostgreSQL: Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;

-- MySQL: Grant permissions
GRANT ALL PRIVILEGES ON database_name.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: Rollback failed

**Cause**: Down migration missing or incomplete

**Solution**:

- Ensure every migration has a proper `down()` method
- Review generated migration before applying
- Test rollback in development first:

```bash
# TypeORM rollback
npm run typeorm migration:revert

# Prisma rollback
npx prisma migrate resolve --rolled-back <migration_name>
```

## ✅ Best Practices

### 1. Always Backup Before Migration

```bash
# Create backup before applying migration
node scripts/backup-automation.js \
  --environment=production \
  --output=backups/

# Then run migration
npx prisma migrate deploy
```

### 2. Test Migrations in Staging First

```bash
# Apply to staging
DATABASE_URL=$STAGING_DATABASE_URL npx prisma migrate deploy

# Verify data integrity
node scripts/data-validator.js --environment=staging

# If successful, apply to production
DATABASE_URL=$PRODUCTION_DATABASE_URL npx prisma migrate deploy
```

### 3. Use Transactional Migrations

Ensure migrations run in transactions to prevent partial failures:

```typescript
// TypeORM Migration
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.startTransaction();
  try {
    // Migration steps
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  }
}
```

### 4. Document Breaking Changes

For migrations with breaking changes, add comments:

```sql
-- BREAKING CHANGE: Renames column 'name' to 'full_name'
-- Action Required: Update application code to use 'full_name'
-- Affected Queries: SELECT name FROM users

ALTER TABLE users RENAME COLUMN name TO full_name;
```

### 5. Monitor Migration Duration

Track migration execution time in production:

```bash
# Add timing to migration script
time npx prisma migrate deploy

# Log to monitoring system
echo "Migration completed in ${SECONDS}s" | logger
```

### 6. Keep Migrations Small

Split large migrations into smaller, independent steps:

```bash
# ❌ Bad: One large migration with 10 changes
# ✅ Good: 10 small migrations, each with 1-2 changes

# Migration 1: Add column
node scripts/migration-generator.js --description="Add email_verified column"

# Migration 2: Backfill data
node scripts/migration-generator.js --description="Backfill email_verified default values"

# Migration 3: Add NOT NULL constraint
node scripts/migration-generator.js --description="Make email_verified NOT NULL"
```

## 📚 Related Documentation

- [SKILL.md](SKILL.md) - Complete skill specifications
- [examples/basic-usage.md](examples/basic-usage.md) - Basic migration examples
- [examples/advanced-usage.md](examples/advanced-usage.md) - Complex migration patterns
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeORM Documentation](https://typeorm.io/)

## 📝 License

MIT

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

---

**Need help?** Create an issue or see [Troubleshooting](#troubleshooting) above.
