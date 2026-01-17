#!/usr/bin/env node

/**
 * Analyze Commit
 * git diffを解析して技術的な変更内容を抽出
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * コミットを分析
 * @param {Object} options - 分析オプション
 * @param {string} options.commit - コミットハッシュ（デフォルト: HEAD）
 * @param {string} options.baseBranch - 比較元ブランチ（デフォルト: なし）
 * @returns {Object} 分析結果
 */
function analyzeCommit(options = {}) {
  const { commit = 'HEAD', baseBranch = null } = options;

  console.log(`\n📝 Analyzing commit: ${commit}...\n`);

  try {
    // Gitリポジトリかチェック
    if (!isGitRepository()) {
      throw new Error('Not a git repository');
    }

    // コミット情報を取得
    const commitInfo = getCommitInfo(commit);

    // 変更ファイルを取得
    const changedFiles = getChangedFiles(commit, baseBranch);

    // 変更内容の詳細を取得
    const changes = analyzeChanges(changedFiles, commit, baseBranch);

    // 技術スタックを検出
    const techStack = detectTechStack(changedFiles, changes);

    // 影響範囲を分析
    const impact = analyzeImpact(changes);

    return {
      commitInfo,
      changedFiles,
      changes,
      techStack,
      impact,
      summary: generateSummary(commitInfo, changes, techStack, impact),
    };
  } catch (error) {
    console.error('❌ Error analyzing commit:', error.message);
    throw error;
  }
}

/**
 * Gitリポジトリかチェック
 * @returns {boolean}
 */
function isGitRepository() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * コミット情報を取得
 * @param {string} commit - コミットハッシュ
 * @returns {Object}
 */
function getCommitInfo(commit) {
  try {
    const hash = execSync(`git rev-parse ${commit}`, { encoding: 'utf8' }).trim();
    const message = execSync(`git log -1 --pretty=%B ${commit}`, { encoding: 'utf8' }).trim();
    const author = execSync(`git log -1 --pretty=%an ${commit}`, { encoding: 'utf8' }).trim();
    const date = execSync(`git log -1 --pretty=%ai ${commit}`, { encoding: 'utf8' }).trim();

    return {
      hash,
      shortHash: hash.substring(0, 7),
      message,
      author,
      date,
    };
  } catch (error) {
    throw new Error(`Failed to get commit info: ${error.message}`);
  }
}

/**
 * 変更ファイルを取得
 * @param {string} commit - コミットハッシュ
 * @param {string|null} baseBranch - 比較元ブランチ
 * @returns {Array}
 */
function getChangedFiles(commit, baseBranch) {
  try {
    const diffCommand = baseBranch
      ? `git diff --name-status ${baseBranch}...${commit}`
      : `git diff --name-status ${commit}^..${commit}`;

    const output = execSync(diffCommand, { encoding: 'utf8' }).trim();

    if (!output) {
      return [];
    }

    return output.split('\n').map((line) => {
      const [status, ...pathParts] = line.split('\t');
      const filePath = pathParts.join('\t');

      return {
        status: getStatusName(status),
        path: filePath,
        extension: path.extname(filePath),
        directory: path.dirname(filePath),
        filename: path.basename(filePath),
      };
    });
  } catch (error) {
    throw new Error(`Failed to get changed files: ${error.message}`);
  }
}

/**
 * ステータスコードを名前に変換
 * @param {string} code - ステータスコード
 * @returns {string}
 */
function getStatusName(code) {
  const statusMap = {
    'A': 'added',
    'M': 'modified',
    'D': 'deleted',
    'R': 'renamed',
    'C': 'copied',
  };
  return statusMap[code] || code;
}

/**
 * 変更内容を分析
 * @param {Array} changedFiles - 変更ファイル一覧
 * @param {string} commit - コミットハッシュ
 * @param {string|null} baseBranch - 比較元ブランチ
 * @returns {Object}
 */
function analyzeChanges(changedFiles, commit, baseBranch) {
  const changes = {
    additions: 0,
    deletions: 0,
    filesByType: {},
    codeChanges: [],
  };

  changedFiles.forEach((file) => {
    // ファイルタイプごとに集計
    const ext = file.extension || 'no-extension';
    if (!changes.filesByType[ext]) {
      changes.filesByType[ext] = { count: 0, files: [] };
    }
    changes.filesByType[ext].count++;
    changes.filesByType[ext].files.push(file.path);

    // 詳細な変更内容を取得（テキストファイルのみ）
    if (isTextFile(file.extension) && file.status !== 'deleted') {
      try {
        const diffCommand = baseBranch
          ? `git diff ${baseBranch}...${commit} -- "${file.path}"`
          : `git diff ${commit}^..${commit} -- "${file.path}"`;

        const diff = execSync(diffCommand, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

        const stats = analyzeDiff(diff);
        changes.additions += stats.additions;
        changes.deletions += stats.deletions;

        changes.codeChanges.push({
          file: file.path,
          ...stats,
        });
      } catch (error) {
        // Diffの取得に失敗した場合はスキップ
      }
    }
  });

  return changes;
}

/**
 * テキストファイルかチェック
 * @param {string} extension - 拡張子
 * @returns {boolean}
 */
function isTextFile(extension) {
  const textExtensions = [
    '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.h',
    '.css', '.scss', '.sass', '.less', '.html', '.xml', '.json', '.yaml', '.yml',
    '.md', '.txt', '.sh', '.bash', '.sql', '.graphql', '.vue', '.svelte',
  ];
  return textExtensions.includes(extension);
}

/**
 * Diffを分析
 * @param {string} diff - git diffの出力
 * @returns {Object}
 */
function analyzeDiff(diff) {
  const lines = diff.split('\n');
  let additions = 0;
  let deletions = 0;
  const addedLines = [];
  const deletedLines = [];

  lines.forEach((line) => {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      additions++;
      addedLines.push(line.substring(1));
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions++;
      deletedLines.push(line.substring(1));
    }
  });

  return {
    additions,
    deletions,
    netChange: additions - deletions,
    addedLines,
    deletedLines,
  };
}

