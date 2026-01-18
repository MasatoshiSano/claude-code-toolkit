# E2E Test Generator

Generate end-to-end tests automatically from user flows with Playwright/Cypress.

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

**Status**: 🚧 Planned (Phase 3 - Q3 2026)
**Supported Frameworks**: Playwright, Cypress

This skill automatically generates E2E test code from user flow descriptions, applies Page Object pattern, supports visual regression testing, and integrates with CI/CD pipelines.

## ✨ Features

### Test Generation

- ✅ Generate tests from Markdown user flows
- ✅ Interactive flow definition with CLI
- ✅ Playwright and Cypress support
- ✅ Automatic Page Object generation

### Testing Patterns

- ✅ Page Object pattern for maintainability
- ✅ Data-driven testing with external datasets
- ✅ Visual regression with screenshot comparison
- ✅ Mobile responsive testing

### CI/CD Integration

- ✅ GitHub Actions workflows
- ✅ Parallel test execution
- ✅ Automatic retries on flaky tests
- ✅ HTML/JSON/JUnit reporters

### Test Maintenance

- ✅ Broken selector detection
- ✅ Auto-fix suggestions
- ✅ Test coverage tracking
- ✅ Performance monitoring

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
cd .claude/skills/e2e-test-generator
npm install
```

### Prerequisites

- Node.js >= 16
- Playwright >= 1.40 (optional, for Playwright tests)
- Cypress >= 13.0 (optional, for Cypress tests)

### Install Testing Frameworks

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Or install Cypress
npm install -D cypress
npx cypress open

# Verify installation
npx playwright --version
# or
npx cypress --version
```

## 🚀 Quick Start

### 1. Define User Flow

Create a user flow in Markdown:

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
```

Save as `flows/user-login.md`.

### 2. Generate Test Code

```bash
# Generate Playwright test
node scripts/test-generator.js \
  --flow flows/user-login.md \
  --framework playwright \
  --output tests/e2e/

# Generate Cypress test
node scripts/test-generator.js \
  --flow flows/user-login.md \
  --framework cypress \
  --output cypress/e2e/
```

### 3. Run Tests

```bash
# Playwright
npx playwright test

# Cypress
npx cypress run
```

## 📖 Usage Examples

### Example 1: Interactive Flow Definition

Define a flow interactively via CLI:

```bash
# Start interactive flow creator
node scripts/flow-recorder.js

# Output:
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
# Step 3:
# Action type: > fill
# Selector: > input[type="password"]
# Value: > Test123!
#
# Step 4:
# Action type: > click
# Selector: > button[type="submit"]
#
# Step 5:
# Action type: > wait
# For: > url
# URL pattern: > /dashboard
#
# Add more steps? [y/N]: n
#
# ✓ Flow defined with 5 steps
# ✓ Saved to flows/user-login.md
# Generate tests now? [y/N]: y
#
# ✓ Generating Playwright tests...
# ✓ Generated test: tests/e2e/user-login.spec.ts
# ✓ Generated Page Object: tests/e2e/pages/LoginPage.ts
# ✓ Done!
```

### Example 2: Generate Playwright Tests with Page Objects

Generate complete test suite with Page Objects:

```bash
# Generate tests
node scripts/test-generator.js \
  --flow flows/user-login.md \
  --framework playwright \
  --output tests/e2e/

# Output:
# ✓ Analyzing flow...
# ✓ Detected 2 pages: LoginPage, DashboardPage
# ✓ Generating Page Objects...
#   - LoginPage (tests/e2e/pages/LoginPage.ts)
#   - DashboardPage (tests/e2e/pages/DashboardPage.ts)
# ✓ Generating test file...
#   - user-login.spec.ts
# ✓ Added 3 test cases:
#   - should successfully login with valid credentials
#   - should show error with invalid credentials
#   - should validate required fields
# ✓ Done!
```

**Generated Playwright Test:**

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
    await loginPage.goto();
    await expect(loginPage.loginForm).toBeVisible();

    await loginPage.fillEmail('test@example.com');
    await loginPage.fillPassword('Test123!');
    await loginPage.clickLoginButton();

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(dashboardPage.userMenu).toBeVisible();
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

**Generated Page Object:**

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

### Example 3: Data-Driven Testing

Generate tests with multiple datasets:

```bash
# Create test data file
cat > test-data/users.json << EOF
{
  "valid": [
    { "email": "test@example.com", "password": "Test123!", "role": "user" },
    { "email": "admin@example.com", "password": "Admin123!", "role": "admin" }
  ],
  "invalid": [
    { "email": "invalid@example.com", "password": "wrong", "expectedError": "Invalid credentials" },
    { "email": "", "password": "Test123!", "expectedError": "Email is required" }
  ]
}
EOF

