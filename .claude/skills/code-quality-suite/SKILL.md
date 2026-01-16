---
name: code-quality-suite
description: Comprehensive code quality, security, and performance analysis suite
version: 1.0.0
author: Claude Code Toolkit
license: MIT
tags:
  - quality
  - security
  - performance
  - testing
  - audit
requires:
  - node>=16
  - python>=3.8
---

# Code Quality Suite Agent Skill

## Purpose

このスキルは、コード品質、セキュリティ、パフォーマンスを包括的に分析し、
優先度付きの改善提案を提供します。`/check`と`/security-audit`を統合した強力なツールです。

## When to Use

- プルリクエスト作成前の品質確認
- 定期的なコード監査
- セキュリティ脆弱性スキャン
- パフォーマンスボトルネックの特定
- プロジェクトヘルスチェック

## Architecture

```
scripts/
├── quality-checker.js      # コード品質分析
├── security-scanner.py     # セキュリティスキャン
├── performance-analyzer.js # パフォーマンス分析
├── dependency-auditor.js   # 依存関係監査
└── report-generator.js     # レポート生成

configs/
├── eslint-rules.json       # ESLint設定
├── security-rules.yaml     # セキュリティルール
├── performance-thresholds.json  # パフォーマンス閾値
└── owasp-checklist.md     # OWASP Top 10チェックリスト

reports/
└── [timestamp]/
    ├── quality-report.md
    ├── security-report.md
    ├── performance-report.md
    └── summary.md
```

## Instructions

### Phase 1: Code Quality Analysis

#### 1.1 Syntax and Type Errors
- TypeScript/JavaScript型エラー検出
- 構文エラーのチェック
- 未使用のimport/export検出

**ツール:**
- `tsc --noEmit` (TypeScript)
- `eslint --max-warnings 0`
- `pyflakes` (Python)

#### 1.2 Code Complexity
- Cyclomatic Complexity測定（推奨: <10）
- Cognitive Complexity分析
- 関数の長さチェック（推奨: <50行）
- ネストの深さ（推奨: <4）

**ツール:**
- `complexity-report`
- `eslint-plugin-complexity`

#### 1.3 Code Smells
- **重複コード**: コピペの検出（>5行）
- **マジックナンバー**: 定数化すべき値
- **長いパラメータリスト**: >5個のパラメータ
- **循環依存**: モジュール間の循環参照

**ツール:**
- `jscpd` (重複コード)
- `madge --circular` (循環依存)

#### 1.4 Best Practices
- コーディング規約準拠
- 命名規則の一貫性
- コメントの質と量
- テストカバレッジ（目標: >80%）

**出力:**
```markdown
## Code Quality Score: 85/100

### Critical Issues (0)
(None)

### High Priority (3)
- `src/utils/helper.js:45`: Cyclomatic complexity 15 (threshold: 10)
- `src/api/users.ts:120`: Function too long (78 lines)
- `src/components/Form.tsx`: Duplicate code (12 lines)

### Medium Priority (8)
...

### Suggestions (15)
...
```

### Phase 2: Security Audit

#### 2.1 OWASP Top 10 Check

**A01: Broken Access Control**
- 認証なしアクセス可能なエンドポイント
- 権限チェックの欠如
- IDORの脆弱性

**A02: Cryptographic Failures**
- 平文パスワード保存
- 弱い暗号化アルゴリズム（MD5, SHA1）
- HTTPSの欠如

**A03: Injection**
- SQLインジェクション（prepared statements未使用）
- NoSQLインジェクション
- コマンドインジェクション
- XSS（Cross-Site Scripting）

**A04: Insecure Design**
- セキュリティコントロールの欠如
- レート制限なし
- 不適切なエラーハンドリング

**A05: Security Misconfiguration**
- デフォルト設定の使用
- デバッグモード有効化（本番）
- 不要なサービス起動

**A06: Vulnerable Components**
- 既知の脆弱性を持つライブラリ
- 古いバージョンの依存関係
- サポート終了パッケージ

**A07: Authentication Failures**
- 弱いパスワードポリシー
- セッション管理の問題
- ブルートフォース対策なし

**A08: Software and Data Integrity Failures**
- CI/CDパイプラインの脆弱性
- 署名なしパッケージ
- 自動更新の検証なし

