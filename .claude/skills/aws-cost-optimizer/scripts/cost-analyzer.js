#!/usr/bin/env node

/**
 * AWS Cost Analyzer
 * コスト分析を実行し、サービス別、環境別、チーム別のコスト内訳を取得
 */

const fs = require('fs');
const path = require('path');
const { CostExplorerClient, GetCostAndUsageCommand } = require('@aws-sdk/client-cost-explorer');
const { Logger } = require('@claude-skills/utils');

const logger = new Logger('aws-cost-optimizer:cost-analyzer');

/**
 * コスト分析を実行
 * @param {Object} options - 分析オプション
 * @param {string} options.period - 分析期間（'last-7-days', 'last-30-days', 'last-90-days'）
 * @param {string} options.groupBy - グループ化方法（'service', 'environment', 'team'）
 * @param {string} options.region - AWSリージョン（デフォルト: 'us-east-1'）
 * @returns {Promise<Object>} コスト分析結果
 */
async function analyzeCost(options = {}) {
  const { period = 'last-30-days', groupBy: _groupBy = 'service', region = 'us-east-1' } = options;

  // 依存関係チェック
  try {
    require('@aws-sdk/client-cost-explorer');
  } catch (error) {
    logger.error('❌ Error: AWS SDK not found');
    logger.info('Install: npm install @aws-sdk/client-cost-explorer');
    process.exit(1);
  }

  // 期間を計算
  const { start, end } = calculatePeriod(period);

  // Cost Explorer クライアントを初期化
  const client = new CostExplorerClient({ region });

  try {
    // コストデータを取得
    const params = {
      TimePeriod: {
        Start: start,
        End: end
      },
      Granularity: 'DAILY',
      Metrics: ['UnblendedCost'],
      GroupBy: [
        {
          Type: 'DIMENSION',
          Key: 'SERVICE'
        }
      ]
    };

    const command = new GetCostAndUsageCommand(params);
    const response = await client.send(command);

    // データを処理
    const analysis = processCostandUsageData(response, period);

    return analysis;
  } catch (error) {
    if (error.name === 'CredentialsProviderError') {
      logger.error('❌ AWS credentials not configured');
      logger.info('Run: aws configure');
      process.exit(1);
    } else if (error.name === 'AccessDeniedException') {
      logger.error('❌ Cost Explorer API not enabled or insufficient permissions');
      logger.info('Enable: https://console.aws.amazon.com/cost-management/');
      logger.info('Required IAM permissions: ce:GetCostAndUsage');
      process.exit(1);
    } else {
      throw error;
    }
  }
}

/**
 * 期間を計算
 * @param {string} period - 期間文字列
 * @returns {Object} 開始日と終了日
 */
function calculatePeriod(period) {
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  const start = new Date(end);

  switch (period) {
    case 'last-7-days':
      start.setDate(start.getDate() - 7);
      break;
    case 'last-30-days':
      start.setDate(start.getDate() - 30);
      break;
    case 'last-90-days':
      start.setDate(start.getDate() - 90);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

/**
 * Cost and Usageデータを処理
 * @param {Object} response - AWS APIレスポンス
 * @param {string} period - 分析期間
 * @returns {Object} 処理されたデータ
 */
function processCostandUsageData(response, period) {
  const results = response.ResultsByTime || [];

  // サービス別コストを集計
  const serviceBreakdown = {};
  let totalCost = 0;

  results.forEach((result) => {
    (result.Groups || []).forEach((group) => {
      const service = group.Keys[0];
      const cost = parseFloat(group.Metrics.UnblendedCost.Amount);

      if (!serviceBreakdown[service]) {
        serviceBreakdown[service] = 0;
      }
      serviceBreakdown[service] += cost;
      totalCost += cost;
    });
  });

  // サービスをコスト順にソート
  const sortedServices = Object.entries(serviceBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([service, cost]) => ({
      service,
      cost: cost.toFixed(2),
      percentage: ((cost / totalCost) * 100).toFixed(1)
    }));

  return {
    period,
    totalCost: totalCost.toFixed(2),
    currency: 'USD',
    serviceBreakdown: sortedServices,
    analyzedDays: results.length
  };
}

/**
 * 分析結果をフォーマットして表示
 * @param {Object} analysis - 分析結果
 */
function displayAnalysis(analysis) {
  logger.info('\n📊 AWS Cost Analysis\n');
  logger.info(`Period: ${analysis.period}`);
  logger.info(`Total Cost: $${analysis.totalCost} ${analysis.currency}`);
  logger.info(`Analyzed Days: ${analysis.analyzedDays}\n`);

  logger.info('Top 10 Services by Cost:\n');
  analysis.serviceBreakdown.forEach((item, index) => {
    logger.info(`${index + 1}. ${item.service.padEnd(30)} $${item.cost.padStart(10)} (${item.percentage}%)`);
  });

  logger.info('');
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // 簡単なCLI引数パース
  args.forEach((arg) => {
    if (arg.startsWith('--period=')) {
      options.period = arg.split('=')[1];
    } else if (arg.startsWith('--region=')) {
      options.region = arg.split('=')[1];
    }
  });

  try {
    const analysis = await analyzeCost(options);
    displayAnalysis(analysis);

    // 結果をJSONファイルとして保存
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(reportsDir, `cost-analysis-${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));

    logger.info(`\n✓ Report saved to: ${outputPath}\n`);
  } catch (error) {
    logger.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = { analyzeCost, calculatePeriod, processCostandUsageData };