# Generate data-driven test
node scripts/test-generator.js \
  --flow flows/user-login.md \
  --framework playwright \
  --data-driven test-data/users.json \
  --output tests/e2e/
```

**Generated Data-Driven Test:**

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

### Example 4: Visual Regression Testing

Generate visual regression tests:

```bash
# Generate visual regression tests
node scripts/visual-regression-setup.js \
  --pages flows/user-login.md \
  --framework playwright \
  --output tests/e2e/visual/

# Output:
# ✓ Generating visual regression tests...
# ✓ Created baseline screenshots directory
# ✓ Generated test: tests/e2e/visual/login-page.spec.ts
# ✓ Run tests to create baseline: npx playwright test --update-snapshots
```

**Generated Visual Test:**

```typescript
// tests/e2e/visual/login-page.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Page Visual Regression', () => {
  test('should match baseline screenshot', async ({ page }) => {
    await page.goto('https://app.example.com/login');

    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      maxDiffPixels: 100
    });
  });

  test('should match error state', async ({ page }) => {
    await page.goto('https://app.example.com/login');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveScreenshot('login-page-error.png');
  });

  test('should match responsive layouts', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('https://app.example.com/login');

      await expect(page).toHaveScreenshot(`login-${viewport.name}.png`);
    }
  });
});
```

## ⚙️ Configuration

### Playwright Configuration

Edit `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' }
    },
    {
      name: 'mobile-chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 667 },
        isMobile: true
      }
    }
  ]
});
```

### Cypress Configuration

Edit `cypress.config.js`:

```javascript
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0
    }
  }
};
```

### Test Data Configuration

Edit `test-data/users.json`:

```json
{
  "valid": [
    {
      "email": "test@example.com",
      "password": "Test123!",
      "role": "user",
      "expectedRedirect": "/dashboard"
    },
    {
      "email": "admin@example.com",
      "password": "Admin123!",
      "role": "admin",
      "expectedRedirect": "/admin"
    }
  ],
  "invalid": [
    {
      "email": "invalid@example.com",
      "password": "wrong",
      "expectedError": "Invalid credentials"
    },
    {
      "email": "",
      "password": "Test123!",
      "expectedError": "Email is required"
    },
    {
      "email": "test@example.com",
      "password": "",
      "expectedError": "Password is required"
    }
  ]
}
```

## 🔧 Troubleshooting

### Error: Selector Not Found

**Cause**: Element selector doesn't match DOM

**Solution**:

```bash
# Use Playwright's codegen to find correct selectors
npx playwright codegen https://app.example.com/login

# Or use Cypress selector playground
npx cypress open
# Click on "Selector Playground" icon

# Update selectors in Page Object
# Before: button.login-btn
# After: button[data-testid="login-button"]
```

### Error: Test Timeout

**Cause**: Page loading too slowly or element not appearing

**Solution**:

```typescript
// Increase timeout in playwright.config.ts
export default defineConfig({
  timeout: 30000, // 30 seconds (default: 30s)
  expect: {
    timeout: 5000 // 5 seconds (default: 5s)
  }
});

// Or increase per-test
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  await page.goto('https://slow-site.com');
});
```

### Error: Flaky Tests

**Cause**: Race conditions or network issues

**Solution**:

```typescript
// ❌ Bad: Implicit waits
await page.click('button');
await page.locator('#result').textContent(); // May fail

