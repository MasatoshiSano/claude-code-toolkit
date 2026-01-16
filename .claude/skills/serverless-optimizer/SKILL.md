---
name: serverless-optimizer
description: Optimize serverless architecture (Lambda, API Gateway, Step Functions, DynamoDB)
version: 1.0.0
author: Claude Code Toolkit
license: MIT
tags:
  - serverless
  - lambda
  - aws
  - optimization
  - performance
  - cost
requires:
  - node>=16
  - aws-cli
  - aws-sdk>=3.0
---

# Serverless Optimizer Agent Skill

## Purpose

このスキルは、サーバーレスアーキテクチャ（AWS Lambda、API Gateway、Step Functions、DynamoDB等）を最適化します。
コールドスタート削減、コスト最適化、パフォーマンス向上、ベストプラクティス適用を自動化します。

## When to Use

- Lambda関数のパフォーマンスを改善したい時
- サーバーレスアプリケーションのコストを削減したい時
- API Gatewayの設定を最適化したい時
- DynamoDBのテーブル設計を見直したい時
- Step Functionsワークフローを最適化したい時
- コールドスタート問題を解決したい時

## Architecture

```
scripts/
├── lambda-optimizer.js         # Lambda最適化
├── coldstart-analyzer.js       # コールドスタート分析
├── apigateway-optimizer.js     # API Gateway最適化
├── dynamodb-optimizer.js       # DynamoDB最適化
├── stepfunctions-optimizer.js  # Step Functions最適化
├── cost-calculator.js          # コスト計算
└── performance-monitor.js      # パフォーマンス監視

templates/
├── lambda/
│   ├── function-template.js
│   ├── layer-template.json
│   └── optimized-config.json
├── apigateway/
│   ├── rest-api-template.yaml
│   └── caching-config.json
├── dynamodb/
│   ├── table-template.yaml
│   └── gsi-design.json
└── stepfunctions/
    └── state-machine-template.json

configs/
├── optimization-rules.yaml     # 最適化ルール
├── performance-thresholds.json # パフォーマンス閾値
└── cost-targets.json           # コスト目標

examples/
├── lambda-optimization.md
├── api-gateway-caching.md
└── dynamodb-capacity.md
```

## Instructions

### Phase 1: Lambda Function Optimization

#### 1.1 パフォーマンス分析

```bash
# Lambda関数の分析
agent serverless-optimizer analyze-lambda \
  --function=myapp-api-handler \
  --days=7

# 出力:
# 📊 Lambda Function Analysis: myapp-api-handler
#
# Invocations: 1,250,000
# Average Duration: 245ms
# Max Duration: 3,450ms
# P50: 180ms | P90: 420ms | P99: 1,200ms
#
# Memory Configuration: 512 MB
# Average Memory Used: 180 MB (35% utilization)
# Max Memory Used: 310 MB
#
# Cold Starts: 8,500 (0.68% of invocations)
# Average Cold Start: 1,800ms
# Provisioned Concurrency: Not configured
#
# Errors: 125 (0.01%)
# Throttles: 0
#
# Cost Breakdown:
# - Compute: $24.50
# - Requests: $0.25
# - Total: $24.75
#
# 🎯 Optimization Opportunities:
#
# 1. MEMORY OPTIMIZATION (High Impact)
#    Current: 512 MB ($24.50)
#    Recommended: 256 MB ($12.25)
#    Savings: $12.25/month (50%)
#    Reason: Only using 35% of allocated memory
#
# 2. COLD START REDUCTION (Medium Impact)
#    Problem: 8,500 cold starts causing 1.8s latency
#    Solutions:
#    a) Enable Provisioned Concurrency: 5 instances ($21/month)
#       - Eliminates 95% of cold starts
#       - Trade-off: Additional cost, but better UX
#    b) Optimize package size (currently 45 MB)
#       - Remove unused dependencies
#       - Use Lambda Layers for common libraries
#       - Estimated cold start reduction: 40%
#
# 3. BUNDLE SIZE OPTIMIZATION (Medium Impact)
#    Current size: 45 MB
#    Opportunities:
#    - aws-sdk included but available in runtime (-3.2 MB)
#    - Unused lodash functions (-1.8 MB)
#    - Source maps in production (-5.5 MB)
#    Target size: 34 MB (24% reduction)
#    Cold start improvement: 35%
```

