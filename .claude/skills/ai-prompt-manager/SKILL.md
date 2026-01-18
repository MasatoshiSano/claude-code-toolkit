---
name: ai-prompt-manager
description:
  Manage, version control, and optimize AI prompts with A/B testing and
  performance analysis
version: 1.0.0
author: Claude Code Toolkit
license: MIT
tags:
  - ai
  - prompts
  - optimization
  - ab-testing
  - claude
  - gpt
  - llm
requires:
  - node>=16
  - python>=3.8
---

# AI Prompt Manager Agent Skill

## Purpose

このスキルは、AI
APIプロンプトの一元管理、バージョン管理、A/Bテスト、パフォーマンス分析を提供します。プロンプトの品質向上とコスト最適化を実現し、複数のAIモデル（Claude、GPT、Gemini等）に対応します。

## When to Use

- AI APIを使用するアプリケーションの開発
- プロンプトの品質を改善したい時
- トークン使用量を削減したい時
- 複数のプロンプトバージョンをテストしたい時
- プロンプトのパフォーマンスを追跡したい時

## Architecture

```
scripts/
├── prompt-validator.js        # プロンプト検証
├── ab-test-runner.js          # A/Bテスト実行
├── token-optimizer.js         # トークン最適化
├── performance-analyzer.js    # パフォーマンス分析
├── cost-calculator.js         # コスト計算
└── export-to-langchain.js     # LangChain形式エクスポート

templates/
├── prompt-template.md         # 汎用プロンプトテンプレート
├── system-prompt-template.md  # システムプロンプトテンプレート
├── few-shot-template.md       # Few-shotテンプレート
└── chain-of-thought-template.md  # Chain-of-Thoughtテンプレート

prompts/
├── chat/                      # チャット用プロンプト
│   ├── customer-support-v1.md
│   ├── customer-support-v2.md
│   └── code-assistant-v1.md
├── completion/                # 補完用プロンプト
│   ├── code-generation-v1.md
│   └── text-summarization-v1.md
└── embeddings/                # Embedding用
    └── semantic-search-v1.md

configs/
├── prompt-registry.json       # プロンプト登録情報
├── model-configs.json         # モデル設定
├── ab-test-configs.yaml       # A/Bテスト設定
└── optimization-rules.json    # 最適化ルール
```

## Instructions

### Phase 1: Prompt Creation and Management

#### 1.1 プロンプトテンプレートの構造

**基本構造:**

```markdown
---
id: customer-support-v1
name: Customer Support Assistant
version: 1.0.0
model: claude-3-5-sonnet-20250205
temperature: 0.7
max_tokens: 1000
tags:
  - customer-support
  - chat
created: 2025-01-16
author: engineering-team
---

# System Prompt

You are a helpful customer support assistant for [Company Name]. Your goal is to
assist customers with their questions and issues in a friendly, professional
manner.

## Guidelines

1. Always be polite and empathetic
2. Provide clear, concise answers
3. If you don't know something, admit it and offer to escalate
4. Use the customer's name when appropriate
5. End responses with "Is there anything else I can help you with?"

## Response Format

- Start with a greeting
- Address the customer's concern
- Provide step-by-step solutions when applicable
- Close with a follow-up question

## Constraints

- Keep responses under 200 words
- Avoid technical jargon
- Never make promises you can't keep
- Do not provide personal opinions

# User Prompt Template

{{user_message}}

# Examples

## Example 1: Order Status Inquiry

User: "Where is my order #12345?" Assistant: "Hi! I'd be happy to help you track
your order #12345.

I can see that your order was shipped yesterday via UPS and is currently in
transit. The expected delivery date is January 18th. You can track it using this
link: [tracking_link]

Is there anything else I can help you with today?"

## Example 2: Product Question

User: "Does this product come in blue?" Assistant: "Hi there! Let me check the
available colors for you.

Yes, this product is available in blue, along with red, black, and white. Would
you like me to add the blue version to your cart?

Is there anything else I can help you with?"
```

#### 1.2 プロンプトレジストリへの登録

**prompt-registry.json:**

```json
{
  "prompts": [
    {
      "id": "customer-support-v1",
      "name": "Customer Support Assistant",
      "file": "prompts/chat/customer-support-v1.md",
      "status": "active",
      "model": "claude-3-5-sonnet-20250205",
      "version": "1.0.0",
      "tags": ["customer-support", "chat"],
      "metrics": {
        "avgTokens": 1234,
        "avgLatency": 1.2,
        "avgCost": 0.012,
        "qualityScore": 4.2
      },
      "deployment": {
        "production": false,
        "staging": true,
        "abTestGroup": "A"
      }
    },
    {
      "id": "customer-support-v2",
      "name": "Customer Support Assistant (Optimized)",
      "file": "prompts/chat/customer-support-v2.md",
      "status": "testing",
      "model": "claude-3-5-sonnet-20250205",
      "version": "2.0.0",
      "tags": ["customer-support", "chat"],
      "parentVersion": "customer-support-v1",
      "changes": ["Reduced token count by 15%", "Improved clarity"],
      "deployment": {
        "production": false,
        "staging": true,
        "abTestGroup": "B"
      }
    }
  ]
}
```

