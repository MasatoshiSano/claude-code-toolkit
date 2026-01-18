/**
 * Tests for lambda-optimizer.js
 */

const {
  optimizeLambda,
  calculateOptimalMemory,
  estimateLambdaCost
} = require('../scripts/lambda-optimizer.js');

// Mock AWS SDK
jest.mock('@aws-sdk/client-lambda');
jest.mock('@aws-sdk/client-cloudwatch');

describe('Lambda Optimizer', () => {
  describe('calculateOptimalMemory', () => {
    it('should recommend lower memory if utilization is low', () => {
      const currentMemory = 1024;
      const metrics = {
        avgMemoryUsed: 400,
        maxMemoryUsed: 500
      };

      // Should recommend 512MB (next power of 2 above 500)
      const optimal = calculateOptimalMemory(currentMemory, metrics);
      expect(optimal).toBeLessThan(currentMemory);
    });

    it('should recommend higher memory if utilization is high', () => {
      const currentMemory = 512;
      const metrics = {
        avgMemoryUsed: 480,
        maxMemoryUsed: 510
      };

      // Should recommend 1024MB
      const optimal = calculateOptimalMemory(currentMemory, metrics);
      expect(optimal).toBeGreaterThan(currentMemory);
    });
  });

  describe('estimateLambdaCost', () => {
    it('should calculate monthly cost correctly', () => {
      const invocations = 1000000; // 1M invocations
      const avgDuration = 500; // 500ms
      const memory = 1024; // 1024MB

      const cost = estimateLambdaCost(invocations, avgDuration, memory);
      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('should return higher cost for higher memory', () => {
      const invocations = 1000000;
      const avgDuration = 500;

      const cost512 = estimateLambdaCost(invocations, avgDuration, 512);
      const cost1024 = estimateLambdaCost(invocations, avgDuration, 1024);

      expect(cost1024).toBeGreaterThan(cost512);
    });
  });
});
