#!/usr/bin/env node

/**
 * Security Scanner
 * セキュリティ脆弱性をスキャン（npm audit、シークレット検出）
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Logger } = require('@claude-skills/utils');

const logger = new Logger('code-quality-suite:security-scanner');

/**
 * セキュリティスキャンを実行
 * @param {Object} options - スキャンオプション
 * @param {string} options.directory - スキャンするディレクトリ
 * @returns {Promise<Object>} スキャン結果
 */
async function scanSecurity(options = {}) {
  const { directory = '.' } = options;

  logger.info('\n🔒 Scanning for security vulnerabilities...\n');

  const results = {
    dependencies: await scanDependencies(directory),
    secrets: scanForSecrets(directory),
    summary: null
  };

  results.summary = generateSecuritySummary(results);

  return results;
}

/**
 * 依存関係の脆弱性をスキャン
 * @param {string} directory - スキャンするディレクトリ
 * @returns {Promise<Object>} スキャン結果
 */
async function scanDependencies(directory) {
  try {
    // package.jsonが存在するか確認
    const packageJsonPath = path.join(directory, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return {
        status: 'skipped',
        reason: 'package.json not found'
      };
    }

    // npm auditを実行
    const output = execSync('npm audit --json', {
      encoding: 'utf8',
      cwd: directory
    });

    const audit = JSON.parse(output);

    return {
      status: 'success',
      vulnerabilities: {
        critical: audit.metadata?.vulnerabilities?.critical || 0,
        high: audit.metadata?.vulnerabilities?.high || 0,
        moderate: audit.metadata?.vulnerabilities?.moderate || 0,
        low: audit.metadata?.vulnerabilities?.low || 0,
        info: audit.metadata?.vulnerabilities?.info || 0
      },
      totalVulnerabilities: audit.metadata?.vulnerabilities?.total || 0
    };
  } catch (error) {
    // npm auditはエラーコード1を返すことがあるが、出力は有効
    try {
      const output = error.stdout || '';
      if (output) {
        const audit = JSON.parse(output);
        return {
          status: 'completed_with_issues',
          vulnerabilities: {
            critical: audit.metadata?.vulnerabilities?.critical || 0,
            high: audit.metadata?.vulnerabilities?.high || 0,
            moderate: audit.metadata?.vulnerabilities?.moderate || 0,
            low: audit.metadata?.vulnerabilities?.low || 0,
            info: audit.metadata?.vulnerabilities?.info || 0
          },
          totalVulnerabilities: audit.metadata?.vulnerabilities?.total || 0
        };
      }
    } catch {
      // JSON parse failed
    }

    return {
      status: 'error',
      error: error.message
    };
  }
}

/**
 * シークレット（パスワード、APIキー等）を検出
 * @param {string} directory - スキャンするディレクトリ
 * @returns {Object} 検出結果
 */
