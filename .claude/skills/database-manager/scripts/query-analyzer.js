#!/usr/bin/env node

/**
 * Query Analyzer
 * スロークエリを分析し、最適化の提案を行う
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('@claude-skills/utils');

const logger = new Logger('database-manager:query-analyzer');

/**
 * クエリを分析
 * @param {Object} options - 分析オプション
 * @param {Array} options.queries - 分析するクエリの配列
 * @param {string} options.dbType - データベースタイプ（postgres/mysql/sqlite）
 * @returns {Object} 分析結果
 */
function analyzeQueries(options = {}) {
  const { queries = [], dbType = 'postgres' } = options;

  logger.info(`\n🔍 Analyzing ${queries.length} queries...\n`);

  const results = {
    queries: [],
    issues: [],
    recommendations: [],
    summary: {
      totalQueries: queries.length,
      issuesFound: 0,
      avgComplexity: 0
    }
  };

  queries.forEach((query, index) => {
    const analysis = analyzeQuery(query, dbType);

    results.queries.push({
      id: index + 1,
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      ...analysis
    });

    if (analysis.issues.length > 0) {
      results.issues.push(
        ...analysis.issues.map((issue) => ({
          queryId: index + 1,
          ...issue
        }))
      );
      results.summary.issuesFound += analysis.issues.length;
    }

    if (analysis.recommendations.length > 0) {
      results.recommendations.push(
        ...analysis.recommendations.map((rec) => ({
          queryId: index + 1,
          ...rec
        }))
      );
    }
  });

  // 平均複雑度を計算
  results.summary.avgComplexity = Math.round(
    results.queries.reduce((sum, q) => sum + q.complexity, 0) / queries.length
  );

  return results;
}

/**
 * 単一クエリを分析
 * @param {string} query - SQLクエリ
 * @param {string} dbType - データベースタイプ
 * @returns {Object} 分析結果
 */
function analyzeQuery(query, dbType) {
  const normalized = query.toLowerCase().trim();

  const analysis = {
    type: detectQueryType(normalized),
    complexity: calculateComplexity(normalized),
    issues: [],
    recommendations: []
  };

  // 問題を検出
  const detectedIssues = detectQueryIssues(normalized, dbType);
  analysis.issues.push(...detectedIssues);

  // 推奨事項を生成
  const recommendations = generateQueryRecommendations(normalized, detectedIssues, dbType);
  analysis.recommendations.push(...recommendations);

  return analysis;
}

/**
 * クエリタイプを検出
 * @param {string} query - 正規化されたクエリ
 * @returns {string} クエリタイプ
 */
function detectQueryType(query) {
  if (query.startsWith('select')) return 'SELECT';
  if (query.startsWith('insert')) return 'INSERT';
  if (query.startsWith('update')) return 'UPDATE';
  if (query.startsWith('delete')) return 'DELETE';
  if (query.startsWith('create')) return 'CREATE';
  if (query.startsWith('alter')) return 'ALTER';
  if (query.startsWith('drop')) return 'DROP';
  return 'UNKNOWN';
}

/**
 * クエリの複雑度を計算
 * @param {string} query - 正規化されたクエリ
 * @returns {number} 複雑度スコア（1-10）
 */
