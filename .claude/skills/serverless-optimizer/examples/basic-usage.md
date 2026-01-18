# Serverless Optimizer - 基本的な使用例

## 1. Lambda関数の最適化

### メモリとタイムアウトの最適化

```bash
node scripts/lambda-optimizer.js --function=my-function --period=7
```

**出力例**:
```
🔍 Analyzing Lambda function: my-function

📊 Optimization Results

Current Configuration:
  Memory: 1024 MB
  Timeout: 30 seconds
  Monthly Cost: $45.67

Optimal Configuration:
  Memory: 512 MB (50% reduction)
  Timeout: 15 seconds
  Monthly Cost: $22.84 (50% savings)

💰 Potential Savings: $22.83/month ($273.96/year)

Recommendations:
  ✓ Reduce memory from 1024MB to 512MB
  ✓ Reduce timeout from 30s to 15s
  ✓ Average execution time: 8.5s (well within new timeout)
```

### すべてのLambda関数を分析

```bash
node scripts/lambda-optimizer.js --all
```

## 2. コールドスタートの分析

```bash
node scripts/coldstart-analyzer.js --function=my-function
```

**出力例**:
```
🔍 Analyzing cold starts for Lambda functions...

📊 Cold Start Analysis Results

1. my-function
   Runtime: nodejs20.x
   Memory: 1024MB
   Estimated Cold Start: 150ms
   Impact: low

   Recommendations:
   - [LOW] Move common dependencies to Lambda Layers to reduce package size
     Improvement: 20-40% reduction
   - [LOW] Increase memory to 1024MB or higher for faster cold starts (more CPU)
     Improvement: 15-30% reduction
```

### Javaランタイムの最適化

```bash
node scripts/coldstart-analyzer.js --function=java-function
```

**出力例**:
```
1. java-function
   Runtime: java21
   Memory: 1024MB
   Estimated Cold Start: 1800ms
   Impact: high

   Recommendations:
   - [HIGH] Consider using GraalVM native image or migrate to faster runtime (Node.js/Python)
     Improvement: 70-90% reduction
   - [MEDIUM] Enable Provisioned Concurrency for consistent performance
     Cost: $13.50/month per instance
```

## 3. API Gatewayの最適化

### キャッシング設定

```javascript
const { optimizeApiGateway } = require('./scripts/api-optimizer.js');

async function setupCaching() {
  await optimizeApiGateway({
    apiId: 'abc123',
    cachingEnabled: true,
    cacheSize: '0.5', // GB
    cacheTtl: 300 // seconds
  });

  console.log('✓ Caching enabled for API Gateway');
}
```

### スロットリング設定

```javascript
await optimizeApiGateway({
  apiId: 'abc123',
  throttling: {
    rateLimit: 1000,  // requests per second
    burstLimit: 2000  // max concurrent requests
  }
});
```

## 4. DynamoDBの最適化

### 読み取り/書き込みキャパシティの分析

```bash
node scripts/dynamodb-optimizer.js --table=Users
```

**出力例**:
```
📊 DynamoDB Optimization Results

Table: Users
Current Mode: Provisioned
  Read Capacity: 100 units
  Write Capacity: 50 units
  Monthly Cost: $35.04

Recommendation: Switch to On-Demand
  Estimated Monthly Cost: $18.25
  Savings: $16.79/month (47.9%)

Reason: Low utilization (avg 15% read, 8% write)
```

### プログラムから最適化

```javascript
const { optimizeDynamoDB } = require('./scripts/dynamodb-optimizer.js');

async function optimizeTables() {
  const results = await optimizeDynamoDB({
    tableName: 'Users',
    autoApply: false // trueで自動適用
  });

  if (results.recommendation === 'on-demand') {
    console.log(`💡 Switch to On-Demand: $${results.savings}/month savings`);
  } else {
    console.log(`💡 Adjust to ${results.recommendedRead}/${results.recommendedWrite} units`);
  }
}
```

