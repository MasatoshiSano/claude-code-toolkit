# AWS Cost Optimizer - 高度な使用例

## 1. カスタムコスト閾値の設定

### config/cost-thresholds.jsonのカスタマイズ

```json
{
  "monthly": {
    "warning": 1000,
    "critical": 2000
  },
  "daily": {
    "warning": 50,
    "critical": 100
  },
  "serviceSpecific": {
    "EC2": 500,
    "RDS": 300,
    "S3": 100
  }
}
```

### プログラムから閾値チェック

```javascript
const { analyzeCost } = require('./scripts/cost-analyzer.js');
const thresholds = require('./configs/cost-thresholds.json');

async function checkThresholds() {
  const results = await analyzeCost({ period: 'last-30-days' });

  // 月次コストチェック
  if (results.totalCost > thresholds.monthly.critical) {
    console.error('🚨 CRITICAL: Monthly cost exceeded!');
    // Send alert to Slack/Email
  } else if (results.totalCost > thresholds.monthly.warning) {
    console.warn('⚠️ WARNING: Approaching monthly budget limit');
  }

  // サービス別チェック
  results.services.forEach(service => {
    const threshold = thresholds.serviceSpecific[service.name];
    if (threshold && service.cost > threshold) {
      console.warn(`⚠️ ${service.name} cost: $${service.cost} exceeds $${threshold}`);
    }
  });
}
```

## 2. 複数アカウント・リージョンの一括分析

```javascript
const { analyzeCost } = require('./scripts/cost-analyzer.js');

const accounts = [
  { name: 'Production', region: 'us-east-1' },
  { name: 'Staging', region: 'us-west-2' },
  { name: 'Development', region: 'eu-west-1' }
];

async function analyzeAllAccounts() {
  const allResults = [];

  for (const account of accounts) {
    console.log(`\n📊 Analyzing ${account.name}...`);

    // AWS credentialsを切り替え（環境変数で制御）
    process.env.AWS_PROFILE = account.name;

    const results = await analyzeCost({
      period: 'last-30-days',
      region: account.region
    });

    allResults.push({
      account: account.name,
      ...results
    });
  }

  // 合計コストを計算
  const totalCost = allResults.reduce((sum, r) => sum + r.totalCost, 0);
  console.log(`\n💰 Total across all accounts: $${totalCost.toFixed(2)}`);

  return allResults;
}

analyzeAllAccounts();
```

## 3. Reserved InstancesとSavings Plansの最適化

### 利用率分析

```javascript
const { detectUnusedResources } = require('./scripts/unused-resource-detector.js');

async function analyzeReservedInstances() {
  const findings = await detectUnusedResources({
    allRegions: true,
    stoppedDaysThreshold: 7
  });

  // EC2インスタンスタイプの集計
  const instanceTypes = {};
  findings.stoppedInstances.forEach(instance => {
    instanceTypes[instance.type] = (instanceTypes[instance.type] || 0) + 1;
  });

  console.log('\n💡 Reserved Instance Recommendations:');
  Object.entries(instanceTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([type, count]) => {
      console.log(`- ${type}: ${count} instances → Consider RI purchase`);
    });
}
```

### Savings Plans計算機

```javascript
function calculateSavingsPlansSavings(monthlyOnDemandCost) {
  // Compute Savings Plans: 平均66%割引
  const computeSavings = monthlyOnDemandCost * 0.66;

  // EC2 Instance Savings Plans: 平均72%割引
  const ec2Savings = monthlyOnDemandCost * 0.72;

  return {
    compute: {
      monthlySavings: computeSavings,
      yearlySavings: computeSavings * 12
    },
    ec2: {
      monthlySavings: ec2Savings,
      yearlySavings: ec2Savings * 12
    },
    recommendation: ec2Savings > computeSavings ? 'EC2 Instance Savings Plans' : 'Compute Savings Plans'
  };
}

// 使用例
const onDemandCost = 1000; // 月額$1000
const savings = calculateSavingsPlansSavings(onDemandCost);
console.log(`💰 Potential savings: $${savings.ec2.yearlySavings}/year`);
```

## 4. カスタムアラート設定

### Slackへの通知

