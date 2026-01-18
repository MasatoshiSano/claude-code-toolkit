/**
 * Stack Rollback Script
 *
 * Rolls back CloudFormation/CDK stacks to previous versions
 */

import {
  CloudFormationClient,
  DescribeStacksCommand,
  RollbackStackCommand
} from '@aws-sdk/client-cloudformation';
import { Logger, handleError, createConfigError } from '@claude-code-toolkit/utils';

const logger = new Logger('aws-deploy-automation:rollback');

/**
 * Rollback a stack to previous version
 * @param {Object} options - Rollback options
 * @param {string} options.stackName - Stack name to rollback
 * @param {string} options.region - AWS region
 * @returns {Promise<Object>} Rollback result
 */
export async function rollbackStack(options) {
  const { stackName, region = process.env.AWS_REGION || 'us-east-1' } = options;

  if (!stackName) {
    throw createConfigError('stackName', 'Stack name is required for rollback');
  }

  logger.info(`Initiating rollback for stack: ${stackName}`);

  const client = new CloudFormationClient({ region });

  // Get current stack status
  const describeCommand = new DescribeStacksCommand({ StackName: stackName });
  const stackInfo = await client.send(describeCommand);
  const stack = stackInfo.Stacks[0];

  logger.info(`Current stack status: ${stack.StackStatus}`);

  // Initiate rollback
  if (stack.StackStatus.includes('FAILED') || stack.StackStatus.includes('ROLLBACK')) {
    const rollbackCommand = new RollbackStackCommand({ StackName: stackName });
    await client.send(rollbackCommand);
    logger.info('Rollback initiated successfully');
  } else {
    logger.warn('Stack is not in a failed state, manual rollback may be required');
  }

  return { success: true, stackName, status: stack.StackStatus };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  rollbackStack({ stackName: process.argv[2] })
    .then((result) => {
      logger.info('Rollback succeeded', result);
      process.exit(0);
    })
    .catch((error) => {
      const exitCode = handleError(error, logger);
      process.exit(exitCode);
    });
}
