# AI Prompt Manager

Manage, version control, and optimize AI prompts with A/B testing and performance analysis.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [Prompt Templates](#prompt-templates)
- [A/B Testing Strategies](#ab-testing-strategies)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Related Documentation](#related-documentation)

## Overview

**Status**: 🚧 Planned (Phase 2 - Q2 2026)
**Supported Providers**: Anthropic (Claude), OpenAI (GPT), Google (Gemini)

This skill provides comprehensive prompt management with version control, A/B testing, token optimization, and performance tracking for AI applications.

## ✨ Features

### Prompt Management

- ✅ Version control for prompts with Git integration
- ✅ Prompt registry with metadata (model, temperature, max_tokens)
- ✅ Template-based prompt creation
- ✅ Multi-provider support (Claude, GPT, Gemini)

### A/B Testing

- ✅ Compare multiple prompt versions
- ✅ Measure quality, cost, and speed
- ✅ Statistical significance analysis
- ✅ Automated winner selection

### Token Optimization

- ✅ Analyze token usage across prompts
- ✅ Suggest optimizations (average 15% reduction)
- ✅ Track token costs by model
- ✅ Identify redundant content

### Performance Tracking

- ✅ Response time monitoring
- ✅ Cost tracking per prompt version
- ✅ Quality metrics (hallucination rate, accuracy)
- ✅ Historical performance reports

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
cd .claude/skills/ai-prompt-manager
npm install
```

### Prerequisites

- Node.js >= 16
- Python >= 3.8 (for advanced analytics)
- API keys for AI providers

### Required API Keys

Set up your API keys as environment variables:

```bash
# Anthropic (Claude)
export ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (GPT)
export OPENAI_API_KEY=sk-...

# Google (Gemini) - optional
export GOOGLE_API_KEY=...
```

## 🚀 Quick Start

### 1. Create Your First Prompt

```bash
# Create a new prompt from template
cp templates/prompt-template.md prompts/chat/my-assistant-v1.md

# Edit the prompt
vim prompts/chat/my-assistant-v1.md
```

**Example prompt (`my-assistant-v1.md`):**

```markdown
---
id: code-assistant-v1
name: Code Review Assistant
version: 1.0.0
model: claude-3-5-sonnet-20250205
temperature: 0.3
max_tokens: 2000
tags:
  - code-review
  - development
---

# System Prompt

You are an expert code reviewer. Analyze the provided code and provide:
1. Security vulnerabilities
2. Performance issues
3. Code style improvements
4. Best practice recommendations

Be concise and actionable.
```

### 2. Run A/B Test

```bash
# Compare two prompt versions
node scripts/ab-test-runner.js \
  --prompts prompts/chat/my-assistant-v1.md,prompts/chat/my-assistant-v2.md \
  --model claude-3-5-sonnet-20250205 \
  --test-inputs test-data/code-samples.json
```

### 3. Optimize Token Usage

```bash
# Analyze and optimize a prompt
node scripts/token-optimizer.js \
  --prompt prompts/chat/my-assistant-v1.md \
  --model gpt-4
```

## 📖 Usage Examples

### Example 1: A/B Testing Two Prompts

Compare a concise vs. detailed prompt for code review:

```bash
# Run A/B test
node scripts/ab-test-runner.js \
  --prompts prompts/chat/code-review-concise-v1.md,prompts/chat/code-review-detailed-v1.md \
  --model claude-3-5-sonnet-20250205 \
  --test-inputs test-data/code-review-samples.json \
  --iterations 50

# Output:
# ✓ Running A/B test with 2 prompts and 50 iterations...
#
# Results:
# ┌──────────────┬──────────┬──────────┬──────────┬────────────┐
# │ Prompt       │ Quality  │ Avg Cost │ Avg Time │ Winner     │
# ├──────────────┼──────────┼──────────┼──────────┼────────────┤
# │ Concise v1   │ 85/100   │ $0.012   │ 1.2s     │            │
# │ Detailed v1  │ 92/100   │ $0.018   │ 1.8s     │ ✓ (p<0.05) │
# └──────────────┴──────────┴──────────┴──────────┴────────────┘
#
# Recommendation: Use "Detailed v1"
# - 8% higher quality (statistically significant)
# - 50% higher cost ($0.006 more per request)
# - 50% slower (0.6s more per request)
# - Best for: High-quality code reviews where accuracy > cost
```

### Example 2: Token Optimization

Reduce token usage while maintaining quality:

```bash
# Analyze current token usage
node scripts/token-optimizer.js \
  --prompt prompts/completion/text-summarization-v1.md \
  --model gpt-4

# Output:
# ✓ Analyzing prompt...
#
# Current Token Usage: 850 tokens
#
# Optimization Suggestions:
#
# 1. Remove Redundancy (-120 tokens, 14% reduction)
#    Before: "Please utilize the following guidelines in order to..."
#    After:  "Use these guidelines to..."
#
# 2. Simplify Language (-85 tokens, 10% reduction)
#    Before: "In the event that you encounter..."
#    After:  "If you encounter..."
#
# 3. Remove Excessive Examples (-150 tokens, 18% reduction)
#    Suggestion: Keep 2-3 examples instead of 8
#
# Total Savings: 355 tokens (42% reduction)
# Cost Savings: $0.0071 per request (GPT-4 pricing)
# Monthly Savings: $213 (30,000 requests/month)
#
# ✓ Optimized prompt saved to: prompts/completion/text-summarization-v2-optimized.md
```

### Example 3: Performance Tracking

Track prompt performance over time:

```bash
# Analyze prompt performance
node scripts/performance-analyzer.js \
  --prompt-id code-assistant-v1 \
  --period 30days

# Output:
# ✓ Analyzing performance for last 30 days...
#
# Prompt: code-assistant-v1
# Total Requests: 15,420
#
# Quality Metrics:
# - Average Score: 88/100
# - Hallucination Rate: 2.3%
# - User Satisfaction: 4.6/5.0
#
# Cost Metrics:
# - Total Cost: $462.50
# - Avg Cost/Request: $0.030
# - Trend: ↓ 5% vs. previous month
#
# Performance Metrics:
# - Avg Response Time: 1.4s
# - 95th Percentile: 2.8s
# - Trend: ↑ 12% vs. previous month (degradation)
#
# Recommendations:
# 1. Consider optimizing prompt to reduce response time
# 2. Quality score is stable and high - maintain current approach
# 3. Cost reduction due to GPT-4 Turbo adoption
```

### Example 4: Multi-Provider Comparison

Compare the same prompt across different providers:

```bash
# Compare across Claude, GPT, and Gemini
node scripts/ab-test-runner.js \
  --prompt prompts/chat/customer-support-v1.md \
  --models claude-3-5-sonnet-20250205,gpt-4,gemini-pro \
  --test-inputs test-data/customer-queries.json

# Output:
# ✓ Testing across 3 providers with 20 test inputs...
#
# Results:
# ┌──────────────────┬──────────┬──────────┬──────────┬──────────┐
# │ Model            │ Quality  │ Avg Cost │ Avg Time │ Winner   │
# ├──────────────────┼──────────┼──────────┼──────────┼──────────┤
# │ Claude Sonnet    │ 92/100   │ $0.015   │ 0.9s     │ ✓        │
# │ GPT-4            │ 89/100   │ $0.030   │ 1.5s     │          │
# │ Gemini Pro       │ 85/100   │ $0.008   │ 1.2s     │          │
# └──────────────────┴──────────┴──────────┴──────────┴──────────┘
#
# Winner: Claude 3.5 Sonnet
# - Best quality (92/100)
# - 50% cheaper than GPT-4
# - Fastest response time
```

## ⚙️ Configuration

### Prompt Registry

Edit `configs/prompt-registry.json`:

```json
{
  "prompts": [
    {
      "id": "code-assistant-v1",
      "path": "prompts/chat/code-assistant-v1.md",
      "model": "claude-3-5-sonnet-20250205",
      "version": "1.0.0",
      "status": "active",
      "deployedAt": "2026-01-15T10:00:00Z",
      "metrics": {
        "avgQuality": 88,
        "avgCost": 0.030,
        "avgResponseTime": 1.4
      }
    }
  ]
}
```

### A/B Test Configuration

Edit `configs/ab-test-configs.yaml`:

```yaml
ab_tests:
  code-review-test:
    prompts:
      - prompts/chat/code-review-concise-v1.md
      - prompts/chat/code-review-detailed-v1.md
    models:
      - claude-3-5-sonnet-20250205
    test_inputs: test-data/code-samples.json
    iterations: 50
    metrics:
      quality:
        weight: 0.6
        measurement: user_rating # or accuracy, hallucination_rate
      cost:
        weight: 0.2
        threshold: 0.05 # Max $0.05 per request
      speed:
        weight: 0.2
        threshold: 3.0 # Max 3 seconds
    winner_criteria:
      min_quality_improvement: 5 # Must be 5% better
      significance_level: 0.05 # p-value < 0.05
```

### Optimization Rules

Edit `configs/optimization-rules.json`:

```json
{
  "rules": [
    {
      "name": "remove-redundancy",
      "enabled": true,
      "patterns": [
        {
          "from": "please utilize",
          "to": "use"
        },
        {
          "from": "in order to",
          "to": "to"
        }
      ]
    },
    {
      "name": "simplify-language",
      "enabled": true,
      "targetReadingLevel": 8
    },
    {
      "name": "limit-examples",
      "enabled": true,
      "maxExamples": 3
    }
  ],
  "targetReduction": 15
}
```

## 📝 Prompt Templates

### System Prompt Template

```markdown
---
id: system-prompt-template
name: System Prompt Template
model: claude-3-5-sonnet-20250205
temperature: 0.7
---

# Role

You are [role description]. Your expertise includes [areas of expertise].

# Goals

Your primary goals are:
1. [Goal 1]
2. [Goal 2]
3. [Goal 3]

# Constraints

- [Constraint 1]
- [Constraint 2]
- [Constraint 3]

# Response Format

Provide responses in the following format:
1. [Section 1]
2. [Section 2]
3. [Section 3]
```

### Few-Shot Template

```markdown
---
id: few-shot-template
name: Few-Shot Learning Template
---

# Task

[Task description]

# Examples

## Example 1

Input: [Example input 1]
Output: [Example output 1]

## Example 2

Input: [Example input 2]
Output: [Example output 2]

## Example 3

Input: [Example input 3]
Output: [Example output 3]

# Your Task

Input: {user_input}
Output:
```

## 🔄 A/B Testing Strategies

### Strategy 1: Quality vs. Cost Tradeoff

Test a detailed prompt against a concise version:

- **Detailed Prompt**: More context, examples, and instructions
  - Pros: Higher quality, fewer errors
  - Cons: Higher token cost, slower response

- **Concise Prompt**: Minimal context, direct instructions
  - Pros: Lower cost, faster response
  - Cons: May sacrifice quality

**When to Use:**
- Quality-critical: Use detailed prompt (e.g., medical advice, legal review)
- Cost-sensitive: Use concise prompt (e.g., chatbot greetings, simple classification)

### Strategy 2: Temperature Testing

Compare different temperature settings:

- **Low Temperature (0.1-0.3)**: Deterministic, focused
  - Use for: Code generation, data extraction, factual Q&A

- **Medium Temperature (0.4-0.7)**: Balanced creativity
  - Use for: General assistance, explanations, tutorials

- **High Temperature (0.8-1.0)**: Creative, varied
  - Use for: Creative writing, brainstorming, idea generation

### Strategy 3: Few-Shot vs. Zero-Shot

Test prompts with and without examples:

- **Few-Shot**: Include 2-5 examples in the prompt
  - Pros: Better accuracy, consistent format
  - Cons: Higher token cost

- **Zero-Shot**: No examples, rely on model knowledge
  - Pros: Lower cost, faster
  - Cons: May require clearer instructions

## 🔧 Troubleshooting

### Error: API Key Not Found

**Cause**: ANTHROPIC_API_KEY or OPENAI_API_KEY not set

**Solution**:

```bash
# Set API key
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Verify
echo $ANTHROPIC_API_KEY

# Or use .env file
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env
```

### Error: Prompt Not Found in Registry

**Cause**: Prompt ID not registered in `prompt-registry.json`

**Solution**:

1. Add prompt to registry:

```bash
node scripts/register-prompt.js \
  --id my-prompt-v1 \
  --path prompts/chat/my-prompt-v1.md
```

2. Or manually edit `configs/prompt-registry.json`

### Error: A/B Test Inconclusive

**Cause**: Not enough iterations or difference too small

**Solution**:

```bash
# Increase iterations
node scripts/ab-test-runner.js \
  --prompts prompt1.md,prompt2.md \
  --iterations 100  # Increase from 50 to 100

# Lower significance threshold (use with caution)
node scripts/ab-test-runner.js \
  --prompts prompt1.md,prompt2.md \
  --significance-level 0.10  # From 0.05 to 0.10
```

### Error: Token Optimization Too Aggressive

**Cause**: `targetReduction` set too high in `optimization-rules.json`

**Solution**:

Edit `configs/optimization-rules.json`:

```json
{
  "targetReduction": 10  // Reduce from 15 to 10
}
```

### Error: Rate Limited by API

**Cause**: Too many requests to AI provider

**Solution**:

```bash
# Add delay between requests
node scripts/ab-test-runner.js \
  --prompts prompt1.md,prompt2.md \
  --delay 2000  # 2 second delay between requests

# Or reduce concurrency
node scripts/ab-test-runner.js \
  --prompts prompt1.md,prompt2.md \
  --concurrency 1  # Sequential instead of parallel
```

## ✅ Best Practices

### 1. Version Control All Prompts

```bash
# ❌ Bad: Overwrite existing prompt
vim prompts/chat/assistant-v1.md  # Edit in place

# ✅ Good: Create new version
cp prompts/chat/assistant-v1.md prompts/chat/assistant-v2.md
vim prompts/chat/assistant-v2.md
git add prompts/chat/assistant-v2.md
git commit -m "feat: Add context about product features to assistant prompt"
```

### 2. Always A/B Test Before Deployment

```bash
# ❌ Bad: Deploy without testing
node scripts/deploy-prompt.js --id my-prompt-v2 --environment production

# ✅ Good: Test first, then deploy
node scripts/ab-test-runner.js \
  --prompts prompts/chat/my-prompt-v1.md,prompts/chat/my-prompt-v2.md \
  --iterations 100

# Only deploy if v2 wins
node scripts/deploy-prompt.js --id my-prompt-v2 --environment production
```

### 3. Track Token Usage Over Time

```bash
# Set up automated tracking
cron: "0 0 * * *"  # Daily at midnight
command: node scripts/performance-analyzer.js --all-prompts --period 1day >> logs/token-usage.log
```

### 4. Use Specific, Measurable Metrics

```yaml
# ❌ Bad: Vague metrics
metrics:
  quality: subjective_feeling

# ✅ Good: Specific, measurable metrics
metrics:
  quality:
    measurement: accuracy
    validation: manual_review_sample_10_percent
  hallucination_rate:
    threshold: 0.05  # Max 5%
  user_satisfaction:
    measurement: thumbs_up_rate
    threshold: 0.8  # Min 80%
```

### 5. Document Prompt Intent and Context

```markdown
# ❌ Bad: No context

You are a helpful assistant.

# ✅ Good: Clear intent and context

---
id: customer-support-v1
intent: Handle customer inquiries about product features and billing
context: Users are existing customers who have already purchased
constraints: Do not provide medical or legal advice
escalation: Transfer to human agent if user is angry or issue is complex
---

You are a customer support assistant for [Product Name]...
```

## 📚 Related Documentation

- [SKILL.md](SKILL.md) - Complete skill specifications
- [examples/basic-usage.md](examples/basic-usage.md) - Basic prompt management examples
- [examples/advanced-usage.md](examples/advanced-usage.md) - Advanced A/B testing patterns
- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/en/docs/prompt-engineering)
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [LangChain Prompt Templates](https://python.langchain.com/docs/modules/model_io/prompts/)

## 📝 License

MIT

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

---

**Need help?** Create an issue or see [Troubleshooting](#troubleshooting) above.
