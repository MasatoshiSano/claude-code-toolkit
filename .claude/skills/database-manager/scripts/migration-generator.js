#!/usr/bin/env node

/**
 * Migration Generator
 * Prisma/TypeORMのマイグレーションファイルを生成
 */

const fs = require('fs');
const path = require('path');

/**
 * マイグレーションを生成
 * @param {Object} options - 生成オプション
 * @param {string} options.orm - ORM（'prisma' or 'typeorm'）
 * @param {string} options.action - アクション（'create-table', 'add-column', 'add-index'等）
 * @param {Object} options.config - マイグレーション設定
 * @returns {Object} 生成結果
 */
async function generateMigration(options) {
  const { orm = 'prisma', action, config = {} } = options;

  // ORMチェック
  if (!['prisma', 'typeorm'].includes(orm)) {
    console.error('❌ Error: Unsupported ORM. Use "prisma" or "typeorm"');
    process.exit(1);
  }

  console.log(`\n📝 Generating ${orm} migration for action: ${action}\n`);

  let migrationContent;
  let fileName;

  switch (orm) {
    case 'prisma':
      ({ content: migrationContent, fileName } = generatePrismaMigration(action, config));
      break;
    case 'typeorm':
      ({ content: migrationContent, fileName } = generateTypeORMMigration(action, config));
      break;
  }

  return {
    orm,
    action,
    fileName,
    content: migrationContent,
  };
}

/**
 * Prismaマイグレーションを生成
 * @param {string} action - アクション
 * @param {Object} config - 設定
 * @returns {Object} マイグレーション内容とファイル名
 */
function generatePrismaMigration(action, config) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  let content = '';
  let fileName = `${timestamp}_${action}.sql`;

  switch (action) {
    case 'create-table':
      content = generatePrismaCreateTable(config);
      break;
    case 'add-column':
      content = generatePrismaAddColumn(config);
      break;
    case 'add-index':
      content = generatePrismaAddIndex(config);
      break;
    case 'add-foreign-key':
      content = generatePrismaAddForeignKey(config);
      break;
    default:
      content = `-- Migration: ${action}\n-- Generated: ${new Date().toISOString()}\n\n-- TODO: Add migration SQL here\n`;
  }

  return { content, fileName };
}

/**
 * TypeORMマイグレーションを生成
 * @param {string} action - アクション
 * @param {Object} config - 設定
 * @returns {Object} マイグレーション内容とファイル名
 */
function generateTypeORMMigration(action, config) {
  const timestamp = Date.now();
  const className = `${capitalizeFirst(action.replace(/-/g, ''))}${timestamp}`;
  let fileName = `${timestamp}-${action}.ts`;

  let content = `import { MigrationInterface, QueryRunner } from "typeorm";

export class ${className} implements MigrationInterface {
    name = '${className}'

    public async up(queryRunner: QueryRunner): Promise<void> {
`;

  switch (action) {
    case 'create-table':
      content += generateTypeORMCreateTable(config);
      break;
    case 'add-column':
      content += generateTypeORMAddColumn(config);
      break;
    case 'add-index':
      content += generateTypeORMAddIndex(config);
      break;
    case 'add-foreign-key':
      content += generateTypeORMAddForeignKey(config);
      break;
    default:
      content += `        // TODO: Add migration logic here\n`;
  }

  content += `    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // TODO: Add rollback logic here
    }
}
`;

  return { content, fileName };
}

/**
 * Prisma: CREATE TABLEを生成
 * @param {Object} config - テーブル設定
 * @returns {string} SQL
 */
function generatePrismaCreateTable(config) {
  const { tableName = 'example_table', columns = [] } = config;

  const defaultColumns = [
    { name: 'id', type: 'SERIAL', constraints: 'PRIMARY KEY' },
    { name: 'created_at', type: 'TIMESTAMP', constraints: 'NOT NULL DEFAULT NOW()' },
    { name: 'updated_at', type: 'TIMESTAMP', constraints: 'NOT NULL DEFAULT NOW()' },
  ];

  const allColumns = [...defaultColumns, ...columns];

  const columnDefs = allColumns
    .map((col) => `    ${col.name} ${col.type}${col.constraints ? ' ' + col.constraints : ''}`)
    .join(',\n');

  return `-- CreateTable
CREATE TABLE "${tableName}" (
${columnDefs}
);

-- CreateIndex
CREATE INDEX "${tableName}_created_at_idx" ON "${tableName}"("created_at");
`;
}

/**
 * Prisma: ADD COLUMNを生成
 * @param {Object} config - カラム設定
 * @returns {string} SQL
 */
function generatePrismaAddColumn(config) {
  const { tableName = 'example_table', columnName = 'new_column', columnType = 'VARCHAR(255)', constraints = '' } = config;

  return `-- AddColumn
ALTER TABLE "${tableName}"
ADD COLUMN "${columnName}" ${columnType}${constraints ? ' ' + constraints : ''};
`;
}

/**
 * Prisma: ADD INDEXを生成
 * @param {Object} config - インデックス設定
 * @returns {string} SQL
 */
