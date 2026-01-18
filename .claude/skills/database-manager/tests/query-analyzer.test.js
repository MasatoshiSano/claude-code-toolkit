/**
 * Tests for query-analyzer.js
 */

const { analyzeQuery, detectQueryIssues } = require('../scripts/query-analyzer.js');

describe('Query Analyzer', () => {
  describe('detectQueryIssues', () => {
    it('should detect SELECT * usage', () => {
      const query = 'select * from users where id = 1';
      const issues = detectQueryIssues(query, 'postgresql');

      const selectAllIssue = issues.find(i => i.type === 'select-all');
      expect(selectAllIssue).toBeDefined();
      expect(selectAllIssue.severity).toBe('medium');
    });

    it('should detect missing WHERE clause in UPDATE', () => {
      const query = 'update users set status = \'active\'';
      const issues = detectQueryIssues(query, 'postgresql');

      const missingWhereIssue = issues.find(i => i.type === 'missing-where-clause');
      expect(missingWhereIssue).toBeDefined();
      expect(missingWhereIssue.severity).toBe('critical');
    });

    it('should detect missing WHERE clause in DELETE', () => {
      const query = 'delete from users';
      const issues = detectQueryIssues(query, 'postgresql');

      const missingWhereIssue = issues.find(i => i.type === 'missing-where-clause');
      expect(missingWhereIssue).toBeDefined();
      expect(missingWhereIssue.severity).toBe('critical');
    });

    it('should not flag UPDATE/DELETE with WHERE clause', () => {
      const query = 'update users set status = \'active\' where id = 1';
      const issues = detectQueryIssues(query, 'postgresql');

      const missingWhereIssue = issues.find(i => i.type === 'missing-where-clause');
      expect(missingWhereIssue).toBeUndefined();
    });
  });

  describe('analyzeQuery', () => {
    it('should return analysis with issues and recommendations', () => {
      const query = 'SELECT * FROM users';
      const analysis = analyzeQuery(query, 'postgresql');

      expect(analysis).toHaveProperty('type');
      expect(analysis).toHaveProperty('issues');
      expect(analysis).toHaveProperty('recommendations');
    });

    it('should detect JOIN queries', () => {
      const query = 'SELECT * FROM users JOIN orders ON users.id = orders.user_id';
      const analysis = analyzeQuery(query, 'postgresql');

      expect(analysis.type).toContain('select');
      expect(analysis.complexity).toBeGreaterThan(1);
    });
  });
});
