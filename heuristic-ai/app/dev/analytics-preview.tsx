/**
 * HeuristicAI — Developer Analytics Preview Screen
 * Sandbox UI for testing post-workout summary and progress dashboard components.
 * Source of truth: TASK.md (M6 Task 24), UI_UX_BRIEF.md
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Database as DbIcon, RefreshCw, Trash2, ShieldAlert, Share2, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '@/constants/theme';
import { database, sessionsCollection, setsCollection } from '@/database';

// Custom Hooks
import { useWorkoutSummary } from '@/hooks/useWorkoutSummary';
import { useProgressAnalytics } from '@/hooks/useProgressAnalytics';
import { useTimeRange } from '@/hooks/useTimeRange';
import { useSessionHistory } from '@/hooks/useSessionHistory';

// Summary Components
import { SummaryHero } from '@/components/summary/SummaryHero';
import { RecoveryRecommendation } from '@/components/summary/RecoveryRecommendation';
import { RPEChart } from '@/components/summary/RPEChart';
import { CoachNotes } from '@/components/summary/CoachNotes';
import { SessionExerciseBreakdown } from '@/components/summary/SessionExerciseBreakdown';
import { ShareSummaryCard } from '@/components/summary/ShareSummaryCard';
import { shareWorkoutSummary } from '@/services/sharing/share-summary';

// Progress Components
import { TimeRangeSelector } from '@/components/progress/TimeRangeSelector';
import { VolumeBarChart } from '@/components/progress/VolumeBarChart';
import { RPETrendChart } from '@/components/progress/RPETrendChart';
import { OneRMProgressChart } from '@/components/progress/OneRMProgressChart';
import { SessionFrequencyHeatmap } from '@/components/progress/SessionFrequencyHeatmap';
import { SessionHistoryList } from '@/components/progress/SessionHistoryList';
import { SessionDetailSheet } from '@/components/progress/SessionDetailSheet';
import { ProgressEmptyState } from '@/components/progress/ProgressEmptyState';

export default function AnalyticsPreviewScreen() {
  const router = useRouter();
  const shareCardRef = useRef<View>(null);

  // Active sandbox view: 'summary' | 'dashboard' | 'sandbox'
  const [activeTab, setActiveTab] = useState<'summary' | 'dashboard' | 'sandbox'>('summary');
  
  // Database status and counts
  const [dbStatus, setDbStatus] = useState<'CHECKING' | 'CONNECTED' | 'ERROR'>('CHECKING');
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [setCount, setSetCount] = useState<number>(0);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [selectedHistorySessionId, setSelectedHistorySessionId] = useState<string | null>(null);

  // Load hooks using correct type signatures
  const { range: selectedRange, setRange: onRangeChange, days } = useTimeRange();
  const {
    loading: loadingAnalytics,
    totalVolume,
    avgRpe: progressAvgRpe,
    weeklyVolume,
    rpeTrend,
    streak,
    frequency,
    sessionsPerWeek,
    squatOneRmProgress,
    benchOneRmProgress,
    deadliftOneRmProgress,
  } = useProgressAnalytics(days);

  const { sessions: historySessions, loading: loadingHistory } = useSessionHistory();
  const { summary: latestSummary, breakdown: latestBreakdown, session: latestSession, loading: loadingSummary } = useWorkoutSummary();

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      setDbStatus('CHECKING');
      const sessions = await sessionsCollection.query().fetch();
      const sets = await setsCollection.query().fetch();
      setSessionCount(sessions.length);
      setSetCount(sets.length);
      setDbStatus('CONNECTED');
    } catch (err) {
      console.error('[AnalyticsPreview] Database check failed:', err);
      setDbStatus('ERROR');
    }
  };

  const handleClearDatabase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Clear Workout Logs',
      'Are you sure you want to delete all workout sessions and sets from WatermelonDB?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setLoadingAction(true);
            try {
              await database.write(async () => {
                const sessions = await sessionsCollection.query().fetch();
                const sets = await setsCollection.query().fetch();
                const prepareDestroy = [
                  ...sessions.map((s) => s.prepareDestroyPermanently()),
                  ...sets.map((s) => s.prepareDestroyPermanently()),
                ];
                await database.batch(...prepareDestroy);
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await checkDatabase();
              Alert.alert('Success', 'Database cleared.');
            } catch (err: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', err?.message || 'Failed to clear database.');
            } finally {
              setLoadingAction(false);
            }
          },
        },
      ]
    );
  };

  const handleSeedMockData = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoadingAction(true);
    try {
      const now = new Date();
      const sessionOffsets = [0, 2, 5, 8, 12, 15, 19, 23, 27];

      await database.write(async () => {
        // Clear first
        const sessions = await sessionsCollection.query().fetch();
        const sets = await setsCollection.query().fetch();
        const prepareDestroy = [
          ...sessions.map((s) => s.prepareDestroyPermanently()),
          ...sets.map((s) => s.prepareDestroyPermanently()),
        ];
        await database.batch(...prepareDestroy);

        for (let i = 0; i < sessionOffsets.length; i++) {
          const offset = sessionOffsets[i];
          const startedAt = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000 - 45 * 60 * 1000);
          const endedAt = new Date(startedAt.getTime() + 45 * 60 * 1000);
          const sessionId = `mock-session-${i}`;

          const sessionRecord = sessionsCollection.prepareCreate((record: any) => {
            record._raw.id = sessionId;
            record.userId = 'mock-user-123';
            record.startedAt = startedAt;
            record.endedAt = endedAt;
            record.status = 'completed';
            record.synced = false;
          });

          const setsToCreate: any[] = [];
          const isLowerBody = i % 2 === 0;

          if (isLowerBody) {
            const squatWeight = 80 + (8 - i) * 2.5;
            for (let setNum = 1; setNum <= 3; setNum++) {
              setsToCreate.push({
                exerciseId: 'squat',
                setNumber: setNum,
                targetReps: 6,
                completedReps: 6,
                targetWeightKg: squatWeight,
                actualWeightKg: squatWeight,
                rpe: 7 + setNum * 0.5,
                rpeEstimated: false,
                formScore: 85 + Math.floor(Math.random() * 10),
                restSeconds: 90,
                completedAt: new Date(startedAt.getTime() + setNum * 5 * 60 * 1000),
                heuristicAction: {
                  coachNote: `Squat Set ${setNum}: Form solid. Drive knees out.`,
                  actionType: 'none',
                },
              });
            }

            const deadliftWeight = 100 + (8 - i) * 5;
            for (let setNum = 1; setNum <= 2; setNum++) {
              setsToCreate.push({
                exerciseId: 'deadlift',
                setNumber: setNum,
                targetReps: 5,
                completedReps: 5,
                targetWeightKg: deadliftWeight,
                actualWeightKg: deadliftWeight,
                rpe: 8 + setNum,
                rpeEstimated: false,
                formScore: 78 + Math.floor(Math.random() * 15),
                restSeconds: 120,
                completedAt: new Date(startedAt.getTime() + (setNum + 3) * 5 * 60 * 1000),
                heuristicAction: {
                  coachNote: `Deadlift Set ${setNum}: Keep bar close to legs.`,
                  actionType: 'none',
                },
              });
            }
          } else {
            const benchWeight = 60 + (8 - i) * 2.5;
            for (let setNum = 1; setNum <= 3; setNum++) {
              setsToCreate.push({
                exerciseId: 'bench-press',
                setNumber: setNum,
                targetReps: 8,
                completedReps: setNum === 3 ? 7 : 8,
                targetWeightKg: benchWeight,
                actualWeightKg: benchWeight,
                rpe: setNum === 3 ? 9 : 8,
                rpeEstimated: false,
                formScore: 82 + Math.floor(Math.random() * 12),
                restSeconds: 90,
                completedAt: new Date(startedAt.getTime() + setNum * 5 * 60 * 1000),
                heuristicAction:
                  setNum === 3
                    ? {
                        coachNote: 'RPE 9 on set 3 - Reducing weight 10% next set.',
                        actionType: 'reduce_weight',
                      }
                    : {
                        coachNote: `Bench Set ${setNum}: Keep elbows tucked.`,
                        actionType: 'none',
                      },
              });
            }
          }

          const preparedSets = setsToCreate.map((setData) =>
            setsCollection.prepareCreate((setRecord: any) => {
              setRecord.sessionId = sessionId;
              setRecord.exerciseId = setData.exerciseId;
              setRecord.setNumber = setData.setNumber;
              setRecord.targetReps = setData.targetReps;
              setRecord.completedReps = setData.completedReps;
              setRecord.targetWeightKg = setData.targetWeightKg;
              setRecord.actualWeightKg = setData.actualWeightKg;
              setRecord.rpe = setData.rpe;
              setRecord.rpeEstimated = setData.rpeEstimated;
              setRecord.formScore = setData.formScore;
              setRecord.restSeconds = setData.restSeconds;
              setRecord._raw.heuristic_action = JSON.stringify(setData.heuristicAction);
              setRecord.completedAt = setData.completedAt;
              setRecord.synced = false;
            })
          );

          const totalVolume = setsToCreate.reduce((sum, s) => sum + s.actualWeightKg * s.completedReps, 0);
          const rpes = setsToCreate.map((s) => s.rpe).filter((r) => r !== null) as number[];
          const avgRpe = rpes.length > 0 ? rpes.reduce((a, b) => a + b, 0) / rpes.length : 6.0;

          sessionRecord.totalVolumeKg = totalVolume;
          sessionRecord.avgRpe = Math.round(avgRpe * 10) / 10;

          const topDecisions = setsToCreate
            .map((s) => s.heuristicAction.coachNote)
            .filter(Boolean)
            .map((n) => ({ coachNote: n, count: 1 }));

          let estimatedOneRmKg = null;
          const bestSet = setsToCreate.reduce(
            (best: any, s) => (!best || s.actualWeightKg > best.actualWeightKg ? s : best),
            null
          );
          if (bestSet) {
            estimatedOneRmKg = bestSet.actualWeightKg * (1 + bestSet.completedReps / 30);
          }

          const formSummary = Array.from(new Set(setsToCreate.map((s) => s.exerciseId))).map((slug) => {
            const matching = setsToCreate.filter((s) => s.exerciseId === slug);
            const scores = matching.map((s) => s.formScore).filter((f) => f !== null) as number[];
            const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 85;
            return { exerciseSlug: slug, avgScore: Math.round(avgScore) };
          });

          const heuristicSummary = {
            totalVolume,
            avgRpe: Math.round(avgRpe * 10) / 10,
            topDecisions: topDecisions.slice(0, 3),
            recoveryRecommendationHours: avgRpe >= 8 ? 72 : avgRpe >= 6 ? 48 : 24,
            estimatedOneRmKg,
            formSummary,
          };

          (sessionRecord as any)._heuristicSummary = JSON.stringify(heuristicSummary);

          await database.batch(sessionRecord, ...preparedSets);
        }
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await checkDatabase();
      Alert.alert('Success', 'Seeded 9 mock sessions spanning the last 30 days.');
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', err?.message || 'Failed to seed mock data.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleShareMockCard = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await shareWorkoutSummary(shareCardRef);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Share sheet opened.');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Sharing Failed', result.error || 'Failed to capture or share.');
    }
  };

  // Safe Back Handler
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Dev Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          accessibilityLabel="Back to dev menu"
        >
          <ChevronLeft color={colors.accent.primary} size={24} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>ANALYTICS SANDBOX</Text>
          <Text style={styles.headerSubtitle}>Milestone M6 Progress Dashboard QA</Text>
        </View>
      </View>

      {/* Control Panel Card */}
      <View style={styles.controlCard}>
        <View style={styles.statusRow}>
          <DbIcon size={16} color={dbStatus === 'CONNECTED' ? colors.accent.primary : colors.danger} />
          <Text style={styles.statusText}>
            LOCAL DB: {sessionCount} SESSIONS • {setCount} SETS
          </Text>
          <TouchableOpacity onPress={checkDatabase} disabled={loadingAction} style={styles.iconBtn}>
            <RefreshCw size={12} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnGreen]}
            onPress={handleSeedMockData}
            disabled={loadingAction}
          >
            <Text style={styles.btnTextInverse}>SEED MOCK WORKOUT HISTORY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnDanger]}
            onPress={handleClearDatabase}
            disabled={loadingAction}
          >
            <Trash2 size={12} color={colors.text.primary} />
            <Text style={styles.btnText}>CLEAR LOGS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sandbox Tab Switcher */}
      <View style={styles.tabSwitcher}>
        {(['summary', 'dashboard', 'sandbox'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loadingAction ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={styles.loadingText}>WRITING DB TRANSACTIONS...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'summary' && (
            <View style={styles.viewSection}>
              {latestSummary && latestSession ? (
                <>
                  <Text style={styles.sectionHeading}>POST-WORKOUT SUMMARY PREVIEW</Text>
                  
                  <SummaryHero
                    totalVolumeKg={latestSummary.totalVolume}
                    durationSeconds={latestSession.endedAt ? Math.max(0, Math.floor((latestSession.endedAt - latestSession.startedAt) / 1000)) : 2700}
                    avgRpe={latestSummary.avgRpe}
                  />

                  <RecoveryRecommendation
                    hours={latestSummary.recoveryRecommendationHours}
                    severity={latestSummary.avgRpe >= 8 ? 'high' : latestSummary.avgRpe >= 6 ? 'moderate' : 'low'}
                    message="Calculated based on your average session RPE, technique consistency, and cumulative weekly stress."
                  />

                  {latestBreakdown.length > 0 && (
                    <RPEChart
                      sets={latestBreakdown.flatMap((b, idx) => 
                        Array.from({ length: b.setsCount }).map((_, sIdx) => ({
                          id: `${b.exerciseSlug}_${idx}_${sIdx}`,
                          sessionId: latestSession.id || '',
                          exerciseSlug: b.exerciseSlug,
                          setNumber: sIdx + 1,
                          targetReps: b.bestReps,
                          completedReps: b.bestReps,
                          targetWeightKg: b.bestWeightKg,
                          actualWeightKg: b.bestWeightKg,
                          rpe: b.avgRpe,
                          rpeEstimated: false,
                          formScore: b.avgFormScore,
                          restSeconds: 90,
                          heuristicAction: null,
                          completedAt: Date.now(),
                          synced: false,
                        }))
                      )}
                    />
                  )}

                  <CoachNotes topDecisions={latestSummary.topDecisions} />

                  <SessionExerciseBreakdown breakdown={latestBreakdown} />

                  <View style={styles.shareSection}>
                    <Text style={styles.shareHeading}>CAPTURE & OS SHARING</Text>
                    <View ref={shareCardRef} collapsable={false}>
                      <ShareSummaryCard
                        summary={latestSummary}
                        durationSeconds={latestSession.endedAt ? Math.max(0, Math.floor((latestSession.endedAt - latestSession.startedAt) / 1000)) : 2700}
                        dateStr={new Date(latestSession.startedAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      />
                    </View>
                    <TouchableOpacity style={styles.shareBtn} onPress={handleShareMockCard}>
                      <Share2 size={14} color={colors.accent.primary} />
                      <Text style={styles.shareBtnText}>SHARE SUMMARY CARD</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <ShieldAlert size={28} color={colors.warning} />
                  <Text style={styles.emptyText}>NO COMPLETED WORKOUTS IN LOCAL DB</Text>
                  <Text style={styles.emptySubtext}>Click 'SEED MOCK WORKOUT HISTORY' above to generate test fixtures.</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'dashboard' && (
            <View style={styles.viewSection}>
              <Text style={styles.sectionHeading}>PROGRESS DASHBOARD PREVIEW</Text>
              
              <TimeRangeSelector selectedRange={selectedRange} onRangeChange={onRangeChange} />

              {loadingAnalytics ? (
                <ActivityIndicator size="small" color={colors.accent.primary} />
              ) : sessionCount > 0 ? (
                <>
                  <SessionFrequencyHeatmap frequency={frequency} />

                  <VolumeBarChart weeklyVolume={weeklyVolume} />

                  <RPETrendChart rpeTrend={rpeTrend} />

                  <OneRMProgressChart
                    squatProgression={squatOneRmProgress}
                    benchProgression={benchOneRmProgress}
                    deadliftProgression={deadliftOneRmProgress}
                  />

                  <SessionHistoryList
                    sessions={historySessions}
                    onSessionSelect={(id) => setSelectedHistorySessionId(id)}
                  />
                </>
              ) : (
                <ProgressEmptyState onStartWorkout={() => setActiveTab('summary')} />
              )}
            </View>
          )}

          {activeTab === 'sandbox' && (
            <View style={styles.viewSection}>
              <Text style={styles.sectionHeading}>COMPONENT PLAYGROUND</Text>

              <View style={styles.infoRow}>
                <Info size={14} color={colors.accent.primary} />
                <Text style={styles.infoText}>Rendering components in isolation with static mock data.</Text>
              </View>

              {/* Recovery Badge Severities */}
              <Text style={styles.playgroundLabel}>Recovery Cards (Low / Moderate / High)</Text>
              <RecoveryRecommendation
                hours={24}
                severity="low"
                message="Recovery recommendation is normal. Ready for regular training."
              />
              <RecoveryRecommendation
                hours={48}
                severity="moderate"
                message="Elevated training fatigue detected. Focus on stretching and passive mobility."
              />
              <RecoveryRecommendation
                hours={72}
                severity="high"
                message="Severe muscular fatigue or technique breakdown. Mandating rest to prevent injury."
              />

              {/* Empty States */}
              <Text style={styles.playgroundLabel}>Empty States Preview</Text>
              <ProgressEmptyState onStartWorkout={() => Alert.alert('Action Triggered')} />
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Detail Bottom Sheet */}
      {selectedHistorySessionId && (
        <SessionDetailSheet
          sessionId={selectedHistorySessionId}
          onClose={() => setSelectedHistorySessionId(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.secondary,
    gap: spacing[3],
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.primary,
  },
  headerTitle: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 16,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 11,
    color: colors.text.muted,
  },
  controlCard: {
    margin: spacing[4],
    marginBottom: 0,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: spacing[4],
    gap: spacing[3],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 11,
    color: colors.text.secondary,
    flex: 1,
  },
  iconBtn: {
    padding: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: 10,
    paddingHorizontal: spacing[3],
    flex: 1,
  },
  btnGreen: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  btnDanger: {
    backgroundColor: colors.bg.primary,
    borderColor: colors.danger,
    flex: 0.7,
  },
  btnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 10,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  btnTextInverse: {
    fontFamily: 'Syne_700Bold',
    fontSize: 10,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    backgroundColor: colors.bg.secondary,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: colors.border.default,
  },
  tabButtonText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 10,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  activeTabButtonText: {
    color: colors.accent.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[4],
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  loadingText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.muted,
  },
  viewSection: {
    gap: spacing[5],
  },
  sectionHeading: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  emptyText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 13,
    color: colors.text.primary,
    marginTop: spacing[2],
  },
  emptySubtext: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 11,
    color: colors.text.muted,
    textAlign: 'center',
  },
  shareSection: {
    gap: spacing[3],
    marginTop: spacing[2],
  },
  shareHeading: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderWidth: 1.5,
    borderColor: colors.accent.primary,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 135, 0.04)',
    paddingVertical: 14,
  },
  shareBtnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.accent.primary,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: spacing[3],
  },
  infoText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 11,
    color: colors.text.secondary,
    flex: 1,
  },
  playgroundLabel: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.text.primary,
    marginTop: spacing[2],
    textTransform: 'uppercase',
  },
});
