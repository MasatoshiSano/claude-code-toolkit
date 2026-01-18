# セキュリティガイド

Claude Code Toolkitを安全に使用するためのセキュリティベストプラクティスとガイドラインです。

## 📋 目次

1. [環境変数の管理](#環境変数の管理)
2. [AWS Credentialsの安全な使用](#aws-credentialsの安全な使用)
3. [API Keysの保護](#api-keysの保護)
4. [Git管理のベストプラクティス](#git管理のベストプラクティス)
5. [本番環境での使用](#本番環境での使用)
6. [IAMポリシーの最小権限原則](#iamポリシーの最小権限原則)
7. [脆弱性の報告](#脆弱性の報告)

---

## 環境変数の管理

### ✅ すべきこと

#### 1. .envファイルの作成

```bash
# .env.exampleをコピーして.envを作成
cp .env.example .env

# .envファイルに実際の認証情報を設定
nano .env
```

#### 2. .envファイルの権限設定

```bash
# 所有者のみ読み書き可能に設定
chmod 600 .env

# 確認
ls -la .env
# -rw------- 1 user user 1234 Jan 18 10:00 .env
```

#### 3. .gitignoreの確認

`.gitignore`に以下が含まれていることを確認：

```
# Environment variables
.env
.env.local
.env.production

# AWS Credentials
.aws/credentials

# API Keys
*.pem
*.key
secrets/
```

### ❌ してはいけないこと

- **絶対にコミットしない**: `.env`ファイルをGitにコミットしない
- **平文で保存しない**: パスワードやAPIキーをソースコードにハードコーディングしない
- **公開しない**: `.env`ファイルをSlack、メール、パブリックリポジトリで共有しない

---

## AWS Credentialsの安全な使用

### 推奨される認証方法（優先順位順）

#### 1. IAM Role（最も推奨） ✨

EC2、ECS、Lambda、CodeBuildなどで実行する場合：

```yaml
# 例: GitHub Actions with OIDC
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
    aws-region: us-east-1
```

**メリット**:
- 認証情報をコードに含めない
- 自動ローテーション
- 監査ログが自動記録

#### 2. AWS SSO / IAM Identity Center（推奨）

```bash
# AWS SSOでログイン
aws sso login --profile my-profile

# 環境変数でプロファイル指定
export AWS_PROFILE=my-profile
```

#### 3. AWS CLI Profiles

```bash
# ~/.aws/credentials
[production]
aws_access_key_id = AKIA...
aws_secret_access_key = ...
region = us-east-1

[development]
aws_access_key_id = AKIA...
aws_secret_access_key = ...
region = us-west-2
```

```bash
# 使用時
export AWS_PROFILE=development
node .claude/skills/aws-cost-optimizer/scripts/cost-analyzer.js
```

#### 4. 一時的な認証情報

```bash
# AWS STSで一時認証情報を取得（12時間有効）
aws sts get-session-token --duration-seconds 43200
```

### ⚠️ 避けるべき方法

- ❌ `.env`ファイルに長期的なAccess Keyを保存
- ❌ ルートユーザーのAccess Keyを使用
- ❌ 過度な権限を持つIAMユーザーを作成

### 最小権限IAMポリシーの例

#### AWS Cost Optimizer用

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "ce:GetCostForecast",
        "ec2:DescribeInstances",
        "ec2:DescribeVolumes",
        "ec2:DescribeAddresses",
        "rds:DescribeDBInstances",
        "elasticloadbalancing:DescribeLoadBalancers"
      ],
      "Resource": "*"
    }
  ]
}
```

#### Serverless Optimizer用

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
        "apigateway:GET",
        "dynamodb:DescribeTable",
        "dynamodb:ListTables"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## API Keysの保護

### Anthropic API Key（Claude）

#### ✅ 安全な使用方法

```javascript
// Good: 環境変数から読み込み
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY is not set');
}

const client = new Anthropic({ apiKey });
```

#### ❌ 危険な使用方法

```javascript
// Bad: ハードコーディング
const client = new Anthropic({
  apiKey: 'sk-ant-api03-xxxxxxxxxx' // 絶対にしない！
});
```

### OpenAI API Key

同様に環境変数で管理：

```javascript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
```

### API Key Rotation（定期的な更新）

```bash
# 1. 新しいAPI Keyを生成
# 2. .envファイルを更新
# 3. アプリケーションを再起動
# 4. 古いAPI Keyを無効化
```

**推奨頻度**: 90日ごと

---

## Git管理のベストプラクティス

### コミット前チェックリスト

```bash
# 1. .envファイルが含まれていないか確認
git status

# 2. 機密情報がないかgrepで検索
git diff | grep -E "(API_KEY|SECRET|PASSWORD|TOKEN)"

# 3. git-secretsを使用（推奨）
git secrets --scan
```

### git-secretsのセットアップ

```bash
# インストール（macOS）
brew install git-secrets

# プロジェクトに設定
cd /path/to/claude-code-toolkit
git secrets --install

# AWSパターンを追加
git secrets --register-aws

# カスタムパターンを追加
git secrets --add 'ANTHROPIC_API_KEY.*sk-ant-api03-[a-zA-Z0-9]{96}'
git secrets --add 'OPENAI_API_KEY.*sk-[a-zA-Z0-9]{48}'
```

### 誤ってコミットした場合の対処

#### ⚠️ まだpushしていない場合

```bash
# 最新のコミットから.envを削除
git rm --cached .env
git commit --amend

# または履歴全体から削除
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

#### 🚨 既にpushしてしまった場合

1. **即座にAPI Keyを無効化**
   ```bash
   # Anthropic Console: https://console.anthropic.com/
   # OpenAI Platform: https://platform.openai.com/api-keys
   # AWS IAM: aws iam delete-access-key --access-key-id AKIA...
   ```

2. **新しいAPI Keyを生成**

3. **GitHubに連絡（パブリックリポジトリの場合）**
   - GitHub Support: https://support.github.com/

4. **BFG Repo-Cleanerで履歴削除**
   ```bash
   # https://rtyley.github.io/bfg-repo-cleaner/
   bfg --replace-text passwords.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

---

## 本番環境での使用

### 環境の分離

```bash
# 開発環境
.env.development

# ステージング環境
.env.staging

# 本番環境
.env.production
```

```javascript
// 環境別の.envファイル読み込み
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});
```

### Secrets Manager / Parameter Storeの使用（推奨）

#### AWS Secrets Manager

```javascript
const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require('@aws-sdk/client-secrets-manager');

