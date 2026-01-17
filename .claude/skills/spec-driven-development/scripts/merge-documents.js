#!/usr/bin/env node

/**
 * Merge Documents
 * 既存のrequirements/design/tasksドキュメントと新しい内容を自動マージ
 */

const fs = require('fs');
const path = require('path');

/**
 * ドキュメントをマージ
 * @param {string} docType - ドキュメントタイプ（requirements/design/tasks）
 * @param {string} newContent - 新しい内容
 * @param {Object} options - マージオプション
 * @returns {string} マージ後の内容
 */
function mergeDocument(docType, newContent, options = {}) {
  const { docPath = '.tmp', force = false } = options;

  const filename = `${docType}.md`;
  const filepath = path.join(docPath, filename);

  console.log(`\n📄 Merging ${docType}.md...\n`);

  // 既存ドキュメントを読み込む
  const existingContent = readExistingDocument(filepath);

  if (!existingContent) {
    console.log(`No existing ${filename} found. Creating new document.`);
    return newContent;
  }

  // ドキュメントタイプに応じてマージ
  let mergedContent;
  switch (docType) {
    case 'requirements':
      mergedContent = mergeRequirements(existingContent, newContent);
      break;
    case 'design':
      mergedContent = mergeDesign(existingContent, newContent);
      break;
    case 'tasks':
      mergedContent = mergeTasks(existingContent, newContent);
      break;
    default:
      throw new Error(`Unknown document type: ${docType}`);
  }

  return mergedContent;
}

/**
 * 既存ドキュメントを読み込む
 * @param {string} filepath - ファイルパス
 * @returns {string|null} ファイル内容（存在しない場合はnull）
 */
function readExistingDocument(filepath) {
  if (!fs.existsSync(filepath)) {
    return null;
  }

  return fs.readFileSync(filepath, 'utf8');
}

/**
 * 要件定義ドキュメントをマージ
 * @param {string} existing - 既存内容
 * @param {string} newContent - 新しい内容
 * @returns {string} マージ後の内容
 */
function mergeRequirements(existing, newContent) {
  console.log('Merging requirements...');

  // セクションを抽出
  const existingSections = extractSections(existing);
  const newSections = extractSections(newContent);

  // 機能要件をマージ
  const mergedFunctional = mergeFunctionalRequirements(
    existingSections['機能要件'],
    newSections['機能要件']
  );

  // 非機能要件をマージ
  const mergedNonFunctional = mergeNonFunctionalRequirements(
    existingSections['非機能要件'],
    newSections['非機能要件']
  );

  // ヘッダーと改訂履歴を保持
  const header = extractHeader(existing);
  const revision = extractRevisionHistory(existing);

  // 新しいドキュメントを構築
  const merged = [
    header,
    '',
    '## 改訂履歴',
    '',
    revision,
    `- **${new Date().toISOString().split('T')[0]}**: 新機能追加によるマージ`,
    '',
    '## 機能要件',
    '',
    mergedFunctional,
    '',
    '## 非機能要件',
    '',
    mergedNonFunctional,
    '',
    existingSections['制約条件'] || '',
    existingSections['成功基準'] || '',
    existingSections['リスク'] || '',
  ].filter(Boolean).join('\n');

  return merged;
}

/**
 * 設計ドキュメントをマージ
 * @param {string} existing - 既存内容
 * @param {string} newContent - 新しい内容
 * @returns {string} マージ後の内容
 */
function mergeDesign(existing, newContent) {
  console.log('Merging design...');

  const existingSections = extractSections(existing);
  const newSections = extractSections(newContent);

  // コンポーネント一覧をマージ
  const mergedComponents = mergeComponents(
    existingSections['コンポーネント一覧'],
    newSections['コンポーネント一覧']
  );

  // データフローをマージ
  const mergedDataFlow = mergeDataFlow(
    existingSections['データフロー'],
    newSections['データフロー']
  );

  // ヘッダーと改訂履歴を保持
  const header = extractHeader(existing);
  const revision = extractRevisionHistory(existing);

  // 新しいドキュメントを構築
  const merged = [
    header,
    '',
    '## 改訂履歴',
    '',
    revision,
    `- **${new Date().toISOString().split('T')[0]}**: 新コンポーネント追加によるマージ`,
    '',
    '## アーキテクチャ概要',
    '',
    existingSections['アーキテクチャ概要'] || newSections['アーキテクチャ概要'] || '',
    '',
    '## コンポーネント一覧',
    '',
    mergedComponents,
    '',
    '## データフロー',
    '',
    mergedDataFlow,
    '',
    existingSections['API設計'] || newSections['API設計'] || '',
    existingSections['データベース設計'] || newSections['データベース設計'] || '',
    existingSections['エラーハンドリング'] || newSections['エラーハンドリング'] || '',
    existingSections['セキュリティ設計'] || newSections['セキュリティ設計'] || '',
  ].filter(Boolean).join('\n');

  return merged;
}