#### 1.2 Lambda最適化実行

```bash
# メモリ最適化
agent serverless-optimizer optimize-lambda \
  --function=myapp-api-handler \
  --optimize=memory \
  --test

# 出力:
# 🔧 Optimizing Memory Configuration...
#
# Current: 512 MB
# Testing configurations:
#   - 256 MB: avg 195ms, max 380ms, cost $12.25 ✓
#   - 384 MB: avg 190ms, max 365ms, cost $18.38
#   - 512 MB: avg 185ms, max 355ms, cost $24.50
#
# Recommendation: 256 MB
# - 5% slower (195ms vs 185ms) - acceptable
# - 50% cost savings ($12.25 vs $24.50)
# - Still well below timeout (3000ms)
#
# Apply optimization? [y/N]: y
#
# ✓ Updated function configuration to 256 MB
# ✓ Deployed and tested
# ✓ CloudWatch alarm configured for duration > 2000ms

# バンドルサイズ最適化
agent serverless-optimizer optimize-lambda \
  --function=myapp-api-handler \
  --optimize=bundle

# 出力:
# 📦 Optimizing Bundle Size...
#
# Current size: 45 MB
# Analyzing dependencies...
#
# Removals:
#   ✓ aws-sdk (included in runtime): -3.2 MB
#   ✓ Source maps: -5.5 MB
#   ✓ Dev dependencies in bundle: -2.1 MB
#
# Optimizations:
#   ✓ Tree-shaking lodash: -1.8 MB
#   ✓ Minification improvements: -1.2 MB
#   ✓ Compress with brotli: -8.5 MB
#
# New size: 22.7 MB (50% reduction)
# Estimated cold start: 1,080ms (40% faster)
#
# ✓ Bundle optimized and deployed
```

#### 1.3 コールドスタート削減

**Provisioned Concurrency:**
```bash
# Provisioned Concurrency設定
agent serverless-optimizer configure-provisioned-concurrency \
  --function=myapp-api-handler \
  --analyze

# 出力:
# 📈 Provisioned Concurrency Analysis
#
# Current cold start rate: 0.68% (8,500/month)
# Traffic pattern:
#   - Peak hours: 08:00-18:00 (Mon-Fri)
#   - Off-peak: 18:00-08:00, weekends
#   - Peak concurrency: 12 instances
#   - Average concurrency: 3 instances
#
# Cost Scenarios:
#
# Option 1: Always-on (12 instances)
#   - Cold starts eliminated: 100%
#   - Cost: $84/month
#   - Total cost: $96.25 ($12.25 compute + $84 PC)
#   - vs Current: +$71.50 (+289%)
#
# Option 2: Peak hours only (5 instances, 08:00-18:00 Mon-Fri)
#   - Cold starts eliminated: 85%
#   - Cost: $21/month
#   - Total cost: $33.25 ($12.25 compute + $21 PC)
#   - vs Current: +$8.50 (+34%)
#
# Option 3: Smart scaling (2-8 instances based on schedule)
#   - Cold starts eliminated: 75%
#   - Cost: $28/month
#   - Total cost: $40.25 ($12.25 compute + $28 PC)
#   - vs Current: +$15.50 (+63%)
#
# Recommendation: Option 2 (Peak hours only)
# - Best cost/performance balance
# - Eliminates cold starts during business hours
# - Acceptable off-peak cold starts (user-facing less critical)
```

