# AWS Cost Optimizer

AWS costs analysis and optimization recommendations.

## Quick Start

### Prerequisites

- Node.js >= 16
- AWS CLI configured with credentials
- AWS Cost Explorer API enabled

### Installation

```bash
cd .claude/skills
npm install
```

### Basic Usage

```bash
# Analyze costs for the last 30 days
node aws-cost-optimizer/scripts/cost-analyzer.js --period=last-30-days

# Detect unused resources
node aws-cost-optimizer/scripts/unused-resource-detector.js --region=us-east-1

# Generate comprehensive report
node aws-cost-optimizer/scripts/report-generator.js
```

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

## Troubleshooting

**Error: AWS credentials not configured**
```bash
aws configure
```

**Error: Cost Explorer API not enabled**
- Go to AWS Console → Cost Management
- Enable Cost Explorer

## License

MIT