/**
 * タスクドキュメントをマージ
 * @param {string} existing - 既存内容
 * @param {string} newContent - 新しい内容
 * @returns {string} マージ後の内容
 */
function mergeTasks(existing, newContent) {
  console.log('Merging tasks...');

  const existingSections = extractSections(existing);
  const newSections = extractSections(newContent);

  // 進行中の機能セクションに新しいタスクを追加
  const mergedInProgress = mergeInProgressTasks(
    existingSections['🚧 進行中の機能'],
    newSections['Phase 1'] || newSections['🚧 進行中の機能']
  );

  // 完了した機能は保持
  const completedTasks = existingSections['✅ 完了した機能'] || '';

  // ヘッダーと改訂履歴を保持
  const header = extractHeader(existing);
  const revision = extractRevisionHistory(existing);

  // 新しいドキュメントを構築
  const merged = [
    header,
    '',
    '## 改訂履歴',
    '',
    revision,
    `- **${new Date().toISOString().split('T')[0]}**: 新タスク追加によるマージ`,
    '',
    '## 🚧 進行中の機能',
    '',
    mergedInProgress,
    '',
    '## ✅ 完了した機能',
    '',
    completedTasks,
    '',
    existingSections['時間見積もり'] || newSections['時間見積もり'] || '',
  ].filter(Boolean).join('\n');

  return merged;
}

/**
 * セクションを抽出
 * @param {string} content - ドキュメント内容
 * @returns {Object} セクション名をキーとしたコンテンツ
 */
function extractSections(content) {
  const sections = {};
  const lines = content.split('\n');

  let currentSection = null;
  let currentContent = [];

  lines.forEach((line) => {
    if (line.startsWith('## ')) {
      // 前のセクションを保存
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }

      // 新しいセクション開始
      currentSection = line.substring(3).trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  });

  // 最後のセクションを保存
  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return sections;
}

/**
 * ヘッダーを抽出
 * @param {string} content - ドキュメント内容
 * @returns {string} ヘッダー部分
 */
function extractHeader(content) {
  const lines = content.split('\n');
  const headerLines = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      break;
    }
    headerLines.push(line);
  }

  return headerLines.join('\n').trim();
}

/**
 * 改訂履歴を抽出
 * @param {string} content - ドキュメント内容
 * @returns {string} 改訂履歴
 */
function extractRevisionHistory(content) {
  const sections = extractSections(content);
  return sections['改訂履歴'] || '';
}

/**
 * 機能要件をマージ
 * @param {string} existing - 既存の機能要件
 * @param {string} newReqs - 新しい機能要件
 * @returns {string} マージ後の機能要件
 */
function mergeFunctionalRequirements(existing, newReqs) {
  if (!existing) return newReqs;
  if (!newReqs) return existing;

  // 箇条書きを抽出
  const existingItems = extractBulletPoints(existing);
  const newItems = extractBulletPoints(newReqs);

  // 重複を除いてマージ
  const allItems = [...new Set([...existingItems, ...newItems])];

  return allItems.map((item) => `- ${item}`).join('\n');
}

/**
 * 非機能要件をマージ
 * @param {string} existing - 既存の非機能要件
 * @param {string} newReqs - 新しい非機能要件
 * @returns {string} マージ後の非機能要件
 */
function mergeNonFunctionalRequirements(existing, newReqs) {
  // 機能要件と同様の処理
  return mergeFunctionalRequirements(existing, newReqs);
}

/**
 * コンポーネントをマージ
 * @param {string} existing - 既存のコンポーネント
 * @param {string} newComponents - 新しいコンポーネント
 * @returns {string} マージ後のコンポーネント
 */