**Lambda Layers:**
```bash
# 共通ライブラリをLayerに移動
agent serverless-optimizer create-layer \
  --name=common-dependencies \
  --dependencies='["axios", "lodash", "moment"]'

# 出力:
# 📦 Creating Lambda Layer...
#
# Dependencies to extract:
#   - axios (1.2 MB)
#   - lodash (1.8 MB)
#   - moment (0.9 MB)
#
# Total layer size: 4.2 MB
# Functions using these dependencies: 8
#
# ✓ Layer created: common-dependencies-v1
# ✓ ARN: arn:aws:lambda:us-east-1:123456:layer:common-dependencies:1
#
# Updating functions:
#   ✓ myapp-api-handler: 45 MB → 40.8 MB
#   ✓ myapp-user-handler: 42 MB → 37.8 MB
#   ✓ myapp-order-handler: 48 MB → 43.8 MB
#   ... (5 more functions)
#
# Total savings:
#   - Storage: 33.6 MB across 8 functions
#   - Deployment: 8x faster (shared layer cache)
#   - Cold start: 15% faster average
```

### Phase 2: API Gateway Optimization

#### 2.1 API Gateway分析

```bash
# API Gateway分析
agent serverless-optimizer analyze-apigateway \
  --api=myapp-api \
  --days=7

# 出力:
# 📊 API Gateway Analysis: myapp-api
#
# Requests: 1,250,000
# Average Latency: 280ms
# P50: 200ms | P90: 450ms | P99: 1,500ms
#
# Endpoint Performance:
# 1. GET /api/users/{id}
#    Requests: 450,000 (36%)
#    Avg Latency: 180ms
#    Cache Hit Rate: 0% (caching not enabled)
#    💡 Enable caching: potential 95% latency reduction
#
# 2. POST /api/orders
#    Requests: 280,000 (22%)
#    Avg Latency: 520ms
#    Errors: 125 (0.04%)
#
# 3. GET /api/products
#    Requests: 320,000 (26%)
#    Avg Latency: 240ms
#    Cache Hit Rate: 0%
#    💡 Enable caching: potential 90% latency reduction
#
# Cost Breakdown:
# - API Requests: $1.25
# - Data Transfer: $0.85
# - Total: $2.10
#
# 🎯 Optimization Opportunities:
#
# 1. ENABLE CACHING (High Impact)
#    Cacheable endpoints: GET /api/users/{id}, GET /api/products
#    Cache size: 0.5 GB ($0.02/hour = $14.40/month)
#    Expected cache hit rate: 85%
#    Latency improvement: 90% (180ms → 18ms for cached)
#    Backend load reduction: 85%
#    Net cost: +$14.40 caching, -$8.50 Lambda = +$5.90
#    Trade-off: Small cost increase for massive performance gain
#
# 2. REQUEST VALIDATION (Medium Impact)
#    Current: 125 invalid requests reach Lambda
#    Recommendation: Enable API Gateway request validation
#    Savings: Reject invalid requests before Lambda invocation
#    Cost reduction: ~$0.05/month
#    Error rate improvement: Invalid requests fail faster
#
# 3. THROTTLING CONFIGURATION (Low Impact)
#    Current: No throttling configured
#    Risk: Potential runaway costs from DDoS or client bugs
#    Recommendation: Set burst limit: 500, rate limit: 100/sec
```

#### 2.2 キャッシング設定

```bash
# キャッシュ設定を適用
agent serverless-optimizer configure-cache \
  --api=myapp-api \
  --cache-size=0.5 \
  --ttl=300

# 出力:
# 🗄️ Configuring API Gateway Cache...
#
# Cache size: 0.5 GB
# TTL: 300 seconds (5 minutes)
# Cost: $0.02/hour = $14.40/month
#
# Enabling cache for endpoints:
#   ✓ GET /api/users/{id}
#     - Cache key: path + userId
#     - Vary by: Authorization header
#   ✓ GET /api/products
#     - Cache key: path + query params
#     - Vary by: None
#   ✓ GET /api/categories
#     - Cache key: path
#     - Vary by: None
#
# Cache invalidation rules:
#   - POST/PUT/DELETE /api/users/* → invalidate GET /api/users/*
#   - POST/PUT/DELETE /api/products/* → invalidate GET /api/products
#
# Testing cache behavior...
#   ✓ First request: 180ms (cache miss, stored)
#   ✓ Second request: 12ms (cache hit)
#   ✓ Cache hit rate: 88% (tested with 1000 requests)
#
# ✅ Cache configured successfully
# Expected results:
#   - Latency: 180ms → 25ms average (86% improvement)
#   - Backend calls: -85%
#   - User experience: Significantly faster
```

