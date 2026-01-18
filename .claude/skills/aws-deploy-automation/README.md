# AWS Deploy Automation

Automate and standardize AWS deployments with Infrastructure as Code (CDK, CloudFormation, Terraform).

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [Deployment Strategies](#deployment-strategies)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Related Documentation](#related-documentation)

## Overview

**Status**: ✅ Implemented (2026-01-18)
**Supported Tools**: AWS CDK, CloudFormation, Terraform

This skill automates AWS infrastructure deployments with built-in best practices, pre-deployment validation, and automated rollback strategies.

## ✨ Features

### Infrastructure as Code Support

- ✅ AWS CDK (TypeScript/JavaScript/Python)
- ✅ CloudFormation templates (JSON/YAML)
- ✅ Terraform configurations (HCL)

### Environment Management

- ✅ Multi-environment configurations (dev/staging/production)
- ✅ Environment-specific parameters and secrets
- ✅ Cross-account deployment support

### Deployment Strategies

- ✅ Blue/Green deployments
- ✅ Canary releases (gradual traffic shifting)
- ✅ Rolling updates
- ✅ All-at-once deployments

### Safety Features

- ✅ Pre-deployment validation (syntax, IAM, quotas)
- ✅ Drift detection
- ✅ Automatic rollback on failure
- ✅ Change set preview

### CI/CD Integration

- ✅ GitHub Actions workflows
- ✅ CircleCI pipelines
- ✅ GitLab CI/CD templates

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
cd .claude/skills/aws-deploy-automation
npm install
```

### Prerequisites

- Node.js >= 16
- AWS CLI >= 2.0
- AWS CDK >= 2.0 (optional, for CDK deployments)
- Terraform >= 1.0 (optional, for Terraform deployments)

### Required IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "iam:PassRole",
        "s3:*",
        "ec2:Describe*",
        "lambda:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🚀 Quick Start

### 1. CDK Deployment

```bash
# Deploy CDK stack to development
node scripts/deploy-cdk.js my-app-stack ./cdk-app dev

# Deploy to production with approval
node scripts/deploy-cdk.js my-app-stack ./cdk-app production --require-approval
```

### 2. CloudFormation Deployment

```bash
# Deploy CloudFormation template
node scripts/deploy-cloudformation.js my-stack ./template.yaml staging

# Deploy with parameters
node scripts/deploy-cloudformation.js my-stack ./template.yaml production \
  --parameters InstanceType=t3.medium,KeyName=my-key
```

### 3. Terraform Deployment

```bash
# Initialize and apply Terraform configuration
node scripts/deploy-terraform.js ./terraform production apply

# Plan changes before applying
node scripts/deploy-terraform.js ./terraform production plan
```

## 📖 Usage Examples

### Example 1: Blue/Green Deployment with CDK

```bash
# Deploy new version (Green)
node scripts/deploy-cdk.js my-app-stack ./cdk-app production \
  --strategy=blue-green \
  --traffic-shift=linear

# Output:
# ✓ Deploying Green stack...
# ✓ Running health checks...
# ✓ Shifting traffic: 10% → 50% → 100%
# ✓ Green deployment successful
# ✓ Blue stack marked for termination (30-day retention)
```

### Example 2: Canary Deployment with CloudFormation

```bash
# Deploy with canary strategy
node scripts/deploy-cloudformation.js api-stack ./api-template.yaml production \
  --strategy=canary \
  --canary-percentage=10 \
  --canary-duration=5m

# Output:
# ✓ Deploying canary (10% traffic)...
# ✓ Monitoring metrics for 5 minutes...
# ✓ No errors detected
# ✓ Promoting canary to 100% traffic...
# ✓ Deployment complete
```

### Example 3: Terraform with Pre-Deployment Validation

```bash
# Validate before deploying
node scripts/deploy-terraform.js ./terraform production validate

# Output:
# ✓ Terraform syntax valid
# ✓ No security issues detected
# ✓ IAM permissions sufficient
# ✓ Service quotas OK
# ✓ Ready to deploy

# Apply changes
node scripts/deploy-terraform.js ./terraform production apply
```

### Example 4: Rollback on Failure

```bash
# Deploy with automatic rollback
node scripts/deploy-cdk.js my-app-stack ./cdk-app production \
  --auto-rollback \
  --rollback-on-alarm=MyAlarmName

# Output:
# ✓ Deploying stack...
# ⚠ CloudWatch alarm triggered: MyAlarmName
# ⚠ Initiating automatic rollback...
# ✓ Rolled back to previous version
# ✗ Deployment failed, stack is stable
```

## ⚙️ Configuration

### Environment Configuration Files

Edit `configs/environments/<env>.json`:

```json
{
  "name": "production",
  "account": "123456789012",
  "region": "us-east-1",
  "tags": {
    "Environment": "production",
    "ManagedBy": "cdk"
  },
  "parameters": {
    "instanceType": "t3.large",
    "minCapacity": 2,
    "maxCapacity": 10
  },
  "alarms": {
    "enabled": true,
    "rollbackOnAlarm": true,
    "alarmNames": ["HighErrorRate", "HighLatency"]
  },
  "approvals": {
    "required": true,
    "approvers": ["ops-team@example.com"]
  }
}
```

### Deployment Strategy Configuration

Edit `configs/deployment-strategy.yaml`:

```yaml
strategies:
  blue-green:
    healthCheckDuration: 5m
    trafficShift: linear # or canary, all-at-once
    retentionPeriod: 30d

  canary:
    percentage: 10
    duration: 5m
    incrementStep: 10
    alarmThreshold: 0.01

  rolling:
    batchSize: 25% # or fixed number
    pauseBetweenBatches: 2m
    maxUnavailable: 1
```

## 🔄 Deployment Strategies

### Blue/Green

Deploy a new version alongside the old one, then switch traffic:

- **Pros**: Zero downtime, instant rollback
- **Cons**: 2x resources during deployment
- **Use Case**: Production deployments requiring high availability

### Canary

Gradually shift traffic from old to new version:

- **Pros**: Low risk, early issue detection
- **Cons**: Slower deployment
- **Use Case**: Critical services where gradual rollout is preferred

### Rolling

Update instances in batches:

- **Pros**: No extra resources needed
- **Cons**: Some downtime possible
- **Use Case**: Non-critical services, cost-sensitive deployments

## 🔧 Troubleshooting

### Error: Stack already exists

**Cause**: Attempting to create a stack that already exists

**Solution**:

```bash
# Update existing stack instead
node scripts/deploy-cloudformation.js my-stack ./template.yaml production --update

# Or delete and recreate
aws cloudformation delete-stack --stack-name my-stack
aws cloudformation wait stack-delete-complete --stack-name my-stack
node scripts/deploy-cloudformation.js my-stack ./template.yaml production
```

### Error: Insufficient IAM permissions

**Cause**: IAM role lacks required permissions

**Solution**:

1. Check current permissions:

```bash
aws iam get-role --role-name MyDeploymentRole
```

2. Add missing permissions (see [Required IAM Permissions](#required-iam-permissions))

### Error: Drift detected

**Cause**: Manual changes made outside IaC

**Solution**:

```bash
# Detect drift
node scripts/detect-drift.js my-stack

# Options:
# 1. Update IaC to match current state
# 2. Revert manual changes
# 3. Force update to IaC definition
node scripts/deploy-cdk.js my-stack ./cdk-app production --force
```

### Error: Rollback failed

**Cause**: Previous stack version is corrupted or deleted

**Solution**:

```bash
# Manual rollback steps
aws cloudformation describe-stack-events --stack-name my-stack

# Delete problematic resources manually
aws ec2 delete-security-group --group-id sg-xxx

# Retry deployment
node scripts/deploy-cloudformation.js my-stack ./template.yaml production
```

## ✅ Best Practices

### 1. Use Environment Configurations

```bash
# ❌ Bad: Hardcoded values
node scripts/deploy-cdk.js my-stack ./cdk-app production \
  --parameters InstanceType=t3.large,MinCapacity=2

# ✅ Good: Environment config file
node scripts/deploy-cdk.js my-stack ./cdk-app production
# Reads from configs/environments/production.json
```

### 2. Always Validate Before Deploying

```bash
# Validate CDK
cdk synth --app="node bin/app.js" --context env=production

# Validate CloudFormation
aws cloudformation validate-template --template-body file://template.yaml

# Validate Terraform
terraform validate
terraform plan
```

### 3. Tag All Resources

```json
{
  "tags": {
    "Environment": "production",
    "ManagedBy": "cdk",
    "CostCenter": "engineering",
    "Owner": "platform-team"
  }
}
```

### 4. Use Change Sets for CloudFormation

```bash
# Create change set
node scripts/deploy-cloudformation.js my-stack ./template.yaml production \
  --create-change-set \
  --change-set-name=my-change-set

# Review changes
aws cloudformation describe-change-set \
  --stack-name my-stack \
  --change-set-name my-change-set

# Execute change set
aws cloudformation execute-change-set \
  --stack-name my-stack \
  --change-set-name my-change-set
```

### 5. Monitor Deployments

Set up CloudWatch alarms for:

- Stack creation/update failures
- Resource provisioning errors
- Rollback events

```bash
# Enable automatic monitoring
node scripts/deploy-cdk.js my-stack ./cdk-app production \
  --enable-monitoring \
  --alarm-email=ops@example.com
```

## 📚 Related Documentation

- [SKILL.md](SKILL.md) - Complete skill specifications
- [examples/basic-usage.md](examples/basic-usage.md) - Basic deployment examples
- [examples/advanced-usage.md](examples/advanced-usage.md) - Advanced deployment patterns
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

## 📝 License

MIT

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

---

**Need help?** Create an issue or see [Troubleshooting](#troubleshooting) above.
