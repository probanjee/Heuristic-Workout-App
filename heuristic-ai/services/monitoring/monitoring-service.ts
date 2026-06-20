/**
 * HeuristicAI — App Monitoring Service
 * Tracks application health check metrics, sync statistics, auth actions, and logs crashes.
 * Source of truth: TASK.md § 9, APP_FLOW.md
 */

import { storageAdapter } from '../storage/storage-adapter';

const CRASH_LOGS_KEY = 'heuristic_crash_logs';
const SYNC_METRICS_KEY = 'heuristic_sync_metrics';
const HEALTH_STATS_KEY = 'heuristic_health_stats';

export interface CrashLog {
  timestamp: string;
  message: string;
  stack?: string;
  info?: string;
}

export interface SyncMetric {
  timestamp: string;
  success: boolean;
  durationMs: number;
  errorMessage?: string;
}

export interface HealthStats {
  appLaunchTime: string;
  lastHeartbeat: string;
  totalErrors: number;
  syncAttempts: number;
  syncSuccesses: number;
  authAttempts: number;
  authSuccesses: number;
}

class MonitoringService {
  private crashLogs: CrashLog[] = [];
  private syncMetrics: SyncMetric[] = [];
  private stats: HealthStats = {
    appLaunchTime: new Date().toISOString(),
    lastHeartbeat: new Date().toISOString(),
    totalErrors: 0,
    syncAttempts: 0,
    syncSuccesses: 0,
    authAttempts: 0,
    authSuccesses: 0,
  };
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const rawCrashes = await storageAdapter.getItem(CRASH_LOGS_KEY);
      if (rawCrashes) this.crashLogs = JSON.parse(rawCrashes);

      const rawSync = await storageAdapter.getItem(SYNC_METRICS_KEY);
      if (rawSync) this.syncMetrics = JSON.parse(rawSync);

      const rawStats = await storageAdapter.getItem(HEALTH_STATS_KEY);
      if (rawStats) {
        this.stats = { ...this.stats, ...JSON.parse(rawStats) };
      }
      this.isInitialized = true;
    } catch (e) {
      console.error('[MonitoringService] Failed to load local stats:', e);
    }
  }

  private async persist(key: string, data: any) {
    try {
      await storageAdapter.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`[MonitoringService] Failed to persist ${key}:`, e);
    }
  }

  public async logCrash(error: Error, errorInfo?: string): Promise<void> {
    if (!this.isInitialized) await this.init();

    const log: CrashLog = {
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      stack: error.stack,
      info: errorInfo,
    };

    this.crashLogs.unshift(log);
    // Keep last 20 crash logs only
    if (this.crashLogs.length > 20) {
      this.crashLogs = this.crashLogs.slice(0, 20);
    }

    this.stats.totalErrors++;
    this.stats.lastHeartbeat = new Date().toISOString();

    await this.persist(CRASH_LOGS_KEY, this.crashLogs);
    await this.persist(HEALTH_STATS_KEY, this.stats);
  }

  public async logSyncMetric(success: boolean, durationMs: number, errorMessage?: string): Promise<void> {
    if (!this.isInitialized) await this.init();

    const metric: SyncMetric = {
      timestamp: new Date().toISOString(),
      success,
      durationMs,
      errorMessage,
    };

    this.syncMetrics.unshift(metric);
    if (this.syncMetrics.length > 50) {
      this.syncMetrics = this.syncMetrics.slice(0, 50);
    }

    this.stats.syncAttempts++;
    if (success) {
      this.stats.syncSuccesses++;
    } else {
      this.stats.totalErrors++;
    }
    this.stats.lastHeartbeat = new Date().toISOString();

    await this.persist(SYNC_METRICS_KEY, this.syncMetrics);
    await this.persist(HEALTH_STATS_KEY, this.stats);
  }

  public async logAuthEvent(success: boolean): Promise<void> {
    if (!this.isInitialized) await this.init();

    this.stats.authAttempts++;
    if (success) {
      this.stats.authSuccesses++;
    }
    this.stats.lastHeartbeat = new Date().toISOString();
    await this.persist(HEALTH_STATS_KEY, this.stats);
  }

  public async recordHeartbeat(): Promise<void> {
    if (!this.isInitialized) await this.init();
    this.stats.lastHeartbeat = new Date().toISOString();
    await this.persist(HEALTH_STATS_KEY, this.stats);
  }

  public async getCrashLogs(): Promise<CrashLog[]> {
    if (!this.isInitialized) await this.init();
    return [...this.crashLogs];
  }

  public async getSyncMetrics(): Promise<SyncMetric[]> {
    if (!this.isInitialized) await this.init();
    return [...this.syncMetrics];
  }

  public async getHealthStats(): Promise<HealthStats> {
    if (!this.isInitialized) await this.init();
    return { ...this.stats };
  }

  public async clearCrashLogs(): Promise<void> {
    this.crashLogs = [];
    await this.persist(CRASH_LOGS_KEY, this.crashLogs);
  }

  public async clearAllMetrics(): Promise<void> {
    this.crashLogs = [];
    this.syncMetrics = [];
    this.stats = {
      appLaunchTime: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
      totalErrors: 0,
      syncAttempts: 0,
      syncSuccesses: 0,
      authAttempts: 0,
      authSuccesses: 0,
    };
    await this.persist(CRASH_LOGS_KEY, this.crashLogs);
    await this.persist(SYNC_METRICS_KEY, this.syncMetrics);
    await this.persist(HEALTH_STATS_KEY, this.stats);
  }
}

export const monitoringService = new MonitoringService();
