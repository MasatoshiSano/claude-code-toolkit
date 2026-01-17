#!/usr/bin/env node

/**
 * Unused Resource Detector
 * 未使用のAWSリソースを検出してコスト削減を提案
 */

const { EC2Client, DescribeInstancesCommand, DescribeVolumesCommand, DescribeAddressesCommand } = require('@aws-sdk/client-ec2');
const fs = require('fs');
const path = require('path');

/**
 * 未使用リソースを検出
 * @param {Object} options - 検出オプション
 * @param {string} options.region - AWSリージョン（デフォルト: 'us-east-1'）
 * @param {boolean} options.allRegions - すべてのリージョンをスキャン
 * @param {number} options.stoppedDaysThreshold - 停止インスタンスの閾値（日数）
 * @param {number} options.volumeAvailableDaysThreshold - 利用可能ボリュームの閾値（日数）
 * @returns {Promise<Object>} 検出結果
 */
async function detectUnusedResources(options = {}) {
  const {
    region = 'us-east-1',
    allRegions = false,
    stoppedDaysThreshold = 7,
    volumeAvailableDaysThreshold = 7,
  } = options;

  // 依存関係チェック
  try {
    require('@aws-sdk/client-ec2');
  } catch (error) {
    console.error('❌ Error: AWS SDK not found');
    console.log('Install: npm install @aws-sdk/client-ec2');
    process.exit(1);
  }

  const regions = allRegions ? await getAWSRegions() : [region];
  const findings = {
    stoppedInstances: [],
    unattachedVolumes: [],
    unallocatedEIPs: [],
    totalMonthlyCost: 0,
  };

  console.log(`\n🔍 Scanning for unused resources in ${regions.length} region(s)...\n`);

  for (const reg of regions) {
    try {
      const regionFindings = await scanRegion(reg, {
        stoppedDaysThreshold,
        volumeAvailableDaysThreshold,
      });

      findings.stoppedInstances.push(...regionFindings.stoppedInstances);
      findings.unattachedVolumes.push(...regionFindings.unattachedVolumes);
      findings.unallocatedEIPs.push(...regionFindings.unallocatedEIPs);
    } catch (error) {
      console.warn(`⚠️  Warning: Failed to scan region ${reg}: ${error.message}`);
    }
  }

  // 総コストを計算
  findings.totalMonthlyCost = calculateTotalCost(findings);
  findings.totalYearlyCost = findings.totalMonthlyCost * 12;

  return findings;
}

/**
 * 特定のリージョンをスキャン
 * @param {string} region - AWSリージョン
 * @param {Object} thresholds - 閾値設定
 * @returns {Promise<Object>} リージョン内の検出結果
 */
async function scanRegion(region, thresholds) {
  const client = new EC2Client({ region });

  const findings = {
    stoppedInstances: [],
    unattachedVolumes: [],
    unallocatedEIPs: [],
  };

  try {
    // 停止中のEC2インスタンスを検出
    const instancesCommand = new DescribeInstancesCommand({});
    const instancesResponse = await client.send(instancesCommand);

    (instancesResponse.Reservations || []).forEach((reservation) => {
      (reservation.Instances || []).forEach((instance) => {
        if (instance.State.Name === 'stopped') {
          const stoppedDays = calculateDaysSince(instance.StateTransitionReason);

          if (stoppedDays >= thresholds.stoppedDaysThreshold) {
            findings.stoppedInstances.push({
              id: instance.InstanceId,
              type: instance.InstanceType,
              region,
              stoppedDays,
              monthlyCost: estimateEC2Cost(instance.InstanceType),
            });
          }
        }
      });
    });

    // アタッチされていないEBSボリュームを検出
    const volumesCommand = new DescribeVolumesCommand({});
    const volumesResponse = await client.send(volumesCommand);

    (volumesResponse.Volumes || []).forEach((volume) => {
      if (volume.State === 'available') {
        const availableDays = calculateDaysSince(volume.CreateTime);

        if (availableDays >= thresholds.volumeAvailableDaysThreshold) {
          findings.unattachedVolumes.push({
            id: volume.VolumeId,
            size: volume.Size,
            type: volume.VolumeType,
            region,
            availableDays,
            monthlyCost: estimateEBSCost(volume.Size, volume.VolumeType),
          });
        }
      }
    });

    // 割り当てられていないElastic IPを検出
    const addressesCommand = new DescribeAddressesCommand({});
    const addressesResponse = await client.send(addressesCommand);

    (addressesResponse.Addresses || []).forEach((address) => {
      if (!address.AssociationId) {
        findings.unallocatedEIPs.push({
          id: address.AllocationId,
          publicIp: address.PublicIp,
          region,
          monthlyCost: 3.6, // 未割り当てEIPの月額コスト
        });
      }
    });
  } catch (error) {
    if (error.name === 'CredentialsProviderError') {
      console.error('❌ AWS credentials not configured');
      console.log('Run: aws configure');
      process.exit(1);
    } else {
      throw error;
    }
  }

  return findings;
}

/**
 * AWSリージョンリストを取得
 * @returns {Promise<string[]>} リージョンリスト
 */
async function getAWSRegions() {
  // 簡略化のため、主要なリージョンのみを返す
  return [
    'us-east-1',
    'us-west-2',
    'eu-west-1',
    'ap-northeast-1',
  ];
}

