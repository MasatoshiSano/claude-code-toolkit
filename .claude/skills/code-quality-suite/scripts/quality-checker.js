#!/usr/bin/env node

/**
 * Code Quality Checker
 * コード品質をチェック（構文エラー、複雑度、ベストプラクティス）
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * コード品質をチェック
 * @param {Object} options - チェックオプション
 * @param {string} options.directory - チェックするディレクトリ
 * @param {Array} options.extensions - チェックするファイル拡張子
 * @returns {Promise<Object>} チェック結果
 */
async function checkQuality(options = {}) {
  const { directory = '.', extensions = ['.js', '.ts', '.jsx', '.tsx'] } = options;

  console.log(`\n🔍 Checking code quality in: ${directory}\n`);

  const results = {
    linting: await runLinting(directory),
    typescript: await runTypeScript(directory),
    complexity: analyzeComplexity(directory, extensions),
    summary: null,
  };

  results.summary = generateSummary(results);

  return results;
}

/**
 * ESLintを実行
 * @param {string} directory - チェックするディレクトリ
 * @returns {Promise<Object>} Linting結果
 */
async function runLinting(directory) {
  try {
    // ESLintがインストールされているか確認
    try {
      execSync('npx eslint --version', { stdio: 'ignore' });
    } catch {
      return {
        status: 'skipped',
        reason: 'ESLint not found',
        suggestion: 'Install: npm install -D eslint',
      };
    }

    // ESLintを実行
    const output = execSync(`npx eslint ${directory} --format json`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'], // stderrを無視
    });

    const results = JSON.parse(output);

    const errorCount = results.reduce((sum, file) => sum + file.errorCount, 0);
    const warningCount = results.reduce((sum, file) => sum + file.warningCount, 0);

    return {
      status: 'success',
      errorCount,
      warningCount,
      files: results.length,
      details: results.slice(0, 5), // 最初の5ファイルのみ
    };
  } catch (error) {
    // ESLintエラー（構文エラー等）がある場合
    try {
      const results = JSON.parse(error.stdout || '[]');
      const errorCount = results.reduce((sum, file) => sum + file.errorCount, 0);
      const warningCount = results.reduce((sum, file) => sum + file.warningCount, 0);

      return {
        status: 'completed_with_errors',
        errorCount,
        warningCount,
        files: results.length,
        details: results.filter((f) => f.errorCount > 0).slice(0, 5),
      };
    } catch {
      return {
        status: 'error',
        error: error.message,
      };
    }
  }
}

/**
 * TypeScriptコンパイルチェックを実行
 * @param {string} directory - チェックするディレクトリ
 * @returns {Promise<Object>} TypeScript結果
 */
async function runTypeScript(directory) {
  try {
    // tscがインストールされているか確認
    try {
      execSync('npx tsc --version', { stdio: 'ignore' });
    } catch {
      return {
        status: 'skipped',
        reason: 'TypeScript not found',
      };
    }

    // tsconfig.jsonが存在するか確認
    if (!fs.existsSync('tsconfig.json')) {
      return {
        status: 'skipped',
        reason: 'tsconfig.json not found',
      };
    }

    // TypeScriptコンパイルチェック
    execSync('npx tsc --noEmit', { encoding: 'utf8' });

    return {
      status: 'success',
      errorCount: 0,
    };
  } catch (error) {
    // TypeScriptエラーがある場合
    const output = error.stdout || error.stderr || '';
    const errorLines = output.split('\n').filter((line) => line.includes('error TS'));

    return {
      status: 'completed_with_errors',
      errorCount: errorLines.length,
      errors: errorLines.slice(0, 10), // 最初の10エラーのみ
    };
  }
}

/**
 * コード複雑度を分析（簡略版）
 * @param {string} directory - チェックするディレクトリ
 * @param {Array} extensions - ファイル拡張子
 * @returns {Object} 複雑度分析結果
 */
function analyzeComplexity(directory, extensions) {
  // 簡略版: ファイル数とサイズのみをカウント
  let fileCount = 0;
  let totalLines = 0;

  function walkDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          walkDir(filePath);
        }
      } else {
        const ext = path.extname(file);
        if (extensions.includes(ext)) {
          fileCount++;
          const content = fs.readFileSync(filePath, 'utf8');
          totalLines += content.split('\n').length;
        }
      }
    });
  }

  try {
    walkDir(directory);
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
    };
  }

  return {
    status: 'success',
    fileCount,
    totalLines,
    averageLinesPerFile: fileCount > 0 ? Math.round(totalLines / fileCount) : 0,
  };
}

/**
 * サマリーを生成
 * @param {Object} results - チェック結果
 * @returns {Object} サマリー
 */
function generateSummary(results) {
  const issues = {
    errors: 0,
    warnings: 0,
  };

  if (results.linting.errorCount) issues.errors += results.linting.errorCount;
  if (results.linting.warningCount) issues.warnings += results.linting.warningCount;
  if (results.typescript.errorCount) issues.errors += results.typescript.errorCount;

  const totalIssues = issues.errors + issues.warnings;

  let score = 100;
  score -= issues.errors * 2; // エラー1つにつき-2点
  score -= issues.warnings * 0.5; // 警告1つにつき-0.5点
  score = Math.max(0, score);

  let rating = 'excellent';
  if (score < 50) rating = 'poor';
  else if (score < 70) rating = 'fair';
  else if (score < 85) rating = 'good';

  return {
    score: Math.round(score),
    rating,
    totalIssues,
    errors: issues.errors,
    warnings: issues.warnings,
  };
}

/**
 * 結果を表示
 * @param {Object} results - チェック結果
 */
function displayResults(results) {
  console.log('\n📊 Code Quality Report\n');
  console.log(`Overall Score: ${results.summary.score}/100 (${results.summary.rating.toUpperCase()})\n`);

  // Linting
  console.log('ESLint:');
  if (results.linting.status === 'skipped') {
    console.log(`  ⚠️  ${results.linting.reason}`);
    if (results.linting.suggestion) {
      console.log(`      ${results.linting.suggestion}`);
    }
  } else {
    console.log(`  Errors: ${results.linting.errorCount}`);
    console.log(`  Warnings: ${results.linting.warningCount}`);
    console.log(`  Files checked: ${results.linting.files}\n`);
  }

  // TypeScript
  console.log('TypeScript:');
  if (results.typescript.status === 'skipped') {
    console.log(`  ⚠️  ${results.typescript.reason}\n`);
  } else {
    console.log(`  Errors: ${results.typescript.errorCount}\n`);
  }

  // Complexity
  console.log('Code Metrics:');
  console.log(`  Files: ${results.complexity.fileCount}`);
  console.log(`  Total Lines: ${results.complexity.totalLines}`);
  console.log(`  Avg Lines/File: ${results.complexity.averageLinesPerFile}\n`);

  // Summary
  console.log('Summary:');
  console.log(`  Total Issues: ${results.summary.totalIssues} (${results.summary.errors} errors, ${results.summary.warnings} warnings)\n`);
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
    const results = await checkQuality(options);
    displayResults(results);

    // 結果をJSONファイルとして保存
    const outputDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `quality-check-${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(`✓ Report saved to: ${outputPath}\n`);

    // エラーがある場合は終了コード1で終了
    if (results.summary.errors > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = { checkQuality, runLinting, runTypeScript };
