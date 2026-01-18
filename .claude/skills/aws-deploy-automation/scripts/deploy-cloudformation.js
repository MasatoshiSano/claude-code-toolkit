/**
 * CloudFormation Deployment Script
 *
 * Deploys AWS CloudFormation stacks with validation, rollback, and monitoring
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import {
  CloudFormationClient,
  CreateStackCommand,
  UpdateStackCommand,
  DescribeStacksCommand,
  ValidateTemplateCommand,
  waitUntilStackCreateComplete,
  waitUntilStackUpdateComplete
} from '@aws-sdk/client-cloudformation';
import {
  Logger,
  createFileError,
  createConfigError,
  createNetworkError,
  handleError,
  loadConfig,
  createProgressBar
} from '@claude-code-toolkit/utils';

const logger = new Logger('aws-deploy-automation:cloudformation');

/**
 * Deploy a CloudFormation stack
 * @param {Object} options - Deployment options
 * @param {string} options.stackName - CloudFormation stack name
 * @param {string} options.templatePath - Path to CloudFormation template
 * @param {string} options.environment - Environment (dev, staging, production)
 * @param {Object} options.parameters - CloudFormation parameters
 * @param {Object} options.tags - Tags to apply to stack
 * @param {Array<string>} options.capabilities - Required capabilities (e.g., CAPABILITY_IAM)
 * @param {string} options.region - AWS region
 * @returns {Promise<Object>} Deployment result
 */
export async function deployCloudFormationStack(options) {
  const {
    stackName,
    templatePath,
    environment = 'dev',
    parameters = {},
    tags = {},
    capabilities = ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
    region = process.env.AWS_REGION || 'us-east-1'
  } = options;

  logger.info(`Starting CloudFormation deployment for stack: ${stackName}`);
  logger.debug('Deployment options', { stackName, templatePath, environment, region });

  // Validate inputs
  if (!stackName) {
    throw createConfigError('stackName', 'Stack name is required');
  }

  if (!templatePath) {
    throw createConfigError('templatePath', 'Template path is required');
  }

  // Read template
  const resolvedTemplatePath = resolve(templatePath);
  if (!existsSync(resolvedTemplatePath)) {
    throw createFileError('read', resolvedTemplatePath, new Error('Template file not found'));
  }

  const templateBody = readFileSync(resolvedTemplatePath, 'utf-8');

  // Initialize CloudFormation client
  const client = new CloudFormationClient({ region });

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
  }

  // Validate template
  logger.info('Validating CloudFormation template');
  await validateTemplate(client, templateBody);

  // Merge parameters and tags
  const allParameters = formatParameters({ ...config.parameters, ...parameters });
  const allTags = formatTags({
    Environment: environment,
    ManagedBy: 'claude-code-toolkit',
    DeploymentTool: 'cloudformation',
    ...config.tags,
    ...tags
  });

  // Check if stack exists
  const stackExists = await checkStackExists(client, stackName);

  logger.info(`Stack ${stackExists ? 'exists' : 'does not exist'}, performing ${stackExists ? 'update' : 'create'}`);

  // Deploy stack
  const result = stackExists
    ? await updateStack(client, stackName, templateBody, allParameters, allTags, capabilities)
    : await createStack(client, stackName, templateBody, allParameters, allTags, capabilities);

  logger.info('CloudFormation deployment completed successfully', { stackName, environment });

  return {
    success: true,
    stackName,
    environment,
    region,
    stackId: result.StackId,
    operation: stackExists ? 'UPDATE' : 'CREATE'
  };
}

/**
 * Validate CloudFormation template
 */
async function validateTemplate(client, templateBody) {
  try {
    const command = new ValidateTemplateCommand({ TemplateBody: templateBody });
    await client.send(command);
    logger.info('Template validation passed');
  } catch (error) {
    throw createNetworkError('CloudFormation', 400, `Template validation failed: ${error.message}`);
  }
}

/**
 * Check if stack exists
 */
async function checkStackExists(client, stackName) {
  try {
    const command = new DescribeStacksCommand({ StackName: stackName });
    await client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'ValidationError' && error.message.includes('does not exist')) {
      return false;
    }
    throw error;
  }
}

/**
 * Create CloudFormation stack
 */
async function createStack(client, stackName, templateBody, parameters, tags, capabilities) {
  logger.info(`Creating stack: ${stackName}`);

  const command = new CreateStackCommand({
    StackName: stackName,
    TemplateBody: templateBody,
    Parameters: parameters,
    Tags: tags,
    Capabilities: capabilities,
    OnFailure: 'ROLLBACK'
  });

  const response = await client.send(command);
  logger.info(`Stack creation initiated: ${response.StackId}`);

  // Wait for stack creation to complete
  const progressBar = createProgressBar('Creating CloudFormation stack', 100);
  progressBar.start(0, { stage: 'Initializing' });

  try {
    await waitUntilStackCreateComplete(
      { client, maxWaitTime: 3600, minDelay: 5, maxDelay: 30 },
      { StackName: stackName }
    );
    progressBar.complete();
  } catch (error) {
    progressBar.stop();
    throw error;
  }

  return response;
}

/**
 * Update CloudFormation stack
 */
async function updateStack(client, stackName, templateBody, parameters, tags, capabilities) {
  logger.info(`Updating stack: ${stackName}`);

  try {
    const command = new UpdateStackCommand({
      StackName: stackName,
      TemplateBody: templateBody,
      Parameters: parameters,
      Tags: tags,
      Capabilities: capabilities
    });

    const response = await client.send(command);
    logger.info(`Stack update initiated: ${response.StackId}`);

    // Wait for stack update to complete
    const progressBar = createProgressBar('Updating CloudFormation stack', 100);
    progressBar.start(0, { stage: 'Updating' });

    try {
      await waitUntilStackUpdateComplete(
        { client, maxWaitTime: 3600, minDelay: 5, maxDelay: 30 },
        { StackName: stackName }
      );
      progressBar.complete();
    } catch (error) {
      progressBar.stop();
      throw error;
    }

    return response;
  } catch (error) {
    if (error.message?.includes('No updates are to be performed')) {
      logger.info('No updates needed for stack');
      return { StackId: stackName, NoUpdates: true };
    }
    throw error;
  }
}

/**
 * Format parameters for CloudFormation
 */
function formatParameters(params) {
  return Object.entries(params).map(([key, value]) => ({
    ParameterKey: key,
    ParameterValue: String(value)
  }));
}

/**
 * Format tags for CloudFormation
 */
function formatTags(tags) {
  return Object.entries(tags).map(([key, value]) => ({
    Key: key,
    Value: String(value)
  }));
}

/**
 * Main execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = {
    stackName: process.env.STACK_NAME || process.argv[2],
    templatePath: process.env.TEMPLATE_PATH || process.argv[3],
    environment: process.env.ENVIRONMENT || process.argv[4] || 'dev',
    region: process.env.AWS_REGION
  };

  deployCloudFormationStack(options)
    .then((result) => {
      logger.info('Deployment succeeded', result);
      process.exit(0);
    })
    .catch((error) => {
      const exitCode = handleError(error, logger);
      process.exit(exitCode);
    });
}
