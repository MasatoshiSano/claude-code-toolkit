---
name: aws-cost-optimizer
description: Analyze and optimize AWS costs with automated recommendations
version: 1.0.0
author: Claude Code Toolkit
license: MIT
tags:
  - aws
  - cost
  - optimization
  - finops
  - savings
requires:
  - node>=16
  - aws-cli>=2.0
  - aws-sdk>=3.0
---

# AWS Cost Optimizer Agent Skill

## 実装状況

**ステータス**: ✅ Phase 1完了
**実装日**: 2026-01-17
**動作保証**: 基本機能
**実装済み機能**:
- ✅ コスト分析（cost-analyzer.js）
- ✅ 未使用リソース検出（unused-resource-detector.js）
- ✅ Markdownレポート生成（report-generator.js）
- ✅ 最適化ルール設定（optimization-rules.json）
- ✅ 閾値設定（thresholds.json）

**未実装機能**（Phase 2以降で実装予定）:
- 🚧 Right-Sizing分析（right-sizing-analyzer.js）
- 🚧 RI/Savings Plans提案（ri-savings-plan-advisor.js）
- 🚧 タグベースコスト配分（tag-cost-allocator.js）

**動作要件**:
- AWS CLI設定済み（`aws configure`）
- Cost Explorer API有効化
- IAM権限: `ce:GetCostAndUsage`, `ec2:Describe*`
- Node.js依存パッケージ: `npm install @aws-sdk/client-cost-explorer @aws-sdk/client-ec2`

## Purpose

このスキルは、AWSコストを分析し、具体的な削減提案を行います。
未使用リソースの検出、適切なインスタンスタイプの推奨、Reserved Instance/Savings Plansの提案を自動化します。

## When to Use

- 月次/週次のコスト見直し
- 予算超過時の緊急対応
- 新規プロジェクトのコスト見積もり
- リソースの棚卸し
- FinOpsプラクティスの実践

## Architecture

```
scripts/
├── cost-analyzer.js           # コスト分析
├── unused-resource-detector.js # 未使用リソース検出
├── right-sizing-analyzer.js   # リソースサイジング分析
├── ri-savings-plan-advisor.js # RI/Savings Plans提案
├── tag-cost-allocator.js      # タグベースコスト配分
└── report-generator.js        # レポート生成

configs/
├── optimization-rules.json    # 最適化ルール
├── thresholds.json           # 閾値設定
└── budget-config.json        # 予算設定

reports/
└── [timestamp]/
    ├── cost-summary.md
    ├── optimization-recommendations.md
    └── savings-forecast.json
```

## Instructions

### Phase 1: Cost Analysis

#### 1.1 現状のコスト把握

```bash
# 全体のコスト分析
agent aws-cost-optimizer analyze \
  --period=last-30-days \
  --group-by=service

# 出力:
# 📊 AWS Cost Analysis: Last 30 Days
#
# Total Cost: $12,450.00
# Trend: +12.5% vs previous period
#
# Top 10 Services by Cost:
# 1. EC2                 $4,230.00 (34.0%)  +15.2%
# 2. RDS                 $2,890.00 (23.2%)  +8.1%
# 3. S3                  $1,450.00 (11.6%)  +5.3%
# 4. NAT Gateway         $1,120.00 (9.0%)   +2.1%
# 5. CloudWatch          $890.00   (7.1%)   +18.5%
# 6. Lambda              $680.00   (5.5%)   -3.2%
# 7. DynamoDB            $520.00   (4.2%)   +22.4%
# 8. ELB                 $340.00   (2.7%)   +1.8%
# 9. CloudFront          $220.00   (1.8%)   -5.1%
# 10. Other Services     $110.00   (0.9%)   +3.7%
#
# Cost by Environment:
# - Production:  $8,960.00 (72%)
# - Staging:     $2,340.00 (19%)
# - Development: $1,150.00 (9%)
#
# Cost by Team:
# - Backend:     $5,620.00 (45%)
# - Frontend:    $3,740.00 (30%)
# - Data:        $2,090.00 (17%)
# - Untagged:    $1,000.00 (8%) ⚠️
```

#### 1.2 コストの内訳分析

