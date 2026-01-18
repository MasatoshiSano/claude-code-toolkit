# Frontend Performance Auditor

Analyze and optimize frontend performance with Lighthouse, Core Web Vitals, and bundle analysis.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Related Documentation](#related-documentation)

## Overview

**Status**: 🚧 Planned (Phase 2 - Q2 2026)
**Supported Tools**: Lighthouse, Web Vitals, Webpack Bundle Analyzer, Squoosh

This skill provides comprehensive frontend performance analysis, identifies optimization opportunities, and tracks improvements over time. Average performance improvement: 38% reduction in load time, 61% reduction in bundle size.

## ✨ Features

### Lighthouse Audits

- ✅ Automated Lighthouse performance audits
- ✅ Mobile and desktop analysis
- ✅ Accessibility, SEO, and best practices scoring
- ✅ Opportunity identification with estimated savings

### Core Web Vitals

- ✅ LCP (Largest Contentful Paint) measurement
- ✅ FID (First Input Delay) tracking
- ✅ CLS (Cumulative Layout Shift) detection
- ✅ Real user metrics (RUM) collection

### Bundle Analysis

- ✅ Webpack/Rollup/Vite bundle size analysis
- ✅ Duplicate dependency detection
- ✅ Tree-shaking optimization suggestions
- ✅ Code splitting recommendations

### Image Optimization

- ✅ Automatic WebP/AVIF conversion
- ✅ Responsive image generation
- ✅ Lazy loading implementation
- ✅ SVG optimization

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
cd .claude/skills/frontend-performance-auditor
npm install
```

### Prerequisites

- Node.js >= 16
- Lighthouse >= 11.0
- webpack-bundle-analyzer >= 4.0 (for Webpack projects)

### Install Required Tools

```bash
# Install Lighthouse
npm install -g lighthouse

# Install Web Vitals library
npm install web-vitals

# Install image optimization tools
npm install -g @squoosh/cli

# Install bundle analyzer (Webpack)
npm install -D webpack-bundle-analyzer

# Verify installation
lighthouse --version
```

## 🚀 Quick Start

### 1. Run Lighthouse Audit

```bash
# Basic audit
node scripts/lighthouse-runner.js \
  --url https://app.example.com \
  --device mobile

# Full audit with all categories
node scripts/lighthouse-runner.js \
  --url https://app.example.com \
  --device desktop \
  --categories performance,accessibility,seo,best-practices
```

### 2. Analyze Core Web Vitals

```bash
# Analyze Web Vitals from real users
node scripts/web-vitals-analyzer.js \
  --url https://app.example.com \
  --period 7days
```

### 3. Analyze Bundle Size

```bash
# Webpack bundle analysis
node scripts/bundle-analyzer.js \
  --config webpack.config.js

# Output: Opens interactive treemap in browser
```

## 📖 Usage Examples

### Example 1: Complete Performance Audit

Run a comprehensive performance audit:

```bash
# Run full audit
node scripts/lighthouse-runner.js \
  --url https://app.example.com \
  --device mobile

# Output:
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
#    - main.css (540KB)
#    - fonts.css (180KB)
#
# 2. Properly size images (Save 420KB)
#    - hero-banner.jpg (2.1MB → 420KB, -80%)
#    - product-1.png (850KB → 120KB, -86%)
#
# 3. Enable text compression (Save 180KB)
#    - main.js (680KB → 220KB, gzip)
#
# 4. Reduce unused JavaScript (Save 340KB)
#    - lodash.js (185KB, use lodash-es)
#    - moment.js (228KB, replace with date-fns)
#
# Total potential improvement: 2.14s (67% faster)
#
# Full report: ./reports/lighthouse-2025-01-18-14-30.html
```

### Example 2: Core Web Vitals Analysis

Analyze real user metrics:

```bash
# Analyze Web Vitals
node scripts/web-vitals-analyzer.js \
  --url https://app.example.com \
  --period 30days

# Output:
# 📊 Core Web Vitals Report (10,000 sessions over last 30 days)
#
# Summary:
# ┌───────┬───────┬──────────────────────┬─────────┬───────┐
# │ Metric│ P75   │ Status               │ Target  │ Grade │
# ├───────┼───────┼──────────────────────┼─────────┼───────┤
# │ LCP   │ 3.2s  │ ⚠️ Needs Improvement │ <2.5s   │ C     │
# │ FID   │ 85ms  │ ✅ Good              │ <100ms  │ A     │
# │ CLS   │ 0.18  │ ⚠️ Needs Improvement │ <0.1    │ C     │
# │ FCP   │ 1.8s  │ ✅ Good              │ <1.8s   │ A     │
# │ TTFB  │ 420ms │ ✅ Good              │ <600ms  │ A     │
# └───────┴───────┴──────────────────────┴─────────┴───────┘
#
# Overall Grade: C+ (2/5 metrics need improvement)
#
# LCP Distribution:
# - Good (<2.5s): 45%
# - Needs Improvement (2.5s-4.0s): 35%
# - Poor (>4.0s): 20%
#
# Recommendations:
#
# Priority 1: Improve LCP (3.2s → <2.5s)
# - Optimize largest image (hero-banner.jpg, 2.1MB)
# - Preload LCP image: <link rel="preload" as="image" href="hero.webp">
# - Use CDN for static assets
# - Implement lazy loading for below-fold images
#
# Priority 2: Reduce CLS (0.18 → <0.1)
# - Reserve space for dynamic content (ads, embeds)
# - Specify width/height for all images
# - Avoid inserting content above existing content
# - Use CSS containment: contain: layout
```

### Example 3: Bundle Size Analysis

Analyze and optimize JavaScript bundle:

```bash
# Analyze bundle
node scripts/bundle-analyzer.js \
  --config webpack.config.js

# Output:
# 📦 Bundle Analysis
#
# Total Bundle Size: 1.24MB (gzipped: 342KB)
# ⚠️ Warning: Exceeds target of 250KB gzipped
#
# Largest Contributors:
# 1. node_modules/moment/moment.js - 228KB (17%)
#    Recommendation: Replace with date-fns (72KB, -68%)
#    Migration: npm install date-fns && npm uninstall moment
#
# 2. node_modules/lodash/lodash.js - 185KB (14%)
#    Recommendation: Use individual imports (lodash-es)
#    Before: import _ from 'lodash';
#    After:  import { debounce, throttle } from 'lodash-es';
#    Savings: ~140KB
#
# 3. src/components/Chart.tsx - 145KB (11%)
#    Recommendation: Code split, lazy load
#    Before: import { Chart } from './components/Chart';
#    After:  const Chart = lazy(() => import('./components/Chart'));
#    Impact: Reduce initial bundle by 145KB
#
# 4. node_modules/axios/dist/axios.js - 98KB (7%)
#    Recommendation: Consider native fetch API
#    Savings: 98KB (if fetch API is sufficient)
#
# 5. Duplicate dependencies detected:
#    - React (v18.2.0) included 2 times → Use webpack dedupe
#    - EventEmitter included in 3 packages → Extract to shared chunk
#
# Optimization Opportunities:
# - Total potential savings: 485KB (38% reduction)
# - Estimated load time improvement: 2.1s → 1.3s
#
# Apply optimizations? [y/N]: y
#
# ✓ Generated optimization recommendations in:
#   - bundle-optimization-plan.md
#   - webpack.config.optimized.js
```

### Example 4: Image Optimization

Optimize images for web:

```bash
# Analyze and optimize images
node scripts/image-optimizer.js \
  --dir ./public/images

# Output:
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
# ✓ Optimizing images...
# ✓ Optimized 47 images
# ✓ Saved 9.2MB (74%)
# ✓ Generated responsive <picture> tags in image-tags.html
```

**Generated Responsive Image Tags:**

```html
<!-- Automatically generated -->
<picture>
  <source
    srcset="
      hero-banner-mobile.webp   480w,
      hero-banner-tablet.webp   768w,
      hero-banner-desktop.webp 1920w
    "
    sizes="100vw"
    type="image/webp"
  />
  <source
    srcset="
      hero-banner-mobile.jpg   480w,
      hero-banner-tablet.jpg   768w,
      hero-banner-desktop.jpg 1920w
    "
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

## ⚙️ Configuration

### Performance Budget

Edit `configs/budget-config.json`:

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

### Lighthouse Configuration

Edit `templates/lighthouse-config.js`:

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
      cpuSlowdownMultiplier: 4
    }
  }
};
```

### Performance Thresholds

Edit `configs/performance-thresholds.json`:

```json
{
  "scores": {
    "performance": {
      "good": 90,
      "needsImprovement": 50
    },
    "accessibility": {
      "good": 90
    }
  },
  "metrics": {
    "lcp": {
      "good": 2500,
      "needsImprovement": 4000
    },
    "fid": {
      "good": 100,
      "needsImprovement": 300
    },
    "cls": {
      "good": 0.1,
      "needsImprovement": 0.25
    }
  }
}
```

## 🔧 Troubleshooting

### Error: Lighthouse Audit Failed

**Cause**: Target URL unreachable or timeout

**Solution**:

```bash
# Increase timeout
node scripts/lighthouse-runner.js \
  --url https://app.example.com \
  --timeout 60000

