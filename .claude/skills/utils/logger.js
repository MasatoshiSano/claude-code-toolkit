/**
 * Logger - Unified logging utility for Agent Skills
 *
 * Provides consistent logging across all skills with Winston
 * Supports console and file output with configurable log levels
 */

const fs = require('fs');
const path = require('path');
const winston = require('winston');

/**
 * Logger class for unified logging
 */
class Logger {
  /**
   * Create a logger instance
   * @param {string} name - Logger name (skill name)
   * @param {Object} options - Logger options
   * @param {string} options.level - Log level (debug, info, warn, error)
   * @param {string} options.logFile - Log file path (optional)
   */
  constructor(name, options = {}) {
    this.name = name;
    this.level = options.level || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
    this.logFile = options.logFile;

    // Create log directory if logFile specified
    if (this.logFile) {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }

    // Winston format
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, name: logName, ...meta }) => {
        const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] [${logName}] ${message}${metaStr}`;
      })
    );

    // Create transports
    const transports = [
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), logFormat)
      })
    ];

    // Add file transport if logFile specified
    if (this.logFile) {
      transports.push(
        new winston.transports.File({
          filename: this.logFile,
          format: logFormat
        })
      );
    }

    // Create Winston logger
    this.logger = winston.createLogger({
      level: this.level,
      defaultMeta: { name: this.name },
      transports
    });
  }

  /**
   * Log DEBUG message
   * @param {string} message - Message to log
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  /**
   * Log INFO message
   * @param {string} message - Message to log
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  /**
   * Log WARN message
   * @param {string} message - Message to log
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  /**
   * Log ERROR message
   * @param {string} message - Message to log
   * @param {Error} error - Error object
   */
  error(message, error) {
    if (error instanceof Error) {
      this.logger.error(message, {
        error: error.message,
        stack: error.stack
      });
    } else {
      this.logger.error(message, { error });
    }
  }
}

module.exports = { Logger };
