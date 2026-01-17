#!/usr/bin/env node

/**
 * Detect Blog Topics
 * コミット分析結果から技術ブログのテーマを自動抽出
 */

const fs = require('fs');
const path = require('path');

/**
 * ブログトピックを検出
 * @param {Object} commitAnalysis - analyze-commit.jsの出力
 * @param {Object} options - 検出オプション
 * @returns {Array} トピック候補
 */
function detectBlogTopics(commitAnalysis, options = {}) {
  const { minImpact = 'small', maxTopics = 5 } = options;

  console.log('\n🔍 Detecting blog topics...\n');

  const topics = [];

  // 1. 新機能の検出
  const newFeatures = detectNewFeatures(commitAnalysis);
  topics.push(...newFeatures);

  // 2. パフォーマンス改善の検出
  const performanceImprovements = detectPerformanceImprovements(commitAnalysis);
  topics.push(...performanceImprovements);

  // 3. リファクタリングの検出
  const refactorings = detectRefactorings(commitAnalysis);
  topics.push(...refactorings);

  // 4. バグ修正の検出
  const bugFixes = detectBugFixes(commitAnalysis);
  topics.push(...bugFixes);

  // 5. 技術スタック導入の検出
  const techStackChanges = detectTechStackChanges(commitAnalysis);
  topics.push(...techStackChanges);

  // 6. アーキテクチャ変更の検出
  const architectureChanges = detectArchitectureChanges(commitAnalysis);
  topics.push(...architectureChanges);

  // 優先度でソート
  topics.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // 最大トピック数に制限
  const filteredTopics = topics.slice(0, maxTopics);

  // 各トピックにメタデータを追加
  return filteredTopics.map((topic, index) => ({
    ...topic,
    id: `topic-${index + 1}`,
    commitHash: commitAnalysis.commitInfo.shortHash,
    detectedAt: new Date().toISOString(),
  }));
}

/**
 * 新機能を検出
 * @param {Object} commitAnalysis - コミット分析結果
 * @returns {Array}
 */
function detectNewFeatures(commitAnalysis) {
  const topics = [];
  const { commitInfo, changedFiles, techStack } = commitAnalysis;

  // コミットメッセージから判断
  if (commitInfo.message.toLowerCase().includes('feat:') ||
      commitInfo.message.toLowerCase().includes('feature:') ||
      commitInfo.message.toLowerCase().includes('add:')) {

    // 新しいコンポーネント/ファイルの追加
    const newFiles = changedFiles.filter((f) => f.status === 'added');

    if (newFiles.length > 0) {
      topics.push({
        type: 'new-feature',
        title: extractFeatureTitle(commitInfo.message),
        description: `新機能「${extractFeatureTitle(commitInfo.message)}」の実装`,
        priority: 'high',
        targetAudience: 'beginner',
        estimatedReadingTime: 10,
        techStack: techStack.slice(0, 3),
        keyFiles: newFiles.slice(0, 3).map((f) => f.path),
        suggestedSections: [
          '問題：なぜこの機能が必要だったのか',
          `解決策：${extractFeatureTitle(commitInfo.message)}とは`,
          '実装：ステップバイステップで解説',
          '使い方：実際の利用例',
          'まとめと今後の展望',
        ],
      });
    }
  }

  return topics;
}

/**
 * パフォーマンス改善を検出
 * @param {Object} commitAnalysis - コミット分析結果
 * @returns {Array}
 */
function detectPerformanceImprovements(commitAnalysis) {
  const topics = [];
  const { commitInfo, changes, techStack } = commitAnalysis;

  const perfKeywords = [
    'performance', 'optimize', 'speed', 'fast', 'cache', 'lazy',
    'パフォーマンス', '最適化', '高速化', 'キャッシュ',
  ];

  const message = commitInfo.message.toLowerCase();
  const hasPerfKeyword = perfKeywords.some((keyword) => message.includes(keyword));

  if (hasPerfKeyword || commitInfo.message.includes('perf:')) {
    topics.push({
      type: 'performance',
      title: `パフォーマンス改善：${extractOptimizationTarget(commitInfo.message)}`,
      description: `${extractOptimizationTarget(commitInfo.message)}の最適化手法`,
      priority: 'high',
      targetAudience: 'intermediate',
      estimatedReadingTime: 15,
      techStack,
      keyFiles: changes.codeChanges.slice(0, 3).map((c) => c.file),
      suggestedSections: [
        '問題：パフォーマンスボトルネックの発見',
          '分析：Before の状態',
        '解決策：最適化のアプローチ',
        '実装：具体的な改善コード',
        '結果：どれくらい改善されたか（数値で示す）',
        '注意点とベストプラクティス',
      ],
    });
  }

  return topics;
}

