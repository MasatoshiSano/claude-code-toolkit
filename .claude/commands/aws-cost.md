---
allowed-tools: Read, Write, Bash(command:*)
description: Analyze and optimize AWS costs with automated recommendations
---

## Context

- Target: $ARGUMENTS (例: "AWSコストを削減" または "未使用リソース検出")
- Skill location: `.claude/skills/aws-cost-optimizer/`

## Trigger Conditions (自動起動の条件)

このスキルは、以下のユーザーリクエストで自動的に起動されます：

- "AWSのコストを削減したい"
- "AWSの請求額が高い"
- "未使用リソースを見つけて"
- "AWS予算を管理"
- "Reserved Instance提案"
- "AWSコスト分析"
- "クラウドコストを最適化"

## Your task

### 1. ユーザーの意図を理解

以下のどの操作か判断：
- **コスト分析**: Service/Tag/環境別のコスト可視化
- **未使用リソース検出**: EC2、EBS、EIP等の検出
- **最適化提案**: Reserved Instance、適正サイズ推奨

### 2. コスト分析の場合

```bash
cd .claude/skills/aws-cost-optimizer
node scripts/cost-analyzer.js
```

**期待される出力:**
- Service別コスト（EC2、RDS、S3等）
- Tag別コスト配分
- 月間コストトレンド

### 3. 未使用リソース検出の場合

```bash
cd .claude/skills/aws-cost-optimizer
node scripts/unused-resource-detector.js
```

**期待される出力:**
- 未使用EC2インスタンス
- 未接続EBS ボリューム
- 未割り当てElastic IP
- 削減可能コスト

### 4. 最適化提案生成

```bash
cd .claude/skills/aws-cost-optimizer
node scripts/report-generator.js
```

**期待される出力:**
- Reserved Instance購入推奨
- 適正サイズダウン提案
- 予想削減額

### 5. 結果報告

**例:**
```
AWSコスト分析結果:
月間コスト: $5,000

最適化提案:
1. 未使用EC2 5台削除 → $500/月削減
2. Reserved Instance購入 → $1,300/月削減（30%）
3. RDS t3.large→t3.medium → $200/月削減

合計削減見込み: $1,800/月（36%削減）
年間: $21,600節約
```

## Example Usage

**ユーザー:** "AWSの請求額が高いから削減したい"

**Claude（このスキルを自動実行）:**
1. AWS Cost Explorerでコスト分析
2. 未使用リソース検出
3. "月$5,000のコストを$3,200に削減できます（36%削減）。未使用EC2の削除とReserved Instance購入を推奨します"

## Notes

- AWS Cost Explorer APIを使用
- IAM権限: ce:GetCostAndUsage、ce:GetReservationPurchaseRecommendation等が必要
- タグベースのコスト配分にはタグ付けが必要
- 予算アラート自動設定可能
