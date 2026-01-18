# AWS Cost Optimizer

**AWSコストを分析し、最適化の提案を行うAgent Skill**

未使用リソースの検出、コスト内訳の可視化、最適化推奨事項の自動生成により、AWS利用料金を平均30-40%削減します。

## 📋 目次

- [クイックスタート](#クイックスタート)
- [機能](#機能)
- [インストール](#インストール)
- [使用方法](#使用方法)
- [設定](#設定)
- [出力形式](#出力形式)
- [トラブルシューティング](#トラブルシューティング)
- [ベストプラクティス](#ベストプラクティス)

## ⚡ クイックスタート

### 前提条件

- **Node.js**: >= 18.x
- **AWS CLI**: 設定済み（`aws configure`完了）
- **AWS Cost Explorer API**: 有効化済み
- **IAM権限**: コスト分析に必要な権限（詳細は下記）

### 1分でセットアップ

```bash
# 1. ルートディレクトリで依存関係をインストール
npm install

# 2. AWS認証情報を設定（未設定の場合）
aws configure

# 3. コスト分析を実行
node .claude/skills/aws-cost-optimizer/scripts/cost-analyzer.js

# 4. 未使用リソースを検出
node .claude/skills/aws-cost-optimizer/scripts/unused-resource-detector.js
```

## ✨ 機能

### コスト分析
- ✅ **AWS Cost Explorer統合**: 過去90日間のコスト履歴を分析
- ✅ **サービス別コスト内訳**: EC2、RDS、S3などサービスごとの利用料を可視化
- ✅ **タグベースのコスト配分**: チーム、環境、プロジェクト別のコスト追跡
- ✅ **コスト予測**: 現在のトレンドから月末コストを予測

### 未使用リソース検出
- ✅ **停止中のEC2インスタンス**: 7日以上停止しているインスタンスを検出
- ✅ **アタッチされていないEBSボリューム**: 削除候補のボリュームをリストアップ
- ✅ **未割り当てのElastic IP**: 月額$3.6の無駄を削減
- ✅ **未使用のRDSインスタンス**: 接続数0のデータベースを検出

### 最適化提案
- ✅ **Reserved Instancesの推奨**: 平均30-40%のコスト削減
- ✅ **Savings Plansの提案**: 柔軟な割引プランを推奨
- ✅ **適正サイズの提案**: オーバースペックなリソースを検出

## 📦 インストール

### オプション1: ワークスペース全体（推奨）

```bash
# ルートディレクトリで実行
npm install
```

### オプション2: スキル単体

```bash
cd .claude/skills/aws-cost-optimizer
npm install
```

### 依存パッケージ

```json
{
  "@aws-sdk/client-cost-explorer": "^3.x",
  "@aws-sdk/client-ec2": "^3.x",
  "@aws-sdk/client-rds": "^3.x"
}
```

## 🚀 使用方法

### 基本的な使い方

```bash
# コスト分析（最近30日間）
node scripts/cost-analyzer.js --period=last-30-days

# サービス別にグループ化
node scripts/cost-analyzer.js --group-by=service

# 環境別にグループ化（タグベース）
node scripts/cost-analyzer.js --group-by=environment
```

### 未使用リソースの検出

```bash
# 特定のリージョン
node scripts/unused-resource-detector.js --region=us-east-1

# すべてのリージョンをスキャン
node scripts/unused-resource-detector.js --all-regions

# 停止期間の閾値を指定（30日以上停止）
node scripts/unused-resource-detector.js --stopped-days=30
```

### プログラムからの使用

```javascript
const { analyzeCost } = require('./scripts/cost-analyzer.js');

async function checkCosts() {
  const results = await analyzeCost({
    period: 'last-30-days',
    groupBy: 'service',
    region: 'us-east-1'
  });

  console.log(`Total Cost: $${results.totalCost}`);

  if (results.totalCost > 1000) {
    console.warn('⚠️ Cost threshold exceeded!');
  }
}
```

### 詳細な使用例

- [基本的な使用例](examples/basic-usage.md)
- [高度な使用例](examples/advanced-usage.md)

### Configuration

Edit `configs/optimization-rules.json` to customize:

- Resource detection thresholds
- Cost anomaly detection rules
- Tagging requirements

## Features

- ✅ AWS Cost Explorer integration
- ✅ Unused resource detection (EC2, EBS, EIP, RDS)
- ✅ Cost breakdown by service/tag/environment
- ✅ Budget alerts and anomaly detection
- ✅ Markdown report generation

## Output

Reports are saved to `reports/`:

- `cost-analysis-YYYY-MM-DD.json` - Detailed cost breakdown
- `unused-resources-YYYY-MM-DD.json` - List of unused resources
- `cost-optimization-report-YYYY-MM-DD.md` - Markdown summary

## Documentation

See [SKILL.md](SKILL.md) for detailed specifications and instructions.

## 🔍 トラブルシューティング

### 認証エラー

**Error: AWS credentials not configured**

```bash
# AWS CLIで認証情報を設定
aws configure

# または環境変数で設定
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_DEFAULT_REGION=us-east-1
```

**Error: Cost Explorer API not enabled**

1. [AWS Cost Management Console](https://console.aws.amazon.com/cost-management/)にアクセス
2. 「Cost Explorer」を有効化
3. 24時間後にデータが利用可能になります

### 権限エラー

**Error: User is not authorized to perform: ce:GetCostAndUsage**

以下のIAMポリシーを追加してください：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "ce:GetCostForecast",
        "ec2:Describe*",
        "rds:Describe*"
      ],
      "Resource": "*"
    }
  ]
}
```

### その他のエラー

- **空のレポート**: Cost Explorerのデータ更新を待つ（最大24時間）
- **タイムアウト**: `--period`を短く設定（例: `last-7-days`）
- **リージョンエラー**: 有効なリージョンを指定（`us-east-1`, `us-west-2`など）

## 💡 ベストプラクティス

### 定期的な分析

```bash
# 毎週月曜日にコストチェック
cron: '0 9 * * 1'
```

### アラート設定

```javascript
// コストが閾値を超えたらSlackに通知
if (results.totalCost > 1000) {
  await sendSlackAlert(`⚠️ AWS Cost: $${results.totalCost}`);
}
```

### タグの活用

すべてのリソースに以下のタグを付与：
- `Environment`: production, staging, development
- `Team`: engineering, marketing, sales
- `Project`: project-name

## 📚 ドキュメント

- [SKILL.md](SKILL.md) - 詳細な仕様とAPI
- [examples/basic-usage.md](examples/basic-usage.md) - 基本的な使用例
- [examples/advanced-usage.md](examples/advanced-usage.md) - 高度な使用例

## 🤝 サポート

問題が発生した場合は[GitHub Issues](https://github.com/your-repo/claude-code-toolkit/issues)で報告してください。

## 📄 ライセンス

MIT
