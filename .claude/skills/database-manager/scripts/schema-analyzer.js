#!/usr/bin/env node

/**
 * Schema Analyzer
 * データベーススキーマを分析し、改善提案を生成
 */

const fs = require('fs');
const path = require('path');

/**
 * スキーマを分析
 * @param {Object} options - 分析オプション
 * @param {string} options.orm - ORM（'prisma' or 'typeorm'）
 * @param {string} options.schemaPath - スキーマファイルのパス
 * @returns {Promise<Object>} 分析結果
 */
async function analyzeSchema(options) {
  const { orm = 'prisma', schemaPath } = options;

  if (!schemaPath || !fs.existsSync(schemaPath)) {
    console.error('❌ Error: Schema file not found');
    console.log('Provide a valid schema file path using --schema=<path>');
    process.exit(1);
  }

  console.log(`\n🔍 Analyzing ${orm} schema...\n`);

  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  let analysis;
  switch (orm) {
    case 'prisma':
      analysis = analyzePrismaSchema(schemaContent);
      break;
    case 'typeorm':
      analysis = analyzeTypeORMSchema(schemaContent);
      break;
    default:
      console.error('❌ Error: Unsupported ORM');
      process.exit(1);
  }

  return analysis;
}

/**
 * Prismaスキーマを分析
 * @param {string} schemaContent - スキーマ内容
 * @returns {Object} 分析結果
 */
function analyzePrismaSchema(schemaContent) {
  // モデル定義を抽出
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
  const models = [];
  let match;

  while ((match = modelRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];

    // フィールドを抽出
    const fieldRegex = /(\w+)\s+(\w+)(\[\])?\s*(@.*)?/g;
    const fields = [];
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(modelBody)) !== null) {
      fields.push({
        name: fieldMatch[1],
        type: fieldMatch[2],
        isArray: !!fieldMatch[3],
        attributes: fieldMatch[4] || '',
      });
    }

    models.push({
      name: modelName,
      fields,
      fieldCount: fields.length,
    });
  }

  // 分析と推奨事項を生成
  const recommendations = generatePrismaRecommendations(models);

  return {
    orm: 'prisma',
    modelCount: models.length,
    models,
    recommendations,
    summary: generateSummary(models, recommendations),
  };
}

/**
 * TypeORMスキーマを分析
 * @param {string} schemaContent - スキーマ内容
 * @returns {Object} 分析結果
 */
function analyzeTypeORMSchema(schemaContent) {
  // エンティティクラスを抽出（簡略化）
  const entityRegex = /@Entity\([^)]*\)\s+export\s+class\s+(\w+)/g;
  const entities = [];
  let match;

  while ((match = entityRegex.exec(schemaContent)) !== null) {
    entities.push({
      name: match[1],
      fields: [], // 実際にはフィールドも解析
    });
  }

  const recommendations = generateTypeORMRecommendations(entities);

  return {
    orm: 'typeorm',
    entityCount: entities.length,
    entities,
    recommendations,
    summary: generateSummary(entities, recommendations),
  };
}

/**
 * Prisma推奨事項を生成
 * @param {Array} models - モデル配列
 * @returns {Array} 推奨事項
 */
function generatePrismaRecommendations(models) {
  const recommendations = [];

  models.forEach((model) => {
    // タイムスタンプフィールドのチェック
    const hasCreatedAt = model.fields.some((f) => f.name === 'createdAt' || f.name === 'created_at');
    const hasUpdatedAt = model.fields.some((f) => f.name === 'updatedAt' || f.name === 'updated_at');

    if (!hasCreatedAt || !hasUpdatedAt) {
      recommendations.push({
        model: model.name,
        type: 'missing-timestamps',
        severity: 'low',
        description: 'Add createdAt and updatedAt timestamp fields',
        suggestion: `Add @default(now()) and @updatedAt attributes`,
      });
    }

    // インデックスのチェック
    const hasIndex = model.fields.some((f) => f.attributes.includes('@unique') || f.attributes.includes('@@index'));

    if (!hasIndex && model.fieldCount > 5) {
      recommendations.push({
        model: model.name,
        type: 'missing-indexes',
        severity: 'medium',
        description: 'Consider adding indexes for frequently queried fields',
        suggestion: 'Add @@index([fieldName]) for commonly queried fields',
      });
    }

    // リレーションのチェック
    const relationFields = model.fields.filter((f) => f.attributes.includes('@relation'));

    relationFields.forEach((field) => {
      if (!field.attributes.includes('onDelete')) {
        recommendations.push({
          model: model.name,
          field: field.name,
          type: 'missing-cascade',
          severity: 'medium',
          description: 'Specify onDelete behavior for foreign key',
          suggestion: 'Add onDelete: Cascade or onDelete: SetNull',
        });
      }
    });
  });

  return recommendations;
}

