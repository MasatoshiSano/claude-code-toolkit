#!/usr/bin/env node

/**
 * Index Optimizer
 * データベースインデックスを分析し、最適化提案を生成
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('@claude-skills/utils');

const logger = new Logger('database-manager:index-optimizer');

/**
 * インデックスを最適化
 * @param {Object} options - 最適化オプション
 * @param {string} options.database - データベース種類（'postgresql', 'mysql'等）
 * @param {Array} options.queries - 分析するクエリ配列
 * @returns {Object} 最適化提案
 */
async function optimizeIndexes(options) {
  const { database = 'postgresql', queries = [] } = options;

  logger.info(`\n🔧 Analyzing indexes for ${database}...\n`);

  // クエリパターンを分析
  const queryPatterns = analyzeQueryPatterns(queries);

  // インデックス提案を生成
  const recommendations = generateIndexRecommendations(queryPatterns, database);

  return {
    database,
    analyzedQueries: queries.length,
    queryPatterns,
    recommendations,
    summary: generateIndexSummary(recommendations)
  };
}

/**
 * クエリパターンを分析
 * @param {Array} queries - クエリ配列
 * @returns {Array} クエリパターン
 */
function analyzeQueryPatterns(queries) {
  const patterns = [];

  queries.forEach((query) => {
    const pattern = extractQueryPattern(query);
    if (pattern) {
      patterns.push(pattern);
    }
  });

  return patterns;
}

/**
 * クエリからパターンを抽出
 * @param {string} query - SQLクエリ
 * @returns {Object} クエリパターン
 */
function extractQueryPattern(query) {
  const normalized = query.toLowerCase().trim();

  // テーブル名を抽出
  const fromMatch = normalized.match(/from\s+(\w+)/);
  const tableName = fromMatch ? fromMatch[1] : null;

  if (!tableName) return null;

  // WHERE句のカラムを抽出
  const whereColumns = [];
  const whereMatch = normalized.match(/where\s+(.+?)(?:group by|order by|limit|$)/);

  if (whereMatch) {
    const whereClause = whereMatch[1];
    const columnMatches = whereClause.matchAll(/(\w+)\s*[=<>]/g);
    for (const match of columnMatches) {
      whereColumns.push(match[1]);
    }
  }

  // ORDER BY句のカラムを抽出
  const orderColumns = [];
  const orderMatch = normalized.match(/order by\s+(.+?)(?:limit|$)/);

  if (orderMatch) {
    const orderClause = orderMatch[1];
    const columnMatches = orderClause.matchAll(/(\w+)/g);
    for (const match of columnMatches) {
      if (!['asc', 'desc'].includes(match[1])) {
        orderColumns.push(match[1]);
      }
    }
  }

  return {
    tableName,
    whereColumns,
    orderColumns,
    query: query.substring(0, 100) + (query.length > 100 ? '...' : '')
  };
}

/**
 * インデックス推奨事項を生成
 * @param {Array} queryPatterns - クエリパターン配列
 * @param {string} database - データベース種類
 * @returns {Array} 推奨事項
 */
function generateIndexRecommendations(queryPatterns, database) {
  const recommendations = [];
  const columnUsage = {};

  // カラム使用頻度を集計
  queryPatterns.forEach((pattern) => {
    pattern.whereColumns.forEach((column) => {
      const key = `${pattern.tableName}.${column}`;
      if (!columnUsage[key]) {
        columnUsage[key] = { table: pattern.tableName, column, whereCount: 0, orderCount: 0 };
      }
      columnUsage[key].whereCount++;
    });

    pattern.orderColumns.forEach((column) => {
      const key = `${pattern.tableName}.${column}`;
      if (!columnUsage[key]) {
        columnUsage[key] = { table: pattern.tableName, column, whereCount: 0, orderCount: 0 };
      }
      columnUsage[key].orderCount++;
    });
  });

  // 頻繁に使用されるカラムにインデックスを推奨
  Object.entries(columnUsage).forEach(([_key, usage]) => {
    const totalUsage = usage.whereCount + usage.orderCount;

    if (totalUsage >= 2) {
      // 2回以上使用されている場合に推奨
      const indexSQL = generateIndexSQL(usage.table, usage.column, database);

      recommendations.push({
        type: 'create-index',
        table: usage.table,
        column: usage.column,
        usageCount: totalUsage,
        whereUsage: usage.whereCount,
        orderUsage: usage.orderCount,
        priority: totalUsage >= 5 ? 'high' : 'medium',
        sql: indexSQL,
        estimatedImpact: estimateIndexImpact(totalUsage)
      });
    }
  });

  // 複合インデックスの推奨
  const compositeIndexes = findCompositeIndexOpportunities(queryPatterns);
  compositeIndexes.forEach((composite) => {
    const indexSQL = generateCompositeIndexSQL(composite.table, composite.columns, database);

    recommendations.push({
      type: 'create-composite-index',
      table: composite.table,
      columns: composite.columns,
      usageCount: composite.count,
      priority: 'high',
      sql: indexSQL,
      estimatedImpact: 'significant'
    });
  });

  return recommendations;
}

