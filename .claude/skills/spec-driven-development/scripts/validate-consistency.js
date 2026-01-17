#!/usr/bin/env node

/**
 * Validate Consistency
 * requirements/design/tasksドキュメント間の整合性を検証
 */

const fs = require('fs');
const path = require('path');

/**
 * ドキュメントの整合性を検証
 * @param {Object} options - 検証オプション
 * @returns {Object} 検証結果
 */
function validateConsistency(options = {}) {
  const { docPath = '.tmp', verbose = false } = options;

  console.log('\n🔍 Validating document consistency...\n');

  const results = {
    requirements: null,
    design: null,
    tasks: null,
    consistency: {
      valid: true,
      errors: [],
      warnings: [],
    },
  };

  // ドキュメントを読み込む
  results.requirements = loadDocument(path.join(docPath, 'requirements.md'));
  results.design = loadDocument(path.join(docPath, 'design.md'));
  results.tasks = loadDocument(path.join(docPath, 'tasks.md'));

  if (!results.requirements || !results.design || !results.tasks) {
    results.consistency.valid = false;
    results.consistency.errors.push('One or more documents are missing');
    return results;
  }

  // 検証を実行
  validateComponentConsistency(results);
  validateRequirementsCoverage(results);
  validateTasksCoverage(results);
  validateNamingConsistency(results);
  validateDependencies(results);

  // 結果を表示
  displayResults(results, verbose);

  return results;
}

/**
 * ドキュメントを読み込む
 * @param {string} filepath - ファイルパス
 * @returns {Object|null} パース済みドキュメント
 */
function loadDocument(filepath) {
  if (!fs.existsSync(filepath)) {
    return null;
  }

  const content = fs.readFileSync(filepath, 'utf8');

  return {
    filepath,
    content,
    sections: extractSections(content),
    components: extractComponents(content),
    requirements: extractRequirements(content),
    tasks: extractTasks(content),
  };
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
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = line.substring(3).trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  });

  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return sections;
}

/**
 * コンポーネントを抽出
 * @param {string} content - ドキュメント内容
 * @returns {Array} コンポーネント名の配列
 */
function extractComponents(content) {
  const components = [];
  const lines = content.split('\n');

  lines.forEach((line) => {
    if (line.startsWith('### ') && !line.includes('備考') && !line.includes('詳細')) {
      const componentName = line.substring(4).trim();
      // コードブロック内の###は除外
      if (!componentName.startsWith('```')) {
        components.push(componentName);
      }
    }
  });

  return components;
}

/**
 * 要件を抽出
 * @param {string} content - ドキュメント内容
 * @returns {Array} 要件の配列
 */
function extractRequirements(content) {
  const requirements = [];
  const sections = extractSections(content);

  const functionalReqs = sections['機能要件'] || '';
  const nonFunctionalReqs = sections['非機能要件'] || '';

  const allReqs = functionalReqs + '\n' + nonFunctionalReqs;
  const lines = allReqs.split('\n');

  lines.forEach((line) => {
    if (line.trim().startsWith('-')) {
      requirements.push(line.trim().substring(1).trim());
    }
  });

  return requirements;
}

/**
 * タスクを抽出
 * @param {string} content - ドキュメント内容
 * @returns {Array} タスクの配列
 */
function extractTasks(content) {
  const tasks = [];
  const lines = content.split('\n');

  let inTaskSection = false;

  lines.forEach((line) => {
    if (line.startsWith('### Phase ') || line.startsWith('### ステップ')) {
      inTaskSection = true;
    } else if (line.startsWith('## ')) {
      inTaskSection = false;
    } else if (inTaskSection && (line.trim().startsWith('-') || line.trim().startsWith('*'))) {
      tasks.push(line.trim().substring(1).trim());
    }
  });

  return tasks;
}

/**
 * コンポーネントの整合性を検証
 * @param {Object} results - 検証結果オブジェクト
 */
