---
name: frontend-performance-auditor
description: Analyze and optimize frontend performance with Lighthouse, Core Web Vitals, and bundle analysis
version: 1.0.0
author: Claude Code Toolkit
license: MIT
tags:
  - performance
  - frontend
  - lighthouse
  - web-vitals
  - optimization
  - bundle-analysis
requires:
  - node>=16
  - lighthouse>=11.0
  - webpack-bundle-analyzer>=4.0
---

# Frontend Performance Auditor Agent Skill

## Purpose

このスキルは、フロントエンドのパフォーマンスを包括的に分析し、最適化提案を提供します。
Lighthouse、Core Web Vitals、バンドル分析、画像最適化を統合し、具体的な改善策を提示します。

## When to Use

- 新機能リリース前のパフォーマンスチェック
- ページ読み込み速度の改善が必要な時
- Core Web Vitalsの改善
- バンドルサイズの削減
- 画像最適化の必要性がある時
- SEO改善のためのパフォーマンス向上

## Architecture

```
scripts/
├── lighthouse-runner.js       # Lighthouse監査実行
├── web-vitals-analyzer.js     # Core Web Vitals分析
├── bundle-analyzer.js         # バンドル分析
├── image-optimizer.js         # 画像最適化
├── performance-budget.js      # パフォーマンス予算管理
└── report-generator.js        # レポート生成

templates/
├── lighthouse-config.js       # Lighthouse設定
├── budget-template.json       # パフォーマンス予算テンプレート
└── optimization-checklist.md  # 最適化チェックリスト

configs/
├── performance-thresholds.json # パフォーマンス閾値
├── budget-config.json         # 予算設定
└── optimization-rules.json    # 最適化ルール
```

## Instructions

### Phase 1: Lighthouse Audit

#### 1.1 基本的な監査実行

```bash
# Lighthouse監査を実行
agent frontend-performance-auditor audit \
  --url=https://app.example.com \
  --device=mobile

# 出力:
# 🔍 Running Lighthouse audit...
#
# Performance Score: 67/100
# Accessibility: 92/100
# Best Practices: 83/100
# SEO: 100/100
#
# Core Web Vitals:
# - LCP (Largest Contentful Paint): 3.2s ⚠️ (target: <2.5s)
# - FID (First Input Delay): 85ms ✅ (target: <100ms)
# - CLS (Cumulative Layout Shift): 0.18 ⚠️ (target: <0.1)
#
# Opportunities for improvement:
# 1. Eliminate render-blocking resources (Save 1.2s)
# 2. Properly size images (Save 420KB)
# 3. Enable text compression (Save 180KB)
# 4. Reduce unused JavaScript (Save 340KB)
#
# Full report: ./reports/lighthouse-2025-01-16-14-30.html
```

#### 1.2 詳細な監査レポート

**lighthouse-config.js:**
```javascript
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    skipAudits: ['uses-http2'],
    throttlingMethod: 'simulate',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      requestLatencyMs: 562.5,
      downloadThroughputKbps: 1474.5,
      uploadThroughputKbps: 675,
      cpuSlowdownMultiplier: 4,
    },
  },
};
```

### Phase 2: Core Web Vitals Analysis

#### 2.1 リアルユーザーメトリクス

```javascript
// web-vitals-analyzer.js
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

function reportWebVitals() {
  getCLS(metric => {
    console.log('CLS:', metric.value);
    sendToAnalytics('CLS', metric.value);
  });

  getFID(metric => {
    console.log('FID:', metric.value);
    sendToAnalytics('FID', metric.value);
  });

  getLCP(metric => {
    console.log('LCP:', metric.value);
    sendToAnalytics('LCP', metric.value);
  });

  getFCP(metric => {
    console.log('FCP:', metric.value);
    sendToAnalytics('FCP', metric.value);
  });

  getTTFB(metric => {
    console.log('TTFB:', metric.value);
    sendToAnalytics('TTFB', metric.value);
  });
}
```

**分析結果:**
```markdown
# Core Web Vitals Report

## Summary
Based on 10,000 real user sessions over the last 7 days

| Metric | P75 | Status | Target | Grade |
|--------|-----|--------|--------|-------|
| LCP    | 3.2s| ⚠️ Needs Improvement | <2.5s | C |
| FID    | 85ms| ✅ Good | <100ms | A |
| CLS    | 0.18| ⚠️ Needs Improvement | <0.1 | C |
| FCP    | 1.8s| ✅ Good | <1.8s | A |
| TTFB   | 420ms| ✅ Good | <600ms | A |

## Overall Grade: C+
2/5 metrics need improvement

## Distribution

### LCP Distribution
- Good (<2.5s): 45%
- Needs Improvement (2.5s-4.0s): 35%
- Poor (>4.0s): 20%

### FID Distribution
- Good (<100ms): 85%
- Needs Improvement (100ms-300ms): 12%
- Poor (>300ms): 3%

### CLS Distribution
- Good (<0.1): 40%
- Needs Improvement (0.1-0.25): 45%
- Poor (>0.25): 15%

## Recommendations

### Priority 1: Improve LCP (3.2s → <2.5s)
- Optimize largest image (hero-banner.jpg, 2.1MB)
- Preload LCP image
- Use CDN for static assets
- Implement lazy loading for below-fold images

### Priority 2: Reduce CLS (0.18 → <0.1)
- Reserve space for dynamic content
- Specify width/height for images
- Avoid inserting content above existing content
- Use CSS containment
```