```javascript
// cost-analyzer.js
async function analyzeCostBreakdown(period) {
  const costExplorer = new AWS.CostExplorer();

  const params = {
    TimePeriod: {
      Start: period.start,
      End: period.end
    },
    Granularity: 'DAILY',
    Metrics: ['UnblendedCost', 'UsageQuantity'],
    GroupBy: [
      { Type: 'DIMENSION', Key: 'SERVICE' },
      { Type: 'TAG', Key: 'Environment' },
      { Type: 'TAG', Key: 'Team' }
    ]
  };

  const response = await costExplorer.getCostAndUsage(params).promise();

  return {
    totalCost: calculateTotal(response),
    dailyTrend: extractDailyTrend(response),
    serviceBreakdown: groupByService(response),
    environmentBreakdown: groupByEnvironment(response),
    teamBreakdown: groupByTeam(response),
    anomalies: detectAnomalies(response)
  };
}
```

### Phase 2: Unused Resource Detection

#### 2.1 未使用リソースの検出

```bash
# 未使用リソースをスキャン
agent aws-cost-optimizer detect-unused \
  --all-regions

# 出力:
# 🔍 Scanning for unused resources across all regions...
#
# ❌ Unused EC2 Instances (5)
# 1. i-0abc123def456789 (t3.medium)
#    - Region: us-east-1
#    - State: stopped (45 days)
#    - Monthly Cost: $35.04
#    - Recommendation: Terminate or snapshot & terminate
#
# 2. i-0def456abc789123 (m5.large)
#    - Region: ap-northeast-1
#    - State: stopped (12 days)
#    - Monthly Cost: $88.32
#    - Recommendation: Start or terminate
#
# ❌ Unattached EBS Volumes (12)
# 1. vol-0abc123def456789 (100GB gp3)
#    - Region: us-east-1
#    - Available for: 30 days
#    - Monthly Cost: $8.00
#    - Recommendation: Snapshot & delete
#
# 2. vol-0def456abc789123 (500GB gp2)
#    - Region: eu-west-1
#    - Available for: 90 days
#    - Monthly Cost: $50.00
#    - Recommendation: Delete (no snapshots in 90 days)
#
# ❌ Unused Elastic IPs (3)
# 1. eipalloc-0abc123def456789
#    - Region: us-east-1
#    - Not associated: 60 days
#    - Monthly Cost: $3.60
#    - Recommendation: Release
#
# ❌ Idle Load Balancers (2)
# 1. my-unused-alb
#    - Region: us-west-2
#    - Active connections: 0 (last 7 days)
#    - Monthly Cost: $22.50
#    - Recommendation: Delete
#
# ❌ Unused RDS Snapshots (18)
# 1-15. Manual snapshots older than 90 days
#    - Total size: 2.4TB
#    - Monthly Cost: $240.00
#    - Recommendation: Delete old snapshots (keep last 7)
#
# 💰 Total Potential Savings:
# - Monthly: $1,234.56
# - Yearly: $14,814.72
#
# Apply cleanup? [y/N]:
```

#### 2.2 自動クリーンアップ