**A09: Security Logging Failures**
- ログ記録の欠如
- 機密情報のログ出力
- ログ監視の欠如

**A10: Server-Side Request Forgery**
- 検証なしURL呼び出し
- 内部ネットワークへのアクセス

#### 2.2 Hardcoded Secrets Detection
パターンマッチングで検出：
- API keys: `api_key = "sk_live_..."`
- Passwords: `password = "secret123"`
- Private keys: `-----BEGIN PRIVATE KEY-----`
- Database credentials: `postgres://user:pass@host`
- OAuth tokens: `access_token = "..."`

**ツール:**
- `truffleHog`
- `gitleaks`
- Custom regex patterns

#### 2.3 Dependency Vulnerabilities
- `npm audit` / `pip check`
- CVE database照合
- ライセンスコンプライアンス

#### 2.4 Data Protection
- GDPR/PII compliance
- データ暗号化（at-rest, in-transit）
- 個人情報の適切な取り扱い

**出力:**
```markdown
## Security Score: 72/100

### Critical Vulnerabilities (2)
🚨 **SQL Injection** in `src/db/queries.js:34`
   - Risk: CVSS 9.8 (Critical)
   - Description: User input directly concatenated to SQL query
   - Fix: Use prepared statements with parameterized queries

🚨 **Hardcoded API Key** in `src/config/api.ts:12`
   - Risk: High
   - Description: API key committed to repository
   - Fix: Move to environment variables, rotate key immediately

### High Priority (5)
⚠️ **Vulnerable Dependency**: `express@4.16.0` (CVE-2022-24999)
   - Risk: Medium
   - Fix: Update to express@4.18.2 or later
...
```

### Phase 3: Performance Analysis

#### 3.1 Algorithm Efficiency
- O(n²)以上のアルゴリズム検出
- 不要なループネスト
- 非効率なデータ構造使用

#### 3.2 Memory Management
- メモリリークの可能性
- 大きなオブジェクトの不適切な保持
- クロージャによるメモリ消費

#### 3.3 Bundle Size
- 総バンドルサイズ（推奨: <250KB gzipped）
- Tree-shaking未適用パッケージ
- 重複依存関係

**ツール:**
- `webpack-bundle-analyzer`
- `source-map-explorer`

#### 3.4 Runtime Performance
- 同期的なブロッキング処理
- 不要な再レンダリング（React）
- 最適化されていないDBクエリ

**出力:**
```markdown
## Performance Score: 78/100

### Bottlenecks Detected (4)

🐌 **Inefficient Algorithm** in `src/utils/sort.js:23`
   - Current: O(n²) bubble sort
   - Issue: Performance degrades with large datasets
   - Fix: Use built-in Array.sort() or implement quicksort
   - Impact: -60% execution time for 1000+ items

📦 **Large Bundle** in `main.bundle.js`
   - Size: 512KB (gzipped: 156KB)
   - Issue: Exceeds 250KB recommendation
   - Fix: Code splitting, lazy loading
   - Largest contributors:
     - moment.js: 67KB (use date-fns instead)
     - lodash: 45KB (use specific imports)
```

### Phase 4: Test Coverage

#### 4.1 Coverage Metrics
- Line coverage（目標: >80%）
- Branch coverage（目標: >75%）
- Function coverage（目標: >90%）

#### 4.2 Missing Tests
- 重要な関数でテストなし
- エッジケースのテスト不足
- エラーハンドリングのテスト欠如

**ツール:**
- `jest --coverage`
- `pytest --cov`
- `istanbul`

### Phase 5: Accessibility Check (Web Projects)

#### 5.1 WCAG 2.2 Compliance
- **知覚可能**: alt属性、color contrast
- **操作可能**: keyboard navigation、focus indicators
- **理解可能**: clear labels、error messages
- **堅牢性**: semantic HTML、ARIA attributes

**ツール:**
- `axe-core`
- `lighthouse --only-categories=accessibility`
- `pa11y`

