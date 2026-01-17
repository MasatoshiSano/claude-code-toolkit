#!/usr/bin/env node

/**
 * Report Generator
 * コスト分析と最適化レポートをMarkdown形式で生成
 */

const fs = require('fs');
const path = require('path');

/**
 * レポートを生成
 * @param {Object} costAnalysis - コスト分析結果
 * @param {Object} unusedResources - 未使用リソース検出結果
 * @param {Object} options - レポートオプション
 * @returns {string} Markdown形式のレポート
 */
function generateReport(costAnalysis, unusedResources, options = {}) {
  const { includeExecutiveSummary = true, includeRecommendations = true } = options;

  const sections = [];

  // ヘッダー
  sections.push('# AWS Cost Optimization Report');
  sections.push(`Generated: ${new Date().toISOString().split('T')[0]}`);
  sections.push('');

  // エグゼクティブサマリー
  if (includeExecutiveSummary) {
    sections.push('## Executive Summary');
    sections.push('');
    sections.push(`- **Current Monthly Cost**: $${costAnalysis.totalCost} ${costAnalysis.currency}`);
    sections.push(`- **Potential Monthly Savings**: $${unusedResources.totalMonthlyCost.toFixed(2)} (${calculateSavingsPercentage(costAnalysis.totalCost, unusedResources.totalMonthlyCost)}%)`);
    sections.push(`- **Estimated Annual Savings**: $${unusedResources.totalYearlyCost.toFixed(2)}`);
    sections.push('');
  }

  // コスト内訳
  sections.push('## Cost Breakdown');
  sections.push('');
  sections.push('### By Service (Top 10)');
  sections.push('');
  sections.push('| Rank | Service | Cost | Percentage |');
  sections.push('|------|---------|------|------------|');
  costAnalysis.serviceBreakdown.forEach((service, index) => {
    sections.push(`| ${index + 1} | ${service.service} | $${service.cost} | ${service.percentage}% |`);
  });
  sections.push('');

  // 未使用リソース
  sections.push('## Unused Resources');
  sections.push('');

  // 停止中のEC2インスタンス
  if (unusedResources.stoppedInstances.length > 0) {
    sections.push(`### Stopped EC2 Instances (${unusedResources.stoppedInstances.length})`);
    sections.push('');
    sections.push('| Instance ID | Type | Region | Stopped Days | Monthly Cost | Recommendation |');
    sections.push('|-------------|------|--------|--------------|--------------|----------------|');
    unusedResources.stoppedInstances.forEach((instance) => {
      const recommendation = instance.stoppedDays > 30 ? 'Terminate' : 'Review';
      sections.push(`| ${instance.id} | ${instance.type} | ${instance.region} | ${instance.stoppedDays} | $${instance.monthlyCost.toFixed(2)} | ${recommendation} |`);
    });
    sections.push('');
  }

  // アタッチされていないEBSボリューム
  if (unusedResources.unattachedVolumes.length > 0) {
    sections.push(`### Unattached EBS Volumes (${unusedResources.unattachedVolumes.length})`);
    sections.push('');
    sections.push('| Volume ID | Size | Type | Region | Available Days | Monthly Cost | Recommendation |');
    sections.push('|-----------|------|------|--------|----------------|--------------|----------------|');
    unusedResources.unattachedVolumes.forEach((volume) => {
      const recommendation = volume.availableDays > 30 ? 'Delete' : 'Snapshot & Delete';
      sections.push(`| ${volume.id} | ${volume.size}GB | ${volume.type} | ${volume.region} | ${volume.availableDays} | $${volume.monthlyCost.toFixed(2)} | ${recommendation} |`);
    });
    sections.push('');
  }

  // 割り当てられていないElastic IP
  if (unusedResources.unallocatedEIPs.length > 0) {
    sections.push(`### Unallocated Elastic IPs (${unusedResources.unallocatedEIPs.length})`);
    sections.push('');
    sections.push('| Allocation ID | Public IP | Region | Monthly Cost | Recommendation |');
    sections.push('|---------------|-----------|--------|--------------|----------------|');
    unusedResources.unallocatedEIPs.forEach((eip) => {
      sections.push(`| ${eip.id} | ${eip.publicIp} | ${eip.region} | $${eip.monthlyCost.toFixed(2)} | Release |`);
    });
    sections.push('');
  }

  // 最適化の推奨事項
  if (includeRecommendations) {
    sections.push('## Optimization Recommendations');
    sections.push('');

    const recommendations = generateRecommendations(unusedResources);

    if (recommendations.quickWins.length > 0) {
      sections.push('### Priority 1: Quick Wins');
      sections.push('');
      recommendations.quickWins.forEach((rec, index) => {
        sections.push(`${index + 1}. ${rec.description} - **$${rec.savings.toFixed(2)}/month**`);
      });
      sections.push('');
    }

    // 総削減額
    sections.push('## Total Savings Summary');
    sections.push('');
    sections.push(`- **Total Monthly Savings**: $${unusedResources.totalMonthlyCost.toFixed(2)}`);
    sections.push(`- **Total Annual Savings**: $${unusedResources.totalYearlyCost.toFixed(2)}`);
    sections.push('');
  }

  // 実装計画
  sections.push('## Implementation Plan');
  sections.push('');
  sections.push('### Week 1: Cleanup Unused Resources');
  sections.push(`- Expected savings: $${unusedResources.totalMonthlyCost.toFixed(2)}/month`);
  sections.push('- Tasks:');
  sections.push('  - Review and terminate stopped EC2 instances');
  sections.push('  - Delete or snapshot unattached EBS volumes');
  sections.push('  - Release unallocated Elastic IPs');
  sections.push('');

  // フッター
  sections.push('---');
  sections.push('*This report was generated by AWS Cost Optimizer Agent Skill*');
  sections.push('');

  return sections.join('\n');
}

