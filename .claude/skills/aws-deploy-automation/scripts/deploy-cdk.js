/**
 * CDK Deployment Script
 *
 * Deploys AWS CDK stacks with validation, tagging, and progress reporting
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import {
  Logger,
  createFileError,
  createConfigError,
  handleError,
  loadConfig,
  createProgressBar
} from '@claude-code-toolkit/utils';

const logger = new Logger('aws-deploy-automation:cdk');

/**
 * Deploy a CDK stack
 * @param {Object} options - Deployment options
 * @param {string} options.stackName - CDK stack name
 * @param {string} options.app - CDK app path
 * @param {string} options.environment - Environment (dev, staging, production)
 * @param {Object} options.context - CDK context variables
 * @param {Object} options.tags - Tags to apply to resources
 * @param {boolean} options.requireApproval - Require manual approval for changes
 * @param {boolean} options.dryRun - Perform diff without deploying
 * @returns {Promise<Object>} Deployment result
 */
export async function deployCdkStack(options) {
  const {
    stackName,
    app,
    environment = 'dev',
    context = {},
    tags = {},
    requireApproval = true,
    dryRun = false
  } = options;

  logger.info(`Starting CDK deployment for stack: ${stackName}`);
  logger.debug('Deployment options', { stackName, environment, dryRun });

  // Validate inputs
  if (!stackName) {
    throw createConfigError('stackName', 'Stack name is required');
  }

  if (!app) {
    throw createConfigError('app', 'CDK app path is required');
  }

  // Resolve app path
  const appPath = resolve(app);
  if (!existsSync(appPath)) {
    throw createFileError('read', appPath, new Error('CDK app not found'));
  }

  // Load environment configuration
  const configPath = join(
    process.cwd(),
    '.claude/skills/aws-deploy-automation/configs/environments',
    `${environment}.json`
  );
  let config = {};
  if (existsSync(configPath)) {
    config = loadConfig(configPath);
    logger.info(`Loaded environment configuration: ${environment}`);
  } else {
    logger.warn(`Environment configuration not found: ${configPath}`);
  }

  // Merge tags
  const allTags = {
    Environment: environment,
    ManagedBy: 'claude-code-toolkit',
    DeploymentTool: 'aws-cdk',
    ...config.tags,
    ...tags
  };

  // Build CDK command
  const cdkCommand = dryRun ? 'diff' : 'deploy';
  const args = [
    cdkCommand,
    stackName,
    '--app',
    appPath,
    '--require-approval',
    requireApproval ? 'any-change' : 'never',
    '--output',
    join(process.cwd(), '.claude/skills/aws-deploy-automation/reports', `cdk-${stackName}-${Date.now()}`)
  ];

  // Add context variables
  Object.entries({ ...config.context, ...context }).forEach(([key, value]) => {
    args.push('--context', `${key}=${value}`);
  });

  // Add tags
  Object.entries(allTags).forEach(([key, value]) => {
    args.push('--tags', `${key}=${value}`);
  });

  logger.info(`Executing CDK command: cdk ${args.join(' ')}`);

  // Execute CDK deployment
  const result = await executeCdkCommand(args, dryRun);

  logger.info('CDK deployment completed successfully', { stackName, environment });

  return {
    success: true,
    stackName,
    environment,
    dryRun,
    output: result.output,
    exitCode: result.exitCode
  };
}

/**
 * Execute CDK command using child_process
 * @param {Array<string>} args - CDK command arguments
 * @param {boolean} dryRun - Whether this is a dry run
 * @returns {Promise<Object>} Command execution result
 */
async function executeCdkCommand(args, dryRun = false) {
  return new Promise((resolve, reject) => {
    const progressBar = dryRun ? null : createProgressBar('Deploying CDK stack', 100);

    if (progressBar && !dryRun) {
      progressBar.start(0, { stage: 'Initializing' });
    }

    let output = '';
    let errorOutput = '';
    let progress = 0;

    const cdkProcess = spawn('cdk', args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });

    cdkProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      logger.debug(chunk.trim());

      // Update progress based on output
      if (chunk.includes('synthesizing')) {
        progress = 20;
        if (progressBar) progressBar.update(progress, { stage: 'Synthesizing' });
      } else if (chunk.includes('bootstrapping')) {
        progress = 40;
        if (progressBar) progressBar.update(progress, { stage: 'Bootstrapping' });
      } else if (chunk.includes('deploying')) {
        progress = 60;
        if (progressBar) progressBar.update(progress, { stage: 'Deploying' });
      } else if (chunk.includes('CloudFormation')) {
        progress = 80;
        if (progressBar) progressBar.update(progress, { stage: 'CloudFormation' });
      }
    });

    cdkProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      logger.warn(chunk.trim());
    });

    cdkProcess.on('close', (code) => {
      if (progressBar) {
        if (code === 0) {
          progressBar.complete();
        } else {
          progressBar.stop();
        }
      }

      if (code === 0) {
        resolve({
          success: true,
          output,
          errorOutput,
          exitCode: code
        });
      } else {
        reject(new Error(`CDK command failed with exit code ${code}: ${errorOutput}`));
      }
    });

    cdkProcess.on('error', (error) => {
      if (progressBar) {
        progressBar.stop();
      }
      reject(error);
    });
  });
}

/**
 * Main execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = {
    stackName: process.env.STACK_NAME || process.argv[2],
    app: process.env.CDK_APP || process.argv[3] || './cdk.out',
    environment: process.env.ENVIRONMENT || process.argv[4] || 'dev',
    requireApproval: process.env.REQUIRE_APPROVAL !== 'false',
    dryRun: process.env.DRY_RUN === 'true'
  };

  deployCdkStack(options)
    .then((result) => {
      logger.info('Deployment succeeded', result);
      process.exit(0);
    })
    .catch((error) => {
      const exitCode = handleError(error, logger);
      process.exit(exitCode);
    });
}
