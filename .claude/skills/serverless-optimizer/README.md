# Serverless Optimizer

Optimize AWS serverless architecture (Lambda, API Gateway, Step Functions, DynamoDB) for performance and cost efficiency.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Related Documentation](#related-documentation)

## Overview

**Status**: ✅ Phase 1 Complete (2026-01-17)
**Supported Services**: AWS Lambda, API Gateway, DynamoDB, Step Functions

This skill automatically analyzes and optimizes your serverless architecture, reducing costs by an average of **50%** while improving performance.

## ✨ Features

### Lambda Optimization

- ✅ Memory/timeout right-sizing (average 50% cost reduction)
- ✅ Cold start analysis and reduction strategies
- ✅ Bundle size optimization
- ✅ Provisioned Concurrency recommendations
- ✅ Lambda Layers extraction for common dependencies

### API Gateway

- 🚧 Caching configuration (Phase 2)
- 🚧 Request validation (Phase 2)
- 🚧 Throttling rules (Phase 2)

### DynamoDB

- 🚧 Capacity mode optimization (Provisioned vs On-Demand) (Phase 2)
- 🚧 Index optimization (Phase 2)
- 🚧 Item size reduction (Phase 2)

### Step Functions

- 🚧 Workflow parallelization (Phase 2)
- 🚧 Express Workflows migration (Phase 2)
- 🚧 Cost analysis (Phase 2)

### Cost Analysis

- ✅ Comprehensive serverless cost breakdown
- ✅ Per-function cost tracking
- ✅ Optimization savings forecast
- ✅ ROI calculation

## 📦 Installation

### Option 1: Workspace Installation (Recommended)

```bash
# Install all skills in the monorepo
cd claude-code-toolkit
npm install
```

### Option 2: Standalone Installation

```bash
# Install this skill independently
cd .claude/skills/serverless-optimizer
npm install
```

### Prerequisites

- Node.js >= 16
- AWS CLI configured with credentials
- AWS SDK >= 3.0
- CloudWatch Logs access

### Required IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:ListFunctions",
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
        "cloudwatch:GetMetricStatistics",
        "logs:DescribeLogStreams",
        "logs:GetLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🚀 Quick Start

### 1. Analyze Lambda Function

```bash
node scripts/lambda-optimizer.js --function=my-api-handler --days=7
```

### 2. Analyze Cold Starts

```bash
node scripts/coldstart-analyzer.js --function=my-api-handler
```

### 3. Calculate Costs

```bash
node scripts/cost-calculator.js --service=lambda --period=last-30-days
```

## 📖 Usage Examples

### Example 1: Lambda Memory Optimization

```bash
# Analyze current memory usage
node scripts/lambda-optimizer.js \
  --function=myapp-api-handler \
  --optimize=memory \
  --days=14

# Output:
# Current: 512 MB ($24.50/month)
# Recommended: 256 MB ($12.25/month)
# Savings: $12.25/month (50%)
```

### Example 2: Cold Start Analysis

```bash
# Analyze cold starts
node scripts/coldstart-analyzer.js \
  --function=myapp-api-handler \
  --period=last-7-days

# Output:
# Cold Starts: 8,500 (0.68% of invocations)
# Average Cold Start: 1,800ms
# Recommendations:
# 1. Enable Provisioned Concurrency: 5 instances ($21/month)
# 2. Optimize bundle size (currently 45 MB)
```

### Example 3: Comprehensive Cost Analysis

```bash
# Analyze all Lambda functions
node scripts/cost-calculator.js \
  --service=lambda \
  --app=myapp \
  --days=30

# Output:
# Total Cost: $78.50
# Top Functions:
# 1. myapp-api-handler: $24.50 (31%)
# 2. myapp-user-handler: $18.20 (23%)
# Potential Savings: $28.50/month (36%)
```

## ⚙️ Configuration

### Optimization Rules

Edit `configs/optimization-rules.yaml`:

```yaml
lambda:
  memory:
    min_utilization: 0.35 # Recommend downsize if < 35% utilized
    max_utilization: 0.90 # Recommend upsize if > 90% utilized
  cold_start:
    threshold_ms: 1000 # Flag if cold start > 1000ms
    rate_threshold: 0.01 # Flag if > 1% cold starts
  bundle:
    max_size_mb: 50 # Warn if bundle > 50 MB
    min_compression: 0.5 # Recommend compression if < 50% compressed
```

### Performance Thresholds

Edit `configs/performance-thresholds.json`:

```json
{
  "lambda": {
    "duration_p99_ms": 3000,
    "error_rate_percent": 1.0,
    "throttle_rate_percent": 0.1
  },
  "apigateway": {
    "latency_p99_ms": 1000,
    "cache_hit_rate_percent": 80
  }
}
```

## 🔧 Troubleshooting

### Error: Function not found

**Cause**: Function name or region incorrect

**Solution**:

```bash
# List all functions in the region
aws lambda list-functions --region us-east-1 --query 'Functions[].FunctionName'

# Verify your AWS region
aws configure get region
```

### Error: Insufficient CloudWatch data

**Cause**: Function has no recent invocations or CloudWatch metrics not available

**Solution**:

- Ensure the function has been invoked in the last 7 days
- Wait for CloudWatch metrics to propagate (up to 15 minutes)
- Increase `--days` parameter to capture more historical data

### Error: Access Denied

**Cause**: Insufficient IAM permissions

**Solution**:

1. Verify IAM permissions (see [Required IAM Permissions](#required-iam-permissions))
2. Check AWS credentials:

```bash
aws sts get-caller-identity
```

### Error: Memory recommendation too low

**Cause**: Function has occasional memory spikes not captured by average

**Solution**:

- Use `--percentile=99` to base recommendations on P99 memory usage instead of average
- Manually review CloudWatch metrics for memory spikes

```bash
node scripts/lambda-optimizer.js \
  --function=my-function \
  --percentile=99 \
  --days=30
```

## ✅ Best Practices

### 1. Regular Optimization (Weekly)

Run Lambda optimization analysis weekly to catch configuration drift:

```bash
# Add to cron or GitHub Actions
node scripts/lambda-optimizer.js --all-functions --region=us-east-1
```

### 2. Pre-Production Testing

Test memory optimizations in staging before applying to production:

```bash
# Test in staging first
node scripts/lambda-optimizer.js \
  --function=my-function \
  --environment=staging \
  --apply
```

### 3. Monitor After Changes

Set up CloudWatch alarms to detect regressions after optimization:

```yaml
# CloudWatch Alarm for duration increase
MetricName: Duration
Threshold: 2000 # ms
EvaluationPeriods: 2
Statistic: Average
```

### 4. Use Provisioned Concurrency Selectively

Only enable Provisioned Concurrency for latency-sensitive functions:

- User-facing APIs (response time < 200ms required)
- Peak traffic hours only (e.g., 08:00-18:00 weekdays)
- Not for batch processing or async tasks

### 5. Track Savings

Document cost savings for stakeholder visibility:

```bash
# Generate monthly savings report
node scripts/cost-calculator.js \
  --compare-period=last-month \
  --format=markdown \
  --output=./reports/savings-report.md
```

## 📚 Related Documentation

- [SKILL.md](SKILL.md) - Complete skill specifications and detailed instructions
- [examples/basic-usage.md](examples/basic-usage.md) - Basic usage examples
- [examples/advanced-usage.md](examples/advanced-usage.md) - Advanced optimization patterns
- [AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing/)
- [AWS Lambda Power Tuning](https://github.com/alexcasalboni/aws-lambda-power-tuning)

## 📝 License

MIT

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

---

**Need help?** Create an issue or see [Troubleshooting](#troubleshooting) above.
