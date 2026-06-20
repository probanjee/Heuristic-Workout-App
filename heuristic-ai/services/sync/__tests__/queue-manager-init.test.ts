/**
 * HeuristicAI — Unit Tests: QueueManager Initialization
 */

import { queueManager } from '../queue-manager';
import { storageAdapter, testStorage } from '../../storage/storage-adapter';

describe('QueueManager Initialization & Race Conditions', () => {
  beforeEach(async () => {
    // Clear mock storage
    for (const key of Object.keys(testStorage)) {
      delete testStorage[key];
    }
    await queueManager.clearQueue();
  });

  it('should initialize and load queue successfully', async () => {
    await storageAdapter.setItem('heuristic_sync_queue', JSON.stringify([
      { id: '1', entityType: 'session', entityId: 's1', operation: 'update', createdAt: new Date().toISOString(), retryCount: 0 }
    ]));

    await queueManager.initialize(true);
    const items = await queueManager.getItems();
    expect(items.length).toBe(1);
    expect(items[0].entityId).toBe('s1');
  });

  it('should wait for initialization on getQueueLength and getItems', async () => {
    await storageAdapter.setItem('heuristic_sync_queue', JSON.stringify([
      { id: '1', entityType: 'session', entityId: 's1', operation: 'update', createdAt: new Date().toISOString(), retryCount: 0 },
      { id: '2', entityType: 'set', entityId: 'set1', operation: 'create', createdAt: new Date().toISOString(), retryCount: 0 }
    ]));

    // Trigger initialization reset without awaiting, so it runs asynchronously
    queueManager.initialize(true);

    // Trigger getQueueLength directly without calling initialize first,
    // it should automatically await initialize and return the correct length.
    const length = await queueManager.getQueueLength();
    expect(length).toBe(2);

    const items = await queueManager.getItems();
    expect(items.length).toBe(2);
  });
});
