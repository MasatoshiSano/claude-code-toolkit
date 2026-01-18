/**
 * Lighthouse Performance Auditor
 *
 * Runs Lighthouse audits and analyzes Core Web Vitals
 */

import { writeFileSync } from 'fs';
import { Logger, handleError } from '@claude-code-toolkit/utils';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const logger = new Logger('frontend-performance-auditor');

/**
 * Run Lighthouse audit
 * @param {Object} options - Audit options
 * @param {string} options.url - URL to audit
 * @param {string} options.outputPath - Output report path
 * @param {Object} options.config - Lighthouse config
 * @returns {Promise<Object>} Audit results
 */
export async function runLighthouseAudit(options) {
  const { url, outputPath, config = {} } = options;

  logger.info(`Starting Lighthouse audit for ${url}`);

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  try {
    const lighthouseConfig = {
      logLevel: 'info',
      output: 'html',
      port: chrome.port,
      ...config
    };

    const runnerResult = await lighthouse(url, lighthouseConfig);

    // Extract key metrics
    const { lhr } = runnerResult;
    const metrics = {
      performance: lhr.categories.performance.score * 100,
      accessibility: lhr.categories.accessibility.score * 100,
      bestPractices: lhr.categories['best-practices'].score * 100,
      seo: lhr.categories.seo.score * 100,
      coreWebVitals: {
        lcp: lhr.audits['largest-contentful-paint'].numericValue,
        fid: lhr.audits['max-potential-fid']?.numericValue,
        cls: lhr.audits['cumulative-layout-shift'].numericValue
      }
    };

    if (outputPath) {
      writeFileSync(outputPath, runnerResult.report);
      logger.info(`Report written to ${outputPath}`);
    }

    logger.info('Lighthouse audit completed', metrics);

    return {
      url,
      metrics,
      recommendations: extractRecommendations(lhr)
    };
  } finally {
    await chrome.kill();
  }
}

/**
 * Extract top recommendations
 */
function extractRecommendations(lhr) {
  const _opportunities = lhr.audits.opportunities || {};

  return Object.values(lhr.audits)
    .filter((audit) => audit.score !== null && audit.score < 0.9)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 5)
    .map((audit) => ({
      title: audit.title,
      description: audit.description,
      score: audit.score
    }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2] || 'https://example.com';

  runLighthouseAudit({ url, outputPath: './lighthouse-report.html' })
    .then((result) => {
      logger.info(JSON.stringify(result.metrics, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      const exitCode = handleError(error, logger);
      process.exit(exitCode);
    });
}
