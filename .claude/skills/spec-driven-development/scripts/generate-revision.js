#!/usr/bin/env node

/**
 * Generate Revision
 * ドキュメントの改訂履歴を自動追加
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 改訂履歴を生成して追加
 * @param {string} filepath - ドキュメントパス
 * @param {Object} options - オプション
 * @returns {string} 更新後のドキュメント
 */
function generateRevision(filepath, options = {}) {
  const {
    description = null,
    autoDetect = true,
    author = null,
  } = options;

  console.log(`\n📝 Generating revision for ${path.basename(filepath)}...\n`);

  // ドキュメントを読み込む
  if (!fs.existsSync(filepath)) {
    throw new Error(`Document not found: ${filepath}`);
  }

  const content = fs.readFileSync(filepath, 'utf8');

  // 改訂情報を生成
  const revision = createRevision(filepath, description, autoDetect, author);

  // 改訂履歴セクションを更新
  const updatedContent = addRevisionToDocument(content, revision);

  return updatedContent;
}

/**
 * 改訂情報を作成
 * @param {string} filepath - ファイルパス
 * @param {string|null} description - 改訂内容説明
 * @param {boolean} autoDetect - 自動検出を有効にするか
 * @param {string|null} author - 著者名
 * @returns {Object} 改訂情報
 */
function createRevision(filepath, description, autoDetect, author) {
  const date = new Date().toISOString().split('T')[0];

  // 自動検出が有効な場合、Gitから変更内容を取得
  let detectedChanges = null;
  if (autoDetect) {
    detectedChanges = detectChanges(filepath);
  }

  // 説明文を生成
  const desc = description || detectedChanges || '内容更新';

  // 著者名を取得
  const authorName = author || getGitAuthor() || 'System';

  return {
    date,
    description: desc,
    author: authorName,
    filepath: path.basename(filepath),
  };
}

/**
 * Gitから変更内容を検出
 * @param {string} filepath - ファイルパス
 * @returns {string|null} 変更内容の説明
 */
function detectChanges(filepath) {
  try {
    // Gitリポジトリかチェック
    if (!isGitRepository()) {
      return null;
    }

    // ファイルが追跡されているかチェック
    const isTracked = checkIfTracked(filepath);

    if (!isTracked) {
      return '新規作成';
    }

    // 前回のコミットとの差分を取得
    const diff = execSync(`git diff HEAD -- "${filepath}"`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    }).trim();

    if (!diff) {
      // 変更がない場合はコミット履歴から最新のメッセージを取得
      try {
        const lastCommitMessage = execSync(
          `git log -1 --pretty=%s -- "${filepath}"`,
          { encoding: 'utf8' }
        ).trim();

        if (lastCommitMessage) {
          return `前回更新: ${lastCommitMessage}`;
        }
      } catch {
        // エラーは無視
      }

      return '変更検出なし';
    }

    // 差分を分析
    const changes = analyzeDiff(diff);

    return changes.description;
  } catch (error) {
    return null;
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
 * ファイルがGitで追跡されているかチェック
 * @param {string} filepath - ファイルパス
 * @returns {boolean}
 */
function checkIfTracked(filepath) {
  try {
    execSync(`git ls-files --error-unmatch "${filepath}"`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 差分を分析
 * @param {string} diff - git diffの出力
 * @returns {Object} 分析結果
 */
function analyzeDiff(diff) {
  const lines = diff.split('\n');

  let additions = 0;
  let deletions = 0;
  const addedSections = [];
  const deletedSections = [];

  let currentSection = null;

  lines.forEach((line) => {
    if (line.startsWith('@@')) {
      // セクションヘッダー
      currentSection = line;
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      additions++;

      // セクション追加を検出
      if (line.includes('## ') || line.includes('### ')) {
        addedSections.push(line.substring(1).trim());
      }
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions++;

      // セクション削除を検出
      if (line.includes('## ') || line.includes('### ')) {
        deletedSections.push(line.substring(1).trim());
      }
    }
  });

  // 変更の種類を判定
  let description = '';

  if (addedSections.length > 0) {
    description = `セクション追加: ${addedSections.join(', ')}`;
  } else if (deletedSections.length > 0) {
    description = `セクション削除: ${deletedSections.join(', ')}`;
  } else if (additions > deletions * 2) {
    description = `大幅な追加 (+${additions}行)`;
  } else if (deletions > additions * 2) {
    description = `大幅な削除 (-${deletions}行)`;
  } else {
    description = `内容更新 (+${additions}/-${deletions}行)`;
  }

  return {
    additions,
    deletions,
    addedSections,
    deletedSections,
    description,
  };
}

/**
 * Git著者名を取得
 * @returns {string|null} 著者名
 */
function getGitAuthor() {
  try {
    const author = execSync('git config user.name', { encoding: 'utf8' }).trim();
    return author || null;
  } catch {
    return null;
  }
}

/**
 * ドキュメントに改訂履歴を追加
 * @param {string} content - ドキュメント内容
 * @param {Object} revision - 改訂情報
 * @returns {string} 更新後のドキュメント
 */
function addRevisionToDocument(content, revision) {
  const lines = content.split('\n');

  // 改訂履歴セクションを探す
  let revisionSectionIndex = -1;
  let revisionContentStart = -1;
  let nextSectionIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '## 改訂履歴') {
      revisionSectionIndex = i;
      revisionContentStart = i + 1;

      // 次のセクションを探す
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith('## ')) {
          nextSectionIndex = j;
          break;
        }
      }
      break;
    }
  }

  // 改訂履歴の新しいエントリ
  const newEntry = `- **${revision.date}**: ${revision.description}`;

  if (revisionSectionIndex === -1) {
    // 改訂履歴セクションが存在しない場合、作成する
    const headerEndIndex = findHeaderEnd(lines);

    const newSection = [
      '',
      '## 改訂履歴',
      '',
      newEntry,
      '',
    ];

    lines.splice(headerEndIndex + 1, 0, ...newSection);
  } else {
    // 既存の改訂履歴セクションに追加
    // 空行をスキップ
    let insertIndex = revisionContentStart;
    while (insertIndex < lines.length && lines[insertIndex].trim() === '') {
      insertIndex++;
    }

    lines.splice(insertIndex, 0, newEntry);
  }

  return lines.join('\n');
}