### Phase 2: A/B Testing

#### 2.1 A/Bテスト設定

**ab-test-configs.yaml:**

```yaml
tests:
  - name: customer-support-optimization
    description: Test optimized prompt vs original
    startDate: 2025-01-16
    endDate: 2025-01-23
    groups:
      A:
        promptId: customer-support-v1
        trafficPercent: 50
      B:
        promptId: customer-support-v2
        trafficPercent: 50
    metrics:
      primary:
        - name: qualityScore
          target: '> 4.0'
          weight: 0.5
      secondary:
        - name: avgTokens
          target: '< 1200'
          weight: 0.2
        - name: avgLatency
          target: '< 1.5s'
          weight: 0.2
        - name: cost
          target: '< $0.015'
          weight: 0.1
    sampleSize: 1000
    significanceLevel: 0.05
```

#### 2.2 A/Bテスト実行

```bash
# A/Bテスト開始
agent ai-prompt-manager ab-test start --config=customer-support-optimization

# 出力例:
# ✓ A/B Test Started
# Test ID: ab-test-1234
# Group A: customer-support-v1 (50% traffic)
# Group B: customer-support-v2 (50% traffic)
# Sample size: 1000 requests
# Expected duration: 7 days
#
# Monitoring dashboard: https://app.example.com/ab-test/1234
```

#### 2.3 結果分析

```javascript
// performance-analyzer.js
async function analyzeABTest(testId) {
  const results = {
    groupA: {
      promptId: 'customer-support-v1',
      samples: 500,
      metrics: {
        qualityScore: 4.2,
        avgTokens: 1234,
        avgLatency: 1.2,
        avgCost: 0.012,
        errorRate: 0.5
      }
    },
    groupB: {
      promptId: 'customer-support-v2',
      samples: 500,
      metrics: {
        qualityScore: 4.4,
        avgTokens: 1050,
        avgLatency: 1.1,
        avgCost: 0.01,
        errorRate: 0.3
      }
    },
    comparison: {
      qualityScore: {
        improvement: '+4.8%',
        pValue: 0.02,
        significant: true
      },
      avgTokens: {
        improvement: '-14.9%',
        pValue: 0.001,
        significant: true
      },
      avgCost: {
        improvement: '-16.7%',
        pValue: 0.001,
        significant: true
      }
    },
    recommendation: 'Deploy customer-support-v2 to production',
    estimatedMonthlySavings: '$4,320'
  };

  return results;
}
```

**出力レポート:**

```markdown
# A/B Test Results: customer-support-optimization

## Summary

- **Winner**: Group B (customer-support-v2)
- **Confidence**: 95% (p-value < 0.05)
- **Recommendation**: Deploy to production

## Metrics Comparison

| Metric        | Group A (v1) | Group B (v2) | Change | Significant |
| ------------- | ------------ | ------------ | ------ | ----------- |
| Quality Score | 4.2/5        | 4.4/5        | +4.8%  | ✅ Yes      |
| Avg Tokens    | 1,234        | 1,050        | -14.9% | ✅ Yes      |
| Avg Latency   | 1.2s         | 1.1s         | -8.3%  | ✅ Yes      |
| Avg Cost      | $0.012       | $0.010       | -16.7% | ✅ Yes      |
| Error Rate    | 0.5%         | 0.3%         | -40.0% | ✅ Yes      |

## Impact Analysis

- **Quality**: Improved (+0.2 points)
- **Performance**: 8.3% faster
- **Cost**: 16.7% cheaper

**Estimated monthly savings**: $4,320 (Based on 360,000 requests/month)

## User Feedback

- Group A: 82% positive
- Group B: 89% positive (+8.5%)

## Recommendation

✅ **Deploy customer-support-v2 to production immediately**

This version shows statistically significant improvements across all metrics
with no downsides. Expected ROI: $51,840/year in cost savings plus improved
customer satisfaction.
```

### Phase 3: Token Optimization

#### 3.1 トークンカウント分析

