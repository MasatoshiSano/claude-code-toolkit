# Database Manager

Database schema management, migrations, optimization, and query analysis.

## Quick Start

### Prerequisites

- Node.js >= 16
- Prisma or TypeORM project (for migration generation)
- Database access (for query analysis)

### Installation

```bash
cd .claude/skills
npm install
```

### Basic Usage

```bash
# Generate migration
node database-manager/scripts/migration-generator.js --orm=prisma --action=add-column

# Analyze schema
node database-manager/scripts/schema-analyzer.js --orm=prisma

# Optimize indexes
node database-manager/scripts/index-optimizer.js --schema=prisma/schema.prisma

# Analyze queries
node database-manager/scripts/query-analyzer.js queries.sql --db-type=postgres
```

### Configuration

Edit `configs/database-config.json` to customize:
- Connection settings
- Performance thresholds
- Index optimization rules

## Features

- ✅ Prisma/TypeORM migration generation
- ✅ Schema analysis and recommendations
- ✅ Index optimization (unused index detection, missing index suggestions)
- ✅ Slow query analysis
- ✅ Data integrity validation
- ✅ Automatic backup scripts

## Output

Reports are saved to `reports/`:
- `schema-analysis-YYYY-MM-DD.json` - Schema recommendations
- `index-optimization-YYYY-MM-DD.json` - Index suggestions
- `query-analysis-YYYY-MM-DD.json` - Query performance issues

## Supported ORMs

- ✅ Prisma
- ✅ TypeORM
- 🚧 Sequelize (planned)

## Supported Databases

- PostgreSQL
- MySQL
- SQLite

## Documentation

See [SKILL.md](SKILL.md) for detailed specifications and instructions.

## Troubleshooting

**Error: Schema file not found**
- Verify Prisma schema path: `prisma/schema.prisma`
- Verify TypeORM entities path

**Error: Invalid query syntax**
- Check SQL syntax for target database
- Ensure queries are separated by semicolons

## License

MIT
