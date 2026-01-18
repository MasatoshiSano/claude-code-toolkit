/**
 * Common Utilities for Agent Skills
 *
 * Exports all shared utilities for use across Agent Skills
 */

const {
  parseCliArgs,
  createOption,
  stringOption,
  numberOption,
  booleanOption,
  arrayOption,
  choiceOption,
  validateRequiredArgs
} = require('./cli-parser');
const { loadConfig, mergeConfig, expandEnvVars, loadConfigWithOverride, saveConfig } = require('./config-loader');
const {
  SkillError,
  handleError,
  wrapAsync,
  createValidationError,
  createFileError,
  createNetworkError,
  createConfigError
} = require('./error-handler');
const { Logger } = require('./logger');
const { createProgressBar, createMultiBar, ProgressBar } = require('./progress-bar');

module.exports = {
  Logger,
  SkillError,
  handleError,
  wrapAsync,
  createValidationError,
  createFileError,
  createNetworkError,
  createConfigError,
  parseCliArgs,
  createOption,
  stringOption,
  numberOption,
  booleanOption,
  arrayOption,
  choiceOption,
  validateRequiredArgs,
  loadConfig,
  mergeConfig,
  expandEnvVars,
  loadConfigWithOverride,
  saveConfig,
  createProgressBar,
  createMultiBar,
  ProgressBar
};