```javascript
// unused-resource-detector.js
async function detectUnusedResources() {
  const findings = [];

  // EC2インスタンス
  const stoppedInstances = await findStoppedEC2Instances();
  findings.push(...stoppedInstances.filter(i => i.stoppedDays > 7));

  // EBSボリューム
  const unattachedVolumes = await findUnattachedEBSVolumes();
  findings.push(...unattachedVolumes.filter(v => v.availableDays > 7));

  // Elastic IP
  const unallocatedEIPs = await findUnallocatedElasticIPs();
  findings.push(...unallocatedEIPs);

  // Load Balancers
  const idleLoadBalancers = await findIdleLoadBalancers();
  findings.push(...idleLoadBalancers.filter(lb => lb.idleDays > 7));

  // RDS Snapshots
  const oldSnapshots = await findOldRDSSnapshots();
  findings.push(...oldSnapshots.filter(s => s.ageDays > 90));

  // NAT Gateway (使用率が低い)
  const underutilizedNAT = await findUnderutilizedNATGateways();
  findings.push(...underutilizedNAT);

  return {
    findings,
    totalMonthlyCost: calculateTotalCost(findings),
    totalYearlyCost: calculateTotalCost(findings) * 12
  };
}

async function cleanupUnusedResources(findings, options) {
  const results = [];

  for (const finding of findings) {
    if (options.dryRun) {
      results.push({ resource: finding.id, action: 'would delete', status: 'dry-run' });
      continue;
    }

    try {
      switch (finding.type) {
        case 'ec2-instance':
          if (finding.stoppedDays > options.ec2TerminateAfterDays) {
            await terminateEC2Instance(finding.id);
            results.push({ resource: finding.id, action: 'terminated', status: 'success' });
          }
          break;

        case 'ebs-volume':
          if (options.snapshotBeforeDelete) {
            await createSnapshot(finding.id);
          }
          await deleteVolume(finding.id);
          results.push({ resource: finding.id, action: 'deleted', status: 'success' });
          break;

        case 'elastic-ip':
          await releaseElasticIP(finding.id);
          results.push({ resource: finding.id, action: 'released', status: 'success' });
          break;

        case 'load-balancer':
          await deleteLoadBalancer(finding.id);
          results.push({ resource: finding.id, action: 'deleted', status: 'success' });
          break;

        case 'rds-snapshot':
          await deleteDBSnapshot(finding.id);
          results.push({ resource: finding.id, action: 'deleted', status: 'success' });
          break;
      }
    } catch (error) {
      results.push({ resource: finding.id, action: 'failed', status: 'error', error: error.message });
    }
  }

  return results;
}
```

### Phase 3: Right-Sizing Analysis

#### 3.1 リソースサイジング分析

```bash
# EC2インスタンスのサイジング分析
agent aws-cost-optimizer right-sizing \
  --resource-type=ec2 \
  --period=last-14-days

# 出力:
# 🔧 EC2 Right-Sizing Analysis (14 days)
#
# Analyzed 47 instances across 3 regions
#
# 🔴 Over-provisioned (12 instances)
#
# 1. i-0abc123def456789 (m5.2xlarge)
#    Current: 8 vCPU, 32GB RAM - $280.32/month
#    Actual Usage:
#    - CPU: 15% average, 28% peak
#    - Memory: 8.2GB average (25.6%)
#    Recommendation: m5.large (2 vCPU, 8GB)
#    New Cost: $70.08/month
#    Savings: $210.24/month (75%)
#
# 2. i-0def456abc789123 (c5.4xlarge)
#    Current: 16 vCPU, 32GB RAM - $561.60/month
#    Actual Usage:
#    - CPU: 22% average, 45% peak
#    - Memory: 12.1GB average (37.8%)
#    Recommendation: c5.xlarge (4 vCPU, 8GB)
#    New Cost: $140.40/month
#    Savings: $421.20/month (75%)
#
# ⚠️ Under-provisioned (3 instances)
#
# 1. i-0ghi789abc123456 (t3.small)
#    Current: 2 vCPU, 2GB RAM - $15.18/month
#    Actual Usage:
#    - CPU: 85% average, 98% peak ⚠️
#    - Memory: 1.8GB average (90%) ⚠️
#    Recommendation: t3.medium (2 vCPU, 4GB)
#    New Cost: $30.37/month
#    Additional Cost: $15.19/month
#    Impact: Improved performance, reduced throttling
#
# ✅ Properly Sized (32 instances)
# - No action needed
#
# 💰 Total Potential Savings:
# - Monthly: $3,245.80
# - Yearly: $38,949.60
#
# Apply changes? [y/N]:
```

#### 3.2 RDSサイジング分析

```bash
# RDSインスタンスの分析
agent aws-cost-optimizer right-sizing \
  --resource-type=rds \
  --period=last-30-days

# 出力:
# 🔧 RDS Right-Sizing Analysis (30 days)
#
# 🔴 Over-provisioned Database (2)
#
# 1. my-app-db-production (db.r5.2xlarge)
#    Current: 8 vCPU, 64GB RAM - $1,051.20/month
#    Actual Usage:
#    - CPU: 18% average, 35% peak
#    - Memory: 22GB average (34.4%)
#    - Connections: 45 average (15% of max 300)
#    - IOPS: 1,200 average (12% of provisioned 10,000)
#    Recommendation: db.r5.large (2 vCPU, 16GB)
#    New Cost: $262.80/month
#    Savings: $788.40/month (75%)
#
# 2. analytics-db (db.m5.xlarge)
#    Current: 4 vCPU, 16GB RAM - $350.40/month
#    Actual Usage:
#    - CPU: 8% average, 15% peak
#    - Read IOPS: 200 average
#    Recommendation: Aurora Serverless v2
#    New Cost: ~$120/month (based on usage)
#    Savings: $230.40/month (66%)
```

