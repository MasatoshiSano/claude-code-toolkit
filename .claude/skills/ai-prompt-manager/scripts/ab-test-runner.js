/**
 * A/B Test Runner for AI Prompts
 *
 * Runs A/B tests comparing multiple prompts across quality, cost, and speed
 */

import Anthropic from '@anthropic-ai/sdk';
import { Logger, handleError, createProgressBar } from '@claude-code-toolkit/utils';
import OpenAI from 'openai';

const logger = new Logger('ai-prompt-manager:ab-test');

/**
 * Run A/B test comparing multiple prompts
 * @param {Object} options - Test options
 * @param {Array<string>} options.prompts - Array of prompts to test
 * @param {string} options.model - AI model to use
 * @param {Array<string>} options.testInputs - Test inputs
 * @param {string} options.provider - AI provider (anthropic/openai)
 * @returns {Promise<Object>} Test results
 */
export async function runAbTest(options) {
  const { prompts, model = 'claude-3-5-sonnet-20241022', testInputs, provider = 'anthropic' } = options;

  logger.info(`Starting A/B test with ${prompts.length} prompts and ${testInputs.length} test inputs`);

  const results = [];
  const progressBar = createProgressBar('Running A/B tests', prompts.length * testInputs.length);
  progressBar.start();

  let completed = 0;

  for (let i = 0; i < prompts.length; i++) {
    const promptResults = {
      promptId: `prompt_${i}`,
      prompt: prompts[i],
      tests: []
    };

    for (const input of testInputs) {
      const result = await runSingleTest(provider, model, prompts[i], input);
      promptResults.tests.push(result);

      completed++;
      progressBar.update(completed);
    }

    // Calculate averages
    promptResults.avgLatency = average(promptResults.tests.map((t) => t.latency));
    promptResults.avgTokens = average(promptResults.tests.map((t) => t.tokens));
    promptResults.avgCost = average(promptResults.tests.map((t) => t.cost));

    results.push(promptResults);
  }

  progressBar.complete();

  logger.info('A/B test completed', { totalTests: completed });

  return {
    results,
    winner: determineWinner(results)
  };
}

/**
 * Run single test
 */
async function runSingleTest(provider, model, prompt, input) {
  const startTime = Date.now();
  let response;
  let tokens;
  let cost;

  if (provider === 'anthropic') {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const result = await client.messages.create({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: `${prompt}\n\n${input}` }]
    });

    tokens = result.usage.input_tokens + result.usage.output_tokens;
    cost = calculateCost(model, result.usage.input_tokens, result.usage.output_tokens);
    response = result.content[0].text;
  } else if (provider === 'openai') {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: `${prompt}\n\n${input}` }]
    });

    tokens = result.usage.total_tokens;
    cost = calculateCost(model, result.usage.prompt_tokens, result.usage.completion_tokens);
    response = result.choices[0].message.content;
  }

  const latency = Date.now() - startTime;

  return { response, latency, tokens, cost };
}

/**
 * Calculate cost based on model and token usage
 */
function calculateCost(model, inputTokens, outputTokens) {
  const pricing = {
    'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }
  };

  const rates = pricing[model] || { input: 0.001, output: 0.002 };
  return (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output;
}

/**
 * Determine winner based on cost/latency/quality balance
 */
function determineWinner(results) {
  let bestScore = Infinity;
  let winner = null;

  results.forEach((result) => {
    // Composite score: lower is better (weighted: 40% cost, 40% latency, 20% tokens)
    const score = result.avgCost * 0.4 + (result.avgLatency * 0.4) / 1000 + (result.avgTokens * 0.2) / 1000;

    if (score < bestScore) {
      bestScore = score;
      winner = result.promptId;
    }
  });

  return winner;
}

/**
 * Calculate average
 */
function average(numbers) {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const testOptions = {
    prompts: [
      'You are a helpful assistant. Answer concisely.',
      'You are a helpful assistant. Provide detailed answers.'
    ],
    testInputs: ['What is JavaScript?', 'Explain async/await'],
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022'
  };

  runAbTest(testOptions)
    .then((result) => {
      logger.info('Test results:', result);
      logger.info(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      const exitCode = handleError(error, logger);
      process.exit(exitCode);
    });
}
