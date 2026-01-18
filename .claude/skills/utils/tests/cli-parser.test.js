/**
 * CLI Parser Tests
 *
 * Tests for the command-line argument parsing utility
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
} = require('../cli-parser');

describe('CLI Parser', () => {
  describe('parseCliArgs', () => {
    it('should parse basic arguments', () => {
      const argv = ['node', 'script.js', '--name', 'test', '--count', '42'];
      const options = {
        command: 'test-skill',
        description: 'Test skill description',
        options: {
          name: stringOption('Name of the thing'),
          count: numberOption('Count of items')
        }
      };

      const args = parseCliArgs(options, argv);

      expect(args.name).toBe('test');
      expect(args.count).toBe(42);
    });

    it('should use default values', () => {
      const argv = ['node', 'script.js'];
      const options = {
        command: 'test-skill',
        options: {
          name: stringOption('Name', 'default-name'),
          count: numberOption('Count', 10)
        }
      };

      const args = parseCliArgs(options, argv);

      expect(args.name).toBe('default-name');
      expect(args.count).toBe(10);
    });

    it('should parse boolean flags', () => {
      const argv = ['node', 'script.js', '--verbose'];
      const options = {
        command: 'test-skill',
        options: {
          verbose: booleanOption('Verbose output', false),
          quiet: booleanOption('Quiet mode', false)
        }
      };

      const args = parseCliArgs(options, argv);

      expect(args.verbose).toBe(true);
      expect(args.quiet).toBe(false);
    });

    it('should parse array arguments', () => {
      const argv = ['node', 'script.js', '--tags', 'tag1', '--tags', 'tag2', '--tags', 'tag3'];
      const options = {
        command: 'test-skill',
        options: {
          tags: arrayOption('Tags to apply')
        }
      };

      const args = parseCliArgs(options, argv);

      expect(args.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should validate choices', () => {
      const argv = ['node', 'script.js', '--env', 'production'];
      const options = {
        command: 'test-skill',
        options: {
          env: choiceOption('Environment', ['development', 'staging', 'production'])
        }
      };

      const args = parseCliArgs(options, argv);

      expect(args.env).toBe('production');
    });

    it('should throw on invalid choice', () => {
      const argv = ['node', 'script.js', '--env', 'invalid'];
      const options = {
        command: 'test-skill',
        options: {
          env: choiceOption('Environment', ['development', 'staging', 'production'])
        }
      };

      expect(() => parseCliArgs(options, argv)).toThrow();
    });

    it('should include examples in help', () => {
      const options = {
        command: 'test-skill',
        description: 'Test skill',
        options: {
          name: stringOption('Name')
        },
        examples: [
          { command: '$0 --name test', description: 'Run with name' },
          { command: '$0 --name prod', description: 'Run with prod name' }
        ]
      };

      expect(() => parseCliArgs(options, ['node', 'script.js'])).not.toThrow();
    });

    it('should handle empty options', () => {
      const argv = ['node', 'script.js'];
      const options = {
        command: 'test-skill',
        description: 'Test skill'
      };

      const args = parseCliArgs(options, argv);

      expect(args).toBeDefined();
      expect(args._).toEqual([]);
    });
  });

  describe('createOption', () => {
    it('should create string option', () => {
      const option = createOption('string', 'Test description', 'default', false);

      expect(option.type).toBe('string');
      expect(option.description).toBe('Test description');
      expect(option.default).toBe('default');
      expect(option.demandOption).toBe(false);
    });

    it('should create required option', () => {
      const option = createOption('string', 'Test description', undefined, true);

      expect(option.demandOption).toBe(true);
      expect(option.default).toBeUndefined();
    });

    it('should create option without default', () => {
      const option = createOption('string', 'Test description');

      expect(option.default).toBeUndefined();
    });
  });

  describe('stringOption', () => {
    it('should create string option with default', () => {
      const option = stringOption('Test string', 'default-value');

      expect(option.type).toBe('string');
      expect(option.default).toBe('default-value');
      expect(option.demandOption).toBe(false);
    });

    it('should create required string option', () => {
      const option = stringOption('Test string', undefined, true);

      expect(option.type).toBe('string');
      expect(option.demandOption).toBe(true);
    });
  });

  describe('numberOption', () => {
    it('should create number option with default', () => {
      const option = numberOption('Test number', 42);

      expect(option.type).toBe('number');
      expect(option.default).toBe(42);
      expect(option.demandOption).toBe(false);
    });

    it('should create required number option', () => {
      const option = numberOption('Test number', undefined, true);

      expect(option.type).toBe('number');
      expect(option.demandOption).toBe(true);
    });
  });

  describe('booleanOption', () => {
    it('should create boolean option with default false', () => {
      const option = booleanOption('Test boolean');

      expect(option.type).toBe('boolean');
      expect(option.default).toBe(false);
      expect(option.demandOption).toBe(false);
    });

    it('should create boolean option with default true', () => {
      const option = booleanOption('Test boolean', true);

      expect(option.type).toBe('boolean');
      expect(option.default).toBe(true);
    });
  });

  describe('arrayOption', () => {
    it('should create array option', () => {
      const option = arrayOption('Test array');

      expect(option.type).toBe('array');
      expect(option.demandOption).toBe(false);
    });

    it('should create array option with default', () => {
      const option = arrayOption('Test array', ['default1', 'default2']);

      expect(option.default).toEqual(['default1', 'default2']);
    });

    it('should create required array option', () => {
      const option = arrayOption('Test array', undefined, true);

      expect(option.demandOption).toBe(true);
    });
  });

  describe('choiceOption', () => {
    it('should create choice option', () => {
      const option = choiceOption('Test choice', ['a', 'b', 'c']);

      expect(option.type).toBe('string');
      expect(option.choices).toEqual(['a', 'b', 'c']);
      expect(option.demandOption).toBe(false);
    });

    it('should create choice option with default', () => {
      const option = choiceOption('Test choice', ['a', 'b', 'c'], 'b');

      expect(option.default).toBe('b');
      expect(option.choices).toEqual(['a', 'b', 'c']);
    });

    it('should create required choice option', () => {
      const option = choiceOption('Test choice', ['a', 'b', 'c'], undefined, true);

      expect(option.demandOption).toBe(true);
    });
  });

  describe('validateRequiredArgs', () => {
    it('should pass validation when all required args present', () => {
      const args = { name: 'test', count: 42, enabled: true };
      const required = ['name', 'count'];

      expect(() => validateRequiredArgs(args, required)).not.toThrow();
    });

    it('should throw when required args missing', () => {
      const args = { name: 'test' };
      const required = ['name', 'count', 'enabled'];

      expect(() => validateRequiredArgs(args, required)).toThrow('Missing required arguments: count, enabled');
    });

    it('should throw when arg is null', () => {
      const args = { name: 'test', count: null };
      const required = ['name', 'count'];

      expect(() => validateRequiredArgs(args, required)).toThrow('Missing required arguments: count');
    });

    it('should throw when arg is undefined', () => {
      const args = { name: 'test', count: undefined };
      const required = ['name', 'count'];

      expect(() => validateRequiredArgs(args, required)).toThrow('Missing required arguments: count');
    });

    it('should pass with empty required array', () => {
      const args = { name: 'test' };
      const required = [];

      expect(() => validateRequiredArgs(args, required)).not.toThrow();
    });

    it('should allow zero as valid value', () => {
      const args = { name: 'test', count: 0 };
      const required = ['name', 'count'];

      expect(() => validateRequiredArgs(args, required)).not.toThrow();
    });

    it('should allow empty string as valid value', () => {
      const args = { name: '', count: 42 };
      const required = ['name', 'count'];

      expect(() => validateRequiredArgs(args, required)).not.toThrow();
    });
  });
});
