/**
 * HeuristicAI — Mini Demo Overlay Component
 * Slide-up player displaying exercise looping demonstration video and form checklists
 * Source of truth: TASK.md § 12, UI_UX_BRIEF.md
 */

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { X, ClipboardCheck, VideoOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '@/constants/theme';
import type { ExerciseData } from '@/heuristic-engine/types';

interface MiniDemoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: ExerciseData | null;
}

export function MiniDemoOverlay({ isOpen, onClose, exercise }: MiniDemoOverlayProps) {
  const videoRef = useRef<Video>(null);

  if (!isOpen || !exercise) return null;

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>{exercise.name.toUpperCase()}</Text>
              <Text style={styles.subtitle}>Form & Execution Demo</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleClose}
              accessibilityLabel="Close exercise demonstration overlay"
              accessibilityRole="button"
            >
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Video Player */}
            <View style={styles.videoWrapper}>
              {exercise.videoUrl ? (
                <Video
                  ref={videoRef}
                  style={styles.video}
                  source={{ uri: exercise.videoUrl }}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay
                  isLooping
                  isMuted
                  useNativeControls={false}
                  accessibilityLabel={`Looping demonstration video of ${exercise.name}`}
                />
              ) : (
                <View style={styles.noVideo}>
                  <VideoOff size={32} color={colors.text.muted} />
                  <Text style={styles.noVideoText}>No demo video available</Text>
                </View>
              )}
            </View>

            {/* Form Checklist section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ClipboardCheck size={16} color={colors.accent.primary} />
                <Text style={styles.sectionTitle}>FORM CHECKLIST</Text>
              </View>

              <View style={styles.checklistList}>
                {exercise.formChecklist && exercise.formChecklist.length > 0 ? (
                  exercise.formChecklist.map((tip, idx) => (
                    <View key={idx} style={styles.checkItem}>
                      <View style={styles.checkIndicator}>
                        <Text style={styles.checkIndicatorText}>✓</Text>
                      </View>
                      <Text style={styles.checkText}>{tip}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noTipsText}>No specific form checklist recorded.</Text>
                )}
              </View>
            </View>

            {/* Muscle Cues summary info */}
            <View style={[styles.section, { marginBottom: spacing[8] }]}>
              <Text style={styles.cuesTitle}>PRIMARY WORKOUT CUES</Text>
              <View style={styles.cuesContainer}>
                {exercise.audioCues && exercise.audioCues.length > 0 ? (
                  exercise.audioCues.map((cue, idx) => (
                    <Text key={idx} style={styles.cueText}>
                      • "{cue}"
                    </Text>
                  ))
                ) : (
                  <Text style={styles.noTipsText}>Perform with control and slow tempo.</Text>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.bg.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    height: '75%',
    backgroundColor: colors.bg.elevated,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingTop: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderColor: colors.border.default,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 18,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.bg.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing[6],
  },
  video: {
    flex: 1,
  },
  noVideo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  noVideoText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.muted,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.accent.primary,
    letterSpacing: 1,
  },
  checklistList: {
    gap: spacing[3],
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  checkIndicator: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.dim,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkIndicatorText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 10,
    color: colors.accent.primary,
    lineHeight: 12,
  },
  checkText: {
    flex: 1,
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  noTipsText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.muted,
  },
  cuesTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: spacing[2],
  },
  cuesContainer: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing[3],
    gap: 6,
  },
  cueText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});
