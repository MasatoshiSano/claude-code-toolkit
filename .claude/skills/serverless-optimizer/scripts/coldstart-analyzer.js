#!/usr/bin/env node

/**
 * Cold Start Analyzer
 * Lambda関数のコールドスタートを分析し、削減策を提案
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('@claude-skills/utils');
const { LambdaClient, ListFunctionsCommand, GetFunctionCommand } = require('@aws-sdk/client-lambda');

const logger = new Logger('serverless-optimizer:coldstart-analyzer');

/**
 * コールドスタートを分析
 * @param {Object} options - 分析オプション
 * @param {string} options.region - AWSリージョン
 * @param {string} options.functionName - 関数名
 * @param {number} options.periodDays - 分析期間
 * @returns {Promise<Object>} 分析結果
 */
async function analyzeColdStarts(options = {}) {
  const { region = 'us-east-1', functionName, periodDays = 7 } = options;

  // 依存関係チェック
  try {
    require('@aws-sdk/client-lambda');
  } catch (error) {
    logger.error('❌ Error: AWS SDK not found');
    logger.info('Install: npm install @aws-sdk/client-lambda');
    process.exit(1);
  }

  const lambdaClient = new LambdaClient({ region });

  logger.info('\n🔍 Analyzing cold starts for Lambda functions...\n');

  try {
    const functions = await getFunctions(lambdaClient, functionName);
    const analyses = [];

    for (const func of functions) {
      const analysis = await analyzeFunctionColdStarts(func, periodDays);
      analyses.push(analysis);
    }

    return {
      analyzedFunctions: functions.length,
      analyses
    };
  } catch (error) {
    if (error.name === 'CredentialsProviderError') {
      logger.error('❌ AWS credentials not configured');
      logger.info('Run: aws configure');
      process.exit(1);
    } else {
      throw error;
    }
  }
}

/**
 * Lambda関数リストを取得
 * @param {LambdaClient} lambdaClient - Lambdaクライアント
 * @param {string} functionName - 特定の関数名（オプション）
 * @returns {Promise<Array>} 関数リスト
 */
async function getFunctions(lambdaClient, functionName) {
  if (functionName) {
    const command = new GetFunctionCommand({ FunctionName: functionName });
    const response = await lambdaClient.send(command);
    return [response.Configuration];
  }

  const command = new ListFunctionsCommand({ MaxItems: 10 }); // 最大10関数に制限
  const response = await lambdaClient.send(command);
  return response.Functions || [];
}

/**
 * 関数のコールドスタートを分析
 * @param {Object} func - Lambda関数情報
 * @param {number} periodDays - 分析期間
 * @returns {Promise<Object>} 分析結果
 */
async function analyzeFunctionColdStarts(func, _periodDays) {
  const functionName = func.FunctionName;

  // コールドスタート検出（簡略化）
  // 実際にはCloudWatch Logsを解析する必要がありますが、Phase 1では推定値を使用
  const coldStartData = estimateColdStartData(func);

  // 推奨事項を生成
  const recommendations = generateColdStartRecommendations(func, coldStartData);

  return {
    functionName,
    runtime: func.Runtime,
    memorySize: func.MemorySize,
    timeout: func.Timeout,
    coldStartData,
    recommendations
  };
}

/**
 * コールドスタートデータを推定
 * @param {Object} func - Lambda関数情報
 * @returns {Object} コールドスタートデータ
 */
function estimateColdStartData(func) {
  // 簡略化: ランタイムとメモリサイズに基づいた推定
  const runtimeColdStartTimes = {
    'nodejs18.x': 200,
    'nodejs20.x': 150,
    'python3.11': 180,
    'python3.12': 150,
    java17: 2000,
    java21: 1800,
    dotnet8: 1200
  };

  const baseColdStart = runtimeColdStartTimes[func.Runtime] || 500;

  // メモリサイズが大きいほどコールドスタートが速い傾向
  const memoryfactor = func.MemorySize >= 1024 ? 0.8 : 1.2;

  return {
    estimatedColdStartMs: Math.round(baseColdStart * memoryfactor),
    frequency: 'estimated-medium', // low/medium/high
    impact: calculateColdStartImpact(baseColdStart * memoryfactor)
  };
}

