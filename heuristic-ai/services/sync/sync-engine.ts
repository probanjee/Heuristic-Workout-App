/**
 * File: services/sync/sync-engine.ts
 * Purpose: Orchestrates background data sync, retries with exponential backoff, and local DB updates.
 */

import { Q } from '@nozbe/watermelondb';
import { database, sessionsCollection, setsCollection, usersCollection } from '../../database';
import { supabase } from '@/lib/supabase';
import { auth } from '../auth/firebase';
import { queueManager } from './queue-manager';
import { uploadSession, downloadSessions } from './session-sync';
import { uploadSets, downloadSets } from './workout-set-sync';
import { uploadProfile, downloadProfile } from './profile-sync';
import { uploadMetrics, downloadMetrics } from './metrics-sync';
import { resolveConflict } from './conflict-resolver';
import { useUserStore } from '@/store/user.store';
import { useSyncStore } from '@/store/sync.store';
import { SyncQueueItem } from './types';
import { setLastSyncTime, incrementFailedSyncCount, resetFailedSyncCount } from './sync-state';

const BACKOFF_DELAYS = [5000, 15000, 45000, 120000, 300000]; // 5s, 15s, 45s, 2m, 5m

// Developer debug overrides
export const syncDevFlags = {
  mockFailure: false,
  mockOffline: false,
};

class SyncEngine {
  private isProcessing = false;

  /**
   * Scans WatermelonDB for unsynced local records and enqueues them.
   */
  public async enqueueUnsyncedData(): Promise<void> {
    try {
      await queueManager.initialize();
      const user = auth.currentUser;
      if (!user) return; // Must be logged in

      // 1. Unsynced Sessions
      const unsyncedSessions = await sessionsCollection
        .query(Q.where('synced', false))
        .fetch();
      
      for (const session of unsyncedSessions) {
        await queueManager.enqueue('session', session.id, 'update');
      }

      // 2. Unsynced Sets
      const unsyncedSets = await setsCollection
        .query(Q.where('synced', false))
        .fetch();

      for (const set of unsyncedSets) {
        await queueManager.enqueue('set', set.id, 'create');
      }

      // 3. Unsynced Profiles (e.g. local User model has no syncedAt or is outdated)
      const users = await usersCollection.query().fetch();
      const localUser = users[0];
      if (localUser && !localUser.syncedAt) {
        await queueManager.enqueue('profile', localUser.id, 'update');
      }

      const syncStore = useSyncStore.getState();
      syncStore.setPendingCount(await queueManager.getQueueLength());
    } catch (e) {
      console.error('[SyncEngine] Failed to enqueue unsynced local data:', e);
    }
  }