function validateComponentConsistency(results) {
  const designComponents = results.design.components;
  const tasksComponents = results.tasks.components;

  // 設計書に記載されているコンポーネントがタスクにも存在するか
  designComponents.forEach((component) => {
    const foundInTasks = tasksComponents.some((taskComp) =>
      taskComp.includes(component) || component.includes(taskComp)
    );

    if (!foundInTasks) {
      results.consistency.warnings.push(
        `Component "${component}" is defined in design.md but not mentioned in tasks.md`
      );
    }
  });

  // タスクに記載されているコンポーネントが設計書にも存在するか
  tasksComponents.forEach((component) => {
    const foundInDesign = designComponents.some((designComp) =>
      designComp.includes(component) || component.includes(designComp)
    );

    if (!foundInDesign) {
      results.consistency.errors.push(
        `Component "${component}" is mentioned in tasks.md but not defined in design.md`
      );
      results.consistency.valid = false;
    }
  });
}

/**
 * 要件のカバレッジを検証
 * @param {Object} results - 検証結果オブジェクト
 */
function validateRequirementsCoverage(results) {
  const requirements = results.requirements.requirements;
  const designContent = results.design.content.toLowerCase();

  // 各要件が設計書でカバーされているか確認
  requirements.forEach((req) => {
    const keywords = extractKeywords(req);

    const isCovered = keywords.some((keyword) =>
      designContent.includes(keyword.toLowerCase())
    );

    if (!isCovered && keywords.length > 0) {
      results.consistency.warnings.push(
        `Requirement "${req.substring(0, 50)}..." may not be covered in design.md`
      );
    }
  });
}

/**
 * タスクのカバレッジを検証
 * @param {Object} results - 検証結果オブジェクト
 */
function validateTasksCoverage(results) {
  const designComponents = results.design.components;
  const tasks = results.tasks.tasks;

  // 各コンポーネントに対応するタスクが存在するか
  designComponents.forEach((component) => {
    const hasTasks = tasks.some((task) =>
      task.toLowerCase().includes(component.toLowerCase())
    );

    if (!hasTasks) {
      results.consistency.warnings.push(
        `Component "${component}" in design.md has no corresponding tasks in tasks.md`
      );
    }
  });
}

/**
 * 命名の整合性を検証
 * @param {Object} results - 検証結果オブジェクト
 */
function validateNamingConsistency(results) {
  const designComponents = results.design.components;
  const reqContent = results.requirements.content;
  const tasksContent = results.tasks.content;

  // コンポーネント名の表記揺れをチェック
  designComponents.forEach((component) => {
    // 英語表記と日本語表記の混在チェック
    const variations = findComponentVariations(component, reqContent + '\n' + tasksContent);

    if (variations.length > 1) {
      results.consistency.warnings.push(
        `Component "${component}" has naming variations: ${variations.join(', ')}`
      );
    }
  });
}

/**
 * コンポーネント名のバリエーションを検出
 * @param {string} component - コンポーネント名
 * @param {string} content - 検索対象コンテンツ
 * @returns {Array} バリエーションの配列
 */
function findComponentVariations(component, content) {
  const variations = new Set([component]);

  // 基本的なバリエーションパターン
  const patterns = [
    component,
    component.toLowerCase(),
    component.toUpperCase(),
    component.replace(/([A-Z])/g, ' $1').trim(), // CamelCase → space separated
    component.replace(/\s+/g, ''), // space → no space
  ];

  patterns.forEach((pattern) => {
    if (content.includes(pattern) && pattern !== component) {
      variations.add(pattern);
    }
  });

  return Array.from(variations);
}

/**
 * 依存関係を検証
 * @param {Object} results - 検証結果オブジェクト
 */
function validateDependencies(results) {
  const tasksContent = results.tasks.content;

  // 依存関係の循環参照をチェック
  const dependencies = extractDependencies(tasksContent);

  const cycles = findCycles(dependencies);

  cycles.forEach((cycle) => {
    results.consistency.errors.push(
      `Circular dependency detected: ${cycle.join(' → ')}`
    );
    results.consistency.valid = false;
  });
}