/**
 * コールドスタートの影響度を計算
 * @param {number} coldStartMs - コールドスタート時間（ms）
 * @returns {string} 影響度
 */
function calculateColdStartImpact(coldStartMs) {
  if (coldStartMs < 500) return 'low';
  if (coldStartMs < 1500) return 'medium';
  return 'high';
}

/**
 * コールドスタート削減の推奨事項を生成
 * @param {Object} func - Lambda関数情報
 * @param {Object} coldStartData - コールドスタートデータ
 * @returns {Array} 推奨事項
 */
function generateColdStartRecommendations(func, coldStartData) {
  const recommendations = [];

  // ランタイムの推奨
  if (func.Runtime && func.Runtime.includes('java')) {
    recommendations.push({
      type: 'runtime-optimization',
      priority: 'high',
      description: 'Consider using GraalVM native image or migrate to faster runtime (Node.js/Python)',
      estimatedImprovement: '70-90% reduction'
    });
  }

  // Provisioned Concurrencyの推奨
  if (coldStartData.impact === 'high' || coldStartData.frequency === 'high') {
    recommendations.push({
      type: 'provisioned-concurrency',
      priority: 'medium',
      description: 'Enable Provisioned Concurrency for consistent performance',
      estimatedCost: '$13.50/month per instance'
    });
  }

  // Lambda Layersの推奨
  recommendations.push({
    type: 'lambda-layers',
    priority: 'low',
    description: 'Move common dependencies to Lambda Layers to reduce package size',
    estimatedImprovement: '20-40% reduction'
  });

  // メモリサイズの推奨
  if (func.MemorySize < 1024) {
    recommendations.push({
      type: 'increase-memory',
      priority: 'low',
      description: 'Increase memory to 1024MB or higher for faster cold starts (more CPU)',
      estimatedImprovement: '15-30% reduction'
    });
  }

  return recommendations;
}

/**
 * 分析結果を表示
 * @param {Object} results - 分析結果
 */
function displayResults(results) {
  logger.info('\n📊 Cold Start Analysis Results\n');
  logger.info(`Analyzed Functions: ${results.analyzedFunctions}\n`);

  results.analyses.forEach((analysis, index) => {
    logger.info(`${index + 1}. ${analysis.functionName}`);
    logger.info(`   Runtime: ${analysis.runtime}`);
    logger.info(`   Memory: ${analysis.memorySize}MB`);
    logger.info(`   Estimated Cold Start: ${analysis.coldStartData.estimatedColdStartMs}ms`);
    logger.info(`   Impact: ${analysis.coldStartData.impact}\n`);

    if (analysis.recommendations.length > 0) {
      logger.info('   Recommendations:');
      analysis.recommendations.forEach((rec) => {
        logger.info(`   - [${rec.priority.toUpperCase()}] ${rec.description}`);
        if (rec.estimatedImprovement) {
          logger.info(`     Improvement: ${rec.estimatedImprovement}`);
        }
        if (rec.estimatedCost) {
          logger.info(`     Cost: ${rec.estimatedCost}`);
        }
      });
      logger.info('');
    }
  });
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach((arg) => {
    if (arg.startsWith('--region=')) {
      options.region = arg.split('=')[1];
    } else if (arg.startsWith('--function=')) {
      options.functionName = arg.split('=')[1];
    } else if (arg.startsWith('--period=')) {
      options.periodDays = parseInt(arg.split('=')[1], 10);
    }
  });

  try {
    const results = await analyzeColdStarts(options);
    displayResults(results);

    // 結果をJSONファイルとして保存
    const outputDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `coldstart-analysis-${timestamp}.json`);
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

module.exports = { analyzeColdStarts, analyzeFunctionColdStarts, generateColdStartRecommendations };
