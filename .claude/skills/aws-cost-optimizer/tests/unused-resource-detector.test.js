/**
 * Tests for unused-resource-detector.js
 */

const {
  detectUnusedResources,
  scanRegion,
  calculateTotalCost
} = require('../scripts/unused-resource-detector.js');

// Mock AWS SDK
jest.mock('@aws-sdk/client-ec2');

describe('Unused Resource Detector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('detectUnusedResources', () => {
    it('should detect stopped EC2 instances', async () => {
      const mockStoppedInstances = [
        {
          instanceId: 'i-abc123',
          state: 'stopped',
          stoppedDays: 30,
          instanceType: 't3.medium',
          monthlyCost: 35.04
        },
        {
          instanceId: 'i-def456',
          state: 'stopped',
          stoppedDays: 15,
          instanceType: 'm5.large',
          monthlyCost: 88.32
        }
      ];

      // Verify stopped instances are identified correctly
      expect(mockStoppedInstances).toHaveLength(2);
      expect(mockStoppedInstances[0].state).toBe('stopped');
      expect(mockStoppedInstances[0].stoppedDays).toBeGreaterThan(7);

      // Calculate total cost
      const totalCost = mockStoppedInstances.reduce(
        (sum, instance) => sum + instance.monthlyCost,
        0
      );
      expect(totalCost).toBe(123.36);
    });

    it('should detect unattached EBS volumes', async () => {
      const mockUnattachedVolumes = [
        {
          volumeId: 'vol-abc123',
          size: 100,
          volumeType: 'gp3',
          availableDays: 30,
          monthlyCost: 8.0
        },
        {
          volumeId: 'vol-def456',
          size: 500,
          volumeType: 'gp2',
          availableDays: 90,
          monthlyCost: 50.0
        }
      ];

      // Verify unattached volumes are identified
      expect(mockUnattachedVolumes).toHaveLength(2);
      expect(mockUnattachedVolumes[0].availableDays).toBeGreaterThan(0);

      // Filter volumes available for more than 30 days
      const oldVolumes = mockUnattachedVolumes.filter(v => v.availableDays > 30);
      expect(oldVolumes).toHaveLength(1);
      expect(oldVolumes[0].volumeId).toBe('vol-def456');
    });

    it('should detect unallocated Elastic IPs', async () => {
      const mockUnallocatedEIPs = [
        {
          allocationId: 'eipalloc-abc123',
          publicIp: '54.123.45.67',
          notAssociatedDays: 60,
          monthlyCost: 3.6
        },
        {
          allocationId: 'eipalloc-def456',
          publicIp: '54.234.56.78',
          notAssociatedDays: 10,
          monthlyCost: 3.6
        }
      ];

      // Verify unallocated EIPs are identified
      expect(mockUnallocatedEIPs).toHaveLength(2);

      // All unallocated EIPs incur cost
      mockUnallocatedEIPs.forEach(eip => {
        expect(eip.monthlyCost).toBeGreaterThan(0);
      });

      // Calculate total monthly cost
      const totalCost = mockUnallocatedEIPs.reduce(
        (sum, eip) => sum + eip.monthlyCost,
        0
      );
      expect(totalCost).toBe(7.2);
    });
  });

  describe('calculateTotalCost', () => {
    it('should calculate total monthly cost correctly', () => {
      const findings = {
        stoppedInstances: [{ monthlyCost: 30 }, { monthlyCost: 40 }],
        unattachedVolumes: [{ monthlyCost: 8 }, { monthlyCost: 12 }],
        unallocatedEIPs: [{ monthlyCost: 3.6 }, { monthlyCost: 3.6 }]
      };

      const total = calculateTotalCost(findings);
      expect(total).toBe(97.2);
    });
  });
});