/**
 * TypeORM推奨事項を生成
 * @param {Array} entities - エンティティ配列
 * @returns {Array} 推奨事項
 */
function generateTypeORMRecommendations(entities) {
  const recommendations = [];

  // 簡略化: 基本的な推奨事項のみ
  if (entities.length === 0) {
    recommendations.push({
      type: 'no-entities',
      severity: 'info',
      description: 'No entities found in schema',
      suggestion: 'Create entity classes with @Entity() decorator',
    });
  }

  return recommendations;
}

/**
 * サマリーを生成
 * @param {Array} items - モデル/エンティティ配列
 * @param {Array} recommendations - 推奨事項
 * @returns {Object} サマリー
 */
function generateSummary(items, recommendations) {
  const severityCounts = {
    high: recommendations.filter((r) => r.severity === 'high').length,
    medium: recommendations.filter((r) => r.severity === 'medium').length,
    low: recommendations.filter((r) => r.severity === 'low').length,
  };

  return {
    totalModels: items.length,
    totalRecommendations: recommendations.length,
    severityCounts,
    overallHealth: calculateHealth(severityCounts),
  };
}

/**
 * スキーマの健全性を計算
 * @param {Object} severityCounts - 深刻度別カウント
 * @returns {string} 健全性レベル
 */
function calculateHealth(severityCounts) {
  if (severityCounts.high > 0) return 'poor';
  if (severityCounts.medium > 3) return 'fair';
  if (severityCounts.medium > 0 || severityCounts.low > 5) return 'good';
  return 'excellent';
}

/**
 * 分析結果を表示
 * @param {Object} analysis - 分析結果
 */
function displayAnalysis(analysis) {
  console.log('📊 Schema Analysis Results\n');
  console.log(`ORM: ${analysis.orm}`);
  console.log(`Models/Entities: ${analysis.summary.totalModels}`);
  console.log(`Overall Health: ${analysis.summary.overallHealth.toUpperCase()}\n`);

  if (analysis.recommendations.length === 0) {
    console.log('✅ No issues found! Schema is well-structured.\n');
    return;
  }

  console.log(`Recommendations (${analysis.recommendations.length}):\n`);

  // 深刻度別にグループ化
  const grouped = {
    high: analysis.recommendations.filter((r) => r.severity === 'high'),
    medium: analysis.recommendations.filter((r) => r.severity === 'medium'),
    low: analysis.recommendations.filter((r) => r.severity === 'low'),
  };

  ['high', 'medium', 'low'].forEach((severity) => {
    if (grouped[severity].length === 0) return;

    console.log(`${severity.toUpperCase()} Priority (${grouped[severity].length}):`);
    grouped[severity].forEach((rec, index) => {
      console.log(`  ${index + 1}. [${rec.model || 'General'}] ${rec.description}`);
      console.log(`     → ${rec.suggestion}\n`);
    });
  });
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node schema-analyzer.js --orm=<prisma|typeorm> --schema=<path>');
    console.log('\nExample:');
    console.log('  node schema-analyzer.js --orm=prisma --schema=./prisma/schema.prisma');
    process.exit(0);
  }

  const options = {};

  args.forEach((arg) => {
    if (arg.startsWith('--orm=')) {
      options.orm = arg.split('=')[1];
    } else if (arg.startsWith('--schema=')) {
      options.schemaPath = arg.split('=')[1];
    }
  });

  try {
    const analysis = await analyzeSchema(options);
    displayAnalysis(analysis);

    // 結果をJSONファイルとして保存
    const outputDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `schema-analysis-${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));

    console.log(`✓ Report saved to: ${outputPath}\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = { analyzeSchema, analyzePrismaSchema, analyzeTypeORMSchema };