/**
 * 依存関係を抽出
 * @param {string} content - タスクドキュメント内容
 * @returns {Object} 依存関係グラフ
 */
function extractDependencies(content) {
  const dependencies = {};
  const lines = content.split('\n');

  let currentTask = null;

  lines.forEach((line) => {
    if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
      currentTask = line.trim().substring(1).trim();
      dependencies[currentTask] = [];
    } else if (currentTask && line.includes('依存:') || line.includes('前提:')) {
      // 依存関係を抽出
      const match = line.match(/[依存|前提]:\s*(.+)/);
      if (match) {
        const deps = match[1].split(/[、,]/).map((d) => d.trim());
        dependencies[currentTask].push(...deps);
      }
    }
  });

  return dependencies;
}

/**
 * 循環参照を検出
 * @param {Object} dependencies - 依存関係グラフ
 * @returns {Array} 循環参照のパス
 */
function findCycles(dependencies) {
  const cycles = [];
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(node, path) {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const deps = dependencies[node] || [];

    for (const dep of deps) {
      if (!visited.has(dep)) {
        dfs(dep, [...path]);
      } else if (recursionStack.has(dep)) {
        // 循環参照を検出
        const cycleStart = path.indexOf(dep);
        cycles.push([...path.slice(cycleStart), dep]);
      }
    }

    recursionStack.delete(node);
  }

  Object.keys(dependencies).forEach((node) => {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  });

  return cycles;
}

/**
 * キーワードを抽出
 * @param {string} text - テキスト
 * @returns {Array} キーワードの配列
 */
function extractKeywords(text) {
  // ストップワードを除いた単語を抽出
  const stopWords = new Set(['の', 'は', 'を', 'が', 'に', 'で', 'と', 'する', 'できる', 'ある']);

  const words = text
    .split(/[\s、。,.]/)
    .filter((word) => word.length > 1 && !stopWords.has(word));

  return words;
}

/**
 * 結果を表示
 * @param {Object} results - 検証結果
 * @param {boolean} verbose - 詳細表示
 */
function displayResults(results, verbose) {
  console.log('📊 Validation Results\n');

  if (results.consistency.valid) {
    console.log('✅ All documents are consistent!\n');
  } else {
    console.log('❌ Consistency issues detected\n');
  }

  // エラーを表示
  if (results.consistency.errors.length > 0) {
    console.log('🚨 Errors:');
    results.consistency.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    console.log('');
  }

  // 警告を表示
  if (results.consistency.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    results.consistency.warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`);
    });
    console.log('');
  }

  // サマリー
  console.log('Summary:');
  console.log(`  Errors: ${results.consistency.errors.length}`);
  console.log(`  Warnings: ${results.consistency.warnings.length}`);
  console.log('');

  if (verbose) {
    console.log('Component Analysis:');
    console.log(`  Requirements: ${results.requirements.requirements.length} items`);
    console.log(`  Design Components: ${results.design.components.length} components`);
    console.log(`  Tasks: ${results.tasks.tasks.length} tasks`);
    console.log('');
  }
}

/**
 * 結果を保存
 * @param {Object} results - 検証結果
 * @param {string} outputPath - 出力パス
 */
function saveResults(results, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`✓ Validation results saved to: ${outputPath}\n`);
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);
  const options = { docPath: '.tmp', verbose: false };

  args.forEach((arg) => {
    if (arg.startsWith('--path=')) {
      options.docPath = arg.split('=')[1];
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  });

  try {
    const results = validateConsistency(options);

    // 結果を保存
    const outputPath = path.join(options.docPath, 'validation-results.json');
    saveResults(results, outputPath);

    // エラーがある場合は終了コード1で終了
    if (!results.consistency.valid) {
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

module.exports = {
  validateConsistency,
  validateComponentConsistency,
  validateRequirementsCoverage,
  validateTasksCoverage,
};