async function getSecret(secretName) {
  const client = new SecretsManagerClient({ region: 'us-east-1' });

  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );

  return JSON.parse(response.SecretString);
}

// 使用例
const secrets = await getSecret('prod/claude-toolkit/api-keys');
const apiKey = secrets.ANTHROPIC_API_KEY;
```

#### AWS Systems Manager Parameter Store

```bash
# パラメータを保存（暗号化）
aws ssm put-parameter \
  --name "/prod/claude-toolkit/anthropic-api-key" \
  --value "sk-ant-api03-xxxxxx" \
  --type "SecureString"

# パラメータを取得
aws ssm get-parameter \
  --name "/prod/claude-toolkit/anthropic-api-key" \
  --with-decryption
```

```javascript
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

async function getParameter(name) {
  const client = new SSMClient({ region: 'us-east-1' });

  const response = await client.send(
    new GetParameterCommand({
      Name: name,
      WithDecryption: true
    })
  );

  return response.Parameter.Value;
}
```

---

## IAMポリシーの最小権限原則

### 基本原則

1. **必要最小限の権限のみ付与**
2. **リソースベースの制限を使用**
3. **条件を活用**

### 条件付きポリシーの例

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeVolumes"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": ["us-east-1", "us-west-2"]
        },
        "DateGreaterThan": {
          "aws:CurrentTime": "2026-01-01T00:00:00Z"
        },
        "DateLessThan": {
          "aws:CurrentTime": "2026-12-31T23:59:59Z"
        }
      }
    }
  ]
}
```

### タグベースのアクセス制御

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ec2:*"],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "ec2:ResourceTag/Environment": "development"
        }
      }
    }
  ]
}
```

---

## 脆弱性の報告

セキュリティ上の問題を発見した場合：

### 報告先

**メール**: security@yourproject.com （非公開）

### 報告すべき内容

- 脆弱性の詳細な説明
- 再現手順
- 影響範囲
- 可能であれば修正案

### 報告してはいけないこと

- ❌ GitHubのPublic Issueで報告
- ❌ SNSで公開
- ❌ 悪用

### 対応フロー

1. **24時間以内**: 受領確認
2. **7日以内**: 初期評価と影響範囲の特定
3. **30日以内**: 修正版のリリース（重大度に応じて短縮）
4. **修正後**: クレジット記載（希望者のみ）

---

## セキュリティチェックリスト

定期的に以下を確認してください：

- [ ] `.env`ファイルが`.gitignore`に含まれている
- [ ] AWS Access Keyが90日以内に更新されている
- [ ] API Keyが定期的にローテーションされている
- [ ] IAMポリシーが最小権限に設定されている
- [ ] 未使用のIAMユーザー/Access Keyが削除されている
- [ ] CloudTrailでAPI呼び出しが監視されている
- [ ] セキュリティグループが適切に設定されている
- [ ] 依存パッケージが最新（`npm audit`を実行）

---

## 参考リソース

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [Anthropic API Security](https://docs.anthropic.com/claude/reference/security)
- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)