### Phase 3: DynamoDB Optimization

#### 3.1 テーブル設計分析

```bash
# DynamoDB テーブル分析
agent serverless-optimizer analyze-dynamodb \
  --table=users

# 出力:
# 📊 DynamoDB Table Analysis: users
#
# Table Configuration:
#   - Partition Key: userId (String)
#   - Sort Key: None
#   - Billing Mode: Provisioned
#   - Read Capacity: 25 RCU ($0.013/hour)
#   - Write Capacity: 10 WCU ($0.065/hour)
#   - Total Cost: $56.16/month
#
# Global Secondary Indexes (GSI):
#   1. email-index
#      - Partition Key: email
#      - Provisioned: 10 RCU, 5 WCU
#      - Cost: $10.80/month
#
# Usage Patterns:
#   - Read requests: 180,000/day (avg 2.08/sec)
#   - Write requests: 15,000/day (avg 0.17/sec)
#   - Peak read: 18/sec (08:00-10:00)
#   - Peak write: 3/sec (12:00-13:00)
#
# Capacity Analysis:
#   - Read: Provisioned 25 RCU, using avg 2.08/sec (8% utilization)
#   - Write: Provisioned 10 WCU, using avg 0.17/sec (2% utilization)
#   - ❌ SEVERELY OVER-PROVISIONED
#
# 🎯 Optimization Opportunities:
#
# 1. SWITCH TO ON-DEMAND BILLING (High Impact)
#    Current cost: $56.16/month (provisioned)
#    Projected cost: $8.40/month (on-demand)
#    Savings: $47.76/month (85% reduction)
#    Reason: Low, unpredictable traffic
#    Trade-off: None (on-demand is better for this pattern)
#
# 2. OPTIMIZE GSI (Medium Impact)
#    email-index usage: 5,000 queries/day
#    Current cost: $10.80/month
#    Options:
#    a) Keep GSI in on-demand: $0.75/month
#    b) Remove GSI, scan table: Not recommended (slow)
#    Recommendation: Keep GSI, use on-demand
#
# 3. PARTITION KEY DESIGN (Medium Impact)
#    Current: userId (good, evenly distributed)
#    ✓ No hot partitions detected
#    ✓ No throttling observed
#
# 4. ITEM SIZE OPTIMIZATION (Low Impact)
#    Average item size: 2.4 KB
#    Opportunities:
#    - Compress large text fields: -15%
#    - Remove redundant data: -8%
#    Estimated savings: $1.20/month
```

#### 3.2 DynamoDB最適化実行

```bash
# On-Demand billingに切り替え
agent serverless-optimizer optimize-dynamodb \
  --table=users \
  --billing-mode=on-demand

# 出力:
# 💰 Switching to On-Demand Billing...
#
# Current configuration:
#   - Billing: Provisioned (25 RCU, 10 WCU)
#   - Cost: $56.16/month
#
# New configuration:
#   - Billing: On-Demand
#   - Estimated cost: $8.40/month
#   - Savings: $47.76/month (85%)
#
# Impact analysis:
#   ✓ No performance degradation
#   ✓ Auto-scaling to handle bursts
#   ✓ No capacity planning needed
#
# ⚠ Note: On-Demand has higher per-request cost
#   - If traffic increases 10x, re-evaluate provisioned mode
#   - Set CloudWatch alarm for monthly cost > $50
#
# Proceed? [y/N]: y
#
# ✓ Updated table to on-demand billing
# ✓ Updated GSI email-index to on-demand
# ✓ CloudWatch alarm configured
#
# ✅ Optimization complete
# Monthly savings: $47.76

# アイテムサイズ最適化
agent serverless-optimizer optimize-dynamodb \
  --table=users \
  --optimize=item-size

# 出力:
# 📦 Analyzing Item Size...
#
# Sample items analyzed: 1,000
# Average size: 2.4 KB
#
# Large attributes:
#   1. profile_data (JSON): avg 1.2 KB
#      - Suggestion: Compress with gzip (-40%)
#      - Tradeoff: CPU cost for compress/decompress
#
#   2. preferences (JSON): avg 0.6 KB
#      - Suggestion: Store only changed preferences (not defaults)
#      - Estimated reduction: -30%
#
#   3. metadata (Map): avg 0.4 KB
#      - Suggestion: Remove redundant fields (duplicated from user object)
#      - Estimated reduction: -100%
#
# Total potential reduction: 25%
# Estimated savings: $2.10/month
#
# Generate migration script? [y/N]: y
#
# ✓ Generated: scripts/optimize-user-items.js
```

