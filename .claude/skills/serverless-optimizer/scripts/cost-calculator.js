#!/usr/bin/env node

/**
 * Serverless Cost Calculator
 * サーバーレスアーキテクチャ（Lambda、API Gateway、DynamoDB）のコストを計算
 */

const { Logger } = require('@claude-skills/utils');

const logger = new Logger('serverless-optimizer:cost-calculator');

/**
 * Lambda関数のコストを計算
 * @param {Object} params - Lambda設定
 * @param {number} params.invocationsPerMonth - 月間呼び出し数
 * @param {number} params.avgDurationMs - 平均実行時間（ミリ秒）
 * @param {number} params.memoryMB - メモリサイズ（MB）
 * @param {number} params.provisionedConcurrency - Provisioned Concurrency数（オプション）
 * @returns {Object} コスト詳細
 */
function calculateLambdaCost(params) {
  const { invocationsPerMonth, avgDurationMs, memoryMB, provisionedConcurrency = 0 } = params;

  // Lambda料金（us-east-1、2025年価格）
  const pricePerRequest = 0.0000002; // $0.20 per 1M requests
  const pricePerGBSecond = 0.0000166667; // $0.0000166667 per GB-second
  const provisionedConcurrencyPrice = 0.000004167; // $0.015 per GB-hour

  // リクエストコスト
  const requestCost = Math.max(0, invocationsPerMonth - 1000000) * pricePerRequest;

  // コンピューティングコスト
  const gbSeconds = invocationsPerMonth * (avgDurationMs / 1000) * (memoryMB / 1024);
  const freeTierGBSeconds = 400000; // 月間400,000 GB-秒の無料枠
  const computeCost = Math.max(0, gbSeconds - freeTierGBSeconds) * pricePerGBSecond;

  // Provisioned Concurrencyコスト
  const provisionedCost = provisionedConcurrency * (memoryMB / 1024) * 730 * provisionedConcurrencyPrice;

  const totalCost = requestCost + computeCost + provisionedCost;

  return {
    service: 'Lambda',
    details: {
      requestCost: requestCost.toFixed(4),
      computeCost: computeCost.toFixed(4),
      provisionedCost: provisionedCost.toFixed(4),
      totalCost: totalCost.toFixed(2)
    },
    totalCost
  };
}

/**
 * API Gatewayのコストを計算
 * @param {Object} params - API Gateway設定
 * @param {number} params.requestsPerMonth - 月間リクエスト数
 * @param {string} params.type - タイプ（'REST' or 'HTTP'）
 * @param {boolean} params.cachingEnabled - キャッシング有効
 * @param {string} params.cacheSize - キャッシュサイズ（'0.5GB', '1.6GB', '6.1GB'等）
 * @returns {Object} コスト詳細
 */
function calculateAPIGatewayCost(params) {
  const { requestsPerMonth, type = 'REST', cachingEnabled = false, cacheSize = '0.5GB' } = params;

  // API Gateway料金
  const restAPIPrice = 0.0000035; // $3.50 per million requests (REST API)
  const httpAPIPrice = 0.000001; // $1.00 per million requests (HTTP API)

  const pricePerRequest = type === 'HTTP' ? httpAPIPrice : restAPIPrice;

  // リクエストコスト
  const requestCost = requestsPerMonth * pricePerRequest;

  // キャッシングコスト（時間単位）
  const cachePrices = {
    '0.5GB': 0.02,
    '1.6GB': 0.038,
    '6.1GB': 0.2,
    '13.5GB': 0.25,
    '28.4GB': 0.5,
    '58.2GB': 1.0,
    '118GB': 1.9,
    '237GB': 3.8
  };

  const cachingCost = cachingEnabled ? (cachePrices[cacheSize] || 0) * 730 : 0;

  const totalCost = requestCost + cachingCost;

  return {
    service: 'API Gateway',
    type,
    details: {
      requestCost: requestCost.toFixed(4),
      cachingCost: cachingCost.toFixed(2),
      totalCost: totalCost.toFixed(2)
    },
    totalCost
  };
}

/**
 * DynamoDBのコストを計算
 * @param {Object} params - DynamoDB設定
 * @param {string} params.mode - モード（'on-demand' or 'provisioned'）
 * @param {number} params.readRequestsPerMonth - 月間読み取りリクエスト数（On-Demand）
 * @param {number} params.writeRequestsPerMonth - 月間書き込みリクエスト数（On-Demand）
 * @param {number} params.readCapacityUnits - 読み取りキャパシティユニット（Provisioned）
 * @param {number} params.writeCapacityUnits - 書き込みキャパシティユニット（Provisioned）
 * @param {number} params.storageSizeGB - ストレージサイズ（GB）
 * @returns {Object} コスト詳細
 */
