/**
 * CLI Parser - Command-line argument parsing for Agent Skills
 *
 * Provides unified CLI argument parsing using yargs
 * with consistent options and help generation
 */

const { hideBin } = require('yargs/helpers');
const yargs = require('yargs/yargs');

/**
 * Parse command-line arguments using yargs
 * @param {Object} options - Parser configuration
 * @param {string} options.command - Command name
 * @param {string} options.description - Command description
 * @param {Object} options.options - Yargs option definitions
 * @param {Array<string>} options.examples - Usage examples
 * @param {Array<string>} argv - Arguments to parse (default: process.argv)
 * @returns {Object} Parsed arguments
 */
function parseCliArgs(options, argv = process.argv) {
  const { command, description, options: optionsDef = {}, examples = [] } = options;

  let parser = yargs(hideBin(argv))
    .scriptName(command || 'skill')
    .usage(`$0 ${description || ''}`);

  // Add options
  Object.entries(optionsDef).forEach(([key, optDef]) => {
    parser = parser.option(key, optDef);
  });

  // Add examples
  examples.forEach((example) => {
    parser = parser.example(example.command, example.description);
  });

  // Configure parser
  parser = parser
    .help('help')
    .alias('help', 'h')
    .version(false)
    .strict()
    .exitProcess(false)
    .wrap(Math.min(120, parser.terminalWidth()));

  return parser.argv;
}

/**
 * Create a basic option definition
 * @param {string} type - Option type (string, number, boolean, array)
 * @param {string} description - Option description
 * @param {*} defaultValue - Default value
 * @param {boolean} required - Whether option is required
 * @returns {Object} Yargs option definition
 */
function createOption(type, description, defaultValue = undefined, required = false) {
  const option = {
    type,
    description,
    demandOption: required
  };

  if (defaultValue !== undefined) {
    option.default = defaultValue;
  }

  return option;
}

/**
 * Create a string option
 * @param {string} description - Option description
 * @param {string} defaultValue - Default value
 * @param {boolean} required - Whether option is required
 * @returns {Object} Yargs option definition
 */
function stringOption(description, defaultValue = undefined, required = false) {
  return createOption('string', description, defaultValue, required);
}

/**
 * Create a number option
 * @param {string} description - Option description
 * @param {number} defaultValue - Default value
 * @param {boolean} required - Whether option is required
 * @returns {Object} Yargs option definition
 */
function numberOption(description, defaultValue = undefined, required = false) {
  return createOption('number', description, defaultValue, required);
}

/**
 * Create a boolean option
 * @param {string} description - Option description
 * @param {boolean} defaultValue - Default value
 * @returns {Object} Yargs option definition
 */
function booleanOption(description, defaultValue = false) {
  return createOption('boolean', description, defaultValue, false);
}

/**
 * Create an array option
 * @param {string} description - Option description
 * @param {Array} defaultValue - Default value
 * @param {boolean} required - Whether option is required
 * @returns {Object} Yargs option definition
 */
function arrayOption(description, defaultValue = undefined, required = false) {
  return createOption('array', description, defaultValue, required);
}

/**
 * Create a choice option (enum)
 * @param {string} description - Option description
 * @param {Array} choices - Valid choices
 * @param {*} defaultValue - Default value
 * @param {boolean} required - Whether option is required
 * @returns {Object} Yargs option definition
 */
function choiceOption(description, choices, defaultValue = undefined, required = false) {
  const option = createOption('string', description, defaultValue, required);
  option.choices = choices;
  return option;
}

/**
 * Validate required arguments
 * @param {Object} args - Parsed arguments
 * @param {Array<string>} requiredArgs - List of required argument names
 * @throws {Error} If required arguments are missing
 */
function validateRequiredArgs(args, requiredArgs) {
  const missing = requiredArgs.filter((arg) => args[arg] === undefined || args[arg] === null);

  if (missing.length > 0) {
    throw new Error(`Missing required arguments: ${missing.join(', ')}`);
  }
}

module.exports = {
  parseCliArgs,
  createOption,
  stringOption,
  numberOption,
  booleanOption,
  arrayOption,
  choiceOption,
  validateRequiredArgs
};
