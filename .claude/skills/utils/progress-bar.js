/**
 * Progress Bar - Visual progress indication for Agent Skills
 *
 * Provides unified progress bar display using cli-progress
 * with customizable format and auto ETA calculation
 */

const cliProgress = require('cli-progress');

/**
 * Create a progress bar instance
 * @param {string} text - Progress bar label text
 * @param {number} total - Total number of items to process
 * @param {Object} options - Progress bar options
 * @param {string} options.format - Custom format string
 * @param {boolean} options.hideCursor - Hide terminal cursor (default: true)
 * @param {boolean} options.clearOnComplete - Clear bar on completion (default: false)
 * @param {boolean} options.stopOnComplete - Auto-stop on completion (default: false)
 * @returns {ProgressBar} Progress bar instance
 */
function createProgressBar(text, total, options = {}) {
  const {
    format = `${text} [{bar}] {percentage}% | {value}/{total} | ETA: {eta_formatted}`,
    hideCursor = true,
    clearOnComplete = false,
    stopOnComplete = false
  } = options;

  const bar = new cliProgress.SingleBar(
    {
      format,
      hideCursor,
      clearOnComplete,
      stopOnComplete,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      fps: 10,
      stream: process.stdout,
      barsize: 30,
      etaBuffer: 10
    },
    cliProgress.Presets.shades_classic
  );

  return new ProgressBar(bar, total);
}

/**
 * ProgressBar class wrapper around cli-progress
 */
class ProgressBar {
  /**
   * Create a ProgressBar instance
   * @param {Object} bar - cli-progress SingleBar instance
   * @param {number} total - Total number of items
   */
  constructor(bar, total) {
    this.bar = bar;
    this.total = total;
    this.current = 0;
    this.isRunning = false;
  }

  /**
   * Start the progress bar
   * @param {number} startValue - Starting value (default: 0)
   * @param {Object} payload - Additional payload data
   */
  start(startValue = 0, payload = {}) {
    this.current = startValue;
    this.isRunning = true;
    this.bar.start(this.total, startValue, payload);
  }

  /**
   * Update the progress bar
   * @param {number} value - Current value
   * @param {Object} payload - Additional payload data
   */
  update(value, payload = {}) {
    if (!this.isRunning) {
      throw new Error('Progress bar not started. Call start() first.');
    }
    this.current = value;
    this.bar.update(value, payload);
  }

  /**
   * Increment the progress bar by a delta
   * @param {number} delta - Amount to increment (default: 1)
   * @param {Object} payload - Additional payload data
   */
  increment(delta = 1, payload = {}) {
    if (!this.isRunning) {
      throw new Error('Progress bar not started. Call start() first.');
    }
    this.current += delta;
    this.bar.increment(delta, payload);
  }

  /**
   * Stop the progress bar
   */
  stop() {
    if (this.isRunning) {
      this.bar.stop();
      this.isRunning = false;
    }
  }

  /**
   * Set the progress to 100% and stop
   */
  complete() {
    if (this.isRunning) {
      this.bar.update(this.total);
      this.bar.stop();
      this.isRunning = false;
    }
  }

  /**
   * Get the current progress value
   * @returns {number} Current value
   */
  getValue() {
    return this.current;
  }

  /**
   * Get the total value
   * @returns {number} Total value
   */
  getTotal() {
    return this.total;
  }

  /**
   * Check if progress bar is running
   * @returns {boolean} Whether bar is running
   */
  isActive() {
    return this.isRunning;
  }
}

/**
 * Create a multi-progress bar container
 * @param {Object} options - MultiBar options
 * @returns {Object} MultiBar instance
 */
function createMultiBar(options = {}) {
  const { clearOnComplete = false, hideCursor = true, format = '{bar} | {task} | {value}/{total}' } = options;

  return new cliProgress.MultiBar(
    {
      clearOnComplete,
      hideCursor,
      format,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591'
    },
    cliProgress.Presets.shades_grey
  );
}

module.exports = {
  createProgressBar,
  createMultiBar,
  ProgressBar
};
