/**
 * Tests for index-optimizer.js
 */

const { analyzeIndexes, generateIndexSQL } = require('../scripts/index-optimizer.js');

describe('Index Optimizer', () => {
  describe('analyzeIndexes', () => {
    it('should recommend indexes for WHERE clauses', () => {
      const queries = [
        'SELECT * FROM users WHERE email = ?',
        'SELECT * FROM users WHERE email = ? AND status = ?'
      ];

      const result = analyzeIndexes({ queries, database: 'postgresql' });

      expect(result.recommended).toBeDefined();
      expect(result.recommended.length).toBeGreaterThan(0);
    });

    it('should recommend composite indexes for multiple columns', () => {
      const queries = [
        'SELECT * FROM orders WHERE user_id = ? AND status = ?',
        'SELECT * FROM orders WHERE user_id = ? AND status = ? ORDER BY created_at'
      ];

      const result = analyzeIndexes({ queries, database: 'postgresql' });

      // Should recommend composite index on (user_id, status)
      const compositeIndex = result.recommended.find(r => r.columns && r.columns.length > 1);
      expect(compositeIndex).toBeDefined();
    });
  });

  describe('generateIndexSQL', () => {
    it('should generate correct PostgreSQL index SQL', () => {
      const sql = generateIndexSQL('users', 'email', 'postgresql');

      expect(sql).toContain('CREATE INDEX');
      expect(sql).toContain('idx_users_email');
      expect(sql).toContain('ON users(email)');
    });

    it('should generate correct MySQL index SQL', () => {
      const sql = generateIndexSQL('users', 'email', 'mysql');

      expect(sql).toContain('CREATE INDEX');
      expect(sql).toContain('users');
      expect(sql).toContain('email');
    });
  });
});
