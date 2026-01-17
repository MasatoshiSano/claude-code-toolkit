# Serverless Optimizer

Optimize AWS Lambda, API Gateway, and DynamoDB for performance and cost.

## Quick Start

### Prerequisites

- Node.js >= 16
- AWS CLI configured with credentials
- CloudWatch Logs access

### Installation

```bash
cd .claude/skills
npm install
```

### Basic Usage

```bash
# Optimize Lambda functions
node serverless-optimizer/scripts/lambda-optimizer.js --function=my-function

# Analyze cold starts
node serverless-optimizer/scripts/coldstart-analyzer.js --function=my-function

# Calculate costs
node serverless-optimizer/scripts/cost-calculator.js --service=lambda
```

### Configuration

Edit `configs/optimization-rules.yaml` to customize:
- Memory optimization thresholds
- Cold start detection rules
- Cost calculation parameters

## Features

- ✅ Lambda memory/timeout optimization (average 50% cost reduction)
- ✅ Cold start analysis and reduction strategies
- ✅ API Gateway caching and throttling configuration
- ✅ DynamoDB capacity analysis (Provisioned vs On-Demand)
- ✅ Step Functions optimization
- ✅ Comprehensive cost analysis

## Output

Reports are saved to `reports/`:
- `lambda-optimization-YYYY-MM-DD.json` - Lambda analysis results
- `coldstart-analysis-YYYY-MM-DD.json` - Cold start metrics
- `serverless-costs-YYYY-MM-DD.json` - Cost breakdown

## Documentation

See [SKILL.md](SKILL.md) for detailed specifications and instructions.

## Troubleshooting

**Error: Function not found**
- Verify function name and region
- Check AWS credentials and permissions

**Error: Insufficient CloudWatch data**
- Function must have recent invocations
- Wait for more CloudWatch metrics to accumulate

## License

MIT
