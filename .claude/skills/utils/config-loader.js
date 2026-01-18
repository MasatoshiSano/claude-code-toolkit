/**
 * Config Loader - Configuration file loading for Agent Skills
 *
 * Provides unified configuration loading from JSON/YAML files
 * with environment variable expansion and default value merging
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Load configuration from a file (JSON or YAML)
 * @param {string} configPath - Path to configuration file
 * @param {Object} defaults - Default configuration values
 * @returns {Object} Merged configuration
 * @throws {Error} If file doesn't exist or parsing fails
 */
function loadConfig(configPath, defaults = {}) {
  // Check if file exists
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  // Read file content
  const content = fs.readFileSync(configPath, 'utf8');

  // Parse based on file extension
  const ext = path.extname(configPath).toLowerCase();
  let config;

  try {
    if (ext === '.json') {
      config = JSON.parse(content);
    } else if (ext === '.yaml' || ext === '.yml') {
      config = yaml.load(content);
    } else {
      throw new Error(`Unsupported file format: ${ext}. Use .json, .yaml, or .yml`);
    }
  } catch (error) {
    throw new Error(`Failed to parse configuration file ${configPath}: ${error.message}`);
  }

  // Merge with defaults (config takes precedence)
  const merged = mergeConfig(defaults, config);

  // Expand environment variables
  const expanded = expandEnvVars(merged);

  return expanded;
}

/**
 * Deep merge two configuration objects
 * @param {Object} target - Target object (defaults)
 * @param {Object} source - Source object (config)
 * @returns {Object} Merged object
 */
function mergeConfig(target, source) {
  const result = { ...target };

  Object.keys(source).forEach((key) => {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      // Recursively merge nested objects
      result[key] = mergeConfig(target[key] || {}, source[key]);
    } else {
      // Override value from source
      result[key] = source[key];
    }
  });

  return result;
}

/**
 * Expand environment variables in configuration values
 * Supports ${VAR_NAME} syntax
 * @param {*} obj - Configuration object or value
 * @returns {*} Object with expanded environment variables
 */
function expandEnvVars(obj) {
  if (typeof obj === 'string') {
    // Replace ${VAR_NAME} with process.env.VAR_NAME
    return obj.replace(/\$\{([^}]+)\}/g, (match, varName) => {
      const value = process.env[varName];
      if (value === undefined) {
        throw new Error(`Environment variable ${varName} is not defined`);
      }
      return value;
    });
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => expandEnvVars(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const result = {};
    Object.keys(obj).forEach((key) => {
      result[key] = expandEnvVars(obj[key]);
    });
    return result;
  }

  return obj;
}

/**
 * Load configuration with optional override
 * Loads from configPath, then optionally overlays overridePath
 * @param {string} configPath - Path to base configuration file
 * @param {string} overridePath - Path to override configuration file (optional)
 * @param {Object} defaults - Default configuration values
 * @returns {Object} Merged configuration
 */
function loadConfigWithOverride(configPath, overridePath = null, defaults = {}) {
  let config = loadConfig(configPath, defaults);

  if (overridePath && fs.existsSync(overridePath)) {
    const override = loadConfig(overridePath, {});
    config = mergeConfig(config, override);
  }

  return config;
}

/**
 * Save configuration to a file (JSON or YAML)
 * @param {string} configPath - Path to save configuration
 * @param {Object} config - Configuration object to save
 * @param {Object} options - Save options
 * @param {boolean} options.pretty - Pretty print JSON (default: true)
 * @param {number} options.indent - Indentation spaces (default: 2)
 */
function saveConfig(configPath, config, options = {}) {
  const { pretty = true, indent = 2 } = options;
  const ext = path.extname(configPath).toLowerCase();

  let content;

  if (ext === '.json') {
    content = pretty ? JSON.stringify(config, null, indent) : JSON.stringify(config);
  } else if (ext === '.yaml' || ext === '.yml') {
    content = yaml.dump(config, { indent });
  } else {
    throw new Error(`Unsupported file format: ${ext}. Use .json, .yaml, or .yml`);
  }

  // Ensure directory exists
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(configPath, content, 'utf8');
}

module.exports = {
  loadConfig,
  mergeConfig,
  expandEnvVars,
  loadConfigWithOverride,
  saveConfig
};
