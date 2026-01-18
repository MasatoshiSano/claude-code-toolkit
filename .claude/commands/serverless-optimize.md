---
allowed-tools: Read, Write, Bash(command:*)
description: Optimize serverless architecture (Lambda, API Gateway, Step Functions, DynamoDB)
---

## Context

- Target: $ARGUMENTS (例: "Lambda最適化" または "コールドスタート削減")
- Skill location: `.claude/skills/serverless-optimizer/`

## Trigger Conditions (自動起動の条件)

このスキルは、以下のユーザーリクエストで自動的に起動されます：

- "Lambdaのコストを削減"
- "コールドスタートが遅い"
- "Lambda関数を最適化"
- "DynamoDBのコストが高い"
- "サーバーレスを最適化"
- "API Gatewayのレスポンスが遅い"
- "Step Functionsを改善"

## Your task

### 1. ユーザーの意図を理解

以下のどの操作か判断：
- **Lambda最適化**: メモリ/タイムアウト最適化
- **コールドスタート削減**: Provisioned Concurrency、Layers活用
- **DynamoDB最適化**: 適正キャパシティ設定
- **包括的分析**: すべてのサーバーレスコンポーネント分析

### 2. Lambda最適化の場合

```bash
cd .claude/skills/serverless-optimizer
node scripts/lambda-optimizer.js
```

**期待される出力:**
- 各関数の現在のメモリ/タイムアウト設定
- 推奨設定
- コスト削減見込み

### 3. コールドスタート分析の場合

```bash
cd .claude/skills/serverless-optimizer
node scripts/coldstart-analyzer.js
```

**期待される出力:**
- コールドスタート時間
- 改善提案（Provisioned Concurrency、Layers等）
- レスポンス改善見込み

### 4. コスト計算

```bash
cd .claude/skills/serverless-optimizer
node scripts/cost-calculator.js
```

**期待される出力:**
- 現在のコスト
- 最適化後のコスト
- 削減率

### 5. 結果報告

**例:**
```
Lambda最適化結果:
月間実行コスト: $2,000

最適化提案:
1. 関数A: 1024MB→256MB → $400/月削減
2. 関数B: タイムアウト900秒→5秒 → $100/月削減
3. 関数C: Provisioned Concurrency設定 → コールドスタート2秒→0.3秒

合計削減見込み: $1,000/月（50%削減）
レスポンス: 85%改善
```

## Example Usage

**ユーザー:** "Lambdaのコストが高いから最適化したい"

**Claude（このスキルを自動実行）:**
1. 全Lambda関数のメトリクスを収集
2. 使用率から最適メモリサイズを算出
3. "月$2,000のコストを$1,000に削減できます（50%削減）。メモリ設定の最適化を推奨します"

## Notes

- CloudWatch Logsからメトリクス収集
- IAM権限: lambda:GetFunction、cloudwatch:GetMetricStatistics等が必要
- Provisioned Concurrency設定は追加コストに注意
- DynamoDBはProvisioned vs On-Demandの比較分析
