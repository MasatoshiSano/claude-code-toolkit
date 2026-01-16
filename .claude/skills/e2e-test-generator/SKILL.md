---
name: e2e-test-generator
description: Generate end-to-end tests automatically from user flows with Playwright/Cypress
version: 1.0.0
author: Claude Code Toolkit
license: MIT
tags:
  - testing
  - e2e
  - playwright
  - cypress
  - automation
requires:
  - node>=16
  - playwright>=1.40 (optional)
  - cypress>=13.0 (optional)
---

# E2E Test Generator Agent Skill

## Purpose

このスキルは、ユーザーフローからE2Eテストを自動生成します。
Playwright/Cypress対応、ページオブジェクトパターン適用、視覚的回帰テスト、CI/CD統合をサポートします。

## When to Use

- 新しい機能のE2Eテストを作成する時
- 既存の手動テストを自動化したい時
- ユーザーフローをテストコードに変換したい時
- 視覚的回帰テストを導入したい時
- CI/CDでE2Eテストを自動実行したい時

## Architecture

```
scripts/
├── flow-recorder.js           # ユーザーフロー録画
├── test-generator.js          # テストコード生成
├── page-object-generator.js   # Page Object生成
├── visual-regression-setup.js # 視覚的回帰テスト設定
└── ci-config-generator.js     # CI/CD設定生成

templates/
├── playwright/
│   ├── test-template.ts
│   ├── page-object-template.ts
│   └── config-template.ts
├── cypress/
│   ├── test-template.js
│   ├── page-object-template.js
│   └── config-template.js
└── common/
    └── assertions-template.ts

examples/
├── user-login-flow.md         # ユーザーフロー例
├── checkout-flow.md           # チェックアウトフロー例
└── generated-tests/           # 生成されたテスト例
```

## Instructions

### Phase 1: User Flow Definition

#### 1.1 ユーザーフローの記述

**Markdown形式:**
```markdown
# User Flow: Login

## Prerequisites
- User exists with email: test@example.com
- Password: Test123!

## Steps

### Step 1: Navigate to login page
- URL: https://app.example.com/login
- Expected: Login form is visible

### Step 2: Enter credentials
- Action: Fill email field with "test@example.com"
- Action: Fill password field with "Test123!"
- Selector: input[name="email"]
- Selector: input[type="password"]

### Step 3: Submit form
- Action: Click login button
- Selector: button[type="submit"]
- Expected: Redirected to /dashboard

### Step 4: Verify logged in
- Expected: User menu is visible
- Expected: Welcome message contains "test@example.com"
- Selector: [data-testid="user-menu"]
```

#### 1.2 対話的フロー定義

```bash
# 対話的にフローを定義
agent e2e-test-generator create-flow

# 出力:
# Let's create an E2E test flow
#
# Flow name: User Login
# Description: Test user login functionality
#
# Step 1:
# Action type: [navigate/click/fill/select/wait]
# > navigate
# URL: > https://app.example.com/login
#
# Step 2:
# Action type: > fill
# Selector: > input[name="email"]
# Value: > test@example.com
#
# ... (continue for all steps)
#
# ✓ Flow defined
# ✓ Saved to flows/user-login.md
```

### Phase 2: Test Code Generation

#### 2.1 Playwrightテスト生成

```bash
# フローからテスト生成
agent e2e-test-generator generate \
  --flow=flows/user-login.md \
  --framework=playwright \
  --output=tests/e2e/

# 出力:
# ✓ Analyzing flow...
# ✓ Generating Page Objects...
#   - LoginPage (tests/e2e/pages/LoginPage.ts)
#   - DashboardPage (tests/e2e/pages/DashboardPage.ts)
# ✓ Generating Test...
#   - user-login.spec.ts
# ✓ Done!
```

**生成されたテスト:**
```typescript
// tests/e2e/user-login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('User Login', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Step 1: Navigate to login page
    await loginPage.goto();
    await expect(loginPage.loginForm).toBeVisible();

    // Step 2: Enter credentials
    await loginPage.fillEmail('test@example.com');
    await loginPage.fillPassword('Test123!');

    // Step 3: Submit form
    await loginPage.clickLoginButton();

    // Step 4: Verify logged in
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(dashboardPage.userMenu).toBeVisible();
    await expect(dashboardPage.welcomeMessage).toContainText('test@example.com');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await loginPage.goto();
    await loginPage.fillEmail('test@example.com');
    await loginPage.fillPassword('wrongpassword');
    await loginPage.clickLoginButton();

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Invalid credentials');
  });

  test('should validate required fields', async ({ page }) => {
    await loginPage.goto();
    await loginPage.clickLoginButton();

    await expect(loginPage.emailError).toContainText('Email is required');
    await expect(loginPage.passwordError).toContainText('Password is required');
  });
});
```

**Page Object:**
```typescript
// tests/e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly loginForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginForm = page.locator('[data-testid="login-form"]');
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.emailError = page.locator('[data-testid="email-error"]');
    this.passwordError = page.locator('[data-testid="password-error"]');
  }

  async goto() {
    await this.page.goto('https://app.example.com/login');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }
}
```

#### 2.2 Cypressテスト生成

```bash
# Cypress形式で生成
agent e2e-test-generator generate \
  --flow=flows/user-login.md \
  --framework=cypress \
  --output=cypress/e2e/
```