// ✅ Good: Explicit waits
await page.click('button');
await page.waitForSelector('#result', { state: 'visible' });
const text = await page.locator('#result').textContent();

// Enable retries in CI
// playwright.config.ts
retries: process.env.CI ? 2 : 0
```

### Error: Visual Regression Test Failing

**Cause**: Intentional UI changes or OS font differences

**Solution**:

```bash
# Update baseline screenshots
npx playwright test --update-snapshots

# Or increase tolerance
await expect(page).toHaveScreenshot('login.png', {
  maxDiffPixels: 100 // Allow 100 pixel difference
});

# Ignore specific areas
await expect(page).toHaveScreenshot('login.png', {
  mask: [page.locator('.dynamic-content')]
});
```

### Error: Page Object Selector Broken

**Cause**: Frontend refactoring changed DOM structure

**Solution**:

```bash
# Auto-detect and fix broken selectors
node scripts/fix-selectors.js \
  --tests tests/e2e/ \
  --url https://app.example.com

# Output:
# 🔍 Scanning tests for broken selectors...
#
# Found 3 broken selectors:
# 1. tests/e2e/login.spec.ts:15
#    Selector: button.login-btn
#    Status: Not found
#    Suggestion: button[data-testid="login-button"]
#    Apply fix? [y/N]: y
#
# ✓ Fixed 3/3 selectors
```

## ✅ Best Practices

### 1. Use Page Object Pattern

```typescript
// ❌ Bad: Selectors scattered in test
test('login', async ({ page }) => {
  await page.goto('https://app.example.com/login');
  await page.locator('input[name="email"]').fill('test@example.com');
  await page.locator('input[type="password"]').fill('Test123!');
  await page.locator('button[type="submit"]').click();
});

// ✅ Good: Centralized in Page Object
test('login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'Test123!');
});
```

### 2. Use data-testid for Stable Selectors

```html
<!-- ❌ Bad: CSS class-based selectors (fragile) -->
<button class="btn btn-primary login-btn">Login</button>

<!-- ✅ Good: data-testid attribute (stable) -->
<button class="btn btn-primary" data-testid="login-button">Login</button>
```

```typescript
// Test code
await page.locator('[data-testid="login-button"]').click();
```

### 3. Keep Tests Independent

```typescript
// ❌ Bad: Tests depend on each other
test('create user', async ({ page }) => {
  // Creates user with ID=123
});

test('update user', async ({ page }) => {
  // Assumes user ID=123 exists from previous test
});

// ✅ Good: Each test is self-contained
test('create user', async ({ page }) => {
  await createTestUser();
  // Test logic
  await cleanupTestUser();
});

test('update user', async ({ page }) => {
  const user = await createTestUser(); // Create own test data
  // Test logic
  await cleanupTestUser(user.id);
});
```

### 4. Use Explicit Waits

```typescript
// ❌ Bad: Hard-coded delays
await page.click('button');
await page.waitForTimeout(2000); // Arbitrary wait

// ✅ Good: Wait for specific condition
await page.click('button');
await page.waitForSelector('#result', { state: 'visible' });
// or
await expect(page.locator('#result')).toBeVisible();
```

### 5. Run Tests in Parallel

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true, // Run tests in parallel
  workers: process.env.CI ? 2 : undefined, // 2 workers in CI
  // ...
});

// Mark tests that can't run in parallel
test.describe.serial('checkout flow', () => {
  // These tests run sequentially
  test('step 1', async ({ page }) => {});
  test('step 2', async ({ page }) => {});
});
```

## 📚 Related Documentation

- [SKILL.md](SKILL.md) - Complete skill specifications
- [examples/user-login-flow.md](examples/user-login-flow.md) - Sample user flow
- [examples/generated-tests/](examples/generated-tests/) - Sample generated tests
- [Playwright Documentation](https://playwright.dev/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Page Object Model](https://playwright.dev/docs/pom)

## 📝 License

MIT

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

---

**Need help?** Create an issue or see [Troubleshooting](#troubleshooting) above.
