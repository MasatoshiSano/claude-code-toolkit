/**
 * E2E Test Generator
 *
 * Generates Playwright/Cypress tests from user flow definitions
 */

import { writeFileSync } from 'fs';
import { Logger, handleError } from '@claude-code-toolkit/utils';

const logger = new Logger('e2e-test-generator');

/**
 * Generate E2E tests from user flow
 * @param {Object} options - Generation options
 * @param {Object} options.flow - User flow definition
 * @param {string} options.framework - Test framework (playwright/cypress)
 * @param {string} options.outputPath - Output file path
 * @returns {Promise<string>} Generated test code
 */
export async function generateTests(options) {
  const { flow, framework = 'playwright', outputPath } = options;

  logger.info(`Generating ${framework} tests from user flow: ${flow.name}`);

  let testCode;

  if (framework === 'playwright') {
    testCode = generatePlaywrightTest(flow);
  } else if (framework === 'cypress') {
    testCode = generateCypressTest(flow);
  } else {
    throw new Error(`Unsupported framework: ${framework}`);
  }

  if (outputPath) {
    writeFileSync(outputPath, testCode);
    logger.info(`Test written to ${outputPath}`);
  }

  return testCode;
}

/**
 * Generate Playwright test
 */
function generatePlaywrightTest(flow) {
  const steps = flow.steps
    .map((step) => {
      switch (step.action) {
        case 'navigate':
          return `  await page.goto('${step.url}');`;
        case 'click':
          return `  await page.click('${step.selector}');`;
        case 'fill':
          return `  await page.fill('${step.selector}', '${step.value}');`;
        case 'expect':
          return `  await expect(page.locator('${step.selector}')).toHaveText('${step.text}');`;
        default:
          return `  // ${step.action}`;
      }
    })
    .join('\n');

  return `import { test, expect } from '@playwright/test';

test.describe('${flow.name}', () => {
  test('${flow.description}', async ({ page }) => {
${steps}
  });
});
`;
}

/**
 * Generate Cypress test
 */
function generateCypressTest(flow) {
  const steps = flow.steps
    .map((step) => {
      switch (step.action) {
        case 'navigate':
          return `    cy.visit('${step.url}');`;
        case 'click':
          return `    cy.get('${step.selector}').click();`;
        case 'fill':
          return `    cy.get('${step.selector}').type('${step.value}');`;
        case 'expect':
          return `    cy.get('${step.selector}').should('have.text', '${step.text}');`;
        default:
          return `    // ${step.action}`;
      }
    })
    .join('\n');

  return `describe('${flow.name}', () => {
  it('${flow.description}', () => {
${steps}
  });
});
`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sampleFlow = {
    name: 'User Login',
    description: 'User can login successfully',
    steps: [
      { action: 'navigate', url: 'https://example.com/login' },
      { action: 'fill', selector: '#username', value: 'testuser' },
      { action: 'fill', selector: '#password', value: 'password123' },
      { action: 'click', selector: 'button[type="submit"]' },
      { action: 'expect', selector: '.welcome-message', text: 'Welcome, testuser!' }
    ]
  };

  generateTests({ flow: sampleFlow, framework: 'playwright' })
    .then((code) => {
      logger.info(code);
      process.exit(0);
    })
    .catch((error) => {
      const exitCode = handleError(error, logger);
      process.exit(exitCode);
    });
}
