---
allowed-tools: Read, Bash(command:*)
description: Automate AWS deployment with CDK/CloudFormation/Terraform (IaC)
---

## Context

- Target: $ARGUMENTS (例: "my-app to dev environment" または "stack-name prod")
- Skill location: `.claude/skills/aws-deploy-automation/`

## Trigger Conditions (自動起動の条件)

このスキルは、以下のユーザーリクエストで自動的に起動されます：

- "AWSにデプロイして"
- "本番環境にデプロイ"
- "CDKスタックをデプロイ"
- "CloudFormationでインフラ構築"
- "Terraformでデプロイ"
- "dev/staging/prod環境にデプロイ"
- "インフラをコードで管理したい"

## Your task

### 1. ユーザーの意図を理解

ユーザーのリクエストから以下を抽出：
- デプロイツール（CDK / CloudFormation / Terraform）
- スタック名またはアプリ名
- 環境（dev / staging / production）
- その他オプション

不明な場合は、対話的に確認してください。

### 2. デプロイ前確認

以下を確認：
```bash
# AWS認証情報の確認
aws sts get-caller-identity

# 対象環境の設定ファイル確認
cat .claude/skills/aws-deploy-automation/configs/environments/${environment}.json
```

### 3. デプロイ実行

**CDKの場合:**
```bash
cd .claude/skills/aws-deploy-automation
node scripts/deploy-cdk.js <stack-name> <app-path> <environment>
```

**CloudFormationの場合:**
```bash
cd .claude/skills/aws-deploy-automation
node scripts/deploy-cloudformation.js <stack-name> <template-path> <environment>
```

**Terraformの場合:**
```bash
cd .claude/skills/aws-deploy-automation
node scripts/deploy-terraform.js <workspace> <environment>
```

### 4. 結果報告

デプロイ完了後：
- スタック名・環境を明示
- デプロイされたリソース概要
- アクセスURL（もしあれば）
- ロールバック方法の案内

### 5. エラーハンドリング

デプロイ失敗時：
- エラーメッセージを解析
- 原因を特定（IAM権限、リソース制約等）
- 解決策を提案
- 必要に応じてロールバック提案

## Example Usage

**ユーザー:** "このアプリをAWSにデプロイして"

**Claude（このスキルを自動実行）:**
1. "CDK、CloudFormation、Terraformのどれを使いますか？" → ユーザー: "CDK"
2. "環境を教えてください（dev/staging/prod）" → ユーザー: "dev"
3. デプロイ実行
4. "dev環境へのデプロイが完了しました。CloudFormationスタック: my-app-dev"

## Notes

- AWS認証情報（`aws configure`）が設定されている必要があります
- IAM権限: デプロイ対象のAWSサービスに応じて必要な権限を事前確認
- Dry-runモードで事前確認することを推奨
- 本番環境へのデプロイは慎重に確認してから実行
