/**
 * File: services/sync/queue-manager.ts
 * Purpose: Manages persistent sync queue, retry tracking, and duplicate prevention.
 */

import { storageAdapter } from '../storage/storage-adapter';
import { SyncQueueItem } from './types';

const QUEUE_STORAGE_KEY = 'heuristic_sync_queue';

class QueueManager {
  private queue: SyncQueueItem[] = [];
  private isLoaded: boolean = false;
  private loadPromise: Promise<SyncQueueItem[]> | null = null;

  constructor() {
    this.initialize().catch(e => console.error('[QueueManager] Async init failed:', e));
  }

  public async initialize(force = false): Promise<void> {
    if (force) {
      this.loadPromise = null;
      this.isLoaded = false;
    }
    if (this.loadPromise) {
      await this.loadPromise;
      return;
    }
    this.loadPromise = this.loadQueue();
    await this.loadPromise;
  }

  public async loadQueue(): Promise<SyncQueueItem[]> {
    try {
      const raw = await storageAdapter.getItem(QUEUE_STORAGE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      } else {
        this.queue = [];
      }
      this.isLoaded = true;
    } catch (e) {
      console.error('[QueueManager] Failed to load queue:', e);
      this.queue = [];
    }
    return this.queue;
  }

  public async persistQueue(): Promise<void> {
    try {
      await storageAdapter.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error('[QueueManager] Failed to persist queue:', e);
    }
  }

  public async getItems(): Promise<SyncQueueItem[]> {
    await this.initialize();
    return [...this.queue];
  }

  public async getQueueLength(): Promise<number> {
    await this.initialize();
    return this.queue.length;
  }

  public async enqueue(entityType: string, entityId: string, operation: 'create' | 'update' | 'delete'): Promise<void> {
    await this.initialize();

    // Check for existing queue item for same entity
    const existingIndex = this.queue.findIndex(
      item => item.entityType === entityType && item.entityId === entityId
    );

    if (existingIndex > -1) {
      const existing = this.queue[existingIndex];
      
      // Merge operations
      if (existing.operation === 'create' && operation === 'delete') {
        // Created and then deleted before sync -> remove from queue completely
        this.queue.splice(existingIndex, 1);
      } else if (existing.operation === 'update' && operation === 'delete') {
        // Updated and then deleted -> operations merge to delete
        existing.operation = 'delete';
        existing.createdAt = new Date().toISOString();
        existing.retryCount = 0;
      } else {
        // Otherwise, keep the older operation (e.g. create remains create, update remains update)
        // Just update timestamp and reset retry count because there's a new change
        existing.createdAt = new Date().toISOString();
        existing.retryCount = 0;
      }
    } else {
      // Create new queue item
      const newItem: SyncQueueItem = {
        id: `${entityType}_${entityId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        entityType,
        entityId,
        operation,
        createdAt: new Date().toISOString(),
        retryCount: 0
      };
      this.queue.push(newItem);
    }

    await this.persistQueue();
  }

  public async removeItem(id: string): Promise<void> {
    await this.initialize();
    this.queue = this.queue.filter(item => item.id !== id);
    await this.persistQueue();
  }

  public async updateItem(updatedItem: SyncQueueItem): Promise<void> {
    await this.initialize();
    const idx = this.queue.findIndex(item => item.id === updatedItem.id);
    if (idx > -1) {
      this.queue[idx] = updatedItem;
      await this.persistQueue();
    }
  }

  public async clearQueue(): Promise<void> {
    this.queue = [];
    await this.persistQueue();
  }
}

export const queueManager = new QueueManager();
