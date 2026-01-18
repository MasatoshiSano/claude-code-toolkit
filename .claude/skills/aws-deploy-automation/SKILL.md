---
name: aws-deploy-automation
description:
  Automate and standardize AWS deployments with Infrastructure as Code
version: 1.0.0
author: Claude Code Toolkit
license: MIT
tags:
  - aws
  - deployment
  - infrastructure
  - cdk
  - cloudformation
  - terraform
  - devops
requires:
  - node>=16
  - aws-cli>=2.0
  - aws-cdk>=2.0 (optional)
  - terraform>=1.0 (optional)
---

# AWS Deploy Automation Agent Skill

## 実装状況

**ステータス**: ✅ 実装済み（基本機能完成） **実装完了日**: 2026-01-18
**動作保証**: 基本機能（要AWS認証情報）

**実装済み機能**:

- ✅ デプロイスクリプト（deploy-cdk.js、deploy-cloudformation.js、deploy-terraform.js）
- ✅ ロールバックスクリプト（rollback-stack.js）
- ✅ 検証スクリプト（pre-deploy-validation.js）
- ✅ 環境別設定ファイル（dev/staging/production）
- ✅ デプロイ戦略設定（deployment-strategy.yaml）
- ✅ 共通ユーティリティ統合（Logger、ErrorHandler、ProgressBar）
- ✅ README.md・ドキュメント

**未実装機能**（将来対応予定）:

- 🚧 デプロイ後スモークテスト（post-deploy-smoke-test.js）
- 🚧 シークレット管理（secret-manager.js）
- 🚧 CDK/CloudFormation/Terraformテンプレート詳細実装
- 🚧 統合テスト・E2Eテスト

**動作要件**:

- Node.js >= 16
- AWS CLI >= 2.0
- AWS CDK >= 2.0（オプション）
- Terraform >= 1.0（オプション）
- IAM権限: デプロイ対象のAWSサービスに応じて設定

## Purpose

このスキルは、AWSへのデプロイを自動化・標準化し、Infrastructure as
Code（IaC）のベストプラクティスを適用します。CDK、CloudFormation、Terraformに対応し、環境ごとの設定管理、ロールバック戦略、デプロイ前後の検証を自動化します。

## When to Use

- 新しいAWSインフラをコードで定義する時
- ステージング・本番環境へのデプロイ
- インフラ変更のレビューと適用
- デプロイのロールバックが必要な時
- CI/CDパイプラインの構築

## Architecture

```
scripts/
├── deploy-cdk.js              # AWS CDKデプロイ
├── deploy-cloudformation.js   # CloudFormationデプロイ
├── deploy-terraform.js        # Terraformデプロイ
├── rollback-stack.js          # スタックロールバック
├── pre-deploy-validation.js   # デプロイ前検証
├── post-deploy-smoke-test.js  # デプロイ後スモークテスト
└── secret-manager.js          # シークレット管理

templates/
├── cdk/
│   ├── app-stack.ts           # CDKアプリケーションスタック
│   ├── vpc-stack.ts           # VPCスタック
│   ├── rds-stack.ts           # RDSスタック
│   ├── ecs-stack.ts           # ECSスタック
│   └── lambda-stack.ts        # Lambdaスタック
├── cloudformation/
│   ├── app-template.yaml
│   ├── vpc-template.yaml
│   └── rds-template.yaml
└── terraform/
    ├── main.tf
    ├── variables.tf
    └── outputs.tf

configs/
├── environments/
│   ├── dev.json
│   ├── staging.json
│   └── production.json
├── deployment-strategy.yaml   # デプロイ戦略定義
└── rollback-policy.yaml       # ロールバックポリシー
```

## Instructions

### Phase 1: Infrastructure Definition

#### 1.1 IaCツールの選択

**AWS CDK（推奨）**

- TypeScript/Pythonで記述
- 高レベルの抽象化
- 型安全性
- IDE補完サポート

**CloudFormation**

- YAML/JSON
- AWS純正
- 既存テンプレートが豊富

**Terraform**

- HCL（HashiCorp Configuration Language）
- マルチクラウド対応
- 成熟したエコシステム

#### 1.2 環境設定の定義

**開発環境（dev）**:

```json
{
  "environment": "dev",
  "region": "ap-northeast-1",
  "account": "123456789012",
  "vpc": {
    "cidr": "10.0.0.0/16",
    "availabilityZones": 2
  },
  "compute": {
    "instanceType": "t3.micro",
    "desiredCount": 1
  },
  "database": {
    "instanceClass": "db.t3.micro",
    "allocatedStorage": 20,
    "multiAZ": false
  },
  "tags": {
    "Environment": "dev",
    "ManagedBy": "CDK"
  }
}
```

**本番環境（production）**:

```json
{
  "environment": "production",
  "region": "ap-northeast-1",
  "account": "987654321098",
  "vpc": {
    "cidr": "10.1.0.0/16",
    "availabilityZones": 3
  },
  "compute": {
    "instanceType": "t3.large",
    "desiredCount": 3,
    "autoScaling": {
      "min": 3,
      "max": 10,
      "targetCPU": 70
    }
  },
  "database": {
    "instanceClass": "db.r5.xlarge",
    "allocatedStorage": 100,
    "multiAZ": true,
    "backupRetention": 7
  },
  "tags": {
    "Environment": "production",
    "ManagedBy": "CDK",
    "CostCenter": "engineering"
  }
}
```

### Phase 2: Pre-Deployment Validation

#### 2.1 構文チェック

**CDK:**

```bash
cdk synth --context env=staging
```

**CloudFormation:**

```bash
aws cloudformation validate-template --template-body file://template.yaml
```

**Terraform:**

```bash
terraform validate
terraform plan -out=tfplan
```

#### 2.2 セキュリティチェック

**IAM権限の検証:**

- 最小権限の原則に従っているか
- ワイルドカード（\*）の過度な使用がないか
- パブリックアクセスが意図的か

**シークレット管理:**

- ハードコードされたシークレットがないか
- AWS Secrets Manager/Systems Manager Parameter Store使用
- 環境変数の適切な管理

**ネットワークセキュリティ:**

- セキュリティグループのインバウンドルール
- 0.0.0.0/0からのアクセスが必要か検証
- VPC内のプライベートサブネット配置

#### 2.3 コスト見積もり

```bash
# CDKでコスト見積もり
cdk diff --context env=production

# 出力例:
# Resources:
# [+] AWS::EC2::Instance MyInstance (estimated: $0.10/hr)
# [+] AWS::RDS::DBInstance MyDatabase (estimated: $0.40/hr)
# [~] AWS::ECS::Service MyService (scaling 1→3, estimated: +$0.20/hr)
#
# Estimated monthly cost: $504 → $756 (+$252/month)
```

#### 2.4 依存関係チェック

- スタック間の依存関係を確認
- 削除保護が有効な重要リソースの確認
- データベースのバックアップが取られているか

### Phase 3: Deployment Execution

#### 3.1 デプロイ戦略の選択

**Blue/Green Deployment（推奨：本番環境）**

```yaml
strategy: blue-green
steps:
  1. 新環境（Green）を構築 2. スモークテストを実行 3.
  トラフィックを段階的に切り替え（10% → 50% → 100%） 4.
  問題なければ旧環境（Blue）を削除 5. 問題あればロールバック
```

**Rolling Update（推奨：ステージング環境）**

```yaml
strategy: rolling
steps:
  1. インスタンスを1つずつ更新 2. ヘルスチェック成功を確認 3. 次のインスタンスへ
```

**All-at-Once（推奨：開発環境のみ）**

```yaml
strategy: all-at-once
steps: 1. 全リソースを一度に更新 2. 最速だがダウンタイムあり
```

#### 3.2 CDKデプロイ実行

```bash
# ステージング環境へデプロイ
cdk deploy --context env=staging --require-approval never

# 本番環境へデプロイ（承認必要）
cdk deploy --context env=production --require-approval broadening

# 差分確認
cdk diff --context env=production
```

#### 3.3 CloudFormationデプロイ実行

```bash
# スタック作成
aws cloudformation create-stack \
  --stack-name my-app-production \
  --template-body file://template.yaml \
  --parameters file://production-params.json \
  --capabilities CAPABILITY_IAM

# スタック更新
aws cloudformation update-stack \
  --stack-name my-app-production \
  --template-body file://template.yaml \
  --parameters file://production-params.json

# 変更セット作成（承認前にレビュー）
aws cloudformation create-change-set \
  --stack-name my-app-production \
  --change-set-name my-changeset \
  --template-body file://template.yaml

# 変更セット確認
aws cloudformation describe-change-set \
  --stack-name my-app-production \
  --change-set-name my-changeset

# 変更セット実行
aws cloudformation execute-change-set \
  --stack-name my-app-production \
  --change-set-name my-changeset
```

