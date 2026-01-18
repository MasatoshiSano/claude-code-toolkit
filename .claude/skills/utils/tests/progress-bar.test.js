/**
 * Progress Bar Tests
 *
 * Tests for the progress bar utility
 */

// Mock cli-progress
jest.mock('cli-progress');
const cliProgress = require('cli-progress');

const { createProgressBar, createMultiBar, ProgressBar } = require('../progress-bar');

describe('Progress Bar', () => {
  let mockBar;

  beforeEach(() => {
    mockBar = {
      start: jest.fn(),
      update: jest.fn(),
      increment: jest.fn(),
      stop: jest.fn()
    };

    cliProgress.SingleBar = jest.fn(() => mockBar);
    cliProgress.MultiBar = jest.fn(() => ({
      create: jest.fn(() => mockBar),
      stop: jest.fn()
    }));
    cliProgress.Presets = {
      shades_classic: {},
      shades_grey: {}
    };
  });

  describe('createProgressBar', () => {
    it('should create progress bar with default options', () => {
      const bar = createProgressBar('Processing', 100);

      expect(bar).toBeInstanceOf(ProgressBar);
      expect(bar.total).toBe(100);
      expect(cliProgress.SingleBar).toHaveBeenCalled();
    });

    it('should create progress bar with custom format', () => {
      const format = 'Custom: {bar} {percentage}%';
      const _bar = createProgressBar('Processing', 100, { format });

      expect(cliProgress.SingleBar).toHaveBeenCalledWith(
        expect.objectContaining({
          format
        }),
        expect.anything()
      );
    });

    it('should pass custom options to cli-progress', () => {
      const _bar = createProgressBar('Processing', 100, {
        hideCursor: false,
        clearOnComplete: true,
        stopOnComplete: true
      });

      expect(cliProgress.SingleBar).toHaveBeenCalledWith(
        expect.objectContaining({
          hideCursor: false,
          clearOnComplete: true,
          stopOnComplete: true
        }),
        expect.anything()
      );
    });
  });

  describe('ProgressBar class', () => {
    let progressBar;

    beforeEach(() => {
      progressBar = createProgressBar('Test', 100);
    });

    describe('start', () => {
      it('should start the progress bar at 0', () => {
        progressBar.start();

        expect(mockBar.start).toHaveBeenCalledWith(100, 0, {});
        expect(progressBar.isActive()).toBe(true);
        expect(progressBar.getValue()).toBe(0);
      });

      it('should start the progress bar at custom value', () => {
        progressBar.start(50);

        expect(mockBar.start).toHaveBeenCalledWith(100, 50, {});
        expect(progressBar.getValue()).toBe(50);
      });

      it('should start with custom payload', () => {
        const payload = { task: 'Processing files' };
        progressBar.start(0, payload);

        expect(mockBar.start).toHaveBeenCalledWith(100, 0, payload);
      });
    });

    describe('update', () => {
      it('should update the progress bar value', () => {
        progressBar.start();
        progressBar.update(50);

        expect(mockBar.update).toHaveBeenCalledWith(50, {});
        expect(progressBar.getValue()).toBe(50);
      });

      it('should update with custom payload', () => {
        progressBar.start();
        const payload = { currentFile: 'test.txt' };
        progressBar.update(75, payload);

        expect(mockBar.update).toHaveBeenCalledWith(75, payload);
      });

      it('should throw if not started', () => {
        expect(() => progressBar.update(50)).toThrow('Progress bar not started');
      });
    });

    describe('increment', () => {
      it('should increment by 1 by default', () => {
        progressBar.start();
        progressBar.increment();

        expect(mockBar.increment).toHaveBeenCalledWith(1, {});
        expect(progressBar.getValue()).toBe(1);
      });

      it('should increment by custom delta', () => {
        progressBar.start();
        progressBar.increment(10);

        expect(mockBar.increment).toHaveBeenCalledWith(10, {});
        expect(progressBar.getValue()).toBe(10);
      });

      it('should increment multiple times', () => {
        progressBar.start();
        progressBar.increment(5);
        progressBar.increment(3);

        expect(progressBar.getValue()).toBe(8);
      });

      it('should increment with custom payload', () => {
        progressBar.start();
        const payload = { item: 'file.txt' };
        progressBar.increment(1, payload);

        expect(mockBar.increment).toHaveBeenCalledWith(1, payload);
      });

      it('should throw if not started', () => {
        expect(() => progressBar.increment()).toThrow('Progress bar not started');
      });
    });

    describe('stop', () => {
      it('should stop the progress bar', () => {
        progressBar.start();
        progressBar.stop();

        expect(mockBar.stop).toHaveBeenCalled();
        expect(progressBar.isActive()).toBe(false);
      });

      it('should do nothing if already stopped', () => {
        progressBar.start();
        progressBar.stop();
        mockBar.stop.mockClear();
        progressBar.stop();

        expect(mockBar.stop).not.toHaveBeenCalled();
      });

      it('should do nothing if never started', () => {
        progressBar.stop();

        expect(mockBar.stop).not.toHaveBeenCalled();
      });
    });

    describe('complete', () => {
      it('should set to 100% and stop', () => {
        progressBar.start();
        progressBar.complete();

        expect(mockBar.update).toHaveBeenCalledWith(100);
        expect(mockBar.stop).toHaveBeenCalled();
        expect(progressBar.isActive()).toBe(false);
      });

      it('should do nothing if already stopped', () => {
        progressBar.start();
        progressBar.stop();
        mockBar.update.mockClear();
        mockBar.stop.mockClear();
        progressBar.complete();

        expect(mockBar.update).not.toHaveBeenCalled();
        expect(mockBar.stop).not.toHaveBeenCalled();
      });
    });

    describe('getters', () => {
      it('should get current value', () => {
        progressBar.start(25);

        expect(progressBar.getValue()).toBe(25);
      });

      it('should get total value', () => {
        expect(progressBar.getTotal()).toBe(100);
      });

      it('should check if active', () => {
        expect(progressBar.isActive()).toBe(false);
        progressBar.start();
        expect(progressBar.isActive()).toBe(true);
        progressBar.stop();
        expect(progressBar.isActive()).toBe(false);
      });
    });
  });

  describe('createMultiBar', () => {
    it('should create multi-bar with default options', () => {
      const _multiBar = createMultiBar();

      expect(cliProgress.MultiBar).toHaveBeenCalled();
    });

    it('should create multi-bar with custom options', () => {
      const _multiBar = createMultiBar({
        clearOnComplete: true,
        hideCursor: false,
        format: 'Custom: {bar}'
      });

      expect(cliProgress.MultiBar).toHaveBeenCalledWith(
        expect.objectContaining({
          clearOnComplete: true,
          hideCursor: false,
          format: 'Custom: {bar}'
        }),
        expect.anything()
      );
    });
  });

  describe('Integration', () => {
    it('should handle complete workflow', () => {
      const bar = createProgressBar('Processing', 10);

      bar.start();
      expect(bar.isActive()).toBe(true);
      expect(bar.getValue()).toBe(0);

      bar.increment();
      expect(bar.getValue()).toBe(1);

      bar.update(5);
      expect(bar.getValue()).toBe(5);

      bar.increment(3);
      expect(bar.getValue()).toBe(8);

      bar.complete();
      expect(bar.isActive()).toBe(false);

      expect(mockBar.start).toHaveBeenCalledTimes(1);
      expect(mockBar.increment).toHaveBeenCalledTimes(2);
      expect(mockBar.update).toHaveBeenCalledTimes(2);
      expect(mockBar.stop).toHaveBeenCalledTimes(1);
    });
  });
});