/**
 * 削減率を計算
 * @param {string|number} totalCost - 総コスト
 * @param {number} savings - 削減額
 * @returns {string} 削減率（パーセンテージ）
 */
function calculateSavingsPercentage(totalCost, savings) {
  const cost = typeof totalCost === 'string' ? parseFloat(totalCost) : totalCost;
  if (cost === 0) return '0.0';
  return ((savings / cost) * 100).toFixed(1);
}

/**
 * 推奨事項を生成
 * @param {Object} unusedResources - 未使用リソース
 * @returns {Object} 推奨事項
 */
function generateRecommendations(unusedResources) {
  const quickWins = [];

  // EC2インスタンスの推奨
  if (unusedResources.stoppedInstances.length > 0) {
    const totalEC2Savings = unusedResources.stoppedInstances.reduce(
      (sum, instance) => sum + instance.monthlyCost,
      0
    );
    quickWins.push({
      description: `Terminate ${unusedResources.stoppedInstances.length} stopped EC2 instance(s)`,
      savings: totalEC2Savings,
    });
  }

  // EBSボリュームの推奨
  if (unusedResources.unattachedVolumes.length > 0) {
    const totalEBSSavings = unusedResources.unattachedVolumes.reduce(
      (sum, volume) => sum + volume.monthlyCost,
      0
    );
    quickWins.push({
      description: `Delete ${unusedResources.unattachedVolumes.length} unattached EBS volume(s)`,
      savings: totalEBSSavings,
    });
  }

  // Elastic IPの推奨
  if (unusedResources.unallocatedEIPs.length > 0) {
    const totalEIPSavings = unusedResources.unallocatedEIPs.reduce(
      (sum, eip) => sum + eip.monthlyCost,
      0
    );
    quickWins.push({
      description: `Release ${unusedResources.unallocatedEIPs.length} unallocated Elastic IP(s)`,
      savings: totalEIPSavings,
    });
  }

  return { quickWins };
}

/**
 * レポートをファイルに保存
 * @param {string} report - Markdownレポート
 * @param {string} outputPath - 出力パス
 */
function saveReport(report, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, report);
  console.log(`\n✓ Report saved to: ${outputPath}\n`);
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);

  // レポートディレクトリから最新のデータを読み込む
  const reportsDir = path.join(__dirname, '..', 'reports');

  if (!fs.existsSync(reportsDir)) {
    console.error('❌ Error: No reports directory found');
    console.log('Run cost-analyzer.js and unused-resource-detector.js first');
    process.exit(1);
  }

  // 最新のコスト分析とリソース検出結果を読み込む
  const files = fs.readdirSync(reportsDir);
  const costAnalysisFile = files.find((f) => f.startsWith('cost-analysis-'));
  const unusedResourcesFile = files.find((f) => f.startsWith('unused-resources-'));

  if (!costAnalysisFile || !unusedResourcesFile) {
    console.error('❌ Error: Missing analysis data');
    console.log('Run cost-analyzer.js and unused-resource-detector.js first');
    process.exit(1);
  }

  const costAnalysis = JSON.parse(
    fs.readFileSync(path.join(reportsDir, costAnalysisFile), 'utf8')
  );
  const unusedResources = JSON.parse(
    fs.readFileSync(path.join(reportsDir, unusedResourcesFile), 'utf8')
  );

  // レポートを生成
  const report = generateReport(costAnalysis, unusedResources);

  // 出力パスを決定
  const timestamp = new Date().toISOString().split('T')[0];
  const outputPath = args[0] || path.join(reportsDir, `aws-cost-optimization-${timestamp}.md`);

  saveReport(report, outputPath);

  console.log('📊 Report Summary:');
  console.log(`   - Current Monthly Cost: $${costAnalysis.totalCost}`);
  console.log(`   - Potential Savings: $${unusedResources.totalMonthlyCost.toFixed(2)}/month`);
  console.log('');
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = { generateReport, generateRecommendations, saveReport };