/**
 * 複合インデックスの機会を見つける
 * @param {Array} queryPatterns - クエリパターン配列
 * @returns {Array} 複合インデックス候補
 */
function findCompositeIndexOpportunities(queryPatterns) {
  const composites = {};

  queryPatterns.forEach((pattern) => {
    if (pattern.whereColumns.length >= 2) {
      const key = `${pattern.tableName}:${pattern.whereColumns.sort().join(',')}`;
      if (!composites[key]) {
        composites[key] = {
          table: pattern.tableName,
          columns: pattern.whereColumns,
          count: 0
        };
      }
      composites[key].count++;
    }
  });

  return Object.values(composites).filter((c) => c.count >= 2);
}

/**
 * インデックスSQLを生成
 * @param {string} tableName - テーブル名
 * @param {string} columnName - カラム名
 * @param {string} database - データベース種類
 * @returns {string} SQL文
 */
function generateIndexSQL(tableName, columnName, _database) {
  const indexName = `idx_${tableName}_${columnName}`;
  return `CREATE INDEX ${indexName} ON ${tableName}(${columnName});`;
}

/**
 * 複合インデックスSQLを生成
 * @param {string} tableName - テーブル名
 * @param {Array} columns - カラム配列
 * @param {string} database - データベース種類
 * @returns {string} SQL文
 */
function generateCompositeIndexSQL(tableName, columns, _database) {
  const indexName = `idx_${tableName}_${columns.join('_')}`;
  return `CREATE INDEX ${indexName} ON ${tableName}(${columns.join(', ')});`;
}

/**
 * インデックスの影響を推定
 * @param {number} usageCount - 使用回数
 * @returns {string} 影響度
 */
function estimateIndexImpact(usageCount) {
  if (usageCount >= 10) return 'high';
  if (usageCount >= 5) return 'medium';
  return 'low';
}

/**
 * サマリーを生成
 * @param {Array} recommendations - 推奨事項
 * @returns {Object} サマリー
 */
function generateIndexSummary(recommendations) {
  return {
    totalRecommendations: recommendations.length,
    highPriority: recommendations.filter((r) => r.priority === 'high').length,
    mediumPriority: recommendations.filter((r) => r.priority === 'medium').length,
    compositeIndexes: recommendations.filter((r) => r.type === 'create-composite-index').length
  };
}

/**
 * 最適化結果を表示
 * @param {Object} results - 最適化結果
 */
function displayResults(results) {
  logger.info('📊 Index Optimization Results\n');
  logger.info(`Database: ${results.database}`);
  logger.info(`Analyzed Queries: ${results.analyzedQueries}`);
  logger.info(`Recommendations: ${results.summary.totalRecommendations}\n`);

  if (results.recommendations.length === 0) {
    logger.info('✅ No index optimizations needed!\n');
    return;
  }

  // 優先度別に表示
  const high = results.recommendations.filter((r) => r.priority === 'high');
  const medium = results.recommendations.filter((r) => r.priority === 'medium');

  if (high.length > 0) {
    logger.info(`HIGH Priority (${high.length}):\n`);
    high.forEach((rec, index) => {
      logger.info(`${index + 1}. ${rec.type} on ${rec.table}`);
      if (rec.columns) {
        logger.info(`   Columns: ${rec.columns.join(', ')}`);
      } else {
        logger.info(`   Column: ${rec.column}`);
      }
      logger.info(`   Usage: ${rec.usageCount} times`);
      logger.info(`   SQL: ${rec.sql}\n`);
    });
  }

  if (medium.length > 0) {
    logger.info(`MEDIUM Priority (${medium.length}):\n`);
    medium.forEach((rec, index) => {
      logger.info(`${index + 1}. ${rec.type} on ${rec.table}.${rec.column}`);
      logger.info(`   SQL: ${rec.sql}\n`);
    });
  }
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const _args = process.argv.slice(2);

  // サンプルクエリでデモ
  const sampleQueries = [
    'SELECT * FROM users WHERE email = ? AND status = ?',
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    'SELECT * FROM products WHERE category_id = ? AND price > ?',
    'SELECT * FROM users WHERE email = ?',
    'SELECT * FROM orders WHERE user_id = ? AND status = ?'
  ];

  const options = {
    database: 'postgresql',
    queries: sampleQueries
  };

  logger.info('Running with sample queries...\n');

  try {
    const results = await optimizeIndexes(options);
    displayResults(results);

    // 結果をJSONファイルとして保存
    const outputDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `index-optimization-${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    logger.info(`✓ Report saved to: ${outputPath}\n`);
  } catch (error) {
    logger.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = { optimizeIndexes, analyzeQueryPatterns, generateIndexRecommendations };