function scanForSecrets(directory) {
  const secretPatterns = [
    { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
    { name: 'Private Key', pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/ },
    { name: 'Password in Code', pattern: /password\s*=\s*['"]/i },
    { name: 'API Key', pattern: /api[_-]?key\s*=\s*['"]/i },
    { name: 'Auth Token', pattern: /auth[_-]?token\s*=\s*['"]/i }
  ];

  const findings = [];
  const excludedDirs = ['node_modules', '.git', 'dist', 'build', '.next'];
  const excludedFiles = ['.env.example', 'package-lock.json'];

  function scanFile(filePath) {
    const relativePath = path.relative(directory, filePath);

    // 除外ファイルをスキップ
    if (excludedFiles.some((excluded) => relativePath.includes(excluded))) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      secretPatterns.forEach((pattern) => {
        lines.forEach((line, index) => {
          if (pattern.pattern.test(line)) {
            findings.push({
              file: relativePath,
              line: index + 1,
              type: pattern.name,
              snippet: line.substring(0, 80) + (line.length > 80 ? '...' : '')
            });
          }
        });
      });
    } catch (error) {
      // ファイル読み込みエラーは無視
    }
  }

  function walkDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!file.startsWith('.') && !excludedDirs.includes(file)) {
          walkDir(filePath);
        }
      } else {
        // テキストファイルのみスキャン
        const ext = path.extname(file);
        if (['.js', '.ts', '.jsx', '.tsx', '.json', '.env', '.yaml', '.yml', '.md'].includes(ext)) {
          scanFile(filePath);
        }
      }
    });
  }

  try {
    walkDir(directory);
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }

  return {
    status: 'success',
    findings,
    count: findings.length
  };
}

/**
 * セキュリティサマリーを生成
 * @param {Object} results - スキャン結果
 * @returns {Object} サマリー
 */
function generateSecuritySummary(results) {
  const criticalIssues = (results.dependencies.vulnerabilities?.critical || 0)
    + results.secrets.findings.filter((f) => f.type.includes('Private Key')).length;

  const highIssues = (results.dependencies.vulnerabilities?.high || 0)
    + results.secrets.findings.filter((f) => f.type.includes('AWS')).length;

  const totalIssues = (results.dependencies.totalVulnerabilities || 0) + results.secrets.count;

  let score = 100;
  score -= criticalIssues * 10; // Critical: -10点
  score -= highIssues * 5; // High: -5点
  score -= (results.dependencies.vulnerabilities?.moderate || 0) * 2; // Moderate: -2点
  score = Math.max(0, score);

  let rating = 'excellent';
  if (score < 40) rating = 'critical';
  else if (score < 60) rating = 'poor';
  else if (score < 80) rating = 'fair';
  else if (score < 95) rating = 'good';

  return {
    score: Math.round(score),
    rating,
    totalIssues,
    criticalIssues,
    highIssues
  };
}

/**
 * 結果を表示
 * @param {Object} results - スキャン結果
 */
function displayResults(results) {
  logger.info('\n🔒 Security Scan Results\n');
  logger.info(`Security Score: ${results.summary.score}/100 (${results.summary.rating.toUpperCase()})\n`);

  // 依存関係の脆弱性
  logger.info('Dependency Vulnerabilities:');
  if (results.dependencies.status === 'skipped') {
    logger.info(`  ⚠️  ${results.dependencies.reason}\n`);
  } else {
    const vuln = results.dependencies.vulnerabilities;
    logger.info(`  Critical: ${vuln.critical}`);
    logger.info(`  High: ${vuln.high}`);
    logger.info(`  Moderate: ${vuln.moderate}`);
    logger.info(`  Low: ${vuln.low}`);
    logger.info(`  Total: ${results.dependencies.totalVulnerabilities}\n`);

    if (results.dependencies.totalVulnerabilities > 0) {
      logger.info('  💡 Run "npm audit fix" to automatically fix vulnerabilities\n');
    }
  }

  // シークレット検出
  logger.info('Secret Detection:');
  logger.info(`  Potential secrets found: ${results.secrets.count}\n`);

  if (results.secrets.count > 0) {
    logger.info('  ⚠️  WARNING: Potential secrets detected:');
    results.secrets.findings.slice(0, 5).forEach((finding) => {
      logger.info(`     - ${finding.type} in ${finding.file}:${finding.line}`);
    });
    if (results.secrets.count > 5) {
      logger.info(`     ... and ${results.secrets.count - 5} more\n`);
    }
  }

  // Summary
  logger.info('Summary:');
  logger.info(`  Total Security Issues: ${results.summary.totalIssues}`);
  logger.info(`  Critical: ${results.summary.criticalIssues}`);
  logger.info(`  High: ${results.summary.highIssues}\n`);
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);
  const options = { directory: '.' };

  args.forEach((arg) => {
    if (arg.startsWith('--dir=')) {
      options.directory = arg.split('=')[1];
    }
  });

  try {
    const results = await scanSecurity(options);
    displayResults(results);

    // 結果をJSONファイルとして保存
    const outputDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `security-scan-${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    logger.info(`✓ Report saved to: ${outputPath}\n`);

    // Critical issuesがある場合は終了コード1で終了
    if (results.summary.criticalIssues > 0) {
      process.exit(1);
    }
  } catch (error) {
    logger.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = { scanSecurity, scanDependencies, scanForSecrets };
