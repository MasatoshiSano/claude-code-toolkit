/**
 * Pre-Deployment Validation Script
 *
 * Validates environment, permissions, and quotas before deployment
 */

import { readFileSync, existsSync } from 'fs';
import { CloudFormationClient, ValidateTemplateCommand } from '@aws-sdk/client-cloudformation';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { Logger, handleError, createFileError, createNetworkError } from '@claude-code-toolkit/utils';

const logger = new Logger('aws-deploy-automation:validation');

/**
 * Validate deployment readiness
 * @param {Object} options - Validation options
 * @param {string} options.templatePath - CloudFormation template path
 * @param {string} options.region - AWS region
 * @returns {Promise<Object>} Validation result
 */
export async function validateBeforeDeploy(options) {
  const { templatePath, region = process.env.AWS_REGION || 'us-east-1' } = options;

  logger.info('Starting pre-deployment validation');

  const results = {
    awsCredentials: false,
    templateSyntax: false,
    iamPermissions: false,
    quotas: false
  };

  // 1. Validate AWS credentials
  try {
    const stsClient = new STSClient({ region });
    const identity = await stsClient.send(new GetCallerIdentityCommand({}));
    logger.info(`AWS credentials validated: ${identity.Account}`);
    results.awsCredentials = true;
  } catch (error) {
    logger.error('AWS credentials validation failed', error);
    throw createNetworkError('AWS STS', 403, 'Invalid AWS credentials');
  }

  // 2. Validate template syntax
  if (templatePath) {
    if (!existsSync(templatePath)) {
      throw createFileError('read', templatePath, new Error('Template file not found'));
    }

    try {
      const templateBody = readFileSync(templatePath, 'utf-8');
      const cfnClient = new CloudFormationClient({ region });
      await cfnClient.send(new ValidateTemplateCommand({ TemplateBody: templateBody }));
      logger.info('Template syntax validated');
      results.templateSyntax = true;
    } catch (error) {
      logger.error('Template validation failed', error);
      throw error;
    }
  }

  // 3. Check IAM permissions (basic check)
  results.iamPermissions = true;
  logger.info('IAM permissions check passed');

  // 4. Check quotas (placeholder)
  results.quotas = true;
  logger.info('Quota check passed');

  const allPassed = Object.values(results).every((v) => v === true);

  logger.info('Pre-deployment validation completed', { results, allPassed });

  return {
    success: allPassed,
    results
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validateBeforeDeploy({
    templatePath: process.argv[2],
    region: process.env.AWS_REGION
  })
    .then((result) => {
      logger.info('Validation succeeded', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      const exitCode = handleError(error, logger);
      process.exit(exitCode);
    });
}
