/**
 * HeuristicAI — Data Export Service
 * Handles querying WatermelonDB collections and exporting session, set, and profile data in JSON and CSV formats.
 * Source of truth: TASK.md § 9, APP_FLOW.md
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { sessionsCollection, setsCollection, heuristicProfilesCollection } from '@/database';

export interface ExportData {
  sessions: any[];
  sets: any[];
  profiles: any[];
}

class ExportService {
  /**
   * Fetches all local user data from WatermelonDB collections.
   */
  public async fetchLocalData(): Promise<ExportData> {
    try {
      const sessions = await sessionsCollection.query().fetch();
      const sets = await setsCollection.query().fetch();
      const profiles = await heuristicProfilesCollection.query().fetch();

      return {
        sessions: sessions.map(s => ({
          id: s.id,
          startedAt: s.startedAt,
          status: s.status,
          totalVolumeKg: s.totalVolumeKg,
          avgRpe: s.avgRpe,
        })),
        sets: sets.map(s => ({
          id: s.id,
          sessionId: s.sessionId,
          exerciseId: s.exerciseId,
          setNumber: s.setNumber,
          targetReps: s.targetReps,
          completedReps: s.completedReps,
          targetWeightKg: s.targetWeightKg,
          actualWeightKg: s.actualWeightKg,
          rpe: s.rpe,
          rpeEstimated: s.rpeEstimated,
          formScore: s.formScore,
          completedAt: s.completedAt,
        })),
        profiles: profiles.map(p => ({
          id: p.id,
          exerciseId: p.exerciseId,
          estimatedOneRmKg: p.estimatedOneRmKg,
          avgRpeLast5: p.avgRpeLast5,
          bestVolumeSession: p.bestVolumeSession,
          consecutiveHighRpe: p.consecutiveHighRpe,
        })),
      };
    } catch (e) {
      console.error('[ExportService] Failed to fetch local database records:', e);
      throw new Error('Database fetch failure during export');
    }
  }

  /**
   * Exports all workout data as a single JSON file.
   */
  public async exportAsJSON(): Promise<{ success: boolean; error?: string }> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        return { success: false, error: 'OS sharing is not available' };
      }

      const data = await this.fetchLocalData();
      const jsonStr = JSON.stringify(data, null, 2);
      
      const fileUri = `${FileSystem.cacheDirectory}heuristic_ai_export_${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(fileUri, jsonStr, { encoding: FileSystem.EncodingType.UTF8 });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Workout Logs (JSON)',
        UTI: 'public.json',
      });

      return { success: true };
    } catch (e: any) {
      console.error('[ExportService] JSON export failed:', e);
      return { success: false, error: e.message || 'JSON export failed' };
    }
  }

  /**
   * Exports workout sets as a flat CSV file.
   */
  public async exportAsCSV(): Promise<{ success: boolean; error?: string }> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        return { success: false, error: 'OS sharing is not available' };
      }

      const data = await this.fetchLocalData();
      
      // Build session map for fast lookup
      const sessionMap = new Map<string, any>();
      data.sessions.forEach(s => sessionMap.set(s.id, s));

      // Header row
      const headers = [
        'Set ID',
        'Session ID',
        'Session Date',
        'Exercise Name',
        'Set Number',
        'Completed Reps',
        'Weight (kg)',
        'RPE',
        'RPE Estimated',
        'Form Score',
        'Completed At'
      ];

      const csvRows = [headers.join(',')];

      data.sets.forEach(set => {
        const session = sessionMap.get(set.sessionId);
        const sessionDate = session ? new Date(session.startedAt).toLocaleDateString() : 'Unknown';
        
        const row = [
          `"${set.id}"`,
          `"${set.sessionId}"`,
          `"${sessionDate}"`,
          `"${set.exerciseId}"`,
          set.setNumber,
          set.completedReps,
          set.actualWeightKg,
          set.rpe !== null ? set.rpe : '',
          set.rpeEstimated ? 'TRUE' : 'FALSE',
          set.formScore !== null ? set.formScore : '',
          set.completedAt ? `"${new Date(set.completedAt).toISOString()}"` : ''
        ];
        
        csvRows.push(row.join(','));
      });

      const csvStr = csvRows.join('\n');
      const fileUri = `${FileSystem.cacheDirectory}heuristic_ai_export_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvStr, { encoding: FileSystem.EncodingType.UTF8 });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Workout Logs (CSV)',
        UTI: 'public.comma-separated-values-text',
      });

      return { success: true };
    } catch (e: any) {
      console.error('[ExportService] CSV export failed:', e);
      return { success: false, error: e.message || 'CSV export failed' };
    }
  }
}

export const exportService = new ExportService();
export default exportService;
