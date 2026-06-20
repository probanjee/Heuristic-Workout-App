/**
 * HeuristicAI — Monitoring Service Tests
 * Tests logging, metrics tracking, limits, and local persistence of the MonitoringService.
 */

import { monitoringService } from '../monitoring-service';
import { testStorage } from '../../storage/storage-adapter';

describe('MonitoringService', () => {
  beforeEach(async () => {
    // Clear testStorage
    for (const key of Object.keys(testStorage)) {
      delete testStorage[key];
    }
    jest.clearAllMocks();
    // Clear all metrics in the service to ensure test isolation
    await monitoringService.clearAllMetrics();
  });

  it('should initialize with default empty values', async () => {
    const stats = await monitoringService.getHealthStats();
    const crashes = await monitoringService.getCrashLogs();
    const syncs = await monitoringService.getSyncMetrics();

    expect(stats.totalErrors).toBe(0);
    expect(stats.syncAttempts).toBe(0);
    expect(stats.syncSuccesses).toBe(0);
    expect(stats.authAttempts).toBe(0);
    expect(stats.authSuccesses).toBe(0);
    expect(crashes).toEqual([]);
    expect(syncs).toEqual([]);
  });

  it('should log crashes and increment totalErrors', async () => {
    const error = new Error('Simulated Crash');
    await monitoringService.logCrash(error, 'ComponentStackDetails');

    const crashes = await monitoringService.getCrashLogs();
    const stats = await monitoringService.getHealthStats();

    expect(crashes.length).toBe(1);
    expect(crashes[0].message).toBe('Simulated Crash');
    expect(crashes[0].info).toBe('ComponentStackDetails');
    expect(crashes[0].stack).toBeDefined();
    expect(stats.totalErrors).toBe(1);
  });

  it('should limit crash logs to 20 items', async () => {
    for (let i = 0; i < 25; i++) {
      await monitoringService.logCrash(new Error(`Crash #${i}`));
    }

    const crashes = await monitoringService.getCrashLogs();
    expect(crashes.length).toBe(20);
    // The most recent crash should be first (index 0)
    expect(crashes[0].message).toBe('Crash #24');
    expect(crashes[19].message).toBe('Crash #5');
  });

  it('should log sync metrics correctly', async () => {
    await monitoringService.logSyncMetric(true, 150);
    await monitoringService.logSyncMetric(false, 300, 'Network timeout');

    const syncs = await monitoringService.getSyncMetrics();
    const stats = await monitoringService.getHealthStats();

    expect(syncs.length).toBe(2);
    expect(syncs[0].success).toBe(false);
    expect(syncs[0].durationMs).toBe(300);
    expect(syncs[0].errorMessage).toBe('Network timeout');

    expect(syncs[1].success).toBe(true);
    expect(syncs[1].durationMs).toBe(150);

    expect(stats.syncAttempts).toBe(2);
    expect(stats.syncSuccesses).toBe(1);
    expect(stats.totalErrors).toBe(1); // The failed sync adds to totalErrors
  });

  it('should limit sync metrics to 50 items', async () => {
    for (let i = 0; i < 60; i++) {
      await monitoringService.logSyncMetric(true, 10 + i);
    }

    const syncs = await monitoringService.getSyncMetrics();
    expect(syncs.length).toBe(50);
    expect(syncs[0].durationMs).toBe(69); // 10 + 59
  });

  it('should log auth events correctly', async () => {
    await monitoringService.logAuthEvent(true);
    await monitoringService.logAuthEvent(false);

    const stats = await monitoringService.getHealthStats();
    expect(stats.authAttempts).toBe(2);
    expect(stats.authSuccesses).toBe(1);
  });

  it('should update heartbeat timestamp', async () => {
    const originalStats = await monitoringService.getHealthStats();
    
    // Wait slightly to ensure timestamp would tick
    await new Promise((r) => setTimeout(r, 10));
    await monitoringService.recordHeartbeat();
    
    const newStats = await monitoringService.getHealthStats();
    expect(new Date(newStats.lastHeartbeat).getTime()).toBeGreaterThanOrEqual(
      new Date(originalStats.lastHeartbeat).getTime()
    );
  });

  it('should clear crash logs', async () => {
    await monitoringService.logCrash(new Error('Persistent error'));
    let crashes = await monitoringService.getCrashLogs();
    expect(crashes.length).toBe(1);

    await monitoringService.clearCrashLogs();
    crashes = await monitoringService.getCrashLogs();
    expect(crashes.length).toBe(0);
  });
});