#### 3.4 Terraformデプロイ実行

```bash
# 初期化
terraform init

# プラン作成
terraform plan -var-file=production.tfvars -out=tfplan

# 適用
terraform apply tfplan

# 承認付き適用
terraform apply -var-file=production.tfvars
```

### Phase 4: Post-Deployment Verification

#### 4.1 スモークテスト

```javascript
// post-deploy-smoke-test.js
async function runSmokeTests(environment) {
  const tests = [
    {
      name: 'Health Check',
      test: async () => {
        const response = await fetch(`${baseUrl}/health`);
        return response.status === 200;
      }
    },
    {
      name: 'Database Connection',
      test: async () => {
        const response = await fetch(`${baseUrl}/api/status/db`);
        return response.json().connected === true;
      }
    },
    {
      name: 'Authentication',
      test: async () => {
        const response = await fetch(`${baseUrl}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${testToken}` }
        });
        return response.status === 200;
      }
    }
  ];

  const results = await Promise.all(
    tests.map(async ({ name, test }) => {
      try {
        const passed = await test();
        return { name, passed, error: null };
      } catch (error) {
        return { name, passed: false, error: error.message };
      }
    })
  );

  return results;
}
```

#### 4.2 メトリクス監視

**CloudWatch Alarms:**

- CPU使用率 > 80%
- メモリ使用率 > 85%
- エラー率 > 1%
- レスポンスタイム > 1秒

**ログ確認:**

```bash
# CloudWatch Logsからエラーログを検索
aws logs filter-log-events \
  --log-group-name /aws/ecs/my-app \
  --filter-pattern "ERROR" \
  --start-time $(date -u -d '5 minutes ago' +%s)000
```

#### 4.3 ロールバック判定

**自動ロールバック条件:**

- スモークテストが50%以上失敗
- エラー率が5%を超える
- ヘルスチェックが3回連続で失敗
- デプロイ後5分以内にCPU使用率が90%を超える

### Phase 5: Rollback Strategy

#### 5.1 CDKロールバック

```bash
# 前のバージョンに戻す（Git経由）
git checkout HEAD~1 -- lib/

# デプロイ
cdk deploy --context env=production
```

#### 5.2 CloudFormationロールバック

```bash
# 自動ロールバック（更新失敗時）
aws cloudformation update-stack \
  --stack-name my-app-production \
  --template-body file://template.yaml \
  --rollback-configuration RollbackTriggers=[...],MonitoringTimeInMinutes=5

# 手動ロールバック（前のバージョンへ）
aws cloudformation cancel-update-stack --stack-name my-app-production
```

#### 5.3 Terraformロールバック

```bash
# State履歴から前のバージョンに戻す
terraform state pull > backup.tfstate
terraform apply -var-file=previous-version.tfvars
```

### Phase 6: CI/CD Integration

#### 6.1 GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches:
      - main
      - staging

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ap-northeast-1

      - name: Install CDK
        run: npm install -g aws-cdk

      - name: Pre-deployment Validation
        run: |
          cdk synth --context env=staging
          npm run test:security

      - name: Deploy to Staging
        if: github.ref == 'refs/heads/staging'
        run: cdk deploy --context env=staging --require-approval never

      - name: Run Smoke Tests
        run: npm run test:smoke

      - name: Deploy to Production
        if: github.ref == 'refs/heads/main' && success()
        run: cdk deploy --context env=production --require-approval broadening
```

#### 6.2 CircleCI

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@3.0

jobs:
  deploy:
    docker:
      - image: cimg/node:16.0
    steps:
      - checkout
      - aws-cli/setup
      - run:
          name: Deploy Infrastructure
          command: |
            npm install -g aws-cdk
            cdk deploy --context env=$CIRCLE_BRANCH --require-approval never
      - run:
          name: Smoke Tests
          command: npm run test:smoke

workflows:
  deploy-workflow:
    jobs:
      - deploy:
          filters:
            branches:
              only:
                - staging
                - main
```

## Error Handling

### Level 1: Recoverable Errors

- **リソース作成失敗**: リトライ（最大3回、指数バックオフ）
- **一時的なネットワークエラー**: 自動リトライ
- **レート制限**: 待機後リトライ

