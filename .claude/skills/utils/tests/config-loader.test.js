/**
 * Config Loader Tests
 *
 * Tests for the configuration file loading utility
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadConfig, mergeConfig, expandEnvVars, loadConfigWithOverride, saveConfig } = require('../config-loader');

describe('Config Loader', () => {
  let tempDir;
  let jsonConfigPath;
  let yamlConfigPath;

  beforeEach(() => {
    // Create temp directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-test-'));
    jsonConfigPath = path.join(tempDir, 'config.json');
    yamlConfigPath = path.join(tempDir, 'config.yaml');
  });

  afterEach(() => {
    // Clean up temp files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('loadConfig', () => {
    it('should load JSON configuration', () => {
      const config = { name: 'test', count: 42, enabled: true };
      fs.writeFileSync(jsonConfigPath, JSON.stringify(config));

      const loaded = loadConfig(jsonConfigPath);

      expect(loaded).toEqual(config);
    });

    it('should load YAML configuration', () => {
      const config = 'name: test\ncount: 42\nenabled: true\n';
      fs.writeFileSync(yamlConfigPath, config);

      const loaded = loadConfig(yamlConfigPath);

      expect(loaded).toEqual({ name: 'test', count: 42, enabled: true });
    });

    it('should merge with defaults', () => {
      const config = { name: 'test' };
      fs.writeFileSync(jsonConfigPath, JSON.stringify(config));

      const defaults = { name: 'default', count: 10, enabled: false };
      const loaded = loadConfig(jsonConfigPath, defaults);

      expect(loaded).toEqual({ name: 'test', count: 10, enabled: false });
    });

    it('should expand environment variables', () => {
      process.env.TEST_VAR = 'test-value';
      process.env.TEST_NUM = '42';

      const config = { name: '${TEST_VAR}', count: '${TEST_NUM}' };
      fs.writeFileSync(jsonConfigPath, JSON.stringify(config));

      const loaded = loadConfig(jsonConfigPath);

      expect(loaded.name).toBe('test-value');
      expect(loaded.count).toBe('42');

      delete process.env.TEST_VAR;
      delete process.env.TEST_NUM;
    });

    it('should throw if file not found', () => {
      expect(() => loadConfig('/nonexistent/config.json')).toThrow('Configuration file not found');
    });

    it('should throw on invalid JSON', () => {
      fs.writeFileSync(jsonConfigPath, '{ invalid json }');

      expect(() => loadConfig(jsonConfigPath)).toThrow('Failed to parse configuration file');
    });

    it('should throw on unsupported file format', () => {
      const txtPath = path.join(tempDir, 'config.txt');
      fs.writeFileSync(txtPath, 'config');

      expect(() => loadConfig(txtPath)).toThrow('Unsupported file format: .txt');
    });

    it('should load .yml extension', () => {
      const ymlPath = path.join(tempDir, 'config.yml');
      fs.writeFileSync(ymlPath, 'name: test\n');

      const loaded = loadConfig(ymlPath);

      expect(loaded.name).toBe('test');
    });
  });

  describe('mergeConfig', () => {
    it('should merge simple objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };

      const result = mergeConfig(target, source);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should deep merge nested objects', () => {
      const target = { db: { host: 'localhost', port: 5432 } };
      const source = { db: { port: 3306, user: 'admin' } };

      const result = mergeConfig(target, source);

      expect(result).toEqual({
        db: { host: 'localhost', port: 3306, user: 'admin' }
      });
    });

    it('should override arrays instead of merging', () => {
      const target = { tags: ['a', 'b'] };
      const source = { tags: ['c', 'd'] };

      const result = mergeConfig(target, source);

      expect(result.tags).toEqual(['c', 'd']);
    });

    it('should handle null values', () => {
      const target = { a: 1 };
      const source = { a: null };

      const result = mergeConfig(target, source);

      expect(result.a).toBeNull();
    });

    it('should not modify original objects', () => {
      const target = { a: 1, b: { c: 2 } };
      const source = { b: { d: 3 } };

      const result = mergeConfig(target, source);
      result.b.e = 4;

      expect(target.b.e).toBeUndefined();
      expect(source.b.e).toBeUndefined();
    });
  });

  describe('expandEnvVars', () => {
    beforeEach(() => {
      process.env.TEST_VAR = 'test-value';
      process.env.TEST_NUM = '42';
    });

    afterEach(() => {
      delete process.env.TEST_VAR;
      delete process.env.TEST_NUM;
    });

    it('should expand environment variables in strings', () => {
      const result = expandEnvVars('Value is ${TEST_VAR}');

      expect(result).toBe('Value is test-value');
    });

    it('should expand multiple variables in one string', () => {
      const result = expandEnvVars('${TEST_VAR} and ${TEST_NUM}');

      expect(result).toBe('test-value and 42');
    });

    it('should expand variables in objects', () => {
      const obj = { name: '${TEST_VAR}', count: '${TEST_NUM}' };

      const result = expandEnvVars(obj);

      expect(result).toEqual({ name: 'test-value', count: '42' });
    });

    it('should expand variables in nested objects', () => {
      const obj = { db: { host: '${TEST_VAR}', port: '${TEST_NUM}' } };

      const result = expandEnvVars(obj);

      expect(result.db.host).toBe('test-value');
      expect(result.db.port).toBe('42');
    });

    it('should expand variables in arrays', () => {
      const arr = ['${TEST_VAR}', '${TEST_NUM}', 'literal'];

      const result = expandEnvVars(arr);

      expect(result).toEqual(['test-value', '42', 'literal']);
    });

    it('should throw on undefined environment variable', () => {
      expect(() => expandEnvVars('${UNDEFINED_VAR}')).toThrow('Environment variable UNDEFINED_VAR is not defined');
    });

    it('should return non-string values as-is', () => {
      expect(expandEnvVars(42)).toBe(42);
      expect(expandEnvVars(true)).toBe(true);
      expect(expandEnvVars(null)).toBeNull();
    });
  });

  describe('loadConfigWithOverride', () => {
    it('should load config with override', () => {
      const baseConfig = { name: 'base', count: 10, enabled: true };
      const overrideConfig = { count: 20 };

      fs.writeFileSync(jsonConfigPath, JSON.stringify(baseConfig));
      const overridePath = path.join(tempDir, 'override.json');
      fs.writeFileSync(overridePath, JSON.stringify(overrideConfig));

      const loaded = loadConfigWithOverride(jsonConfigPath, overridePath);

      expect(loaded).toEqual({ name: 'base', count: 20, enabled: true });
    });

    it('should work without override if file does not exist', () => {
      const baseConfig = { name: 'base' };
      fs.writeFileSync(jsonConfigPath, JSON.stringify(baseConfig));

      const loaded = loadConfigWithOverride(jsonConfigPath, '/nonexistent/override.json');

      expect(loaded).toEqual({ name: 'base' });
    });

    it('should work with defaults', () => {
      const baseConfig = { name: 'base' };
      fs.writeFileSync(jsonConfigPath, JSON.stringify(baseConfig));

      const defaults = { name: 'default', count: 10 };
      const loaded = loadConfigWithOverride(jsonConfigPath, null, defaults);

      expect(loaded).toEqual({ name: 'base', count: 10 });
    });
  });

  describe('saveConfig', () => {
    it('should save JSON configuration', () => {
      const config = { name: 'test', count: 42 };

      saveConfig(jsonConfigPath, config);

      const content = fs.readFileSync(jsonConfigPath, 'utf8');
      expect(JSON.parse(content)).toEqual(config);
    });

    it('should save YAML configuration', () => {
      const config = { name: 'test', count: 42 };

      saveConfig(yamlConfigPath, config);

      const content = fs.readFileSync(yamlConfigPath, 'utf8');
      expect(content).toContain('name: test');
      expect(content).toContain('count: 42');
    });

    it('should create directory if it does not exist', () => {
      const nestedPath = path.join(tempDir, 'nested', 'dir', 'config.json');
      const config = { name: 'test' };

      saveConfig(nestedPath, config);

      expect(fs.existsSync(nestedPath)).toBe(true);
    });

    it('should save pretty-printed JSON by default', () => {
      const config = { name: 'test', count: 42 };

      saveConfig(jsonConfigPath, config);

      const content = fs.readFileSync(jsonConfigPath, 'utf8');
      expect(content).toContain('\n');
      expect(content).toContain('  ');
    });

    it('should save compact JSON when pretty is false', () => {
      const config = { name: 'test', count: 42 };

      saveConfig(jsonConfigPath, config, { pretty: false });

      const content = fs.readFileSync(jsonConfigPath, 'utf8');
      expect(content).toBe('{"name":"test","count":42}');
    });

    it('should throw on unsupported file format', () => {
      const txtPath = path.join(tempDir, 'config.txt');
      const config = { name: 'test' };

      expect(() => saveConfig(txtPath, config)).toThrow('Unsupported file format: .txt');
    });
  });
});
