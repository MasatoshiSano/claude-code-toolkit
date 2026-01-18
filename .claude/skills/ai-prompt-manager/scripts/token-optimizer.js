/**
 * Token Optimizer
 *
 * Analyzes and optimizes prompts to reduce token usage
 */

import { Logger, handleError } from '@claude-code-toolkit/utils';
import { encoding_for_model } from 'tiktoken';

const logger = new Logger('ai-prompt-manager:token-optimizer');

/**
 * Optimize prompt to reduce token usage
 * @param {Object} options - Optimization options
 * @param {string} options.prompt - Original prompt
 * @param {string} options.model - Model name
 * @returns {Promise<Object>} Optimization results
 */
export async function optimizeTokens(options) {
  const { prompt, model = 'gpt-4' } = options;

  logger.info('Starting token optimization');

  const encoding = encoding_for_model(model);
  const originalTokens = encoding.encode(prompt).length;

  // Optimization strategies
  const optimizedPrompts = [removeRedundancy(prompt), simplifyLanguage(prompt), removeExamples(prompt)];

  const results = optimizedPrompts.map((optimized, index) => {
    const tokens = encoding.encode(optimized).length;
    const savings = (((originalTokens - tokens) / originalTokens) * 100).toFixed(2);

    return {
      strategy: ['Remove Redundancy', 'Simplify Language', 'Remove Examples'][index],
      prompt: optimized,
      tokens,
      originalTokens,
      savings: `${savings}%`
    };
  });

  encoding.free();

  logger.info('Token optimization completed');

  return {
    original: { prompt, tokens: originalTokens },
    optimizations: results,
    bestOptimization: results.reduce((best, current) => (current.tokens < best.tokens ? current : best))
  };
}

/**
 * Remove redundant phrases
 */
function removeRedundancy(prompt) {
  return prompt
    .replace(/\b(please|kindly)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Simplify language
 */
function simplifyLanguage(prompt) {
  const replacements = {
    utilize: 'use',
    implement: 'do',
    'in order to': 'to',
    'due to the fact that': 'because'
  };

  let simplified = prompt;
  Object.entries(replacements).forEach(([complex, simple]) => {
    simplified = simplified.replace(new RegExp(complex, 'gi'), simple);
  });

  return simplified;
}

/**
 * Remove examples to reduce tokens
 */
function removeExamples(prompt) {
  return prompt.replace(/For example[^.]*\./gi, '').trim();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const testPrompt = 'Please utilize the following guidelines in order to implement the feature. For example, you can use async/await patterns.';

  optimizeTokens({ prompt: testPrompt })
    .then((result) => {
      logger.info(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      const exitCode = handleError(error, logger);
      process.exit(exitCode);
    });
}