function generatePrismaAddIndex(config) {
  const { tableName = 'example_table', indexName, columns = [] } = config;
  const idxName = indexName || `${tableName}_${columns.join('_')}_idx`;

  return `-- CreateIndex
CREATE INDEX "${idxName}" ON "${tableName}"(${columns.map((c) => `"${c}"`).join(', ')});
`;
}

/**
 * Prisma: ADD FOREIGN KEYを生成
 * @param {Object} config - 外部キー設定
 * @returns {string} SQL
 */
function generatePrismaAddForeignKey(config) {
  const {
    tableName = 'example_table',
    columnName = 'foreign_id',
    referencedTable = 'referenced_table',
    referencedColumn = 'id',
    onDelete = 'CASCADE',
  } = config;

  const constraintName = `${tableName}_${columnName}_fkey`;

  return `-- AddForeignKey
ALTER TABLE "${tableName}"
ADD CONSTRAINT "${constraintName}"
FOREIGN KEY ("${columnName}")
REFERENCES "${referencedTable}"("${referencedColumn}")
ON DELETE ${onDelete};
`;
}

/**
 * TypeORM: CREATE TABLEを生成
 * @param {Object} config - テーブル設定
 * @returns {string} TypeORMコード
 */
function generateTypeORMCreateTable(config) {
  const { tableName = 'example_table' } = config;

  return `        await queryRunner.createTable(
            new Table({
                name: "${tableName}",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );
`;
}

/**
 * TypeORM: ADD COLUMNを生成
 * @param {Object} config - カラム設定
 * @returns {string} TypeORMコード
 */
function generateTypeORMAddColumn(config) {
  const { tableName = 'example_table', columnName = 'new_column', columnType = 'varchar' } = config;

  return `        await queryRunner.addColumn(
            "${tableName}",
            new TableColumn({
                name: "${columnName}",
                type: "${columnType}",
                isNullable: true,
            })
        );
`;
}

/**
 * TypeORM: ADD INDEXを生成
 * @param {Object} config - インデックス設定
 * @returns {string} TypeORMコード
 */
function generateTypeORMAddIndex(config) {
  const { tableName = 'example_table', columns = [] } = config;

  return `        await queryRunner.createIndex(
            "${tableName}",
            new TableIndex({
                name: "IDX_${tableName}_${columns.join('_')}",
                columnNames: [${columns.map((c) => `"${c}"`).join(', ')}],
            })
        );
`;
}

/**
 * TypeORM: ADD FOREIGN KEYを生成
 * @param {Object} config - 外部キー設定
 * @returns {string} TypeORMコード
 */
function generateTypeORMAddForeignKey(config) {
  const {
    tableName = 'example_table',
    columnName = 'foreign_id',
    referencedTable = 'referenced_table',
    referencedColumn = 'id',
  } = config;

  return `        await queryRunner.createForeignKey(
            "${tableName}",
            new TableForeignKey({
                columnNames: ["${columnName}"],
                referencedColumnNames: ["${referencedColumn}"],
                referencedTableName: "${referencedTable}",
                onDelete: "CASCADE",
            })
        );
`;
}

/**
 * 先頭文字を大文字にする
 * @param {string} str - 文字列
 * @returns {string} 先頭文字が大文字の文字列
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * マイグレーションファイルを保存
 * @param {Object} migration - マイグレーション情報
 * @param {string} outputDir - 出力ディレクトリ
 */
function saveMigration(migration, outputDir) {
  const dir = outputDir || path.join(process.cwd(), 'migrations');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, migration.fileName);
  fs.writeFileSync(filePath, migration.content);

  console.log(`✓ Migration file created: ${filePath}\n`);
  console.log('Preview:');
  console.log('─'.repeat(60));
  console.log(migration.content);
  console.log('─'.repeat(60));
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node migration-generator.js --orm=<prisma|typeorm> --action=<action> [--table=<name>] [--output=<dir>]');
    console.log('\nActions:');
    console.log('  create-table    Create a new table');
    console.log('  add-column      Add a column to existing table');
    console.log('  add-index       Add an index');
    console.log('  add-foreign-key Add a foreign key constraint');
    console.log('\nExample:');
    console.log('  node migration-generator.js --orm=prisma --action=create-table --table=users');
    process.exit(0);
  }

  const options = { config: {} };
  let outputDir;

  args.forEach((arg) => {
    if (arg.startsWith('--orm=')) {
      options.orm = arg.split('=')[1];
    } else if (arg.startsWith('--action=')) {
      options.action = arg.split('=')[1];
    } else if (arg.startsWith('--table=')) {
      options.config.tableName = arg.split('=')[1];
    } else if (arg.startsWith('--column=')) {
      options.config.columnName = arg.split('=')[1];
    } else if (arg.startsWith('--type=')) {
      options.config.columnType = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      outputDir = arg.split('=')[1];
    }
  });

  try {
    const migration = await generateMigration(options);
    saveMigration(migration, outputDir);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = { generateMigration, generatePrismaMigration, generateTypeORMMigration };