/**
 * リファクタリングを検出
 * @param {Object} commitAnalysis - コミット分析結果
 * @returns {Array}
 */
function detectRefactorings(commitAnalysis) {
  const topics = [];
  const { commitInfo, changes, impact } = commitAnalysis;

  if (commitInfo.message.toLowerCase().includes('refactor:') ||
      commitInfo.message.toLowerCase().includes('リファクタリング')) {

    // 中規模以上のリファクタリングのみ
    if (impact.level !== 'small') {
      topics.push({
        type: 'refactoring',
        title: `リファクタリング事例：${extractRefactoringTarget(commitInfo.message)}`,
        description: `コードの可読性と保守性を向上させるリファクタリング`,
        priority: 'medium',
        targetAudience: 'intermediate',
        estimatedReadingTime: 12,
        techStack: commitAnalysis.techStack,
        keyFiles: changes.codeChanges.slice(0, 3).map((c) => c.file),
        suggestedSections: [
          '問題：リファクタリング前のコードの課題',
          'Before: 改善前のコード',
          'After: 改善後のコード',
          '改善のポイント解説',
          '得られた効果（メトリクスで示す）',
          '適用できる他のケース',
        ],
      });
    }
  }

  return topics;
}

/**
 * バグ修正を検出
 * @param {Object} commitAnalysis - コミット分析結果
 * @returns {Array}
 */
function detectBugFixes(commitAnalysis) {
  const topics = [];
  const { commitInfo, changes } = commitAnalysis;

  if (commitInfo.message.toLowerCase().includes('fix:') ||
      commitInfo.message.toLowerCase().includes('bug:') ||
      commitInfo.message.toLowerCase().includes('修正')) {

    // 重要なバグ修正のみ（変更行数が一定以上）
    if (changes.additions + changes.deletions > 20) {
      topics.push({
        type: 'bug-fix',
        title: `バグ解決：${extractBugDescription(commitInfo.message)}`,
        description: `よくあるバグとその解決方法`,
        priority: 'medium',
        targetAudience: 'beginner',
        estimatedReadingTime: 8,
        techStack: commitAnalysis.techStack,
        keyFiles: changes.codeChanges.slice(0, 2).map((c) => c.file),
        suggestedSections: [
          '問題：発生していたバグ',
          '原因：なぜこのバグが発生したのか',
          '解決策：修正内容の詳細',
          '再発防止：同じミスを防ぐには',
          'まとめ',
        ],
      });
    }
  }

  return topics;
}

/**
 * 技術スタック変更を検出
 * @param {Object} commitAnalysis - コミット分析結果
 * @returns {Array}
 */
function detectTechStackChanges(commitAnalysis) {
  const topics = [];
  const { changedFiles, techStack } = commitAnalysis;

  // package.jsonの変更
  const packageJsonChanged = changedFiles.some(
    (f) => f.filename === 'package.json' && f.status === 'modified'
  );

  // 新しい技術スタックの導入
  const hasNewTech = techStack.length > 0;

  if (packageJsonChanged && hasNewTech) {
    techStack.forEach((tech) => {
      topics.push({
        type: 'tech-adoption',
        title: `${tech}導入ガイド：初心者でもわかる使い方`,
        description: `${tech}を実際のプロジェクトに導入する方法`,
        priority: 'high',
        targetAudience: 'beginner',
        estimatedReadingTime: 20,
        techStack: [tech],
        keyFiles: ['package.json'],
        suggestedSections: [
          `${tech}とは？`,
          'なぜこの技術を選んだのか',
          'インストールとセットアップ',
          '基本的な使い方',
          '実際のコード例',
          '注意点とトラブルシューティング',
          '次のステップ',
        ],
      });
    });
  }

  return topics;
}

/**
 * アーキテクチャ変更を検出
 * @param {Object} commitAnalysis - コミット分析結果
 * @returns {Array}
 */