```javascript
// token-optimizer.js
function analyzeTokenUsage(prompt) {
  const analysis = {
    total: 1234,
    breakdown: {
      systemPrompt: 450,
      instructions: 320,
      examples: 380,
      userMessage: 84
    },
    optimizations: [
      {
        type: 'Remove redundancy',
        location: 'Instructions section',
        current: 'Be polite and professional. Always maintain a polite tone.',
        suggested: 'Be polite and professional.',
        tokensSaved: 8,
        impact: 'low'
      },
      {
        type: 'Simplify examples',
        location: 'Example 1',
        current: '(verbose example with 150 tokens)',
        suggested: '(concise example with 90 tokens)',
        tokensSaved: 60,
        impact: 'medium'
      },
      {
        type: 'Remove unnecessary formatting',
        location: 'Guidelines',
        tokensSaved: 15,
        impact: 'low'
      }
    ],
    estimatedSavings: {
      tokens: 183,
      percentage: '14.8%',
      costPerRequest: '$0.0018',
      monthlySavings: '$648' // 360,000 requests/month
    }
  };

  return analysis;
}
```

#### 3.2 自動最適化提案

```bash
# トークン最適化分析
agent ai-prompt-manager optimize --prompt=customer-support-v1

# 出力:
# 🔍 Token Optimization Analysis
#
# Current token count: 1,234
# Optimized token count: 1,051 (-183 tokens, -14.8%)
#
# Optimizations found:
# 1. Remove redundant instructions (8 tokens)
# 2. Simplify examples (60 tokens)
# 3. Remove unnecessary formatting (15 tokens)
# 4. Consolidate guidelines (45 tokens)
# 5. Optimize system prompt (55 tokens)
#
# Estimated savings:
# - Per request: $0.0018
# - Monthly (360k requests): $648
# - Yearly: $7,776
#
# Apply optimizations? [y/N]: y
#
# ✓ Optimizations applied
# ✓ Created customer-support-v2 with optimizations
# ✓ Ready for A/B testing
```

### Phase 4: Performance Monitoring

#### 4.1 リアルタイム監視

```javascript
// Real-time metrics dashboard
const metrics = {
  realtime: {
    requestsPerMinute: 45,
    avgLatency: 1.2,
    errorRate: 0.3,
    p95Latency: 2.1,
    p99Latency: 3.5
  },
  today: {
    totalRequests: 12450,
    totalTokens: 15356700,
    totalCost: 153.57,
    avgQualityScore: 4.2
  },
  thisWeek: {
    totalRequests: 85200,
    totalTokens: 105144000,
    totalCost: 1051.44,
    avgQualityScore: 4.3,
    trend: '+5.2%'
  },
  alerts: [
    {
      level: 'warning',
      message: 'Error rate increased to 0.8% (threshold: 0.5%)',
      timestamp: '2025-01-16T14:30:00Z',
      promptId: 'code-generation-v1'
    }
  ]
};
```

#### 4.2 コスト追跡

```bash
# 月次コストレポート
agent ai-prompt-manager cost-report --period=monthly

# 出力:
# 📊 AI Cost Report: January 2025
#
# Total Cost: $4,234.56
# Total Requests: 360,000
# Total Tokens: 444,240,000
#
# By Model:
# - Claude 3.5 Sonnet: $3,120.34 (73.7%)
# - Claude 3 Haiku: $892.12 (21.1%)
# - GPT-4: $222.10 (5.2%)
#
# By Prompt:
# 1. customer-support: $2,450.00 (57.8%)
# 2. code-assistant: $1,120.50 (26.5%)
# 3. text-summarization: $664.06 (15.7%)
#
# Cost Trends:
# - vs Last Month: -12.3% ✅
# - vs Budget: Within budget ($5,000)
#
# Top Optimization Opportunities:
# 1. Optimize customer-support-v1: Save $420/month
# 2. Switch code-assistant to Haiku: Save $680/month
# 3. Cache system prompts: Save $210/month
```

### Phase 5: Multi-Model Support

#### 5.1 モデル設定

**model-configs.json:**

```json
{
  "models": [
    {
      "id": "claude-3-5-sonnet-20250205",
      "provider": "anthropic",
      "name": "Claude 3.5 Sonnet",
      "pricing": {
        "input": 0.003,
        "output": 0.015
      },
      "limits": {
        "maxTokens": 8192,
        "maxContextWindow": 200000
      },
      "features": ["vision", "tool-use"],
      "recommended": ["complex-reasoning", "code-generation"]
    },
    {
      "id": "claude-3-haiku-20250205",
      "provider": "anthropic",
      "name": "Claude 3 Haiku",
      "pricing": {
        "input": 0.00025,
        "output": 0.00125
      },
      "limits": {
        "maxTokens": 4096,
        "maxContextWindow": 200000
      },
      "features": ["fast-response"],
      "recommended": ["simple-tasks", "high-volume"]
    },
    {
      "id": "gpt-4-turbo",
      "provider": "openai",
      "name": "GPT-4 Turbo",
      "pricing": {
        "input": 0.01,
        "output": 0.03
      },
      "limits": {
        "maxTokens": 4096,
        "maxContextWindow": 128000
      },
      "features": ["vision", "json-mode"]
    }
  ]
}
```