**生成されたCypressテスト:**
```javascript
// cypress/e2e/user-login.cy.js
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

describe('User Login', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();

  beforeEach(() => {
    cy.visit('/login');
  });

  it('should successfully login with valid credentials', () => {
    loginPage.fillEmail('test@example.com');
    loginPage.fillPassword('Test123!');
    loginPage.submit();

    cy.url().should('include', '/dashboard');
    dashboardPage.userMenu().should('be.visible');
    dashboardPage.welcomeMessage().should('contain', 'test@example.com');
  });

  it('should show error with invalid credentials', () => {
    loginPage.fillEmail('test@example.com');
    loginPage.fillPassword('wrongpassword');
    loginPage.submit();

    loginPage.errorMessage().should('be.visible');
    loginPage.errorMessage().should('contain', 'Invalid credentials');
  });
});
```

### Phase 3: Data-Driven Tests

#### 3.1 テストデータの定義

```typescript
// tests/e2e/data/users.ts
export const testUsers = {
  valid: [
    { email: 'test@example.com', password: 'Test123!', role: 'user' },
    { email: 'admin@example.com', password: 'Admin123!', role: 'admin' },
  ],
  invalid: [
    { email: 'invalid@example.com', password: 'wrong', expectedError: 'Invalid credentials' },
    { email: '', password: 'Test123!', expectedError: 'Email is required' },
    { email: 'test@example.com', password: '', expectedError: 'Password is required' },
  ]
};
```

**データ駆動テスト:**
```typescript
import { testUsers } from '../data/users';

test.describe('Login with multiple users', () => {
  for (const user of testUsers.valid) {
    test(`should login successfully as ${user.role}`, async ({ page }) => {
      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await expect(page).toHaveURL(/.*dashboard/);
    });
  }

  for (const user of testUsers.invalid) {
    test(`should show error: ${user.expectedError}`, async ({ page }) => {
      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await expect(loginPage.errorMessage).toContainText(user.expectedError);
    });
  }
});
```

### Phase 4: Visual Regression Testing

#### 4.1 スクリーンショット比較

```typescript
// tests/e2e/visual-regression/login-page.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Page Visual Regression', () => {
  test('should match baseline screenshot', async ({ page }) => {
    await page.goto('https://app.example.com/login');

    // フルページスクリーンショット
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      maxDiffPixels: 100
    });
  });

  test('should match error state', async ({ page }) => {
    await page.goto('https://app.example.com/login');
    await page.locator('button[type="submit"]').click();

    // エラー状態のスクリーンショット
    await expect(page).toHaveScreenshot('login-page-error.png');
  });

  test('should match responsive layouts', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('https://app.example.com/login');

      await expect(page).toHaveScreenshot(`login-${viewport.name}.png`);
    }
  });
});
```

### Phase 5: CI/CD Integration

#### 5.1 GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e -- --project=${{ matrix.browser }}
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots-${{ matrix.browser }}
          path: test-results/
```

#### 5.2 並列実行

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
    {
      name: 'mobile-chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 667 },
        isMobile: true,
      },
    },
  ],
});
```

### Phase 6: Test Maintenance

#### 6.1 Selectorの自動修復

```bash
# 壊れたselectorを検出して修正
agent e2e-test-generator fix-selectors \
  --tests=tests/e2e/ \
  --url=https://app.example.com

# 出力:
# 🔍 Scanning tests for broken selectors...
#
# Found 3 broken selectors:
# 1. tests/e2e/login.spec.ts:15
#    Selector: button.login-btn
#    Status: Not found
#    Suggestion: button[data-testid="login-button"]
#    Apply fix? [y/N]: y
#
# 2. tests/e2e/dashboard.spec.ts:22
#    Selector: div.user-menu
#    Status: Multiple matches (3 elements)
#    Suggestion: [data-testid="user-menu"]
#    Apply fix? [y/N]: y
#
# ✓ Fixed 2/3 selectors
# ⚠ 1 selector requires manual review
```

## Error Handling

### Level 1: Recoverable Errors

- **Selectorが見つからない**: 代替selectorを提案
- **タイムアウト**: リトライ、待機時間延長

### Level 2: User Intervention Required

- **複数要素にマッチ**: より具体的なselectorを要求
- **ページ構造変更**: テスト更新を推奨

### Level 3: Critical Errors

- **テスト環境起動失敗**: 環境設定の確認を要求
- **ブラウザ起動失敗**: Playwright/Cypress再インストールを案内

## Performance Notes

- **並列実行**: 複数のテストを同時実行
- **スマートリトライ**: 失敗したテストのみリトライ
- **選択的実行**: 変更されたファイルに関連するテストのみ実行

## Dependencies

- Node.js >= 16
- Playwright >= 1.40 または Cypress >= 13.0

## Best Practices

1. **Page Objectパターン**: テストロジックとページ構造を分離
2. **data-testid属性**: 安定したselectorのため専用属性を使用
3. **独立したテスト**: テスト間の依存関係を避ける
4. **適切な待機**: 明示的な待機を使用、暗黙的待機は避ける
5. **視覚的回帰テスト**: 重要な画面は視覚的にも検証

## Related Skills

- `api-contract-validator`: APIコントラクトからテストデータ生成
- `frontend-performance-auditor`: パフォーマンステストと組み合わせ

## Examples

### ✅ Good Example: Generated Test

```bash
Input: agent e2e-test-generator generate --flow=flows/checkout.md

Output:
✓ Generated 5 test files:
  - checkout-flow.spec.ts (main flow)
  - checkout-error-handling.spec.ts (error cases)
  - checkout-payment.spec.ts (payment scenarios)
  - checkout-visual.spec.ts (visual regression)
  - checkout-mobile.spec.ts (mobile responsive)

✓ Generated 3 Page Objects:
  - CheckoutPage.ts
  - PaymentPage.ts
  - ConfirmationPage.ts

Ready to run: npm run test:e2e
```

## Notes

- テストは実際のユーザー行動を再現
- 過度に詳細なテストは避ける（メンテナンスコスト）
- 重要なユーザーフローを優先