  /**
   * Pulls profile, sessions, workout sets, and heuristic metrics from Supabase,
   * performs conflict resolution, and writes updates to WatermelonDB in a transaction.
   */
  public async pullData(): Promise<void> {
    try {
      const firebaseUid = auth.currentUser?.uid;
      if (!firebaseUid) return;

      // 1. Download all user data in parallel
      const [cloudProfiles, cloudSessions, cloudSets, cloudMetrics] = await Promise.all([
        downloadProfile(firebaseUid),
        downloadSessions(firebaseUid),
        downloadSets(firebaseUid),
        downloadMetrics(firebaseUid),
      ]);

      const cloudProfile = cloudProfiles[0];

      // Retrieve local user references
      const localUsers = await usersCollection.query().fetch();
      const localUser = localUsers[0];
      let localUserId = localUser?.id || 'default_user_id';

      // Load existing local sessions and sets to avoid N+1 queries during conflict resolution
      const localSessions = await sessionsCollection.query().fetch();
      const localSessionsMap = new Map(localSessions.map(s => [s.id, s]));

      const localSets = await setsCollection.query().fetch();
      const localSetsMap = new Map(localSets.map(s => [s.id, s]));

      await database.write(async () => {
        // A. Reconcile and Hydrate Profile
        if (cloudProfile) {
          if (localUser) {
            await localUser.update((record: any) => {
              record.displayName = cloudProfile.display_name || '';
              record.goal = cloudProfile.goal || 'hypertrophy';
              record.trainingLevel = cloudProfile.training_level || 'beginner';
              record._raw.equipment = typeof cloudProfile.equipment === 'string' ? cloudProfile.equipment : JSON.stringify(cloudProfile.equipment || []);
              record._raw.injury_flags = typeof cloudProfile.injuries === 'string' ? cloudProfile.injuries : JSON.stringify(cloudProfile.injuries || cloudProfile.injury_flags || []);
              record.syncedAt = new Date();
            });
          } else {
            const newUser = await usersCollection.create((record: any) => {
              record._raw.id = cloudProfile.id;
              record.firebaseUid = firebaseUid;
              record.displayName = cloudProfile.display_name || '';
              record.goal = cloudProfile.goal || 'hypertrophy';
              record.trainingLevel = cloudProfile.training_level || 'beginner';
              record._raw.equipment = typeof cloudProfile.equipment === 'string' ? cloudProfile.equipment : JSON.stringify(cloudProfile.equipment || []);
              record._raw.injury_flags = typeof cloudProfile.injuries === 'string' ? cloudProfile.injuries : JSON.stringify(cloudProfile.injuries || cloudProfile.injury_flags || []);
              record.syncedAt = new Date();
            });
            localUserId = newUser.id;
          }

          // Hydrate Zustand store preferences and attributes
          const userStore = useUserStore.getState();
          const parsedPrefs = typeof cloudProfile.preferences === 'string'
            ? JSON.parse(cloudProfile.preferences)
            : (cloudProfile.preferences || {});
          
          userStore.updatePreferences({
            unitSystem: cloudProfile.units || 'kg',
            defaultRestSeconds: parsedPrefs.defaultRestSeconds ?? 90,
            cameraDefaultOn: parsedPrefs.cameraDefaultOn ?? false,
            audioCuesEnabled: parsedPrefs.audioCuesEnabled ?? true,
            hapticsEnabled: parsedPrefs.hapticsEnabled ?? true,
            workoutRemindersEnabled: parsedPrefs.workoutRemindersEnabled ?? true,
            recoveryAlertsEnabled: parsedPrefs.recoveryAlertsEnabled ?? true,
          });

          userStore.setGoal(cloudProfile.goal || null);
          userStore.setTrainingLevel(cloudProfile.training_level || null);

          const equipmentArray = Array.isArray(cloudProfile.equipment)
            ? cloudProfile.equipment
            : (typeof cloudProfile.equipment === 'string' ? JSON.parse(cloudProfile.equipment) : []);
          userStore.setEquipment(equipmentArray);

          const injuryArray = Array.isArray(cloudProfile.injuries)
            ? cloudProfile.injuries
            : (Array.isArray(cloudProfile.injury_flags)
              ? cloudProfile.injury_flags
              : (typeof cloudProfile.injuries === 'string' ? JSON.parse(cloudProfile.injuries) : []));
          userStore.setInjuryFlags(injuryArray);

          userStore.completeOnboarding(false, {
            id: localUserId,
            firebaseUid: firebaseUid,
            displayName: cloudProfile.display_name || '',
            goal: cloudProfile.goal || 'hypertrophy',
            trainingLevel: cloudProfile.training_level || 'beginner',
            equipment: equipmentArray,
            injuryFlags: injuryArray,
            createdAt: localUser ? localUser.createdAt.getTime() : Date.now(),
            syncedAt: Date.now(),
          });
        }

        // B. Reconcile Sessions
        for (const session of cloudSessions) {
          const existingSession = localSessionsMap.get(session.id);
          if (existingSession) {
            const res = resolveConflict(existingSession, session);
            if (res === 'cloud_wins') {
              await existingSession.update((record: any) => {
                record.startedAt = new Date(session.started_at).getTime();
                record.endedAt = session.completed_at ? new Date(session.completed_at).getTime() : null;
                record.status = session.completed_at ? 'completed' : 'active';
                record.totalVolumeKg = session.volume ? Number(session.volume) : null;
                record.avgRpe = session.avg_rpe ? Number(session.avg_rpe) : null;
                record.synced = true;
              });
            }
          } else {
            await sessionsCollection.create((record: any) => {
              record._raw.id = session.id;
              record.userId = localUserId;
              record.startedAt = new Date(session.started_at).getTime();
              record.endedAt = session.completed_at ? new Date(session.completed_at).getTime() : null;
              record.status = session.completed_at ? 'completed' : 'active';
              record.totalVolumeKg = session.volume ? Number(session.volume) : null;
              record.avgRpe = session.avg_rpe ? Number(session.avg_rpe) : null;
              record.synced = true;
            });
          }
        }

        // C. Reconcile Workout Sets
        for (const set of cloudSets) {
          const existingSet = localSetsMap.get(set.id);
          if (existingSet) {
            const res = resolveConflict(existingSet, set);
            if (res === 'cloud_wins') {
              await existingSet.update((record: any) => {
                record.completedReps = set.reps;
                record.actualWeightKg = set.weight;
                record.rpe = set.rpe ? Number(set.rpe) : null;
                record.completedAt = new Date(set.created_at).getTime();
                record.synced = true;
              });
            }
          } else {
            await setsCollection.create((record: any) => {
              record._raw.id = set.id;
              record.sessionId = set.session_id;
              record.exerciseId = set.exercise_id;
              record.setNumber = 1; // Corrected in secondary pass
              record.targetReps = set.reps;
              record.completedReps = set.reps;
              record.targetWeightKg = set.weight;
              record.actualWeightKg = set.weight;
              record.rpe = set.rpe ? Number(set.rpe) : null;
              record.rpeEstimated = set.rpe === null;
              record.completedAt = new Date(set.created_at).getTime();
              record.synced = true;
            });
          }
        }
      });

      // D. Secondary pass to assign proper set numbers grouped by session and exercise
      // Extract to outside database.write to avoid cross-collection reads inside active write transaction
      const updatedLocalSets = await setsCollection.query().fetch();
      const groups: Record<string, any[]> = {};
      for (const s of updatedLocalSets) {
        const key = `${s.sessionId}_${s.exerciseId}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(s);
      }

      const setsToUpdate: { set: any; newSetNumber: number }[] = [];
      for (const key of Object.keys(groups)) {
        const groupSets = groups[key];
        groupSets.sort((a, b) => a.completedAt - b.completedAt);
        for (let i = 0; i < groupSets.length; i++) {
          const s = groupSets[i];
          if (s.setNumber !== i + 1) {
            setsToUpdate.push({ set: s, newSetNumber: i + 1 });
          }
        }
      }

      if (setsToUpdate.length > 0) {
        await database.write(async () => {
          for (const item of setsToUpdate) {
            await item.set.update((record: any) => {
              record.setNumber = item.newSetNumber;
            });
          }
        });
      }
    } catch (e) {
      console.error('[SyncEngine] Failed during pullData delta synchronization:', e);
    }
  }

  /**
   * Processes the sync queue sequentially if online.
   */
  public async processQueue(): Promise<void> {
    await queueManager.initialize();
    const syncStore = useSyncStore.getState();
    
    if (!syncStore.isOnline || syncDevFlags.mockOffline) {
      syncStore.setStatus('Offline');
      return;
    }

    if (this.isProcessing) return;
    this.isProcessing = true;
    syncStore.setSyncing();

    try {
      // Pull before push strategy: fetch latest cloud updates and resolve conflicts
      await this.pullData();

      // Refresh the queue from local DB first
      await this.enqueueUnsyncedData();
      const items = await queueManager.getItems();

      if (items.length === 0) {
        syncStore.setSynced(Date.now());
        await setLastSyncTime(Date.now());
        await resetFailedSyncCount();
        this.isProcessing = false;
        return;
      }

      for (const item of items) {
        // Check if item is in exponential backoff
        if (item.retryCount > 0) {
          const delay = BACKOFF_DELAYS[item.retryCount - 1] || 300000;
          const timeSinceCreated = Date.now() - new Date(item.createdAt).getTime();
          if (timeSinceCreated < delay) {
            // Skip this item for now
            continue;
          }
        }

        let success = false;
        let errorMessage = '';

        try {
          if (syncDevFlags.mockFailure) {
            throw new Error('[MOCK_FAILURE] Sync operation failed by developer override');
          }

          if (item.entityType === 'session') {
            const localSession = await sessionsCollection.find(item.entityId);
            if (localSession) {
              const res = await uploadSession(localSession);
              if (res.success) {
                // Also upload metrics associated with this session completion
                await uploadMetrics(localSession);

                await database.write(async () => {
                  await localSession.update((s: any) => {
                    s.synced = true;
                  });
                });
                success = true;
              } else {
                errorMessage = res.error || 'Session sync failed';
              }
            } else {
              // Local session deleted/not found, remove from queue
              success = true;
            }
          } else if (item.entityType === 'set') {
            const localSet = await setsCollection.find(item.entityId);
            if (localSet) {
              const res = await uploadSets([localSet]);
              if (res.success) {
                await database.write(async () => {
                  await localSet.update((s: any) => {
                    s.synced = true;
                  });
                });
                success = true;
              } else {
                errorMessage = res.error || 'Workout set sync failed';
              }
            } else {
              success = true;
            }
          } else if (item.entityType === 'profile') {
            const users = await usersCollection.query().fetch();
            const localUser = users[0];
            if (localUser && localUser.id === item.entityId) {
              const res = await uploadProfile(localUser);
              if (res.success) {
                await database.write(async () => {
                  await localUser.update((u: any) => {
                    u.syncedAt = new Date();
                  });
                });
                success = true;
              } else {
                errorMessage = res.error || 'Profile sync failed';
              }
            } else {
              success = true;
            }
          }

          if (success) {
            await queueManager.removeItem(item.id);
          } else {
            throw new Error(errorMessage);
          }
        } catch (err: any) {
          const errMsg = err.message || 'Sync failed';
          console.warn(`[SyncEngine] Item ${item.id} failed to sync:`, errMsg);

          if (item.retryCount < 5) {
            item.retryCount++;
            item.createdAt = new Date().toISOString(); // Update timestamp for backoff delay
            await queueManager.updateItem(item);
          } else {
            // Max retries reached — dead letter protection
            console.error(`[SyncEngine] Item ${item.id} exceeded max retries. Logging to cloud.`);
            await this.logSyncError(item, `Exceeded max retries: ${errMsg}`);
            await queueManager.removeItem(item.id);
          }

          await incrementFailedSyncCount();
          syncStore.setSyncError(errMsg);
        }
      }

      // Check remaining queue length
      const remainingCount = await queueManager.getQueueLength();
      syncStore.setPendingCount(remainingCount);

      if (remainingCount === 0) {
        syncStore.setSynced(Date.now());
        await setLastSyncTime(Date.now());
        await resetFailedSyncCount();
      } else {
        syncStore.setStatus('Failed');
      }
    } catch (e: any) {
      console.error('[SyncEngine] Sync process failed:', e);
      syncStore.setSyncError(e.message || 'Queue execution failure');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Logs a failed sync event directly to Supabase for diagnostic auditing.
   */
  private async logSyncError(item: SyncQueueItem, errorMessage: string): Promise<void> {
    try {
      await supabase.from('sync_log').insert({
        firebase_uid: auth.currentUser?.uid || null,
        entity_type: item.entityType,
        entity_id: item.entityId,
        status: 'Failed',
        error_message: errorMessage,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('[SyncEngine] Failed to write to cloud sync_log:', e);
    }
  }

  /**
   * Returns current queue length.
   */
  public async getQueueLength(): Promise<number> {
    return await queueManager.getQueueLength();
  }
}

export const syncEngine = new SyncEngine();