/**
 * 技術スタックを検出
 * @param {Array} changedFiles - 変更ファイル一覧
 * @param {Object} changes - 変更内容
 * @returns {Array}
 */
function detectTechStack(changedFiles, changes) {
  const techStack = new Set();

  // ファイル拡張子から検出
  changedFiles.forEach((file) => {
    const ext = file.extension;

    if (['.js', '.jsx'].includes(ext)) techStack.add('JavaScript');
    if (['.ts', '.tsx'].includes(ext)) techStack.add('TypeScript');
    if (ext === '.py') techStack.add('Python');
    if (ext === '.java') techStack.add('Java');
    if (ext === '.go') techStack.add('Go');
    if (ext === '.rs') techStack.add('Rust');
    if (['.c', '.cpp', '.h'].includes(ext)) techStack.add('C/C++');
    if (['.css', '.scss', '.sass'].includes(ext)) techStack.add('CSS');
    if (ext === '.html') techStack.add('HTML');
    if (ext === '.vue') techStack.add('Vue.js');
    if (ext === '.svelte') techStack.add('Svelte');
    if (ext === '.sql') techStack.add('SQL');
  });

  // パッケージファイルから検出
  changedFiles.forEach((file) => {
    if (file.filename === 'package.json') {
      techStack.add('Node.js');
      techStack.add('npm');
    }
    if (file.filename === 'Cargo.toml') techStack.add('Rust');
    if (file.filename === 'go.mod') techStack.add('Go');
    if (file.filename === 'requirements.txt' || file.filename === 'Pipfile') {
      techStack.add('Python');
    }
    if (file.filename === 'Dockerfile') techStack.add('Docker');
    if (file.filename.endsWith('.yaml') || file.filename.endsWith('.yml')) {
      if (file.path.includes('kubernetes') || file.path.includes('k8s')) {
        techStack.add('Kubernetes');
      }
    }
  });

  // コード内容から検出（React、Next.js等）
  changes.codeChanges.forEach((change) => {
    const content = change.addedLines.join('\n');

    if (content.includes('import React') || content.includes('from "react"')) {
      techStack.add('React');
    }
    if (content.includes('next/') || content.includes('from "next')) {
      techStack.add('Next.js');
    }
    if (content.includes('@aws-sdk/') || content.includes('aws-sdk')) {
      techStack.add('AWS SDK');
    }
    if (content.includes('prisma') || content.includes('@prisma/client')) {
      techStack.add('Prisma');
    }
    if (content.includes('express') || content.includes('fastify')) {
      techStack.add('Express/Fastify');
    }
  });

  return Array.from(techStack);
}

/**
 * 影響範囲を分析
 * @param {Object} changes - 変更内容
 * @returns {Object}
 */
function analyzeImpact(changes) {
  const totalChanges = changes.additions + changes.deletions;
  let impactLevel = 'small';

  if (totalChanges > 500) impactLevel = 'large';
  else if (totalChanges > 100) impactLevel = 'medium';

  const fileCount = changes.codeChanges.length;
  const affectedDirectories = new Set(
    changes.codeChanges.map((c) => path.dirname(c.file))
  );

  return {
    level: impactLevel,
    totalChanges,
    fileCount,
    directoryCount: affectedDirectories.size,
    additions: changes.additions,
    deletions: changes.deletions,
  };
}

/**
 * サマリーを生成
 * @param {Object} commitInfo - コミット情報
 * @param {Object} changes - 変更内容
 * @param {Array} techStack - 技術スタック
 * @param {Object} impact - 影響範囲
 * @returns {string}
 */
function generateSummary(commitInfo, changes, techStack, impact) {
  const lines = [];

  lines.push(`Commit: ${commitInfo.shortHash} - ${commitInfo.message}`);
  lines.push(`Author: ${commitInfo.author}`);
  lines.push(`Date: ${commitInfo.date}`);
  lines.push('');
  lines.push(`Impact Level: ${impact.level.toUpperCase()}`);
  lines.push(`Files Changed: ${impact.fileCount}`);
  lines.push(`Lines Added: +${impact.additions}`);
  lines.push(`Lines Deleted: -${impact.deletions}`);
  lines.push('');
  lines.push('Tech Stack:');
  techStack.forEach((tech) => lines.push(`  - ${tech}`));

  return lines.join('\n');
}

/**
 * 結果を保存
 * @param {Object} result - 分析結果
 * @param {string} outputPath - 出力パス
 */
function saveResult(result, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\n✓ Analysis saved to: ${outputPath}\n`);
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);
  const options = { commit: 'HEAD', baseBranch: null };

  args.forEach((arg) => {
    if (arg.startsWith('--commit=')) {
      options.commit = arg.split('=')[1];
    } else if (arg.startsWith('--base=')) {
      options.baseBranch = arg.split('=')[1];
    }
  });

  try {
    const result = analyzeCommit(options);

    console.log(result.summary);

    // 結果をJSONファイルとして保存
    const outputDir = path.join(__dirname, '..', 'reports');
    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `commit-analysis-${timestamp}.json`);
    saveResult(result, outputPath);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = { analyzeCommit, detectTechStack, analyzeImpact };