function detectArchitectureChanges(commitAnalysis) {
  const topics = [];
  const { impact, changedFiles, commitInfo } = commitAnalysis;

  // 大規模変更
  if (impact.level === 'large' && impact.directoryCount > 3) {
    const archKeywords = [
      'architecture', 'restructure', 'migrate', 'アーキテクチャ', '構造', '移行',
    ];

    const message = commitInfo.message.toLowerCase();
    const hasArchKeyword = archKeywords.some((keyword) => message.includes(keyword));

    if (hasArchKeyword) {
      topics.push({
        type: 'architecture',
        title: `アーキテクチャ刷新：${extractArchitectureChange(commitInfo.message)}`,
        description: `システムアーキテクチャの改善と移行`,
        priority: 'high',
        targetAudience: 'advanced',
        estimatedReadingTime: 25,
        techStack: commitAnalysis.techStack,
        keyFiles: changedFiles.slice(0, 5).map((f) => f.path),
        suggestedSections: [
          '背景：なぜアーキテクチャを変更したのか',
          'Before: 以前のアーキテクチャ',
          'After: 新しいアーキテクチャ',
          '移行プロセス',
          '得られた効果（パフォーマンス、保守性等）',
          '学んだこと',
        ],
      });
    }
  }

  return topics;
}

/**
 * コミットメッセージから機能名を抽出
 * @param {string} message - コミットメッセージ
 * @returns {string}
 */
function extractFeatureTitle(message) {
  // "feat: XXX" または "add: XXX" から XXX を抽出
  const match = message.match(/(?:feat|feature|add):\s*(.+)/i);
  if (match) {
    return match[1].split('\n')[0].trim();
  }
  return message.split('\n')[0].trim();
}

/**
 * 最適化ターゲットを抽出
 * @param {string} message - コミットメッセージ
 * @returns {string}
 */
function extractOptimizationTarget(message) {
  const match = message.match(/(?:optimize|performance|perf):\s*(.+)/i);
  if (match) {
    return match[1].split('\n')[0].trim();
  }
  return 'パフォーマンス';
}

/**
 * リファクタリング対象を抽出
 * @param {string} message - コミットメッセージ
 * @returns {string}
 */
function extractRefactoringTarget(message) {
  const match = message.match(/refactor:\s*(.+)/i);
  if (match) {
    return match[1].split('\n')[0].trim();
  }
  return 'コード';
}

/**
 * バグの説明を抽出
 * @param {string} message - コミットメッセージ
 * @returns {string}
 */
function extractBugDescription(message) {
  const match = message.match(/(?:fix|bug):\s*(.+)/i);
  if (match) {
    return match[1].split('\n')[0].trim();
  }
  return message.split('\n')[0].trim();
}

/**
 * アーキテクチャ変更内容を抽出
 * @param {string} message - コミットメッセージ
 * @returns {string}
 */
function extractArchitectureChange(message) {
  return message.split('\n')[0].replace(/^(feat|refactor|chore):\s*/i, '').trim();
}

/**
 * トピックを対話的に選択
 * @param {Array} topics - トピック候補
 * @returns {Promise<Array>} 選択されたトピック
 */
async function selectTopicsInteractive(topics) {
  console.log('\n📚 Detected Blog Topics:\n');

  topics.forEach((topic, index) => {
    console.log(`${index + 1}. [${topic.priority.toUpperCase()}] ${topic.title}`);
    console.log(`   Type: ${topic.type}`);
    console.log(`   Target: ${topic.targetAudience}`);
    console.log(`   Est. Reading Time: ${topic.estimatedReadingTime} min`);
    console.log('');
  });

  // 実際の対話的選択は generate-article.js で実装
  return topics;
}

/**
 * 結果を保存
 * @param {Array} topics - トピック一覧
 * @param {string} outputPath - 出力パス
 */
function saveTopics(topics, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(topics, null, 2));
  console.log(`\n✓ Topics saved to: ${outputPath}\n`);
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: detect-blog-topics.js <analysis-file.json>');
    process.exit(1);
  }

  const analysisFile = args[0];

  try {
    // コミット分析結果を読み込む
    if (!fs.existsSync(analysisFile)) {
      throw new Error(`Analysis file not found: ${analysisFile}`);
    }

    const commitAnalysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));

    // トピックを検出
    const topics = detectBlogTopics(commitAnalysis);

    if (topics.length === 0) {
      console.log('⚠️  No blog-worthy topics detected in this commit.');
      process.exit(0);
    }

    // トピックを表示
    await selectTopicsInteractive(topics);

    // 結果を保存
    const outputDir = path.join(__dirname, '..', 'reports');
    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `blog-topics-${timestamp}.json`);
    saveTopics(topics, outputPath);

    console.log(`\n✅ Detected ${topics.length} blog topic(s)\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = { detectBlogTopics, selectTopicsInteractive };