**出力:**
```markdown
## Accessibility Score: 88/100

### Issues (7)

⚠️ **Color Contrast** in `Button.tsx:45`
   - Current: 3.2:1
   - Required: 4.5:1 (WCAG AA)
   - Fix: Increase contrast or use darker color

ℹ️ **Missing Alt Text** in `Gallery.tsx:78`
   - 3 images without alt attributes
   - Fix: Add descriptive alt text for screen readers
```

### Phase 6: Report Generation

#### 6.1 Summary Report
```markdown
# Code Quality Suite Report
Generated: 2025-01-16 14:30:00

## Overall Score: 81/100 (Good)

| Category        | Score | Issues |
|-----------------|-------|--------|
| Code Quality    | 85    | 26     |
| Security        | 72    | 12     |
| Performance     | 78    | 8      |
| Test Coverage   | 84    | -      |
| Accessibility   | 88    | 7      |

## Priority Action Items

### 🚨 Critical (Must Fix)
1. Fix SQL injection in queries.js:34
2. Remove hardcoded API key from api.ts:12

### ⚠️ High Priority (Fix Soon)
1. Update vulnerable express dependency
2. Reduce cyclomatic complexity in helper.js:45
3. Fix color contrast issues (3 instances)

### 💡 Improvements (Nice to Have)
1. Increase test coverage to >85%
2. Reduce bundle size by 40%
3. Add missing alt text to images
```

#### 6.2 Detailed Reports
- `quality-report.md`: 詳細な品質分析
- `security-report.md`: セキュリティ詳細レポート
- `performance-report.md`: パフォーマンス分析
- `recommendations.md`: 具体的な改善提案

#### 6.3 Trend Analysis (Optional)
```markdown
## Trend Over Last 5 Runs

Quality Score:    78 → 82 → 80 → 83 → 85 ✅ (+9%)
Security Issues:  18 → 15 → 14 → 13 → 12 ✅ (-33%)
Bundle Size:     580KB → 550KB → 520KB → 510KB → 512KB ⚠️ (-12%)
```

## Error Handling

### Level 1: Recoverable Errors
- **ツール未インストール**: インストール方法を提示
- **設定ファイル不在**: デフォルト設定で実行

### Level 2: User Intervention Required
- **テストスイートなし**: テスト作成を推奨、カバレッジスキップ
- **プロジェクトタイプ不明**: ユーザーに確認

### Level 3: Critical Errors
- **コードが実行不可**: 構文エラーを先に修正するよう指示
- **権限エラー**: 適切な権限を要求

## Performance Notes

- **大規模プロジェクト**: 段階的実行（品質→セキュリティ→パフォーマンス）
- **CI/CD統合**: 並列実行で時間短縮（5-10分→2-3分）
- **キャッシング**: 前回の結果をキャッシュ、差分のみ再スキャン

## Dependencies

### Required
- Node.js >= 16
- Python >= 3.8（セキュリティスキャン用）

### Optional (Better Results)
- ESLint + plugins
- TypeScript (型チェック)
- Jest/Pytest (カバレッジ)
- axe-core (アクセシビリティ)

## Best Practices

1. **定期実行**: 週1回の完全スキャン
2. **CI/CD統合**: プルリクエストごとに自動実行
3. **閾値設定**: 品質スコア<70でビルド失敗
4. **段階的改善**: Critical → High → Medium の順に対応
5. **トレンド追跡**: 改善の可視化

## Related Skills

- `/clean`: 自動修正可能な問題を即座に修正
- `/optimize`: パフォーマンス問題の詳細分析と最適化
- `/dependency-audit`: 依存関係の詳細監査

## Examples

### ✅ Good Usage

```bash
# 定期的な品質チェック
$ code-quality-suite --full

# プルリクエスト前の簡易チェック
$ code-quality-suite --quick --focus=security

# 特定ディレクトリのみ
$ code-quality-suite --path=src/api

# CIモード（JSON出力）
$ code-quality-suite --ci --format=json
```

### ❌ Bad Usage

```bash
# 全チェックをスキップ（意味なし）
$ code-quality-suite --skip-all

# 未コミットの変更が多数ある状態で実行
# → 結果が不正確になる可能性
```

## Notes

- セキュリティスキャンは偽陽性（False Positive）を含む可能性あり
- 手動レビューと組み合わせることを推奨
- レポートは`.reports/`ディレクトリに保存（gitignore推奨）