### Phase 4: Reserved Instance & Savings Plans

#### 4.1 RI/Savings Plans推奨

```bash
# RI/Savings Plans分析
agent aws-cost-optimizer analyze-commitments

# 出力:
# 💳 Reserved Instance & Savings Plans Analysis
#
# Current Commitment Coverage: 34%
# Recommended Coverage: 75%
#
# 🎯 EC2 Reserved Instance Recommendations
#
# 1. m5.xlarge in us-east-1
#    - Current Usage: 5 instances running 24/7
#    - On-Demand Cost: $876/month
#    - 1-Year Standard RI: $547/month
#    - 3-Year Standard RI: $365/month
#    - Savings (3-year): $511/month (58%)
#
# 2. t3.medium in ap-northeast-1
#    - Current Usage: 8 instances running 24/7
#    - On-Demand Cost: $243/month
#    - 1-Year Convertible RI: $183/month
#    - Savings (1-year): $60/month (25%)
#
# 🎯 RDS Reserved Instance Recommendations
#
# 1. db.r5.large in us-east-1
#    - Current Usage: 2 instances running 24/7
#    - On-Demand Cost: $526/month
#    - 3-Year Standard RI: $237/month
#    - Savings (3-year): $289/month (55%)
#
# 🎯 Compute Savings Plans Recommendations
#
# Plan: 3-Year Compute Savings Plan
# Commitment: $2,500/month
# Estimated Savings: $1,125/month (31%)
# Break-even: 8 months
#
# ROI Analysis:
# - Year 1: $13,500 savings
# - Year 2: $13,500 savings
# - Year 3: $13,500 savings
# - Total 3-year: $40,500 savings
#
# Generate purchase recommendations? [y/N]:
```

### Phase 5: Tag-Based Cost Allocation

#### 5.1 タグコスト配分

```bash
# タグベースのコスト配分
agent aws-cost-optimizer tag-analysis

# 出力:
# 🏷️ Tag-Based Cost Allocation
#
# ⚠️ Untagged Resources: $1,234.56/month (9.9%)
#
# Cost by Environment:
# - production:  $8,960.00 (72.0%)
# - staging:     $2,340.00 (18.8%)
# - development: $1,150.00 (9.2%)
#
# Cost by Team:
# - backend:   $5,620.00 (45.1%)
# - frontend:  $3,740.00 (30.0%)
# - data:      $2,090.00 (16.8%)
# - untagged:  $1,000.00 (8.0%) ⚠️
#
# Cost by Project:
# - web-app:       $4,230.00 (34.0%)
# - mobile-app:    $3,120.00 (25.1%)
# - analytics:     $2,890.00 (23.2%)
# - infrastructure: $2,210.00 (17.7%)
#
# ⚠️ Missing Tags (235 resources):
# - Missing 'Environment': 87 resources
# - Missing 'Team': 64 resources
# - Missing 'Project': 84 resources
#
# Auto-tag resources based on patterns? [y/N]:
```

### Phase 6: Budget Alerts

#### 6.1 予算アラート設定

```javascript
// budget-config.json
{
  "budgets": [
    {
      "name": "Monthly Total",
      "amount": 15000,
      "threshold": [
        { "percentage": 80, "notification": "warning" },
        { "percentage": 90, "notification": "critical" },
        { "percentage": 100, "notification": "critical" }
      ]
    },
    {
      "name": "EC2 Budget",
      "amount": 5000,
      "filters": { "Service": "EC2" },
      "threshold": [{ "percentage": 90, "notification": "warning" }]
    },
    {
      "name": "Production Environment",
      "amount": 10000,
      "filters": { "Tag": { "Environment": "production" } },
      "threshold": [{ "percentage": 85, "notification": "warning" }]
    }
  ]
}
```

### Phase 7: Optimization Report

#### 7.1 レポート生成