## 5. Step Functionsの最適化

### 並列実行の最適化

```javascript
// Before: Sequential execution
{
  "StartAt": "Task1",
  "States": {
    "Task1": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:...:function:task1",
      "Next": "Task2"
    },
    "Task2": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:...:function:task2",
      "End": true
    }
  }
}

// After: Parallel execution (推奨)
{
  "StartAt": "Parallel",
  "States": {
    "Parallel": {
      "Type": "Parallel",
      "Branches": [
        {
          "StartAt": "Task1",
          "States": {
            "Task1": {
              "Type": "Task",
              "Resource": "arn:aws:lambda:...:function:task1",
              "End": true
            }
          }
        },
        {
          "StartAt": "Task2",
          "States": {
            "Task2": {
              "Type": "Task",
              "Resource": "arn:aws:lambda:...:function:task2",
              "End": true
            }
          }
        }
      ],
      "End": true
    }
  }
}
```

### Express Workflowsへの移行

```javascript
// Standard Workflow: $0.025 per 1000 state transitions
// Express Workflow: $1.00 per 1M requests + duration

// 推奨: 高頻度・短時間のワークフローはExpress Workflowsへ
const config = {
  workflowType: results.avgDuration < 5000 && results.frequency > 1000
    ? 'EXPRESS'
    : 'STANDARD'
};
```

## 6. コスト分析レポート

### 包括的なコスト分析

```bash
node scripts/cost-calculator.js --comprehensive
```

**出力例**:
```
💰 Serverless Cost Analysis

Lambda:
  Total Invocations: 1.5M/month
  Total Duration: 3.2M GB-seconds
  Monthly Cost: $65.30

API Gateway:
  Total Requests: 2M/month
  Caching Cost: $7.50
  Monthly Cost: $14.50

DynamoDB:
  Tables: 5
  Total RCU: 250 units
  Total WCU: 150 units
  Monthly Cost: $87.60

Step Functions:
  State Transitions: 50K/month
  Monthly Cost: $1.25

Total Monthly Cost: $168.65

💡 Optimization Opportunities:
  1. Lambda memory optimization: -$32.65/month
  2. DynamoDB On-Demand mode: -$43.80/month
  3. API Gateway caching: -$5.00/month (already optimal)

Total Potential Savings: $76.45/month (45.3%)
```

## 7. ベストプラクティスチェック

```javascript
const { checkBestPractices } = require('./scripts/best-practices-checker.js');

async function auditServerless() {
  const results = await checkBestPractices({
    region: 'us-east-1'
  });

  console.log('\n✓ Best Practices Audit:');

  results.findings.forEach(finding => {
    const icon = finding.severity === 'high' ? '❌' : '⚠️';
    console.log(`${icon} ${finding.title}`);
    console.log(`   ${finding.description}`);
    console.log(`   Fix: ${finding.recommendation}\n`);
  });
}
```

**チェック項目**:
- ✓ Lambda functions have appropriate timeout settings
- ✓ Dead Letter Queues configured for async invocations
- ✓ Reserved Concurrency set for critical functions
- ✓ CloudWatch Logs retention configured
- ✓ X-Ray tracing enabled for debugging
- ✓ Environment variables encrypted with KMS

## 8. CI/CDでの自動最適化

### GitHub Actionsの例

```yaml
name: Serverless Optimization Check

on:
  schedule:
    - cron: '0 0 * * 0'  # 毎週日曜日

jobs:
  optimize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Lambda optimizer
        run: |
          node .claude/skills/serverless-optimizer/scripts/lambda-optimizer.js --all

      - name: Check for savings
        run: |
          SAVINGS=$(cat reports/lambda-optimization-*.json | jq '.totalSavings')
          if (( $(echo "$SAVINGS > 50" | bc -l) )); then
            echo "💰 Found \$$SAVINGS/month in potential savings!"
          fi
```
