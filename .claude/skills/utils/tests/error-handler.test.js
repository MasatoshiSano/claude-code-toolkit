/**
 * Error Handler Tests
 *
 * Tests for the unified error handling utility
 */

const {
  SkillError,
  handleError,
  wrapAsync,
  createValidationError,
  createFileError,
  createNetworkError,
  createConfigError
} = require('../error-handler');
const { Logger } = require('../logger');

// Mock Logger
jest.mock('../logger');

describe('Error Handler', () => {
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    Logger.mockImplementation(() => mockLogger);
  });

  describe('SkillError', () => {
    it('should create SkillError with message, code, and details', () => {
      const error = new SkillError('Test error', 42, { key: 'value' });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SkillError);
      expect(error.name).toBe('SkillError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(42);
      expect(error.details).toEqual({ key: 'value' });
      expect(error.stack).toBeDefined();
    });

    it('should create SkillError with default empty details', () => {
      const error = new SkillError('Test error', 1);

      expect(error.details).toEqual({});
    });

    it('should have proper stack trace', () => {
      const error = new SkillError('Test error', 1);

      expect(error.stack).toContain('SkillError: Test error');
      expect(error.stack).toContain('error-handler.test.js');
    });
  });

  describe('handleError', () => {
    it('should handle SkillError and return custom code', () => {
      const error = new SkillError('Skill failed', 42, { reason: 'test' });
      const exitCode = handleError(error, mockLogger);

      expect(exitCode).toBe(42);
      expect(mockLogger.error).toHaveBeenCalledWith('[42] Skill failed', error);
    });

    it('should handle standard Error and return code 1', () => {
      const error = new Error('Standard error');
      const exitCode = handleError(error, mockLogger);

      expect(exitCode).toBe(1);
      expect(mockLogger.error).toHaveBeenCalledWith('Standard error', error);
    });

    it('should handle unknown error type and return code 1', () => {
      const error = 'String error';
      const exitCode = handleError(error, mockLogger);

      expect(exitCode).toBe(1);
      expect(mockLogger.error).toHaveBeenCalledWith('Unknown error occurred', error);
    });

    it('should handle null error', () => {
      const exitCode = handleError(null, mockLogger);

      expect(exitCode).toBe(1);
      expect(mockLogger.error).toHaveBeenCalledWith('Unknown error occurred', null);
    });

    it('should handle undefined error', () => {
      const exitCode = handleError(undefined, mockLogger);

      expect(exitCode).toBe(1);
      expect(mockLogger.error).toHaveBeenCalledWith('Unknown error occurred', undefined);
    });
  });

  describe('wrapAsync', () => {
    it('should execute successful async function', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const wrapped = wrapAsync(fn, mockLogger);

      const result = await wrapped('arg1', 'arg2');

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle SkillError in async function', async () => {
      const error = new SkillError('Async failed', 42);
      const fn = jest.fn().mockRejectedValue(error);
      const wrapped = wrapAsync(fn, mockLogger);

      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

      await wrapped();

      expect(mockLogger.error).toHaveBeenCalledWith('[42] Async failed', error);
      expect(mockExit).toHaveBeenCalledWith(42);

      mockExit.mockRestore();
    });

    it('should handle standard Error in async function', async () => {
      const error = new Error('Async error');
      const fn = jest.fn().mockRejectedValue(error);
      const wrapped = wrapAsync(fn, mockLogger);

      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

      await wrapped();

      expect(mockLogger.error).toHaveBeenCalledWith('Async error', error);
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });
  });

  describe('createValidationError', () => {
    it('should create validation error with code 2', () => {
      const error = createValidationError('username', 'must be at least 3 characters', 'ab');

      expect(error).toBeInstanceOf(SkillError);
      expect(error.message).toBe("Validation failed for field 'username': must be at least 3 characters");
      expect(error.code).toBe(2);
      expect(error.details).toEqual({
        field: 'username',
        reason: 'must be at least 3 characters',
        value: 'ab'
      });
    });

    it('should create validation error with null value', () => {
      const error = createValidationError('email', 'is required', null);

      expect(error.code).toBe(2);
      expect(error.details.value).toBeNull();
    });
  });

  describe('createFileError', () => {
    it('should create file error with code 3', () => {
      const originalError = new Error('ENOENT: no such file or directory');
      const error = createFileError('read', '/path/to/file.txt', originalError);

      expect(error).toBeInstanceOf(SkillError);
      expect(error.message).toBe("File read failed for '/path/to/file.txt': ENOENT: no such file or directory");
      expect(error.code).toBe(3);
      expect(error.details).toEqual({
        operation: 'read',
        path: '/path/to/file.txt',
        originalError: 'ENOENT: no such file or directory'
      });
    });

    it('should create file error for write operation', () => {
      const originalError = new Error('EACCES: permission denied');
      const error = createFileError('write', '/protected/file.txt', originalError);

      expect(error.message).toContain('File write failed');
      expect(error.code).toBe(3);
    });
  });

  describe('createNetworkError', () => {
    it('should create network error with code 4', () => {
      const error = createNetworkError('https://api.example.com', 404, 'Not Found');

      expect(error).toBeInstanceOf(SkillError);
      expect(error.message).toBe("Network request failed for 'https://api.example.com': Not Found");
      expect(error.code).toBe(4);
      expect(error.details).toEqual({
        url: 'https://api.example.com',
        statusCode: 404,
        message: 'Not Found'
      });
    });

    it('should create network error for 500 status', () => {
      const error = createNetworkError('https://api.example.com', 500, 'Internal Server Error');

      expect(error.code).toBe(4);
      expect(error.details.statusCode).toBe(500);
    });
  });

  describe('createConfigError', () => {
    it('should create config error with code 5', () => {
      const error = createConfigError('apiKey', 'is required but not provided');

      expect(error).toBeInstanceOf(SkillError);
      expect(error.message).toBe("Configuration error for 'apiKey': is required but not provided");
      expect(error.code).toBe(5);
      expect(error.details).toEqual({
        key: 'apiKey',
        reason: 'is required but not provided'
      });
    });

    it('should create config error for invalid value', () => {
      const error = createConfigError('timeout', 'must be a positive number');

      expect(error.code).toBe(5);
      expect(error.details.key).toBe('timeout');
    });
  });

  describe('Integration', () => {
    it('should work with all error types in handleError', () => {
      const errors = [
        createValidationError('field', 'invalid', 'value'),
        createFileError('read', '/file.txt', new Error('not found')),
        createNetworkError('http://example.com', 500, 'error'),
        createConfigError('key', 'missing')
      ];

      const exitCodes = errors.map((error) => handleError(error, mockLogger));

      expect(exitCodes).toEqual([2, 3, 4, 5]);
      expect(mockLogger.error).toHaveBeenCalledTimes(4);
    });
  });
});