/**
 * 日数を計算
 * @param {string|Date} dateOrReason - 日付または状態変更理由
 * @returns {number} 経過日数
 */
function calculateDaysSince(dateOrReason) {
  let date;

  if (typeof dateOrReason === 'string') {
    // State transition reason から日付を抽出（簡略化）
    const match = dateOrReason.match(/\((\d{4}-\d{2}-\d{2})/);
    date = match ? new Date(match[1]) : new Date();
  } else {
    date = new Date(dateOrReason);
  }

  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * EC2インスタンスの月額コストを推定
 * @param {string} instanceType - インスタンスタイプ
 * @returns {number} 月額コスト（USD）
 */
function estimateEC2Cost(instanceType) {
  // 簡略化した価格表（実際はPricing APIを使用すべき）
  const pricing = {
    't2.micro': 8.35,
    't2.small': 16.79,
    't2.medium': 33.58,
    't3.micro': 7.59,
    't3.small': 15.18,
    't3.medium': 30.37,
    'm5.large': 70.08,
    'm5.xlarge': 140.16,
    'm5.2xlarge': 280.32,
  };

  return pricing[instanceType] || 50.0; // デフォルト値
}

/**
 * EBSボリュームの月額コストを推定
 * @param {number} size - サイズ（GB）
 * @param {string} volumeType - ボリュームタイプ
 * @returns {number} 月額コスト（USD）
 */
function estimateEBSCost(size, volumeType) {
  // GB単価（簡略化）
  const pricePerGB = {
    gp2: 0.10,
    gp3: 0.08,
    io1: 0.125,
    io2: 0.125,
    st1: 0.045,
    sc1: 0.025,
  };

  const unitPrice = pricePerGB[volumeType] || 0.10;
  return size * unitPrice;
}

/**
 * 総コストを計算
 * @param {Object} findings - 検出結果
 * @returns {number} 総月額コスト
 */
function calculateTotalCost(findings) {
  let total = 0;

  findings.stoppedInstances.forEach((instance) => {
    total += instance.monthlyCost;
  });

  findings.unattachedVolumes.forEach((volume) => {
    total += volume.monthlyCost;
  });

  findings.unallocatedEIPs.forEach((eip) => {
    total += eip.monthlyCost;
  });

  return total;
}

/**
 * 検出結果を表示
 * @param {Object} findings - 検出結果
 */
function displayFindings(findings) {
  console.log('\n📊 Unused Resources Report\n');

  // 停止中のEC2インスタンス
  if (findings.stoppedInstances.length > 0) {
    console.log(`❌ Stopped EC2 Instances (${findings.stoppedInstances.length})\n`);
    findings.stoppedInstances.forEach((instance, index) => {
      console.log(`${index + 1}. ${instance.id} (${instance.type})`);
      console.log(`   - Region: ${instance.region}`);
      console.log(`   - Stopped for: ${instance.stoppedDays} days`);
      console.log(`   - Monthly Cost: $${instance.monthlyCost.toFixed(2)}`);
      console.log(`   - Recommendation: ${instance.stoppedDays > 30 ? 'Terminate' : 'Review'}\n`);
    });
  }

  // アタッチされていないEBSボリューム
  if (findings.unattachedVolumes.length > 0) {
    console.log(`❌ Unattached EBS Volumes (${findings.unattachedVolumes.length})\n`);
    findings.unattachedVolumes.forEach((volume, index) => {
      console.log(`${index + 1}. ${volume.id} (${volume.size}GB ${volume.type})`);
      console.log(`   - Region: ${volume.region}`);
      console.log(`   - Available for: ${volume.availableDays} days`);
      console.log(`   - Monthly Cost: $${volume.monthlyCost.toFixed(2)}`);
      console.log(`   - Recommendation: ${volume.availableDays > 30 ? 'Delete' : 'Snapshot & Delete'}\n`);
    });
  }

  // 割り当てられていないElastic IP
  if (findings.unallocatedEIPs.length > 0) {
    console.log(`❌ Unallocated Elastic IPs (${findings.unallocatedEIPs.length})\n`);
    findings.unallocatedEIPs.forEach((eip, index) => {
      console.log(`${index + 1}. ${eip.id} (${eip.publicIp})`);
      console.log(`   - Region: ${eip.region}`);
      console.log(`   - Monthly Cost: $${eip.monthlyCost.toFixed(2)}`);
      console.log(`   - Recommendation: Release\n`);
    });
  }

  // 総コスト
  console.log('\n💰 Total Potential Savings:');
  console.log(`   - Monthly: $${findings.totalMonthlyCost.toFixed(2)}`);
  console.log(`   - Yearly: $${findings.totalYearlyCost.toFixed(2)}\n`);
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // CLI引数パース
  args.forEach((arg) => {
    if (arg === '--all-regions') {
      options.allRegions = true;
    } else if (arg.startsWith('--region=')) {
      options.region = arg.split('=')[1];
    } else if (arg.startsWith('--stopped-days=')) {
      options.stoppedDaysThreshold = parseInt(arg.split('=')[1], 10);
    }
  });

  try {
    const findings = await detectUnusedResources(options);
    displayFindings(findings);

    // 結果をJSONファイルとして保存
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(reportsDir, `unused-resources-${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(findings, null, 2));

    console.log(`✓ Report saved to: ${outputPath}\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = { detectUnusedResources, scanRegion, calculateTotalCost };