# Run with verbose logging
node scripts/lighthouse-runner.js \
  --url https://app.example.com \
  --verbose

# Check if URL is accessible
curl -I https://app.example.com
```

### Error: Performance Budget Exceeded

**Cause**: Bundle or assets exceed configured limits

**Solution**:

```bash
# Check what exceeded budget
node scripts/performance-budget.js \
  --config budget-config.json \
  --url https://app.example.com

# Output shows violations:
# ❌ Budget Exceeded (3 violations)
# 1. JavaScript Bundle Size: 342KB / 250KB (over by 92KB)
# 2. Total Page Size: 1240KB / 1000KB (over by 240KB)
# 3. LCP: 3200ms / 2500ms (over by 700ms)

# Apply bundle optimizations
node scripts/bundle-analyzer.js --config webpack.config.js
# Follow recommendations to reduce bundle size
```

### Error: Core Web Vitals Not Collected

**Cause**: Web Vitals library not integrated

**Solution**:

Add to your application:

```javascript
// src/index.js
import { getCLS, getFID, getLCP } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
```

### Error: Image Optimization Failed

**Cause**: @squoosh/cli not installed or unsupported image format

**Solution**:

```bash
# Install Squoosh CLI
npm install -g @squoosh/cli

# Check supported formats
npx @squoosh/cli --help