function calculateDynamoDBCost(params) {
  const {
    mode = 'on-demand',
    readRequestsPerMonth = 0,
    writeRequestsPerMonth = 0,
    readCapacityUnits = 0,
    writeCapacityUnits = 0,
    storageSizeGB = 0
  } = params;

  // DynamoDB料金
  const onDemandReadPrice = 0.00000025; // $0.25 per million read requests
  const onDemandWritePrice = 0.00000125; // $1.25 per million write requests
  const provisionedReadPrice = 0.00013; // $0.00013 per hour per RCU
  const provisionedWritePrice = 0.00065; // $0.00065 per hour per WCU
  const storagePrice = 0.25; // $0.25 per GB-month

  let readCost = 0;
  let writeCost = 0;

  if (mode === 'on-demand') {
    readCost = readRequestsPerMonth * onDemandReadPrice;
    writeCost = writeRequestsPerMonth * onDemandWritePrice;
  } else {
    // Provisioned
    const freeTierRCU = 25; // 最初の25 RCUは無料
    const freeTierWCU = 25; // 最初の25 WCUは無料

    readCost = Math.max(0, readCapacityUnits - freeTierRCU) * 730 * provisionedReadPrice;
    writeCost = Math.max(0, writeCapacityUnits - freeTierWCU) * 730 * provisionedWritePrice;
  }

  // ストレージコスト
  const freeTierStorageGB = 25; // 最初の25GBは無料
  const storageCost = Math.max(0, storageSizeGB - freeTierStorageGB) * storagePrice;

  const totalCost = readCost + writeCost + storageCost;

  return {
    service: 'DynamoDB',
    mode,
    details: {
      readCost: readCost.toFixed(4),
      writeCost: writeCost.toFixed(4),
      storageCost: storageCost.toFixed(2),
      totalCost: totalCost.toFixed(2)
    },
    totalCost
  };
}

/**
 * サーバーレスアーキテクチャ全体のコストを計算
 * @param {Object} architecture - アーキテクチャ設定
 * @returns {Object} 総コスト
 */
function calculateServerlessCost(architecture) {
  const costs = {
    lambda: architecture.lambda ? calculateLambdaCost(architecture.lambda) : null,
    apiGateway: architecture.apiGateway ? calculateAPIGatewayCost(architecture.apiGateway) : null,
    dynamodb: architecture.dynamodb ? calculateDynamoDBCost(architecture.dynamodb) : null
  };

  const totalCost = Object.values(costs)
    .filter(Boolean)
    .reduce((sum, cost) => sum + cost.totalCost, 0);

  return {
    breakdown: costs,
    totalMonthlyCost: totalCost.toFixed(2),
    totalAnnualCost: (totalCost * 12).toFixed(2)
  };
}

/**
 * コスト計算結果を表示
 * @param {Object} results - 計算結果
 */
function displayCostBreakdown(results) {
  logger.info('\n💰 Serverless Cost Breakdown\n');

  if (results.breakdown.lambda) {
    logger.info('Lambda:');
    logger.info(`  - Request Cost: $${results.breakdown.lambda.details.requestCost}`);
    logger.info(`  - Compute Cost: $${results.breakdown.lambda.details.computeCost}`);
    logger.info(`  - Provisioned Concurrency: $${results.breakdown.lambda.details.provisionedCost}`);
    logger.info(`  - Total: $${results.breakdown.lambda.details.totalCost}\n`);
  }

  if (results.breakdown.apiGateway) {
    logger.info(`API Gateway (${results.breakdown.apiGateway.type}):`);
    logger.info(`  - Request Cost: $${results.breakdown.apiGateway.details.requestCost}`);
    logger.info(`  - Caching Cost: $${results.breakdown.apiGateway.details.cachingCost}`);
    logger.info(`  - Total: $${results.breakdown.apiGateway.details.totalCost}\n`);
  }

  if (results.breakdown.dynamodb) {
    logger.info(`DynamoDB (${results.breakdown.dynamodb.mode}):`);
    logger.info(`  - Read Cost: $${results.breakdown.dynamodb.details.readCost}`);
    logger.info(`  - Write Cost: $${results.breakdown.dynamodb.details.writeCost}`);
    logger.info(`  - Storage Cost: $${results.breakdown.dynamodb.details.storageCost}`);
    logger.info(`  - Total: $${results.breakdown.dynamodb.details.totalCost}\n`);
  }

  logger.info(`Total Monthly Cost: $${results.totalMonthlyCost}`);
  logger.info(`Total Annual Cost: $${results.totalAnnualCost}\n`);
}

/**
 * CLIエントリーポイント
 */
function main() {
  // サンプル計算（実際にはCLI引数から設定を読み取る）
  const exampleArchitecture = {
    lambda: {
      invocationsPerMonth: 5000000,
      avgDurationMs: 200,
      memoryMB: 512,
      provisionedConcurrency: 0
    },
    apiGateway: {
      requestsPerMonth: 5000000,
      type: 'REST',
      cachingEnabled: false
    },
    dynamodb: {
      mode: 'on-demand',
      readRequestsPerMonth: 10000000,
      writeRequestsPerMonth: 2000000,
      storageSizeGB: 10
    }
  };

  const results = calculateServerlessCost(exampleArchitecture);
  displayCostBreakdown(results);

  logger.info('📝 Example calculation completed.');
  logger.info('For custom calculations, use the exported functions.\n');
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = {
  calculateLambdaCost,
  calculateAPIGatewayCost,
  calculateDynamoDBCost,
  calculateServerlessCost
};
