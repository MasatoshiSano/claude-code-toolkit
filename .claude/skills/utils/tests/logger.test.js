/**
 * Logger Tests
 *
 * Tests for the unified logging utility
 */

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const { Logger } = require('../logger');

// Mock winston
jest.mock('winston', () => {
  const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };

  return {
    format: {
      combine: jest.fn((...args) => args),
      timestamp: jest.fn(),
      errors: jest.fn(),
      printf: jest.fn(),
      colorize: jest.fn()
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn()
    },
    createLogger: jest.fn(() => mockLogger)
  };
});

// Mock fs
jest.mock('fs');

describe('Logger', () => {
  let mockLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = winston.createLogger();
  });

  describe('Constructor', () => {
    it('should create logger with default options', () => {
      const logger = new Logger('test-skill');

      expect(logger.name).toBe('test-skill');
      expect(logger.level).toBe('debug'); // default in non-production
      expect(logger.logFile).toBeUndefined();
      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
          defaultMeta: { name: 'test-skill' }
        })
      );
    });

    it('should create logger with custom log level', () => {
      const logger = new Logger('test-skill', { level: 'warn' });

      expect(logger.level).toBe('warn');
      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'warn'
        })
      );
    });

    it('should use info level in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const logger = new Logger('test-skill');

      expect(logger.level).toBe('info');
      process.env.NODE_ENV = originalEnv;
    });

    it('should create log directory if logFile specified', () => {
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {});

      const logFile = path.join('logs', 'test.log');
      const logger = new Logger('test-skill', { logFile });

      expect(logger.logFile).toBe(logFile);
      expect(fs.existsSync).toHaveBeenCalledWith('logs');
      expect(fs.mkdirSync).toHaveBeenCalledWith('logs', { recursive: true });
    });

    it('should not create log directory if it already exists', () => {
      fs.existsSync.mockReturnValue(true);

      const logFile = path.join('logs', 'test.log');
      const _logger = new Logger('test-skill', { logFile });

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should add file transport when logFile specified', () => {
      const logFile = path.join('logs', 'test.log');
      const _logger = new Logger('test-skill', { logFile });

      expect(winston.transports.File).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: logFile
        })
      );
    });
  });

  describe('Log Methods', () => {
    let logger;

    beforeEach(() => {
      logger = new Logger('test-skill');
    });

    it('should call debug method with message and metadata', () => {
      logger.debug('Debug message', { key: 'value' });

      expect(mockLogger.debug).toHaveBeenCalledWith('Debug message', { key: 'value' });
    });

    it('should call debug method with message only', () => {
      logger.debug('Debug message');

      expect(mockLogger.debug).toHaveBeenCalledWith('Debug message', {});
    });

    it('should call info method with message and metadata', () => {
      logger.info('Info message', { key: 'value' });

      expect(mockLogger.info).toHaveBeenCalledWith('Info message', { key: 'value' });
    });

    it('should call info method with message only', () => {
      logger.info('Info message');

      expect(mockLogger.info).toHaveBeenCalledWith('Info message', {});
    });

    it('should call warn method with message and metadata', () => {
      logger.warn('Warning message', { key: 'value' });

      expect(mockLogger.warn).toHaveBeenCalledWith('Warning message', { key: 'value' });
    });

    it('should call warn method with message only', () => {
      logger.warn('Warning message');

      expect(mockLogger.warn).toHaveBeenCalledWith('Warning message', {});
    });

    it('should call error method with Error object', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      logger.error('Error occurred', error);

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        error: 'Test error',
        stack: 'Error stack trace'
      });
    });

    it('should call error method with non-Error object', () => {
      const errorData = { code: 'ERR001', message: 'Custom error' };
      logger.error('Error occurred', errorData);

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        error: errorData
      });
    });

    it('should handle error method with string', () => {
      logger.error('Error occurred', 'Simple error string');

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        error: 'Simple error string'
      });
    });
  });

  describe('Winston Format Configuration', () => {
    it('should configure timestamp format', () => {
      const _logger = new Logger('test-skill');

      expect(winston.format.timestamp).toHaveBeenCalledWith({ format: 'YYYY-MM-DD HH:mm:ss' });
    });

    it('should configure error format with stack traces', () => {
      const _logger = new Logger('test-skill');

      expect(winston.format.errors).toHaveBeenCalledWith({ stack: true });
    });

    it('should configure custom printf format', () => {
      const _logger = new Logger('test-skill');

      expect(winston.format.printf).toHaveBeenCalled();
    });

    it('should configure colorize for console transport', () => {
      const _logger = new Logger('test-skill');

      expect(winston.format.colorize).toHaveBeenCalled();
    });
  });

  describe('Transports Configuration', () => {
    it('should always include console transport', () => {
      const _logger = new Logger('test-skill');

      expect(winston.transports.Console).toHaveBeenCalled();
    });

    it('should include both console and file transports when logFile specified', () => {
      const _logger = new Logger('test-skill', { logFile: 'logs/test.log' });

      expect(winston.transports.Console).toHaveBeenCalled();
      expect(winston.transports.File).toHaveBeenCalled();
    });

    it('should only include console transport when logFile not specified', () => {
      winston.transports.File.mockClear();

      const _logger = new Logger('test-skill');

      expect(winston.transports.Console).toHaveBeenCalled();
      expect(winston.transports.File).not.toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should create logger with all configurations', () => {
      const logger = new Logger('integration-test', {
        level: 'warn',
        logFile: 'logs/integration.log'
      });

      expect(logger.name).toBe('integration-test');
      expect(logger.level).toBe('warn');
      expect(logger.logFile).toBe('logs/integration.log');

      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'warn',
          defaultMeta: { name: 'integration-test' },
          transports: expect.any(Array)
        })
      );
    });
  });
});