### Phase 4: Step Functions Optimization

#### 4.1 ワークフロー分析

```bash
# Step Functions分析
agent serverless-optimizer analyze-stepfunctions \
  --state-machine=order-processing

# 出力:
# 📊 Step Functions Analysis: order-processing
#
# Executions: 15,000/month
# Average Duration: 45 seconds
# Success Rate: 98.5%
# Failed Executions: 225 (1.5%)
#
# State Transitions: 180,000/month
# Cost: $4.50/month
#
# Workflow Steps:
#   1. ValidateOrder (Lambda): avg 200ms
#   2. CheckInventory (Lambda): avg 300ms
#   3. ProcessPayment (Lambda): avg 1,200ms
#   4. Wait (30 seconds)
#   5. ConfirmOrder (Lambda): avg 150ms
#   6. SendNotification (Lambda): avg 400ms
#
# 🎯 Optimization Opportunities:
#
# 1. REMOVE UNNECESSARY WAIT STATE (Medium Impact)
#    Current: Wait 30 seconds between ProcessPayment and ConfirmOrder
#    Reason: Originally added for payment gateway delay
#    Analysis: Payment gateway now returns synchronously
#    Recommendation: Remove Wait state
#    Savings:
#      - Execution time: 45s → 15s (67% faster)
#      - User experience: Order confirmed in 15s instead of 45s
#
# 2. PARALLEL EXECUTION (High Impact)
#    Current: CheckInventory → ProcessPayment (sequential)
#    Observation: These steps are independent
#    Recommendation: Run in parallel
#    Savings:
#      - Execution time: 1,500ms → 1,200ms (20% faster)
#
# 3. BATCH NOTIFICATIONS (Medium Impact)
#    Current: SendNotification for each order (15,000 Lambda calls)
#    Recommendation: Aggregate notifications, send in batches
#    Approach:
#      - Collect order IDs in DynamoDB
#      - EventBridge scheduled rule triggers batch processor every 5 min
#      - Send aggregated notifications
#    Savings:
#      - Lambda invocations: 15,000 → 8,640 (42% reduction)
#      - Cost: $0.75 → $0.43/month
#
# 4. EXPRESS WORKFLOWS (High Impact - if applicable)
#    Current: Standard workflow ($25/million transitions)
#    Traffic pattern: High volume, short duration (< 5 minutes)
#    Recommendation: Consider Express Workflows ($1/million requests)
#    Tradeoff:
#      - ✓ 96% cost reduction
#      - ✗ No execution history in console (use CloudWatch instead)
#      - ✗ 5 minute max duration (current: 45s avg, OK)
#    Estimated savings: $4.32/month (96%)
```

#### 4.2 ワークフロー最適化

