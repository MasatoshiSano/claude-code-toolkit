/**
 * Terraform Deployment Script
 *
 * Deploys infrastructure using Terraform with workspace management and S3 backend
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { Logger, createFileError, handleError } from '@claude-code-toolkit/utils';

const logger = new Logger('aws-deploy-automation:terraform');

/**
 * Deploy using Terraform
 * @param {Object} options - Deployment options
 * @param {string} options.workingDir - Terraform working directory
 * @param {string} options.workspace - Terraform workspace (dev, staging, production)
 * @param {string} options.operation - Operation (plan, apply, destroy)
 * @param {Object} options.variables - Terraform variables
 * @param {boolean} options.autoApprove - Auto-approve apply/destroy
 * @returns {Promise<Object>} Deployment result
 */
export async function deployTerraformStack(options) {
  const { workingDir, workspace = 'dev', operation = 'apply', variables = {}, autoApprove = false } = options;

  logger.info(`Starting Terraform ${operation} in workspace: ${workspace}`);

  if (!workingDir || !existsSync(resolve(workingDir))) {
    throw createFileError('read', workingDir, new Error('Terraform directory not found'));
  }

  // Initialize Terraform
  await executeTerraformCommand(['init'], workingDir);

  // Select/create workspace
  await executeTerraformCommand(['workspace', 'select', workspace], workingDir, true);

  // Build command args
  const args = [operation];
  Object.entries(variables).forEach(([key, value]) => {
    args.push('-var', `${key}=${value}`);
  });

  if (autoApprove && (operation === 'apply' || operation === 'destroy')) {
    args.push('-auto-approve');
  }

  // Execute operation
  const result = await executeTerraformCommand(args, workingDir);

  logger.info(`Terraform ${operation} completed successfully`);

  return {
    success: true,
    workspace,
    operation,
    output: result.output
  };
}

/**
 * Execute Terraform command
 */
async function executeTerraformCommand(args, cwd, ignoreErrors = false) {
  return new Promise((resolve, reject) => {
    let output = '';
    const tfProcess = spawn('terraform', args, { cwd, stdio: ['inherit', 'pipe', 'pipe'], shell: true });

    tfProcess.stdout.on('data', (data) => {
      output += data.toString();
      logger.debug(data.toString().trim());
    });

    tfProcess.stderr.on('data', (data) => {
      logger.warn(data.toString().trim());
    });

    tfProcess.on('close', (code) => {
      if (code === 0 || ignoreErrors) {
        resolve({ output, exitCode: code });
      } else {
        reject(new Error(`Terraform command failed with exit code ${code}`));
      }
    });
  });
}

/**
 * Main execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = {
    workingDir: process.env.TF_DIR || process.argv[2] || './terraform',
    workspace: process.env.TF_WORKSPACE || process.argv[3] || 'dev',
    operation: process.env.TF_OPERATION || process.argv[4] || 'plan',
    autoApprove: process.env.AUTO_APPROVE === 'true'
  };

  deployTerraformStack(options)
    .then((result) => {
      logger.info('Terraform operation succeeded', result);
      process.exit(0);
    })
    .catch((error) => {
      const exitCode = handleError(error, logger);
      process.exit(exitCode);
    });
}