function mergeComponents(existing, newComponents) {
  if (!existing) return newComponents;
  if (!newComponents) return existing;

  // コンポーネント名を抽出（### で始まる行）
  const existingComps = extractComponentNames(existing);
  const newComps = extractComponentNames(newComponents);

  // 既存コンポーネントを保持し、新しいコンポーネントを追加
  const existingSections = extractComponentSections(existing);
  const newSections = extractComponentSections(newComponents);

  const merged = [];

  // 既存コンポーネントを追加
  existingComps.forEach((name) => {
    if (existingSections[name]) {
      merged.push(existingSections[name]);
    }
  });

  // 新しいコンポーネントを追加（重複していない場合のみ）
  newComps.forEach((name) => {
    if (!existingComps.includes(name) && newSections[name]) {
      merged.push(newSections[name]);
    }
  });

  return merged.join('\n\n');
}

/**
 * データフローをマージ
 * @param {string} existing - 既存のデータフロー
 * @param {string} newFlow - 新しいデータフロー
 * @returns {string} マージ後のデータフロー
 */
function mergeDataFlow(existing, newFlow) {
  if (!existing) return newFlow;
  if (!newFlow) return existing;

  // 両方を連結
  return `${existing}\n\n### 新しいデータフロー\n\n${newFlow}`;
}

/**
 * 進行中のタスクをマージ
 * @param {string} existing - 既存のタスク
 * @param {string} newTasks - 新しいタスク
 * @returns {string} マージ後のタスク
 */
function mergeInProgressTasks(existing, newTasks) {
  if (!existing) return newTasks;
  if (!newTasks) return existing;

  return `${existing}\n\n### 新規追加タスク\n\n${newTasks}`;
}

/**
 * 箇条書きを抽出
 * @param {string} content - コンテンツ
 * @returns {Array} 箇条書き項目の配列
 */
function extractBulletPoints(content) {
  const lines = content.split('\n');
  return lines
    .filter((line) => line.trim().startsWith('-'))
    .map((line) => line.trim().substring(1).trim());
}

/**
 * コンポーネント名を抽出
 * @param {string} content - コンテンツ
 * @returns {Array} コンポーネント名の配列
 */
function extractComponentNames(content) {
  const lines = content.split('\n');
  return lines
    .filter((line) => line.startsWith('### '))
    .map((line) => line.substring(4).trim());
}

/**
 * コンポーネントセクションを抽出
 * @param {string} content - コンテンツ
 * @returns {Object} コンポーネント名をキーとしたセクション内容
 */
function extractComponentSections(content) {
  const sections = {};
  const lines = content.split('\n');

  let currentComponent = null;
  let currentContent = [];

  lines.forEach((line) => {
    if (line.startsWith('### ')) {
      // 前のコンポーネントを保存
      if (currentComponent) {
        sections[currentComponent] = currentContent.join('\n').trim();
      }

      // 新しいコンポーネント開始
      currentComponent = line.substring(4).trim();
      currentContent = [line];
    } else if (currentComponent) {
      currentContent.push(line);
    }
  });

  // 最後のコンポーネントを保存
  if (currentComponent) {
    sections[currentComponent] = currentContent.join('\n').trim();
  }

  return sections;
}

/**
 * マージ結果を保存
 * @param {string} docType - ドキュメントタイプ
 * @param {string} content - 内容
 * @param {Object} options - 保存オプション
 */
function saveDocument(docType, content, options = {}) {
  const { docPath = '.tmp' } = options;

  const filename = `${docType}.md`;
  const filepath = path.join(docPath, filename);

  // ディレクトリが存在しない場合は作成
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`✅ Merged document saved to: ${filepath}\n`);
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: merge-documents.js <doc-type> <new-content-file>');
    console.error('  doc-type: requirements, design, or tasks');
    process.exit(1);
  }

  const docType = args[0];
  const newContentFile = args[1];

  try {
    // 新しい内容を読み込む
    if (!fs.existsSync(newContentFile)) {
      throw new Error(`New content file not found: ${newContentFile}`);
    }

    const newContent = fs.readFileSync(newContentFile, 'utf8');

    // マージを実行
    const merged = mergeDocument(docType, newContent);

    // 保存
    saveDocument(docType, merged);

    console.log('✅ Document merge completed successfully\n');
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
  mergeDocument,
  mergeRequirements,
  mergeDesign,
  mergeTasks,
};