### Level 2: User Intervention Required

- **IAM権限不足**: 必要な権限を表示、ユーザーに追加を要求
- **リソース制限超過**: 制限緩和リクエストの案内
- **シークレット未設定**: シークレット設定方法を案内

### Level 3: Critical Errors

- **スタック作成失敗**: 自動ロールバック、エラー詳細をログ
- **データベース削除保護**: デプロイ中断、警告表示
- **本番環境の破壊的変更**: ユーザー承認を強制要求

## Performance Notes

- **並列デプロイ**: 独立したスタックは並列にデプロイ
- **差分デプロイ**: 変更があったリソースのみ更新
- **キャッシング**: CloudFormationテンプレートをS3にキャッシュ

## Dependencies

### Required

- AWS CLI >= 2.0
- Node.js >= 16
- 適切なIAM権限

### Optional

- AWS CDK >= 2.0（CDK使用時）
- Terraform >= 1.0（Terraform使用時）
- Docker（コンテナデプロイ時）

## Best Practices

1. **環境ごとに独立したAWSアカウント**: dev/staging/prodで分離
2. **タグ付けの徹底**: コスト配分、リソース管理に必須
3. **削除保護の有効化**: RDS、DynamoDB等の重要リソース
4. **バックアップの自動化**: デプロイ前に自動バックアップ
5. **段階的ロールアウト**: 本番環境はカナリアデプロイ
6. **監視とアラート**: デプロイ後の異常を即座に検知
7. **ドキュメント化**: インフラ構成図を自動生成

## Related Skills

- `/check`: デプロイ前のコード品質チェック
- `/security-audit`: IAMポリシー、セキュリティグループの監査
- `api-contract-validator`: APIコントラクトの検証

## Examples

### ✅ Good Example 1: Staging Deploy

```bash
Input: agent aws-deploy-automation --env=staging --auto-approve

Output:
✓ Pre-deployment validation passed
✓ CDK synth completed
✓ Deploying stack: my-app-staging
  ├─ VPC created (vpc-abc123)
  ├─ ECS Cluster created (my-app-staging-cluster)
  ├─ RDS Instance created (my-app-staging-db)
  └─ Load Balancer created (my-app-staging-alb)
✓ Deployment completed in 8m 32s
✓ Running smoke tests...
  ├─ Health check: PASS
  ├─ Database connection: PASS
  └─ API authentication: PASS
✓ Deployment successful!

Stack URL: https://staging.myapp.com
CloudWatch Dashboard: https://console.aws.amazon.com/...
```

### ✅ Good Example 2: Production Canary Deploy

```bash
Input: agent aws-deploy-automation --env=prod --strategy=canary --traffic=10%

Output:
✓ Pre-deployment validation passed
⚠ Production deployment detected - extra validation required
✓ Change set created
  Changes:
  [~] ECS Task Definition (CPU: 256→512, Memory: 512→1024)
  [+] Auto Scaling Policy (Target CPU: 70%)

Approve these changes? [y/N]: y

✓ Deploying with canary strategy
  ├─ Phase 1: Deploy new version (10% traffic)
  ├─ Monitoring metrics (5 minutes)...
  │   CPU: 45% ✓
  │   Error rate: 0.1% ✓
  │   Response time: 120ms ✓
  ├─ Phase 2: Increase to 50% traffic
  ├─ Monitoring metrics (5 minutes)...
  ├─ Phase 3: Increase to 100% traffic
  └─ Old version terminated

✓ Production deployment successful!
Deployment time: 18m 45s
```

### ❌ Bad Example: Missing Configuration

```bash
Input: agent aws-deploy-automation --env=prod

Output:
❌ Deployment failed

Errors:
1. Missing required configuration: configs/environments/prod.json
2. AWS credentials not configured
3. IAM role arn:aws:iam::123:role/DeployRole not found

Solutions:
1. Create prod.json from template:
   cp configs/environments/production.template.json configs/environments/prod.json

2. Configure AWS credentials:
   aws configure --profile production

3. Create IAM role with required permissions:
   aws iam create-role --role-name DeployRole --assume-role-policy-document file://trust-policy.json
```

## Notes

- デプロイ前に必ずステージング環境でテスト
- 本番デプロイは業務時間外を推奨
- ロールバック手順を事前に確認
- 重要なデプロイは2人体制（デプロイ者 + 監視者）
