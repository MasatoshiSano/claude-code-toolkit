#!/usr/bin/env node

/**
 * Generate Article
 * ブログトピックからMarkdown記事を生成
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('@claude-skills/utils');

const logger = new Logger('technical-blog-generator:generate-article');

/**
 * 記事を生成
 * @param {Object} topic - ブログトピック
 * @param {Object} commitAnalysis - コミット分析結果
 * @param {Object} options - 生成オプション
 * @returns {string} 生成された記事（Markdown）
 */
function generateArticle(topic, commitAnalysis, options = {}) {
  const { outputDir = '_docs/blog', autoSave = true } = options;

  logger.info(`\n✍️  Generating article: ${topic.title}...\n`);

  // テンプレートを選択
  const template = loadTemplate(topic.targetAudience);

  // テンプレート変数を置換
  const article = populateTemplate(template, topic, commitAnalysis);

  if (autoSave) {
    const filename = generateFilename(topic);
    const filepath = path.join(outputDir, filename);

    saveArticle(article, filepath);
  }

  return article;
}

/**
 * テンプレートを読み込む
 * @param {string} audience - 対象読者（beginner/intermediate/advanced）
 * @returns {string} テンプレート内容
 */
function loadTemplate(audience) {
  const templateMap = {
    beginner: 'beginner-article.md',
    intermediate: 'intermediate-article.md',
    advanced: 'advanced-article.md'
  };

  const templateFile = templateMap[audience] || templateMap.beginner;
  const templatePath = path.join(__dirname, '..', 'templates', templateFile);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * テンプレート変数を置換
 * @param {string} template - テンプレート
 * @param {Object} topic - トピック
 * @param {Object} commitAnalysis - コミット分析結果
 * @returns {string} 置換後のMarkdown
 */
function populateTemplate(template, topic, commitAnalysis) {
  const variables = {
    '{{TITLE}}': topic.title,
    '{{DESCRIPTION}}': topic.description,
    '{{DATE}}': new Date().toISOString().split('T')[0],
    '{{READING_TIME}}': `${topic.estimatedReadingTime}分`,
    '{{TECH_STACK}}': topic.techStack.join(', '),
    '{{COMMIT_HASH}}': commitAnalysis.commitInfo.shortHash,
    '{{COMMIT_MESSAGE}}': commitAnalysis.commitInfo.message,
    '{{FILES_CHANGED}}': commitAnalysis.impact.fileCount,
    '{{LINES_ADDED}}': commitAnalysis.impact.additions,
    '{{LINES_DELETED}}': commitAnalysis.impact.deletions,
    '{{KEY_FILES}}': generateKeyFilesList(topic.keyFiles),
    '{{CODE_EXAMPLES}}': generateCodeExamples(topic, commitAnalysis),
    '{{BEFORE_AFTER}}': generateBeforeAfter(topic, commitAnalysis),
    '{{RESULTS}}': generateResults(topic, commitAnalysis)
  };

  let article = template;

  // 変数を置換
  Object.entries(variables).forEach(([placeholder, value]) => {
    article = article.replace(new RegExp(placeholder, 'g'), value);
  });

  return article;
}

/**
 * キーファイルリストを生成
 * @param {Array} keyFiles - ファイルパス一覧
 * @returns {string} Markdownリスト
 */
function generateKeyFilesList(keyFiles) {
  if (!keyFiles || keyFiles.length === 0) {
    return '（ファイル情報なし）';
  }

  return keyFiles.map((file) => `- \`${file}\``).join('\n');
}

/**
 * コード例を生成
 * @param {Object} topic - トピック
 * @param {Object} commitAnalysis - コミット分析結果
 * @returns {string} コードブロック
 */
function generateCodeExamples(topic, commitAnalysis) {
  const { changes } = commitAnalysis;

  if (!changes.codeChanges || changes.codeChanges.length === 0) {
    return '```\n// コード例を追加してください\n```';
  }

  // 最も変更が大きいファイルを取得
  const mainChange = changes.codeChanges.reduce((prev, curr) =>
    prev.additions + prev.deletions > curr.additions + curr.deletions ? prev : curr
  );

  const ext = path.extname(mainChange.file).substring(1) || 'javascript';
  const addedCode = mainChange.addedLines.slice(0, 15).join('\n');

  return `\`\`\`${ext}\n${addedCode}\n\`\`\``;
}

/**
 * Before/Afterコード比較を生成
 * @param {Object} topic - トピック
 * @param {Object} commitAnalysis - コミット分析結果
 * @returns {string} Before/After比較
 */
function generateBeforeAfter(topic, commitAnalysis) {
  const { changes } = commitAnalysis;

  if (!changes.codeChanges || changes.codeChanges.length === 0) {
    return '（Before/After コード例を追加してください）';
  }

  const mainChange = changes.codeChanges[0];
  const ext = path.extname(mainChange.file).substring(1) || 'javascript';

  const beforeCode = mainChange.deletedLines.slice(0, 10).join('\n');
  const afterCode = mainChange.addedLines.slice(0, 10).join('\n');

  return `
### Before（改善前）

\`\`\`${ext}
${beforeCode || '// 削除されたコード'}
\`\`\`

### After（改善後）

\`\`\`${ext}
${afterCode || '// 追加されたコード'}
\`\`\`
`;
}

/**
 * 改善結果を生成
 * @param {Object} topic - トピック
 * @param {Object} commitAnalysis - コミット分析結果
 * @returns {string} 結果のまとめ
 */
function generateResults(topic, commitAnalysis) {
  const { impact } = commitAnalysis;

  const lines = [];

  lines.push('### 数値で見る改善効果');
  lines.push('');
  lines.push('| 項目 | 値 |');
  lines.push('|------|------|');
  lines.push(`| 変更ファイル数 | ${impact.fileCount}ファイル |`);
  lines.push(`| 追加行数 | +${impact.additions}行 |`);
  lines.push(`| 削除行数 | -${impact.deletions}行 |`);
  lines.push(`| 影響範囲 | ${impact.directoryCount}ディレクトリ |`);

  // トピックタイプに応じた追加メトリクス
  if (topic.type === 'performance') {
    lines.push('| パフォーマンス改善 | （計測結果を記載） |');
    lines.push('| 実行時間短縮 | （Before/Afterを記載） |');
  } else if (topic.type === 'refactoring') {
    lines.push('| コード品質向上 | （ESLintスコア等を記載） |');
    lines.push('| 複雑度削減 | （Cyclomatic Complexity等を記載） |');
  }

  lines.push('');
  lines.push('> 📊 **注意**: 上記の数値は自動抽出されたものです。実際のベンチマーク結果で置き換えてください。');

  return lines.join('\n');
}

/**
 * ファイル名を生成
 * @param {Object} topic - トピック
 * @returns {string} ファイル名
 */
function generateFilename(topic) {
  const date = new Date().toISOString().split('T')[0];
  const slug = topic.title
    .toLowerCase()
    .replace(/[：:]/g, '-')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  return `${date}-${slug}.md`;
}

/**
 * 記事を保存
 * @param {string} article - 記事内容
 * @param {string} filepath - 保存先パス
 */
function saveArticle(article, filepath) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, article, 'utf8');
  logger.info(`✅ Article saved to: ${filepath}\n`);
}

