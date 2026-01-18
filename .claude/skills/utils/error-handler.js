/**
 * Error Handler - Unified error handling for Agent Skills
 *
 * Provides custom error classes and error handling functions
 * with consistent logging and exit codes
 */

/**
 * SkillError - Custom error class for Agent Skills
 */
class SkillError extends Error {
  /**
   * Create a SkillError
   * @param {string} message - Error message
   * @param {number} code - Error exit code
   * @param {Object} details - Additional error details
   */
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'SkillError';
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle errors with logging and return appropriate exit code
 * @param {Error|SkillError|*} error - The error to handle
 * @param {Logger} logger - Logger instance for error logging
 * @returns {number} Exit code for the process
 */
function handleError(error, logger) {
  if (error instanceof SkillError) {
    // Custom skill error with specific code
    logger.error(`[${error.code}] ${error.message}`, error);
    return error.code;
  }

  if (error instanceof Error) {
    // Standard JavaScript error
    logger.error(error.message, error);
    return 1;
  }

  // Unknown error type
  logger.error('Unknown error occurred', error);
  return 1;
}

/**
 * Wrap async functions with error handling
 * @param {Function} fn - Async function to wrap
 * @param {Logger} logger - Logger instance
 * @returns {Function} Wrapped function with error handling
 */
function wrapAsync(fn, logger) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const exitCode = handleError(error, logger);
      process.exit(exitCode);
    }
  };
}

/**
 * Create a SkillError from a validation failure
 * @param {string} field - Field that failed validation
 * @param {string} reason - Reason for validation failure
 * @param {*} value - The invalid value
 * @returns {SkillError} Validation error
 */
function createValidationError(field, reason, value) {
  return new SkillError(`Validation failed for field '${field}': ${reason}`, 2, { field, reason, value });
}

/**
 * Create a SkillError from a file operation failure
 * @param {string} operation - File operation (read, write, delete, etc.)
 * @param {string} path - File path
 * @param {Error} originalError - Original error from file operation
 * @returns {SkillError} File operation error
 */
function createFileError(operation, path, originalError) {
  return new SkillError(`File ${operation} failed for '${path}': ${originalError.message}`, 3, {
    operation,
    path,
    originalError: originalError.message
  });
}

/**
 * Create a SkillError from a network operation failure
 * @param {string} url - URL that failed
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @returns {SkillError} Network error
 */
function createNetworkError(url, statusCode, message) {
  return new SkillError(`Network request failed for '${url}': ${message}`, 4, { url, statusCode, message });
}

/**
 * Create a SkillError from a configuration error
 * @param {string} key - Configuration key that is missing or invalid
 * @param {string} reason - Reason for configuration error
 * @returns {SkillError} Configuration error
 */
function createConfigError(key, reason) {
  return new SkillError(`Configuration error for '${key}': ${reason}`, 5, { key, reason });
}

module.exports = {
  SkillError,
  handleError,
  wrapAsync,
  createValidationError,
  createFileError,
  createNetworkError,
  createConfigError
};
