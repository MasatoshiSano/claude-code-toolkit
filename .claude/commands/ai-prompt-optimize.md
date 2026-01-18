---
allowed-tools: Read, Write, Bash(command:*)
description: Optimize AI prompts with A/B testing and token optimization
---

## Context

- Target: $ARGUMENTS (例: "プロンプトを最適化" または "A/Bテスト実行")
- Skill location: `.claude/skills/ai-prompt-manager/`

## Trigger Conditions (自動起動の条件)

このスキルは、以下のユーザーリクエストで自動的に起動されます：

- "プロンプトを最適化して"
- "AIのコストを削減したい"
- "トークン使用量を減らして"
- "プロンプトのA/Bテスト"
- "プロンプトの品質を改善"
- "複数のプロンプトを比較"
- "Claude/GPTのコストが高い"

## Your task

### 1. ユーザーの意図を理解

以下のどの操作か判断：
- **A/Bテスト**: 複数プロンプトの比較実験
- **トークン最適化**: 既存プロンプトのトークン削減
- **パフォーマンス分析**: プロンプトの品質・コスト・速度分析

### 2. A/Bテストの場合

```bash
cd .claude/skills/ai-prompt-manager

# テスト対象のプロンプトを確認
ls prompts/chat/

# A/Bテスト実行
node scripts/ab-test-runner.js
```

**期待される出力:**
- 各プロンプトの品質スコア
- トークン数・コスト
- レスポンス速度
- 推奨プロンプト

### 3. トークン最適化の場合

```bash
cd .claude/skills/ai-prompt-manager

# トークン最適化提案を生成
node scripts/token-optimizer.js --prompt="prompts/chat/example.md"
```

**期待される出力:**
- 元のトークン数
- 最適化後のトークン数
- 削減率（%）
- 最適化されたプロンプトテキスト

### 4. 結果報告

**A/Bテストの場合:**
```
A/Bテスト結果:

プロンプトA: 品質85点、1000トークン、$0.03
プロンプトB: 品質87点、850トークン、$0.025

推奨: プロンプトB
理由: 品質+2点、コスト15%削減
```

**トークン最適化の場合:**
```
トークン最適化結果:

元のプロンプト: 1200トークン
最適化後: 1020トークン
削減率: 15%
年間コスト削減見込み: $1,800
```

### 5. 最適化提案の適用

最適化されたプロンプトを保存：
```bash
# 新バージョンとして保存
cp prompts/chat/example.md prompts/chat/example-v2.md

# 最適化内容を反映
# （Claudeが自動で内容を編集）
```

## Example Usage

**ユーザー:** "AIプロンプトのコストを削減したい"

**Claude（このスキルを自動実行）:**
1. "どのプロンプトを最適化しますか？" → ユーザー: "FAQチャットボット用"
2. prompts/chat/faq.md を読み込み
3. トークン最適化を実行
4. "1200トークン → 1020トークン（15%削減）に最適化しました。年間$1,800の節約見込みです"
5. 最適化版を prompts/chat/faq-v2.md に保存

## Notes

- マルチモデル対応（Claude、GPT、Gemini）
- A/Bテストには十分なテストデータが必要（configs/ab-test-configs.yamlで設定）
- トークン計測にはtiktokenライブラリを使用
- コスト計算は各モデルの公式料金に基づく
