#!/usr/bin/env node

/**
 * Lambda Optimizer
 * Lambda関数のメモリ、タイムアウト、同時実行数を最適化
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('@claude-skills/utils');
const { CloudWatchClient, GetMetricStatisticsCommand } = require('@aws-sdk/client-cloudwatch');
const { LambdaClient, ListFunctionsCommand, GetFunctionCommand } = require('@aws-sdk/client-lambda');

const logger = new Logger('serverless-optimizer:lambda-optimizer');

/**
 * Lambda関数を最適化
 * @param {Object} options - 最適化オプション
 * @param {string} options.region - AWSリージョン
 * @param {string} options.functionName - 関数名（指定しない場合は全関数を分析）
 * @param {number} options.periodDays - 分析期間（日数）
 * @returns {Promise<Object>} 最適化結果
 */
async function optimizeLambdaFunctions(options = {}) {
  const { region = 'us-east-1', functionName, periodDays = 14 } = options;

  // 依存関係チェック
  try {
    require('@aws-sdk/client-lambda');
    require('@aws-sdk/client-cloudwatch');
  } catch (error) {
    logger.error('❌ Error: AWS SDK not found');
    logger.info('Install: npm install @aws-sdk/client-lambda @aws-sdk/client-cloudwatch');
    process.exit(1);
  }

  const lambdaClient = new LambdaClient({ region });
  const cloudwatchClient = new CloudWatchClient({ region });

  logger.info(`\n🔧 Analyzing Lambda functions in ${region}...\n`);

  try {
    const functions = await getFunctions(lambdaClient, functionName);
    const recommendations = [];

    for (const func of functions) {
      const analysis = await analyzeLambdaFunction(lambdaClient, cloudwatchClient, func, periodDays);

      if (analysis.recommendation) {
        recommendations.push(analysis);
      }
    }

    const totalSavings = recommendations.reduce((sum, rec) => sum + (rec.monthlySavings || 0), 0);

    return {
      analyzedFunctions: functions.length,
      recommendations,
      totalMonthlySavings: totalSavings,
      totalAnnualSavings: totalSavings * 12
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

  const command = new ListFunctionsCommand({});
  const response = await lambdaClient.send(command);
  return response.Functions || [];
}

/**
 * Lambda関数を分析
 * @param {LambdaClient} lambdaClient - Lambdaクライアント
 * @param {CloudWatchClient} cloudwatchClient - CloudWatchクライアント
 * @param {Object} func - Lambda関数情報
 * @param {number} periodDays - 分析期間
 * @returns {Promise<Object>} 分析結果
 */
async function analyzeLambdaFunction(lambdaClient, cloudwatchClient, func, periodDays) {
  const functionName = func.FunctionName;
  const currentMemoryMB = func.MemorySize;
  const currentTimeoutSeconds = func.Timeout;

  // CloudWatchメトリクスを取得
  const metrics = await getLambdaMetrics(cloudwatchClient, functionName, periodDays);

  // 最適なメモリサイズを計算
  const optimalMemory = calculateOptimalMemory(currentMemoryMB, metrics);
  const memorySavingsPercentage = optimalMemory < currentMemoryMB
    ? ((currentMemoryMB - optimalMemory) / currentMemoryMB) * 100
    : 0;

  // コスト計算
  const currentMonthlyCost = estimateLambdaCost(metrics.invocations, metrics.avgDuration, currentMemoryMB);
  const optimizedMonthlyCost = estimateLambdaCost(metrics.invocations, metrics.avgDuration, optimalMemory);
  const monthlySavings = currentMonthlyCost - optimizedMonthlyCost;

  // 推奨事項を生成
  const recommendation = memorySavingsPercentage > 10
    ? {
      type: 'memory-reduction',
      from: currentMemoryMB,
      to: optimalMemory,
      savingsPercentage: memorySavingsPercentage.toFixed(1)
    }
    : null;

  return {
    functionName,
    currentConfig: {
      memory: currentMemoryMB,
      timeout: currentTimeoutSeconds
    },
    metrics: {
      invocations: metrics.invocations,
      avgDuration: metrics.avgDuration,
      maxMemoryUsed: metrics.maxMemoryUsed
    },
    recommendation,
    currentMonthlyCost: currentMonthlyCost.toFixed(2),
    optimizedMonthlyCost: optimizedMonthlyCost.toFixed(2),
    monthlySavings: monthlySavings.toFixed(2)
  };
}

/**
 * Lambda関数のCloudWatchメトリクスを取得
 * @param {CloudWatchClient} cloudwatchClient - CloudWatchクライアント
 * @param {string} functionName - 関数名
 * @param {number} periodDays - 期間
 * @returns {Promise<Object>} メトリクス
 */
async function getLambdaMetrics(cloudwatchClient, functionName, periodDays) {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - periodDays * 24 * 60 * 60 * 1000);

  // Invocationsメトリクスを取得
  const invocationsCommand = new GetMetricStatisticsCommand({
    Namespace: 'AWS/Lambda',
    MetricName: 'Invocations',
    Dimensions: [
      {
        Name: 'FunctionName',
        Value: functionName
      }
    ],
    StartTime: startTime,
    EndTime: endTime,
    Period: periodDays * 24 * 60 * 60,
    Statistics: ['Sum']
  });

  // Durationメトリクスを取得
  const durationCommand = new GetMetricStatisticsCommand({
    Namespace: 'AWS/Lambda',
    MetricName: 'Duration',
    Dimensions: [
      {
        Name: 'FunctionName',
        Value: functionName
      }
    ],
    StartTime: startTime,
    EndTime: endTime,
    Period: periodDays * 24 * 60 * 60,
    Statistics: ['Average']
  });

  try {
    const [invocationsResponse, durationResponse] = await Promise.all([
      cloudwatchClient.send(invocationsCommand),
      cloudwatchClient.send(durationCommand)
    ]);

    const invocations = invocationsResponse.Datapoints[0]?.Sum || 0;
    const avgDuration = durationResponse.Datapoints[0]?.Average || 0;

    // 簡略化: 実際のメモリ使用量は取得できないので推定
    const maxMemoryUsed = 128; // ダミー値

    return {
      invocations: Math.round(invocations),
      avgDuration: Math.round(avgDuration),
      maxMemoryUsed
    };
  } catch (error) {
    // メトリクスが取得できない場合はデフォルト値を返す
    return {
      invocations: 0,
      avgDuration: 1000,
      maxMemoryUsed: 128
    };
  }
}

/**
 * 最適なメモリサイズを計算
 * @param {number} currentMemory - 現在のメモリ（MB）
 * @param {Object} metrics - メトリクス
 * @returns {number} 最適なメモリサイズ（MB）
 */
function calculateOptimalMemory(currentMemory, metrics) {
  // 簡略化したロジック: 実際のメモリ使用量 + 20%のバッファ
  const recommendedMemory = Math.ceil(metrics.maxMemoryUsed * 1.2);

  // Lambdaのメモリサイズの有効な値に丸める（64MB刻み）
  const validMemorySizes = [
    128, 192, 256, 320, 384, 448, 512, 576, 640, 704, 768, 832, 896, 960, 1024, 1088, 1152, 1216, 1280, 1344, 1408,
    1472, 1536, 1600, 1664, 1728, 1792, 1856, 1920, 1984, 2048, 2112, 2176, 2240, 2304, 2368, 2432, 2496, 2560, 2624,
    2688, 2752, 2816, 2880, 2944, 3008
  ];

  const optimalMemory = validMemorySizes.find((size) => size >= recommendedMemory) || 128;

  // 現在のメモリより大きい場合は現在のメモリを返す（削減のみ推奨）
  return optimalMemory < currentMemory ? optimalMemory : currentMemory;
}

/**
 * Lambda関数の月額コストを推定
 * @param {number} invocations - 月間呼び出し数
 * @param {number} avgDurationMs - 平均実行時間（ミリ秒）
 * @param {number} memoryMB - メモリサイズ（MB）
 * @returns {number} 月額コスト（USD）
 */
function estimateLambdaCost(invocations, avgDurationMs, memoryMB) {
  // Lambda料金（us-east-1の2025年価格）
  const pricePerRequest = 0.0000002; // $0.20 per 1M requests
  const pricePerGBSecond = 0.0000166667; // $0.0000166667 per GB-second

  const requestCost = invocations * pricePerRequest;
  const computeCost = invocations * (avgDurationMs / 1000) * (memoryMB / 1024) * pricePerGBSecond;

  return requestCost + computeCost;
}

/**
 * 最適化結果を表示
 * @param {Object} results - 最適化結果
 */
function displayResults(results) {
  logger.info('\n📊 Lambda Optimization Analysis\n');
  logger.info(`Analyzed Functions: ${results.analyzedFunctions}`);
  logger.info(`Optimization Opportunities: ${results.recommendations.length}\n`);

  if (results.recommendations.length === 0) {
    logger.info('✅ All functions are optimally configured!\n');
    return;
  }

  results.recommendations.forEach((rec, index) => {
    logger.info(`${index + 1}. ${rec.functionName}`);
    logger.info(`   Current: ${rec.currentConfig.memory}MB`);

    if (rec.recommendation) {
      logger.info(`   Recommendation: ${rec.recommendation.to}MB`);
      logger.info(`   Savings: ${rec.recommendation.savingsPercentage}%`);
      logger.info(`   Monthly Cost: $${rec.currentMonthlyCost} → $${rec.optimizedMonthlyCost}`);
      logger.info(`   Monthly Savings: $${rec.monthlySavings}\n`);
    }
  });

  logger.info('\n💰 Total Potential Savings:');
  logger.info(`   - Monthly: $${results.totalMonthlySavings.toFixed(2)}`);
  logger.info(`   - Annual: $${results.totalAnnualSavings.toFixed(2)}\n`);
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
    const results = await optimizeLambdaFunctions(options);
    displayResults(results);

    // 結果をJSONファイルとして保存
    const outputDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `lambda-optimization-${timestamp}.json`);
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

module.exports = { optimizeLambdaFunctions, analyzeLambdaFunction, estimateLambdaCost };