```javascript
const axios = require('axios');

async function sendSlackAlert(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  await axios.post(webhookUrl, {
    text: message,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      }
    ]
  });
}

// 使用例
const { analyzeCost } = require('./scripts/cost-analyzer.js');

async function dailyCostCheck() {
  const results = await analyzeCost({ period: 'last-7-days' });

  if (results.totalCost > 1000) {
    await sendSlackAlert(
      `⚠️ *AWS Cost Alert*\n` +
      `Total: $${results.totalCost}\n` +
      `Top service: ${results.services[0].name} ($${results.services[0].cost})`
    );
  }
}
```

### Emailアラート（AWS SES）

```javascript
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

async function sendEmailAlert(subject, body) {
  const sesClient = new SESClient({ region: 'us-east-1' });

  const command = new SendEmailCommand({
    Source: 'alerts@example.com',
    Destination: {
      ToAddresses: ['team@example.com']
    },
    Message: {
      Subject: { Data: subject },
      Body: {
        Text: { Data: body }
      }
    }
  });

  await sesClient.send(command);
}
```

## 5. コスト予測とトレンド分析

```javascript
const { analyzeCost } = require('./scripts/cost-analyzer.js');

async function predictMonthlyCost() {
  // 過去7日間の平均日次コストを取得
  const results = await analyzeCost({ period: 'last-7-days' });
  const dailyAverage = results.totalCost / 7;

  // 今月の経過日数
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();

  // 今月の予測コスト
  const predictedMonthlyCost = dailyAverage * daysInMonth;

  // 現在のペース
  const currentSpend = dailyAverage * daysPassed;

  console.log(`\n📈 Cost Forecast:`);
  console.log(`Daily Average: $${dailyAverage.toFixed(2)}`);
  console.log(`Current Month Spend: $${currentSpend.toFixed(2)} (${daysPassed} days)`);
  console.log(`Predicted Monthly Total: $${predictedMonthlyCost.toFixed(2)}`);

  return {
    dailyAverage,
    currentSpend,
    predictedMonthlyCost,
    daysRemaining: daysInMonth - daysPassed
  };
}
```

## 6. タグベースのコスト配分

```javascript
async function analyzeByTags() {
  const results = await analyzeCost({
    period: 'last-30-days',
    groupBy: 'team' // または 'project', 'environment'
  });

  console.log('\n🏷️ Cost by Team:');
  results.tags.forEach(tag => {
    console.log(`${tag.name}: $${tag.cost} (${tag.percentage}%)`);
  });

  // チームごとの推奨アクション
  results.tags.forEach(tag => {
    if (tag.cost > 500) {
      console.log(`\n💡 Recommendations for ${tag.name}:`);
      console.log('- Review unused resources');
      console.log('- Consider Reserved Instances');
      console.log('- Enable auto-scaling');
    }
  });
}
```

## 7. カスタムレポートの生成

```javascript
const fs = require('fs');
const { analyzeCost } = require('./scripts/cost-analyzer.js');
const { detectUnusedResources } = require('./scripts/unused-resource-detector.js');

async function generateExecutiveReport() {
  const costData = await analyzeCost({ period: 'last-30-days' });
  const unusedData = await detectUnusedResources({ allRegions: true });

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalCost: costData.totalCost,
      potentialSavings: unusedData.totalMonthlyCost,
      savingsPercentage: ((unusedData.totalMonthlyCost / costData.totalCost) * 100).toFixed(2)
    },
    topServices: costData.services.slice(0, 5),
    unusedResources: {
      instances: unusedData.stoppedInstances.length,
      volumes: unusedData.unattachedVolumes.length,
      ips: unusedData.unallocatedEIPs.length
    },
    recommendations: [
      `Terminate ${unusedData.stoppedInstances.length} stopped instances`,
      `Delete ${unusedData.unattachedVolumes.length} unattached volumes`,
      `Release ${unusedData.unallocatedEIPs.length} unused Elastic IPs`,
      'Consider Reserved Instances for consistent workloads'
    ]
  };

  // HTMLレポート生成
  const html = `
    <html>
      <head><title>AWS Cost Report</title></head>
      <body>
        <h1>AWS Cost Optimization Report</h1>
        <h2>Summary</h2>
        <p>Total Cost: $${report.summary.totalCost}</p>
        <p>Potential Savings: $${report.summary.potentialSavings} (${report.summary.savingsPercentage}%)</p>
        <!-- 詳細を追加 -->
      </body>
    </html>
  `;

  fs.writeFileSync('./reports/executive-report.html', html);
  console.log('✓ Report generated: reports/executive-report.html');
}
```