### Phase 3: Bundle Analysis

#### 3.1 バンドルサイズの分析

```bash
# Webpack バンドル分析
agent frontend-performance-auditor analyze-bundle \
  --config=webpack.config.js

# 出力:
# 📦 Bundle Analysis
#
# Total Bundle Size: 1.24MB (gzipped: 342KB)
# ⚠️ Warning: Exceeds target of 250KB gzipped
#
# Largest Contributors:
# 1. node_modules/moment/moment.js - 228KB (17%)
#    Recommendation: Replace with date-fns (72KB, -68%)
#
# 2. node_modules/lodash/lodash.js - 185KB (14%)
#    Recommendation: Use individual imports (lodash-es)
#    Example: import { debounce } from 'lodash-es'
#    Savings: ~140KB
#
# 3. src/components/Chart.tsx - 145KB (11%)
#    Recommendation: Code split, lazy load
#    Impact: Reduce initial bundle by 145KB
#
# 4. node_modules/axios/dist/axios.js - 98KB (7%)
#    Recommendation: Consider native fetch API
#    Savings: 98KB
#
# 5. Duplicate dependencies:
#    - React (v18.2.0) included 2 times
#    - EventEmitter included in 3 packages
#
# Optimization Opportunities:
# - Total potential savings: 485KB (38%)
# - Estimated load time improvement: 2.1s → 1.3s
```

**バンドル最適化提案:**
```javascript
// webpack.config.js の最適化
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log in production
          },
        },
      }),
    ],
  },

  // Tree shaking
  mode: 'production',

  // Analyze bundle
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html',
    }),
  ],
};
```

### Phase 4: Image Optimization

#### 4.1 画像分析と最適化

```bash
# 画像を分析
agent frontend-performance-auditor optimize-images \
  --dir=./public/images

# 出力:
# 🖼️ Image Optimization Report
#
# Found 47 images, Total size: 12.4MB
#
# Optimization Opportunities:
#
# 1. hero-banner.jpg (2.1MB → 420KB, -80%)
#    Current: 3840x2160, JPEG, Quality 95
#    Optimized: 1920x1080, WebP, Quality 80
#    Command: npx @squoosh/cli --webp '{"quality":80}' hero-banner.jpg
#
# 2. product-*.png (8 files, 4.2MB → 680KB, -84%)
#    Current: PNG, no compression
#    Optimized: WebP with compression
#    Batch command: npx @squoosh/cli --webp '{"quality":85}' product-*.png
#
# 3. icons/*.svg (15 files, 145KB → 45KB, -69%)
#    Current: Unoptimized SVG
#    Optimized: SVGO compression
#    Command: npx svgo -f icons/
#
# Total potential savings: 9.2MB (74%)
# Estimated LCP improvement: 3.2s → 1.8s
#
# Apply optimizations? [y/N]: y
#
# ✓ Optimized 47 images
# ✓ Saved 9.2MB
# ✓ Generated <picture> tags with fallbacks
```

**最適化後の画像タグ:**
```html
<!-- 自動生成されたレスポンシブ画像 -->
<picture>
  <source
    srcset="hero-banner-mobile.webp 480w,
            hero-banner-tablet.webp 768w,
            hero-banner-desktop.webp 1920w"
    sizes="100vw"
    type="image/webp"
  />
  <source
    srcset="hero-banner-mobile.jpg 480w,
            hero-banner-tablet.jpg 768w,
            hero-banner-desktop.jpg 1920w"
    sizes="100vw"
    type="image/jpeg"
  />
  <img
    src="hero-banner-desktop.jpg"
    alt="Hero Banner"
    loading="lazy"
    width="1920"
    height="1080"
  />
</picture>
```

### Phase 5: Performance Budget

#### 5.1 予算設定

**budget-config.json:**
```json
{
  "budgets": [
    {
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 250
        },
        {
          "resourceType": "stylesheet",
          "budget": 50
        },
        {
          "resourceType": "image",
          "budget": 500
        },
        {
          "resourceType": "font",
          "budget": 100
        },
        {
          "resourceType": "total",
          "budget": 1000
        }
      ],
      "resourceCounts": [
        {
          "resourceType": "script",
          "budget": 10
        },
        {
          "resourceType": "stylesheet",
          "budget": 5
        },
        {
          "resourceType": "third-party",
          "budget": 5
        }
      ],
      "timings": [
        {
          "metric": "first-contentful-paint",
          "budget": 1800
        },
        {
          "metric": "largest-contentful-paint",
          "budget": 2500
        },
        {
          "metric": "interactive",
          "budget": 3800
        }
      ]
    }
  ]
}
```