/**
 * ドキュメントヘッダーの終わりを見つける
 * @param {Array} lines - ドキュメントの行配列
 * @returns {number} ヘッダーの終わりのインデックス
 */
function findHeaderEnd(lines) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) {
      return i - 1;
    }
  }

  // セクションが見つからない場合、最初の空行の後
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      return i;
    }
  }

  return 0;
}

/**
 * 改訂履歴を保存
 * @param {string} filepath - ファイルパス
 * @param {string} content - 更新後の内容
 */
function saveRevision(filepath, content) {
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`✅ Revision added to: ${filepath}\n`);
}

/**
 * 複数のドキュメントに改訂履歴を追加
 * @param {Array} filepaths - ファイルパスの配列
 * @param {Object} options - オプション
 */
function generateRevisionsForAll(filepaths, options = {}) {
  console.log(`\n📚 Generating revisions for ${filepaths.length} document(s)...\n`);

  const results = [];

  filepaths.forEach((filepath) => {
    try {
      const updatedContent = generateRevision(filepath, options);
      saveRevision(filepath, updatedContent);

      results.push({
        filepath,
        success: true,
      });
    } catch (error) {
      console.error(`❌ Error processing ${filepath}: ${error.message}`);

      results.push({
        filepath,
        success: false,
        error: error.message,
      });
    }
  });

  // サマリー
  const successful = results.filter((r) => r.success).length;
  console.log(`\n✅ Revisions added: ${successful}/${filepaths.length}\n`);

  return results;
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: generate-revision.js <file1> [file2] [file3] [...] [--description="..."]');
    console.error('');
    console.error('Examples:');
    console.error('  generate-revision.js .tmp/requirements.md');
    console.error('  generate-revision.js .tmp/*.md');
    console.error('  generate-revision.js .tmp/design.md --description="コンポーネント追加"');
    process.exit(1);
  }

  const options = {
    autoDetect: true,
    description: null,
    author: null,
  };

  const filepaths = [];

  args.forEach((arg) => {
    if (arg.startsWith('--description=')) {
      options.description = arg.split('=')[1].replace(/^["']|["']$/g, '');
    } else if (arg.startsWith('--author=')) {
      options.author = arg.split('=')[1].replace(/^["']|["']$/g, '');
    } else if (arg === '--no-auto-detect') {
      options.autoDetect = false;
    } else {
      filepaths.push(arg);
    }
  });

  if (filepaths.length === 0) {
    console.error('❌ No files specified');
    process.exit(1);
  }

  try {
    // Glob展開（簡易版）
    const expandedPaths = [];
    filepaths.forEach((filepath) => {
      if (filepath.includes('*')) {
        // ワイルドカードを展開
        const dir = path.dirname(filepath);
        const pattern = path.basename(filepath);

        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');

          files.forEach((file) => {
            if (regex.test(file)) {
              expandedPaths.push(path.join(dir, file));
            }
          });
        }
      } else {
        expandedPaths.push(filepath);
      }
    });

    if (expandedPaths.length === 0) {
      console.error('❌ No matching files found');
      process.exit(1);
    }

    // 改訂履歴を生成
    generateRevisionsForAll(expandedPaths, options);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = {
  generateRevision,
  generateRevisionsForAll,
  createRevision,
  detectChanges,
};