function calculateComplexity(query) {
  let score = 1;

  // JOIN の数
  const joinCount = (query.match(/\bjoin\b/g) || []).length;
  score += joinCount * 1;

  // サブクエリの数
  const subqueryCount = (query.match(/\(select\b/g) || []).length;
  score += subqueryCount * 2;

  // WHERE条件の数
  const whereConditions = (query.match(/\band\b|\bor\b/g) || []).length;
  score += Math.floor(whereConditions / 2);

  // GROUP BY、ORDER BYの存在
  if (query.includes('group by')) score += 1;
  if (query.includes('order by')) score += 1;
  if (query.includes('having')) score += 1;

  // UNION、INTERSECTなど
  if (query.includes('union')) score += 2;
  if (query.includes('intersect')) score += 2;
  if (query.includes('except')) score += 2;

  return Math.min(score, 10);
}

/**
 * クエリの問題を検出
 * @param {string} query - 正規化されたクエリ
 * @param {string} dbType - データベースタイプ
 * @returns {Array} 検出された問題
 */
function detectQueryIssues(query, _dbType) {
  const issues = [];

  // SELECT * の使用
  if (query.includes('select *')) {
    issues.push({
      type: 'select-all',
      severity: 'medium',
      description: 'SELECT * is used instead of specific columns',
      impact: 'Fetches unnecessary data, increases network traffic and memory usage'
    });
  }

  // WHERE句なしのUPDATE/DELETE
  if ((query.startsWith('update') || query.startsWith('delete')) && !query.includes('where')) {
    issues.push({
      type: 'missing-where-clause',
      severity: 'critical',
      description: 'UPDATE/DELETE without WHERE clause',
      impact: 'May affect all rows in the table'
    });
  }

  // LIKE '%pattern%' の使用
  const likePattern = query.match(/like\s+['"]%[^%]+%['"]/);
  if (likePattern) {
    issues.push({
      type: 'inefficient-like',
      severity: 'high',
      description: 'LIKE with leading wildcard prevents index usage',
      impact: 'Full table scan required'
    });
  }

  // WHERE句での関数使用
  const functionInWhere = query.match(/where\s+[^=]+\([^)]+\)\s*=/);
  if (functionInWhere) {
    issues.push({
      type: 'function-in-where',
      severity: 'medium',
      description: 'Function applied to column in WHERE clause',
      impact: 'Prevents index usage on that column'
    });
  }

  // OR条件の過剰使用
  const orCount = (query.match(/\bor\b/g) || []).length;
  if (orCount > 5) {
    issues.push({
      type: 'excessive-or-conditions',
      severity: 'medium',
      description: `Too many OR conditions (${orCount})`,
      impact: 'Consider using IN clause or UNION instead'
    });
  }

  // N+1クエリパターン（IN句で大量のID）
  const inClause = query.match(/in\s*\(([^)]+)\)/);
  if (inClause) {
    const itemCount = inClause[1].split(',').length;
    if (itemCount > 100) {
      issues.push({
        type: 'large-in-clause',
        severity: 'high',
        description: `IN clause with ${itemCount} items`,
        impact: 'Consider using temporary table or JOIN instead'
      });
    }
  }

  // サブクエリの非効率な使用
  const subqueryInSelect = query.match(/select[^from]*\(select/);
  if (subqueryInSelect) {
    issues.push({
      type: 'subquery-in-select',
      severity: 'medium',
      description: 'Subquery in SELECT clause',
      impact: 'Executes for each row, consider using JOIN'
    });
  }

  // DISTINCT の過剰使用
  if (query.includes('distinct') && !query.includes('group by')) {
    issues.push({
      type: 'unnecessary-distinct',
      severity: 'low',
      description: 'DISTINCT without GROUP BY',
      impact: 'May indicate data model issue or missing JOIN condition'
    });
  }

  // OFFSET/LIMITの大きな値
  const offsetMatch = query.match(/offset\s+(\d+)/);
  if (offsetMatch && parseInt(offsetMatch[1]) > 1000) {
    issues.push({
      type: 'large-offset',
      severity: 'high',
      description: `Large OFFSET value (${offsetMatch[1]})`,
      impact: 'Database must scan and skip many rows, use cursor-based pagination'
    });
  }

  return issues;
}

/**
 * 最適化の推奨事項を生成
 * @param {string} query - 正規化されたクエリ
 * @param {Array} issues - 検出された問題
 * @param {string} dbType - データベースタイプ
 * @returns {Array} 推奨事項
 */
function generateQueryRecommendations(query, issues, dbType) {
  const recommendations = [];

  issues.forEach((issue) => {
    switch (issue.type) {
      case 'select-all':
        recommendations.push({
          priority: 'medium',
          recommendation: 'Specify only required columns in SELECT clause',
          example: 'SELECT id, name, email FROM users WHERE ...'
        });
        break;

      case 'missing-where-clause':
        recommendations.push({
          priority: 'critical',
          recommendation: 'Always use WHERE clause with UPDATE/DELETE',
          example: 'DELETE FROM table WHERE id = ?'
        });
        break;

      case 'inefficient-like':
        recommendations.push({
          priority: 'high',
          recommendation: 'Use full-text search or avoid leading wildcard',
          example:
            dbType === 'postgres'
              ? "Use: WHERE column ILIKE 'pattern%' or to_tsvector(column) @@ to_tsquery('pattern')"
              : "Use: WHERE column LIKE 'pattern%' or MATCH(column) AGAINST('pattern')"
        });
        break;

      case 'function-in-where':
        recommendations.push({
          priority: 'medium',
          recommendation: 'Avoid functions on columns in WHERE clause, or create functional index',
          example:
            dbType === 'postgres'
              ? 'CREATE INDEX idx_lower_email ON users (LOWER(email))'
              : 'Consider computed column or redesign query'
        });
        break;

      case 'excessive-or-conditions':
        recommendations.push({
          priority: 'medium',
          recommendation: 'Replace multiple OR with IN clause or UNION',
          example: "WHERE status IN ('active', 'pending', 'approved')"
        });
        break;

      case 'large-in-clause':
        recommendations.push({
          priority: 'high',
          recommendation: 'Use temporary table or JOIN instead of large IN clause',
          example:
            'CREATE TEMP TABLE temp_ids (id INT); INSERT INTO temp_ids VALUES (...); SELECT * FROM table JOIN temp_ids USING (id)'
        });
        break;

      case 'subquery-in-select':
        recommendations.push({
          priority: 'medium',
          recommendation: 'Convert subquery to JOIN or use window functions',
          example: 'SELECT t1.*, t2.count FROM table1 t1 LEFT JOIN (SELECT ...) t2 ON ...'
        });
        break;

      case 'large-offset':
        recommendations.push({
          priority: 'high',
          recommendation: 'Use cursor-based pagination instead of OFFSET',
          example: 'WHERE id > last_seen_id ORDER BY id LIMIT 20'
        });
        break;
    }
  });

  // 一般的な推奨事項
  if (query.includes('select') && !query.includes('limit')) {
    recommendations.push({
      priority: 'low',
      recommendation: 'Consider adding LIMIT clause to prevent fetching too many rows',
      example: 'SELECT ... LIMIT 100'
    });
  }

  return recommendations;
}

/**
 * 結果を表示
 * @param {Object} results - 分析結果
 */
function displayResults(results) {
  logger.info('📊 Query Analysis Results\n');

  logger.info('Summary:');
  logger.info(`  Total Queries: ${results.summary.totalQueries}`);
  logger.info(`  Issues Found: ${results.summary.issuesFound}`);
  logger.info(`  Average Complexity: ${results.summary.avgComplexity}/10\n`);

  if (results.issues.length > 0) {
    logger.info('🚨 Issues Detected:\n');

    // 重要度別にグループ化
    const criticalIssues = results.issues.filter((i) => i.severity === 'critical');
    const highIssues = results.issues.filter((i) => i.severity === 'high');
    const mediumIssues = results.issues.filter((i) => i.severity === 'medium');
    const _lowIssues = results.issues.filter((i) => i.severity === 'low');

    if (criticalIssues.length > 0) {
      logger.info('  🔴 CRITICAL:');
      criticalIssues.forEach((issue) => {
        logger.info(`     Query #${issue.queryId}: ${issue.description}`);
        logger.info(`     Impact: ${issue.impact}\n`);
      });
    }

    if (highIssues.length > 0) {
      logger.info('  🟠 HIGH:');
      highIssues.forEach((issue) => {
        logger.info(`     Query #${issue.queryId}: ${issue.description}`);
        logger.info(`     Impact: ${issue.impact}\n`);
      });
    }

    if (mediumIssues.length > 0) {
      logger.info('  🟡 MEDIUM:');
      mediumIssues.forEach((issue) => {
        logger.info(`     Query #${issue.queryId}: ${issue.description}`);
      });
      logger.info('');
    }
  }

  if (results.recommendations.length > 0) {
    logger.info('💡 Recommendations:\n');

    const criticalRecs = results.recommendations.filter((r) => r.priority === 'critical');
    const highRecs = results.recommendations.filter((r) => r.priority === 'high');

    if (criticalRecs.length > 0) {
      criticalRecs.slice(0, 3).forEach((rec) => {
        logger.info(`  🔴 Query #${rec.queryId}: ${rec.recommendation}`);
        logger.info(`     Example: ${rec.example}\n`);
      });
    }

    if (highRecs.length > 0) {
      highRecs.slice(0, 3).forEach((rec) => {
        logger.info(`  🟠 Query #${rec.queryId}: ${rec.recommendation}`);
        logger.info(`     Example: ${rec.example}\n`);
      });
    }
  }
}

/**
 * 結果を保存
 * @param {Object} results - 分析結果
 * @param {string} outputPath - 出力パス
 */
function saveResults(results, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  logger.info(`✓ Analysis results saved to: ${outputPath}\n`);
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    logger.error('Usage: query-analyzer.js <queries-file.sql> [--db-type=postgres|mysql|sqlite]');
    logger.error('');
    logger.error('The queries file should contain one query per line or queries separated by semicolons.');
    process.exit(1);
  }

  const queriesFile = args[0];
  let dbType = 'postgres';

  args.forEach((arg) => {
    if (arg.startsWith('--db-type=')) {
      dbType = arg.split('=')[1];
    }
  });

  try {
    // クエリファイルを読み込む
    if (!fs.existsSync(queriesFile)) {
      throw new Error(`Queries file not found: ${queriesFile}`);
    }

    const content = fs.readFileSync(queriesFile, 'utf8');

    // クエリを分割
    const queries = content
      .split(';')
      .map((q) => q.trim())
      .filter((q) => q.length > 0 && !q.startsWith('--') && !q.startsWith('/*'));

    if (queries.length === 0) {
      throw new Error('No valid queries found in file');
    }

    // 分析を実行
    const results = analyzeQueries({ queries, dbType });

    displayResults(results);

    // 結果を保存
    const outputDir = path.join(__dirname, '..', 'reports');
    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `query-analysis-${timestamp}.json`);
    saveResults(results, outputPath);

    // Critical issuesがある場合は終了コード1で終了
    const hasCritical = results.issues.some((i) => i.severity === 'critical');
    if (hasCritical) {
      process.exit(1);
    }
  } catch (error) {
    logger.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = {
  analyzeQueries,
  analyzeQuery,
  detectQueryIssues,
  generateQueryRecommendations
};