#### 5.2 予算超過の検出

```bash
# パフォーマンス予算をチェック
agent frontend-performance-auditor check-budget \
  --config=budget-config.json \
  --url=https://app.example.com

# 出力:
# 📊 Performance Budget Check
#
# ❌ Budget Exceeded (3 violations)
#
# 1. JavaScript Bundle Size
#    Budget: 250KB
#    Actual: 342KB
#    Over by: 92KB (37%)
#    Impact: HIGH
#
# 2. Total Page Size
#    Budget: 1000KB
#    Actual: 1240KB
#    Over by: 240KB (24%)
#    Impact: MEDIUM
#
# 3. Largest Contentful Paint
#    Budget: 2500ms
#    Actual: 3200ms
#    Over by: 700ms (28%)
#    Impact: HIGH
#
# ✅ Within Budget (5 metrics)
# - CSS Size: 45KB / 50KB
# - Font Size: 82KB / 100KB
# - First Contentful Paint: 1600ms / 1800ms
# - Interactive: 3200ms / 3800ms
# - Third-party Scripts: 3 / 5
#
# Recommendation: Fix HIGH impact violations before deployment
```

### Phase 6: Optimization Implementation

#### 6.1 コード分割

```typescript
// Before: すべて同期的にロード
import { Chart } from './components/Chart';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';

// After: 動的インポート
const Chart = lazy(() => import('./components/Chart'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chart" element={<Chart />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

#### 6.2 リソースヒント

```html
<!-- DNS Prefetch -->
<link rel="dns-prefetch" href="https://api.example.com" />

<!-- Preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Preload -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/images/hero.webp" as="image" />

<!-- Prefetch -->
<link rel="prefetch" href="/dashboard" />
```

#### 6.3 キャッシング戦略

```javascript
// Service Worker でキャッシング
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles/main.css',
        '/scripts/main.js',
        '/images/logo.svg',
      ]);
    })
  );
});

// Cache-first strategy for static assets
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/static/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

### Phase 7: Continuous Monitoring

#### 7.1 CI/CD統合

```yaml
# .github/workflows/performance.yml
name: Performance Budget

on:
  pull_request:
  push:
    branches: [main]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://staging.example.com
            https://staging.example.com/dashboard
          budgetPath: ./budget-config.json
          uploadArtifacts: true
          temporaryPublicStorage: true

      - name: Check performance budget
        run: |
          npm run performance:check
          if [ $? -ne 0 ]; then
            echo "Performance budget exceeded!"
            exit 1
          fi

      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            const results = require('./lhci-report.json');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: formatPerformanceResults(results)
            });
```

## Error Handling

### Level 1: Recoverable Errors

- **タイムアウト**: リトライ、タイムアウト延長
- **一時的なネットワークエラー**: 自動リトライ

### Level 2: User Intervention Required

- **予算超過**: 最適化提案を表示、デプロイ警告
- **パフォーマンス悪化**: 前回との比較、原因調査を支援

### Level 3: Critical Errors

- **重大なパフォーマンス劣化**: デプロイをブロック
- **Lighthouseスコア50未満**: 即座に対処を要求

## Performance Notes

- **並列監査**: 複数ページを並列で監査
- **キャッシング**: Lighthouseレポートをキャッシュ
- **インクリメンタル分析**: 変更があったページのみ再分析

## Dependencies

- Node.js >= 16
- Lighthouse >= 11.0
- webpack-bundle-analyzer >= 4.0
- web-vitals

## Best Practices

1. **パフォーマンス予算を設定**: デプロイ前に自動チェック
2. **定期的な監査**: 週次でLighthouse監査
3. **Core Web Vitalsの追跡**: リアルユーザーメトリクスを監視
4. **段階的最適化**: 大きな影響から対処
5. **トレードオフの理解**: 機能とパフォーマンスのバランス

## Related Skills

- `e2e-test-generator`: パフォーマンステストをE2Eテストに統合
- `aws-deploy-automation`: CDNとキャッシング設定の最適化

## Examples

### ✅ Good Example: Optimization Success

```bash
Input: agent frontend-performance-auditor audit --url=https://app.example.com

Output:
Before Optimization:
- Performance Score: 67/100
- LCP: 3.2s
- Bundle Size: 1.24MB

After Optimization:
- Performance Score: 94/100 (+27)
- LCP: 1.8s (-44%)
- Bundle Size: 485KB (-61%)

Optimizations Applied:
✓ Replaced moment.js with date-fns (-156KB)
✓ Code splitting on routes (-145KB)
✓ Optimized images (-540KB)
✓ Enabled Brotli compression
✓ Implemented lazy loading

Estimated Impact:
- Page load time: 4.2s → 1.9s
- Monthly bandwidth savings: 2.4TB
- Improved SEO ranking potential
```

## Notes

- パフォーマンス最適化は継続的プロセス
- ユーザー体験への影響を常に測定
- 過度な最適化は避ける（開発効率とのバランス）