# For unsupported formats, convert first
convert input.tiff input.jpg
npx @squoosh/cli --webp '{"quality":80}' input.jpg
```

### Error: Bundle Analyzer Not Opening

**Cause**: Port already in use or browser not detected

**Solution**:

```bash
# Specify custom port
node scripts/bundle-analyzer.js \
  --config webpack.config.js \
  --port 8889

# Or generate static HTML report
node scripts/bundle-analyzer.js \
  --config webpack.config.js \
  --mode static

# Open report manually
open bundle-report.html
```

## ✅ Best Practices

### 1. Set and Enforce Performance Budgets

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
          budgetPath: ./configs/budget-config.json
          uploadArtifacts: true

      - name: Check performance budget
        run: |
          npm run performance:check
          if [ $? -ne 0 ]; then
            echo "❌ Performance budget exceeded!"
            exit 1
          fi
```

### 2. Optimize Images Before Committing

```bash
# ❌ Bad: Commit large unoptimized images
git add public/images/hero-banner.jpg  # 2.1MB

# ✅ Good: Optimize before committing
npx @squoosh/cli --webp '{"quality":80}' public/images/hero-banner.jpg
git add public/images/hero-banner.webp  # 420KB

# Even better: Add pre-commit hook
# .husky/pre-commit
#!/bin/sh
node scripts/image-optimizer.js --dir ./public/images --auto-fix
```

### 3. Use Code Splitting

```typescript
// ❌ Bad: Load everything upfront
import { Chart } from './components/Chart';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';

// ✅ Good: Dynamic imports with lazy loading
import { lazy, Suspense } from 'react';

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

### 4. Implement Resource Hints

```html
<!-- DNS Prefetch for external domains -->
<link rel="dns-prefetch" href="https://api.example.com" />

<!-- Preconnect for critical third-party origins -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Preload critical resources -->
<link
  rel="preload"
  href="/fonts/main.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
<link rel="preload" href="/images/hero.webp" as="image" />

<!-- Prefetch next page -->
<link rel="prefetch" href="/dashboard" />
```

### 5. Monitor Performance Continuously

```bash
# ❌ Bad: Only check performance before releases
npm run build
# (no performance check)
npm run deploy

# ✅ Good: Continuous monitoring in CI/CD
npm run build
npm run performance:audit  # Runs Lighthouse
npm run performance:budget # Checks budgets
npm run deploy

# Set up weekly reports
# cron: 0 9 * * 1 (Every Monday at 9am)
node scripts/lighthouse-runner.js --url https://app.example.com \
  --email-report ops@example.com
```

## 📚 Related Documentation

- [SKILL.md](SKILL.md) - Complete skill specifications
- [examples/optimization-guide.md](examples/optimization-guide.md) - Detailed optimization guide
- [examples/web-vitals-setup.md](examples/web-vitals-setup.md) - Web Vitals integration guide
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Web Vitals](https://web.dev/vitals/)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

## 📝 License

MIT

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

---

**Need help?** Create an issue or see [Troubleshooting](#troubleshooting) above.