/**
 * 複数トピックから記事を一括生成
 * @param {Array} topics - トピック一覧
 * @param {Object} commitAnalysis - コミット分析結果
 * @param {Object} options - 生成オプション
 * @returns {Array} 生成された記事パス一覧
 */
function generateMultipleArticles(topics, commitAnalysis, options = {}) {
  logger.info(`\n📚 Generating ${topics.length} article(s)...\n`);

  const generatedFiles = [];

  topics.forEach((topic, index) => {
    logger.info(`[${index + 1}/${topics.length}] ${topic.title}`);

    try {
      const _article = generateArticle(topic, commitAnalysis, options);

      if (options.autoSave) {
        const filename = generateFilename(topic);
        const filepath = path.join(options.outputDir || '_docs/blog', filename);
        generatedFiles.push(filepath);
      }
    } catch (error) {
      logger.error(`  ❌ Error: ${error.message}`);
    }
  });

  logger.info(`\n✅ Generated ${generatedFiles.length} article(s)\n`);

  return generatedFiles;
}

/**
 * 対話的な記事生成
 * @param {Array} topics - トピック一覧
 * @param {Object} commitAnalysis - コミット分析結果
 * @returns {Promise<Array>} 生成された記事パス一覧
 */
async function generateArticlesInteractive(topics, commitAnalysis) {
  logger.info('\n🤖 Interactive Article Generation\n');
  logger.info('Select topics to generate articles:\n');

  topics.forEach((topic, index) => {
    logger.info(`${index + 1}. [${topic.priority}] ${topic.title}`);
    logger.info(`   ${topic.description}`);
    logger.info('');
  });

  // 実際の対話的選択は Claude Code の AskUserQuestion で実装される
  // ここでは全トピックを生成
  return generateMultipleArticles(topics, commitAnalysis, {
    outputDir: '_docs/blog',
    autoSave: true
  });
}

/**
 * サマリーを生成
 * @param {Array} generatedFiles - 生成されたファイルパス一覧
 */
function generateSummary(generatedFiles) {
  logger.info('\n📋 Summary\n');
  logger.info(`Generated ${generatedFiles.length} article(s):\n`);

  generatedFiles.forEach((file, index) => {
    logger.info(`${index + 1}. ${path.basename(file)}`);
  });

  logger.info('\n💡 Next Steps:');
  logger.info('1. Review and edit the generated articles');
  logger.info('2. Add screenshots, diagrams, or additional code examples');
  logger.info('3. Run benchmarks and add actual performance metrics');
  logger.info('4. Publish to your blog platform\n');
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    logger.error('Usage: generate-article.js <topics-file.json> <analysis-file.json>');
    process.exit(1);
  }

  const topicsFile = args[0];
  const analysisFile = args[1];

  try {
    // トピックとコミット分析を読み込む
    if (!fs.existsSync(topicsFile)) {
      throw new Error(`Topics file not found: ${topicsFile}`);
    }
    if (!fs.existsSync(analysisFile)) {
      throw new Error(`Analysis file not found: ${analysisFile}`);
    }

    const topics = JSON.parse(fs.readFileSync(topicsFile, 'utf8'));
    const commitAnalysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));

    if (topics.length === 0) {
      logger.info('⚠️  No topics to generate articles for.');
      process.exit(0);
    }

    // 記事を生成
    const generatedFiles = await generateArticlesInteractive(topics, commitAnalysis);

    // サマリーを表示
    generateSummary(generatedFiles);
  } catch (error) {
    logger.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = {
  generateArticle,
  generateMultipleArticles,
  generateArticlesInteractive
};
