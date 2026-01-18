# AWS Cost Optimizer - 基本的な使用例

## 1. コスト分析の実行

### 最近30日間のコストを分析

```bash
node scripts/cost-analyzer.js --period=last-30-days
```

**出力例**:
```
🔍 Analyzing AWS costs...

📊 Cost Analysis Results

Period: last-30-days
Total Cost: $1,234.56

Top Services by Cost:
1. EC2: $456.78 (37%)
2. RDS: $234.56 (19%)
3. S3: $123.45 (10%)
```

### サービス別にグループ化

```bash
node scripts/cost-analyzer.js --group-by=service
```

### 環境別にグループ化（タグベース）

```bash
node scripts/cost-analyzer.js --group-by=environment
```

## 2. 未使用リソースの検出

### すべてのリージョンをスキャン

```bash
node scripts/unused-resource-detector.js --all-regions
```

**出力例**:
```
🔍 Scanning for unused resources in 4 region(s)...

📊 Unused Resources Report

❌ Stopped EC2 Instances (3)
1. i-1234567890abcdef0 (t3.medium)
   - Region: us-east-1
   - Stopped for: 45 days
   - Monthly Cost: $30.37
   - Recommendation: Terminate

❌ Unattached EBS Volumes (5)
1. vol-0123456789abcdef0 (100GB gp3)
   - Region: us-east-1
   - Available for: 60 days
   - Monthly Cost: $8.00
   - Recommendation: Delete

💰 Total Potential Savings:
   - Monthly: $125.67
   - Yearly: $1,508.04
```

### 特定のリージョンのみスキャン

```bash
node scripts/unused-resource-detector.js --region=us-east-1
```

### 停止期間の閾値を指定

```bash
# 30日以上停止しているインスタンスのみ検出
node scripts/unused-resource-detector.js --stopped-days=30
```

## 3. レポート生成

分析結果は自動的に`reports/`ディレクトリに保存されます：

```
.claude/skills/aws-cost-optimizer/reports/
├── cost-analysis-2026-01-18.json
└── unused-resources-2026-01-18.json
```

### レポートの読み込み

```javascript
const fs = require('fs');
const report = JSON.parse(
  fs.readFileSync('./reports/cost-analysis-2026-01-18.json', 'utf-8')
);

console.log(`Total Cost: $${report.totalCost}`);
console.log(`Services: ${report.services.length}`);
```

## 4. プログラムからの利用

```javascript
const { analyzeCost } = require('./scripts/cost-analyzer.js');

async function checkCosts() {
  const results = await analyzeCost({
    period: 'last-7-days',
    groupBy: 'service',
    region: 'us-east-1'
  });

  console.log(`Total Cost: $${results.totalCost}`);

  // コストが閾値を超えたらアラート
  if (results.totalCost > 1000) {
    console.warn('⚠️ Cost threshold exceeded!');
  }
}

checkCosts();
```

## 5. CI/CDでの使用

### GitHub Actionsの例

```yaml
name: Weekly Cost Check

on:
  schedule:
    - cron: '0 9 * * 1'  # 毎週月曜日 9:00

jobs:
  cost-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install
        working-directory: .claude/skills/aws-cost-optimizer

      - name: Run cost analysis
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: node scripts/cost-analyzer.js --period=last-7-days
        working-directory: .claude/skills/aws-cost-optimizer

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: cost-report
          path: .claude/skills/aws-cost-optimizer/reports/
```

## 6. トラブルシューティング

### 認証エラー

```bash
❌ AWS credentials not configured
Run: aws configure
```

**解決方法**:
```bash
aws configure
# AWS Access Key ID: [your-key]
# AWS Secret Access Key: [your-secret]
# Default region name: us-east-1
# Default output format: json
```

### リージョンが見つからない

```bash
❌ Error: Invalid region specified
```

**解決方法**:
有効なリージョンを指定してください：
- us-east-1
- us-west-2
- eu-west-1
- ap-northeast-1

### 権限不足エラー

```bash
❌ Error: User is not authorized to perform: ce:GetCostAndUsage
```

**解決方法**:
IAMユーザーに以下のポリシーを追加：
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "ec2:DescribeInstances",
        "ec2:DescribeVolumes",
        "rds:DescribeDBInstances"
      ],
      "Resource": "*"
    }
  ]
}
```