#### 5.2 モデル選択の最適化

```javascript
function recommendModel(task) {
  const recommendations = {
    'customer-support': {
      recommended: 'claude-3-haiku-20250205',
      reason: 'Fast response, lower cost, sufficient quality',
      alternatives: [
        {
          model: 'claude-3-5-sonnet-20250205',
          reason: 'Higher quality but 12x more expensive',
          useCase: 'Complex customer issues'
        }
      ]
    },
    'code-generation': {
      recommended: 'claude-3-5-sonnet-20250205',
      reason: 'Best code quality and reasoning',
      alternatives: []
    },
    'text-summarization': {
      recommended: 'claude-3-haiku-20250205',
      reason: 'Fast, cost-effective, good quality',
      alternatives: []
    }
  };

  return recommendations[task];
}
```

### Phase 6: Integration

#### 6.1 アプリケーションへの統合

```typescript
// Example: TypeScript integration
import { PromptManager } from '@ai-prompt-manager/sdk';

const promptManager = new PromptManager({
  registryPath: '.claude/skills/ai-prompt-manager/configs/prompt-registry.json',
  enableABTesting: true,
  enableMetrics: true
});

// プロンプトを取得
const prompt = await promptManager.getPrompt('customer-support', {
  version: 'latest', // または 'v1', 'v2'
  abTestGroup: 'auto' // 自動A/Bテストグループ割り当て
});

// AI APIを呼び出し
const response = await anthropic.messages.create({
  model: prompt.model,
  max_tokens: prompt.maxTokens,
  temperature: prompt.temperature,
  system: prompt.systemPrompt,
  messages: [
    {
      role: 'user',
      content: promptManager.fillTemplate(prompt.userTemplate, {
        user_message: userInput
      })
    }
  ]
});

// メトリクスを記録
await promptManager.recordMetrics({
  promptId: prompt.id,
  tokens: response.usage.input_tokens + response.usage.output_tokens,
  latency: responseTime,
  cost: calculateCost(response.usage)
});
```

## Error Handling

### Level 1: Recoverable Errors

- **プロンプトファイルが見つからない**: デフォルトプロンプトを使用
- **メトリクス記録失敗**: ローカルキャッシュに保存、後でリトライ

### Level 2: User Intervention Required

- **A/Bテストのサンプルサイズ不足**: テスト期間延長を提案
- **統計的有意差なし**: より長期のテストを推奨

### Level 3: Critical Errors

- **プロンプトレジストリ破損**: バックアップから復元
- **API認証失敗**: 認証情報の再設定を要求

## Performance Notes

- プロンプトキャッシング: 頻繁に使用するプロンプトをメモリにキャッシュ
- バッチメトリクス記録: 1秒ごとにまとめて記録
- 非同期A/Bテスト: メイン処理をブロックしない

## Dependencies

- Node.js >= 16
- Python >= 3.8（分析スクリプト用）
- AI SDK（Anthropic SDK、OpenAI SDK等）

## Best Practices

1. **バージョン管理**: すべてのプロンプト変更をGitで管理
2. **A/Bテスト**: 本番デプロイ前に必ずテスト
3. **メトリクス追跡**: 継続的な品質・コスト監視
4. **ドキュメント化**: プロンプトの意図と変更理由を記録
5. **モデル選択**: タスクに応じて最適なモデルを使用

## Related Skills

- `code-quality-suite`: プロンプト品質のレビュー
- `technical-blog-generator`: プロンプト最適化の知見を記事化

## Examples

### ✅ Good Example: A/B Test Success

```bash
Input: agent ai-prompt-manager ab-test start --prompt=customer-support

Output:
✓ A/B Test configured
  Group A: customer-support-v1
  Group B: customer-support-v2
  Duration: 7 days
  Sample size: 1000

After 7 days:
✓ Test completed
  Winner: Group B (customer-support-v2)
  Improvement: -14.9% tokens, +4.8% quality
  Savings: $648/month
  Recommendation: Deploy to production
```

## Notes

- プロンプトの変更は段階的に（一度に多くを変更しない）
- ユーザーフィードバックも品質評価に含める
- コスト最適化と品質のバランスを取る