```bash
# 並列実行を追加
agent serverless-optimizer optimize-stepfunctions \
  --state-machine=order-processing \
  --parallelize

# 出力:
# 🔧 Optimizing Workflow for Parallel Execution...
#
# Current workflow (sequential):
#   ValidateOrder → CheckInventory → ProcessPayment → ConfirmOrder
#   Total: 200ms + 300ms + 1,200ms + 150ms = 1,850ms
#
# Optimized workflow (parallel):
#   ValidateOrder → [CheckInventory + ProcessPayment] → ConfirmOrder
#   Total: 200ms + max(300ms, 1,200ms) + 150ms = 1,550ms
#
# Improvement: 16% faster (300ms saved per execution)
#
# Updated state machine definition:
# {
#   "States": {
#     "ValidateOrder": { ... },
#     "ParallelChecks": {
#       "Type": "Parallel",
#       "Branches": [
#         {
#           "StartAt": "CheckInventory",
#           "States": { "CheckInventory": { ... } }
#         },
#         {
#           "StartAt": "ProcessPayment",
#           "States": { "ProcessPayment": { ... } }
#         }
#       ],
#       "Next": "ConfirmOrder"
#     },
#     "ConfirmOrder": { ... }
#   }
# }
#
# ✓ State machine updated
# ✓ Tested with 10 executions: all successful
# ✓ Average duration: 1,520ms (18% improvement)

# Express Workflowsに移行
agent serverless-optimizer convert-to-express \
  --state-machine=order-processing

# 出力:
# ⚡ Converting to Express Workflow...
#
# Validation:
#   ✓ Average duration: 15s (< 5 minute limit)
#   ✓ Max duration: 42s (< 5 minute limit)
#   ✓ No human approval steps
#   ✓ High volume traffic (good fit for Express)
#
# Cost comparison:
#   Standard: $4.50/month (180,000 transitions)
#   Express: $0.18/month (15,000 requests)
#   Savings: $4.32/month (96%)
#
# Tradeoffs:
#   ✗ Execution history not in console (use CloudWatch Logs)
#   ✓ CloudWatch Logs integration configured
#   ✓ CloudWatch Insights queries provided for monitoring
#
# ✓ Created new Express workflow: order-processing-express
# ✓ Deployed and tested
# ✓ Routing 10% of traffic to new workflow (canary deployment)
#
# Monitor for 24 hours, then:
#   - If stable: route 100% traffic
#   - If issues: rollback to Standard workflow
```

### Phase 5: Comprehensive Cost Optimization

#### 5.1 全体コスト分析

```bash
# サーバーレスアプリ全体のコスト分析
agent serverless-optimizer analyze-costs \
  --app=myapp \
  --days=30

# 出力:
# 💰 Serverless Cost Analysis: myapp (30 days)
#
# Total Cost: $142.50
#
# Breakdown by Service:
#   1. Lambda: $78.50 (55%)
#      - Compute: $72.00
#      - Requests: $6.50
#   2. DynamoDB: $56.16 (39%)
#      - Provisioned capacity: $56.16
#   3. API Gateway: $2.10 (1%)
#   4. Step Functions: $4.50 (3%)
#   5. CloudWatch: $1.24 (1%)
#
# Breakdown by Function:
#   1. myapp-api-handler: $24.50 (17%)
#   2. myapp-user-handler: $18.20 (13%)
#   3. myapp-order-handler: $22.40 (16%)
#   ... (12 more functions)
#
# 🎯 Optimization Summary:
#
# High Impact (implement immediately):
#   1. DynamoDB: Provisioned → On-Demand
#      Savings: $47.76/month (34% of total)
#   2. Lambda: Right-size memory
#      Savings: $28.50/month (20% of total)
#   3. Step Functions: Standard → Express
#      Savings: $4.32/month (3% of total)
#
# Medium Impact (implement within 30 days):
#   4. API Gateway: Enable caching
#      Cost: +$14.40, Lambda savings: -$8.50
#      Net: +$5.90 (but massive performance gain)
#   5. Lambda: Create shared layers
#      Savings: $3.20/month (2% of total)
#
# Total Potential Savings: $80.58/month (57% reduction)
# New Monthly Cost: $61.92
#
# Generate optimization plan? [y/N]: y
```