```bash
# 包括的な最適化レポート
agent aws-cost-optimizer generate-report \
  --format=markdown \
  --output=./reports/

# 出力:
# 📊 Generating AWS Cost Optimization Report...
#
# ✓ Analyzed cost data (last 90 days)
# ✓ Detected unused resources
# ✓ Analyzed right-sizing opportunities
# ✓ Generated RI/Savings Plans recommendations
# ✓ Analyzed tag coverage
#
# 📄 Report saved to: ./reports/aws-cost-optimization-2025-01-16.md
#
# Executive Summary:
# - Current Monthly Cost: $12,450
# - Potential Monthly Savings: $5,234 (42%)
# - Estimated Annual Savings: $62,808
#
# Top Recommendations:
# 1. Terminate unused resources: $1,234/month
# 2. Right-size EC2 instances: $3,245/month
# 3. Purchase Savings Plans: $755/month
```

**生成されたレポート:**
```markdown
# AWS Cost Optimization Report
Generated: 2025-01-16

## Executive Summary

- **Current Monthly Cost**: $12,450.00
- **Potential Monthly Savings**: $5,234.00 (42%)
- **Estimated Annual Savings**: $62,808.00

## Cost Breakdown

### By Service
1. EC2: $4,230 (34%) - High optimization potential
2. RDS: $2,890 (23%) - Moderate optimization potential
3. S3: $1,450 (12%) - Well optimized

### By Environment
- Production: $8,960 (72%)
- Staging: $2,340 (19%)
- Development: $1,150 (9%)

## Optimization Recommendations

### Priority 1: Quick Wins ($1,234/month)
1. Terminate 5 stopped EC2 instances
2. Delete 12 unattached EBS volumes
3. Release 3 unused Elastic IPs

### Priority 2: Right-Sizing ($3,245/month)
1. Downsize 12 over-provisioned EC2 instances
2. Migrate 2 RDS instances to Aurora Serverless

### Priority 3: Commitments ($755/month)
1. Purchase 3-Year Compute Savings Plan
2. Buy RDS Reserved Instances

## Implementation Plan

### Week 1
- Cleanup unused resources
- Expected savings: $1,234/month

### Week 2
- Right-size EC2 instances
- Expected savings: $3,245/month

### Week 3
- Implement Savings Plans
- Expected savings: $755/month

**Total Expected Savings: $5,234/month**
```

## Error Handling

### Level 1: Recoverable Errors

- **API rate limiting**: 自動リトライ、バックオフ
- **一時的なアクセスエラー**: リトライ

### Level 2: User Intervention Required

- **IAM権限不足**: 必要な権限を表示
- **複数アカウント**: Organizations統合を推奨

### Level 3: Critical Errors

- **Cost Explorer API無効**: 有効化方法を案内
- **誤った削除**: 削除前に必ず確認を要求

## Performance Notes

- **並列スキャン**: 複数リージョンを並列でスキャン
- **キャッシング**: Cost Explorerデータを24時間キャッシュ
- **増分分析**: 前回からの差分のみ分析

## Dependencies

- Node.js >= 16
- AWS CLI >= 2.0
- AWS SDK >= 3.0
- Cost Explorer API有効化

## Best Practices

1. **定期実行**: 週次で自動実行、月次で詳細レビュー
2. **段階的適用**: まず未使用リソースから、次にRight-Sizing
3. **タグ戦略**: すべてのリソースに適切なタグを付与
4. **予算設定**: アラートで異常を早期検知
5. **チーム教育**: コスト意識をチーム全体で共有

## Related Skills

- `aws-deploy-automation`: デプロイ時のコスト最適化
- `serverless-optimizer`: Lambda関数のコスト最適化

## Examples

### ✅ Good Example: Significant Savings

```bash
Input: agent aws-cost-optimizer analyze --full

Output:
Current Monthly Cost: $12,450
Potential Savings: $5,234 (42%)

Actions Taken:
✓ Terminated 5 unused EC2 instances ($456/month)
✓ Deleted 12 unattached volumes ($128/month)
✓ Right-sized 8 instances ($2,100/month)
✓ Purchased Savings Plan ($2,550/month)

New Monthly Cost: $7,216
Total Savings: $5,234/month ($62,808/year)
```

## Notes

- Cost Optimizationは継続的プロセス
- 削除前に必ずバックアップ/スナップショット
- 本番環境の変更は慎重に
