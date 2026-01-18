/**
 * Tests for coldstart-analyzer.js
 */

const {
  analyzeColdStarts,
  estimateColdStartData,
  generateColdStartRecommendations
} = require('../scripts/coldstart-analyzer.js');

describe('Cold Start Analyzer', () => {
  describe('estimateColdStartData', () => {
    it('should estimate lower cold start for Node.js', () => {
      const func = {
        Runtime: 'nodejs20.x',
        MemorySize: 1024
      };

      const data = estimateColdStartData(func);
      expect(data.estimatedColdStartMs).toBeLessThan(500);
    });

    it('should estimate higher cold start for Java', () => {
      const func = {
        Runtime: 'java21',
        MemorySize: 1024
      };

      const data = estimateColdStartData(func);
      expect(data.estimatedColdStartMs).toBeGreaterThan(1000);
    });

    it('should reduce estimate for higher memory', () => {
      const func512 = {
        Runtime: 'nodejs20.x',
        MemorySize: 512
      };
      const func1024 = {
        Runtime: 'nodejs20.x',
        MemorySize: 1024
      };

      const data512 = estimateColdStartData(func512);
      const data1024 = estimateColdStartData(func1024);

      expect(data1024.estimatedColdStartMs).toBeLessThan(data512.estimatedColdStartMs);
    });
  });

  describe('generateColdStartRecommendations', () => {
    it('should recommend GraalVM for Java functions', () => {
      const func = { Runtime: 'java21', MemorySize: 1024 };
      const coldStartData = { impact: 'high', estimatedColdStartMs: 2000 };

      const recommendations = generateColdStartRecommendations(func, coldStartData);

      const graalvmRec = recommendations.find(r => r.type === 'runtime-optimization');
      expect(graalvmRec).toBeDefined();
      expect(graalvmRec.priority).toBe('high');
    });

    it('should recommend Provisioned Concurrency for high impact', () => {
      const func = { Runtime: 'nodejs20.x', MemorySize: 1024 };
      const coldStartData = { impact: 'high', estimatedColdStartMs: 1000 };

      const recommendations = generateColdStartRecommendations(func, coldStartData);

      const provisionedRec = recommendations.find(r => r.type === 'provisioned-concurrency');
      expect(provisionedRec).toBeDefined();
    });
  });
});