**最適化プラン:**
```markdown
# Serverless Optimization Plan: myapp

## Phase 1: Quick Wins (Week 1)

### 1. Lambda Memory Optimization
- **Target**: 8 Lambda functions
- **Action**: Reduce memory from 512 MB to 256 MB
- **Savings**: $28.50/month
- **Risk**: Low (tested in staging)
- **Rollback**: Easy (update configuration)

### 2. DynamoDB Billing Mode
- **Target**: 3 tables (users, orders, products)
- **Action**: Switch to on-demand billing
- **Savings**: $47.76/month
- **Risk**: Very low (traffic pattern suitable)
- **Rollback**: Easy (switch back if needed)

**Week 1 Savings**: $76.26/month (54%)

## Phase 2: Performance Enhancements (Week 2-3)

### 3. API Gateway Caching
- **Target**: 3 GET endpoints
- **Action**: Enable 0.5 GB cache, TTL 5 minutes
- **Cost**: +$14.40/month cache, -$8.50/month Lambda
- **Net**: +$5.90/month
- **Benefit**: 86% latency reduction (180ms → 25ms)
- **Risk**: Low (cache invalidation configured)

### 4. Step Functions Migration
- **Target**: order-processing workflow
- **Action**: Standard → Express
- **Savings**: $4.32/month
- **Risk**: Medium (monitor CloudWatch Logs)
- **Rollback**: Keep Standard workflow as backup

**Phase 2 Total**: +$1.58/month, major performance gain

## Phase 3: Long-term Improvements (Week 4)

### 5. Lambda Layers
- **Target**: Common dependencies (axios, lodash, moment)
- **Action**: Extract to shared layer
- **Savings**: $3.20/month
- **Benefit**: Faster deployments, reduced cold starts
- **Risk**: Low

### 6. Monitoring & Alerts
- **Action**: Set up cost alerts
- **Trigger**: Monthly cost > $80
- **Benefit**: Prevent cost surprises

**Total Savings**: $80.58/month (57% reduction)
**New Monthly Cost**: $61.92 (down from $142.50)
```

## Error Handling

### Level 1: Recoverable Errors

- **一時的なAWS APIエラー**: リトライ（指数バックオフ）
- **Lambda timeout**: タイムアウト値を段階的に増やして再テスト

### Level 2: User Intervention Required

- **コスト増加のトレードオフ**: ユーザーに確認（例: Provisioned Concurrency）
- **設定変更のリスク**: Dry runで影響を提示

### Level 3: Critical Errors

- **本番環境での破壊的変更**: ロールバック、アラート
- **予算超過**: 即座に最適化をロールバック

## Performance Notes

- **段階的ロールアウト**: Canary deploymentで新設定をテスト
- **A/Bテスト**: 本番トラフィックの10%で検証
- **モニタリング**: CloudWatch metricsで継続的に監視

## Dependencies

- Node.js >= 16
- AWS CLI >= 2.0
- AWS SDK >= 3.0
- Terraform または AWS CDK (Infrastructure as Code)

## Best Practices

1. **右サイズ化**: 過剰なリソース割り当てを避ける
2. **オンデマンド vs プロビジョニング**: トラフィックパターンに応じて選択
3. **キャッシング**: 適切なTTLで無駄なバックエンド呼び出しを削減
4. **モニタリング**: コストとパフォーマンスのメトリクスを追跡
5. **段階的最適化**: 一度に大きな変更をせず、段階的に実施

## Related Skills

- `aws-cost-optimizer`: 全体的なAWSコスト最適化
- `aws-deploy-automation`: 最適化設定のIaCデプロイ
- `database-manager`: DynamoDBスキーマ設計

## Examples

### ✅ Good Example: Lambda Optimization

```bash
Input: agent serverless-optimizer optimize-lambda --function=api-handler --test

Output:
✓ Tested 3 memory configurations
✓ Recommended: 256 MB (50% cost savings, <5% slower)
✓ Applied and monitoring
Monthly savings: $12.25
```

### ❌ Bad Example: Over-provisioning

```bash
Input: Current Lambda configuration

Output:
❌ Over-provisioned
Memory: 3008 MB allocated, 200 MB used (7% utilization)
Cost: $156/month
Recommendation: Reduce to 512 MB → save $130/month (83%)
```

## Notes

- 最適化は段階的に実施（一度に大きな変更は避ける）
- 本番環境では必ずCanary deploymentを使用
- コスト削減とパフォーマンスのトレードオフを常に考慮
- CloudWatch Alarmsでコストとパフォーマンスを監視
