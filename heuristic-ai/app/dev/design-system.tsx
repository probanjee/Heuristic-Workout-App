/**
 * File: app/dev/design-system.tsx
 * Purpose: Visual showcase and verification screen for the HeuristicAI Design System
 * Dependencies: react, react-native, expo-router, lucide-react-native, @/components/ui, @/constants/theme
 */

import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Dumbbell,
  Play,
  Check,
  Trash,
  Info,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/theme';
import {
  H1,
  H2,
  H3,
  BodyLarge,
  BodyMedium,
  BodySmall,
  Caption,
  NumXL,
  NumL,
  NumM,
  NumS,
  Typography,
} from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DesignSystemShowcase() {
  const router = useRouter();
  const [progressVal, setProgressVal] = useState<number>(35);
  const [skeletonLoading, setSkeletonLoading] = useState<boolean>(true);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.accent.primary} size={24} />
        </TouchableOpacity>
        <H2 style={styles.headerTitle}>DESIGN SYSTEM</H2>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <Card style={styles.introCard} variant="elevated">
          <H3 style={{ color: colors.accent.primary, marginBottom: spacing[2] }}>
            HEURISTICAI CORE UI
          </H3>
          <BodyMedium>
            Dark Brutalist HUD-style design foundation. Built using Electric Green
            accent (#00FF87), sharp 4–8px corners, and specialized fonts (Syne, IBM
            Plex Sans, DM Mono).
          </BodyMedium>
        </Card>

        {/* 1. TYPOGRAPHY */}
        <View style={styles.section}>
          <H3 style={styles.sectionHeader}>01 / TYPOGRAPHY</H3>
          <View style={styles.sectionBody}>
            {/* Syne Headings */}
            <View style={styles.subBlock}>
              <Caption style={styles.subBlockLabel}>Display Headings (Syne)</Caption>
              <H1>H1 Heading 32px</H1>
              <H2 style={{ marginTop: spacing[2] }}>H2 Heading 24px</H2>
              <H3 style={{ marginTop: spacing[2] }}>H3 Heading 18px</H3>
            </View>

            {/* IBM Plex Sans Body */}
            <View style={styles.subBlock}>
              <Caption style={styles.subBlockLabel}>Body & Labels (IBM Plex Sans)</Caption>
              <BodyLarge>Body Large 16px - Used for readable content text.</BodyLarge>
              <BodyMedium style={{ marginTop: spacing[2] }}>
                Body Medium 14px - Primary size for lists, details, descriptions.
              </BodyMedium>
              <BodySmall style={{ marginTop: spacing[2] }}>
                Body Small 12px - Subtext and exercise metadata.
              </BodySmall>
              <Caption style={{ marginTop: spacing[2] }}>
                Caption 11px - Dark/muted context labels.
              </Caption>
            </View>

            {/* DM Mono Numbers */}
            <View style={styles.subBlock}>
              <Caption style={styles.subBlockLabel}>Numerals (DM Mono)</Caption>
              <View style={styles.monoRow}>
                <View>
                  <NumXL>99</NumXL>
                  <Caption>NumXL 64px (Reps/Timer)</Caption>
                </View>
                <View style={{ marginLeft: spacing[6] }}>
                  <NumL>180</NumL>
                  <Caption>NumL 48px (Weight)</Caption>
                </View>
              </View>
              <View style={[styles.monoRow, { marginTop: spacing[4] }]}>
                <View>
                  <NumM>Set 2/4</NumM>
                  <Caption>NumM 32px (Sets/1RM)</Caption>
                </View>
                <View style={{ marginLeft: spacing[6] }}>
                  <NumS>RPE 8.5</NumS>
                  <Caption>NumS 20px (Badges/Mini-Stats)</Caption>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 2. BUTTONS */}
        <View style={styles.section}>
          <H3 style={styles.sectionHeader}>02 / BUTTONS</H3>
          <View style={styles.sectionBody}>
            {/* Primary */}
            <View style={styles.subBlock}>
              <Caption style={styles.subBlockLabel}>Primary Variant</Caption>
              <Button variant="primary">PRIMARY ACTION</Button>
              <Button
                variant="primary"
                leftIcon={<Play size={16} color={colors.text.inverse} />}
                style={{ marginTop: spacing[2] }}
              >
                PLAY WORKOUT
              </Button>
            </View>

            {/* Secondary */}
            <View style={styles.subBlock}>
              <Caption style={styles.subBlockLabel}>Secondary Variant</Caption>
              <Button variant="secondary">SECONDARY ACTION</Button>
              <Button
                variant="secondary"
                rightIcon={<Dumbbell size={16} color={colors.text.primary} />}
                style={{ marginTop: spacing[2] }}
              >
                ADD EXERCISE
              </Button>
            </View>

            {/* Danger & Ghost */}
            <View style={styles.subBlock}>
              <Caption style={styles.subBlockLabel}>Danger & Ghost Variants</Caption>
              <Button variant="danger">DELETE WORKOUT</Button>
              <View style={styles.row}>
                <Button variant="ghost" style={{ flex: 1 }}>
                  CANCEL
                </Button>
                <Button
                  variant="ghost"
                  leftIcon={<Trash size={16} color={colors.accent.primary} />}
                  style={{ flex: 1 }}
                >
                  REMOVE
                </Button>
              </View>
            </View>

            {/* Button States */}
            <View style={styles.subBlock}>
              <Caption style={styles.subBlockLabel}>States (Disabled & Loading)</Caption>
              <Button variant="primary" disabled>
                DISABLED ACTION
              </Button>
              <Button variant="primary" loading style={{ marginTop: spacing[2] }}>
                SUBMITTING
              </Button>
            </View>
          </View>
        </View>

        {/* 3. CARDS */}
        <View style={styles.section}>
          <H3 style={styles.sectionHeader}>03 / CARDS</H3>
          <View style={styles.sectionBody}>
            {/* Card Default */}
            <Caption style={styles.subBlockLabel}>Default Variant (bg.secondary)</Caption>
            <Card variant="default" style={styles.cardExample}>
              <H3>Default Surface Card</H3>
              <BodyMedium style={{ marginTop: spacing[1] }}>
                Brutalist sharp border-radius (8px) with 1px border.
              </BodyMedium>
            </Card>

            {/* Card Elevated */}
            <Caption style={[styles.subBlockLabel, { marginTop: spacing[4] }]}>
              Elevated Variant (bg.elevated)
            </Caption>
            <Card variant="elevated" style={styles.cardExample}>
              <H3 style={{ color: colors.accent.primary }}>Elevated Modal Card</H3>
              <BodyMedium style={{ marginTop: spacing[1] }}>
                Lighter surface color for modals, selectors, or bottom sheets.
              </BodyMedium>
            </Card>

            {/* Card Glass Overlay */}
            <Caption style={[styles.subBlockLabel, { marginTop: spacing[4] }]}>
              Glass/Overlay Variant (Translucent HUD)
            </Caption>
            <Card variant="glass" style={styles.cardExample}>
              <H3 style={{ color: colors.warning }}>Translucent Panel</H3>
              <BodyMedium style={{ marginTop: spacing[1] }}>
                Overlay background featuring electric border accents.
              </BodyMedium>
            </Card>
          </View>
        </View>

        {/* 4. BADGES */}
        <View style={styles.section}>
          <H3 style={styles.sectionHeader}>04 / STATUS BADGES</H3>
          <View style={styles.sectionBody}>
            <Caption style={styles.subBlockLabel}>Semantic Badges</Caption>
            <View style={styles.badgeGrid}>
              <Badge variant="success" label="Recovery" />
              <Badge
                variant="warning"
                label="High Fatigue"
                icon={<Info size={12} color={colors.warning} />}
              />
              <Badge variant="danger" label="Deload" />
              <Badge variant="info" label="Active" />
            </View>
          </View>
        </View>

        {/* 5. PROGRESS BARS */}
        <View style={styles.section}>
          <H3 style={styles.sectionHeader}>05 / PROGRESS BARS</H3>
          <View style={styles.sectionBody}>
            <Caption style={styles.subBlockLabel}>Static Bars</Caption>
            <ProgressBar value={75} label="Workout progress" showPercentage />
            <ProgressBar
              value={100}
              label="Session target"
              color={colors.success}
              showPercentage
              style={{ marginTop: spacing[4] }}
            />

            <Caption style={[styles.subBlockLabel, { marginTop: spacing[4] }]}>
              Interactive Transition Verification
            </Caption>
            <ProgressBar
              value={progressVal}
              label="Real-time Engine Feedback"
              showPercentage
            />
            <View style={styles.row}>
              <Button
                variant="secondary"
                onPress={() => setProgressVal(Math.max(progressVal - 15, 0))}
                style={{ flex: 1, height: 38, marginRight: spacing[2] }}
              >
                DECREASE -15
              </Button>
              <Button
                variant="secondary"
                onPress={() => setProgressVal(Math.min(progressVal + 15, 100))}
                style={{ flex: 1, height: 38 }}
              >
                INCREASE +15
              </Button>
            </View>
          </View>
        </View>

        {/* 6. SKELETONS */}
        <View style={styles.section}>
          <H3 style={styles.sectionHeader}>06 / SKELETON LOADERS</H3>
          <View style={styles.sectionBody}>
            <View style={styles.row}>
              <Caption style={styles.subBlockLabel}>Skeleton Placeholder Shimmer</Caption>
              <TouchableOpacity
                onPress={() => setSkeletonLoading(!skeletonLoading)}
                style={styles.toggleLoader}
              >
                <RefreshCw
                  size={12}
                  color={skeletonLoading ? colors.accent.primary : colors.text.muted}
                />
              </TouchableOpacity>
            </View>

            {skeletonLoading ? (
              <View style={styles.skeletonContainer}>
                <View style={styles.row}>
                  <Skeleton width={50} height={50} rounded={true} />
                  <View style={{ flex: 1, marginLeft: spacing[4], gap: spacing[2] }}>
                    <Skeleton width="80%" height={16} />
                    <Skeleton width="50%" height={12} />
                  </View>
                </View>
                <Skeleton width="100%" height={80} style={{ marginTop: spacing[4] }} />
              </View>
            ) : (
              <Card variant="default" style={styles.skeletonContainer}>
                <View style={styles.row}>
                  <View style={styles.dummyAvatar}>
                    <Dumbbell size={20} color={colors.accent.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing[4] }}>
                    <H3>Barbell Squat</H3>
                    <BodySmall style={{ color: colors.text.muted }}>
                      Difficulty: Intermediate
                    </BodySmall>
                  </View>
                </View>
                <BodyMedium style={{ marginTop: spacing[4] }}>
                  Placeholder loaded successfully! Tap the refresh icon above to toggle
                  the shimmer loading state again.
                </BodyMedium>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderColor: colors.border.default,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 20,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  introCard: {
    marginBottom: spacing[6],
  },
  section: {
    marginBottom: spacing[8],
  },
  sectionHeader: {
    color: colors.text.muted,
    fontFamily: 'DMMono_500Medium',
    fontSize: 12,
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.default,
    paddingBottom: spacing[2],
    marginBottom: spacing[4],
  },
  sectionBody: {
    gap: spacing[4],
  },
  subBlock: {
    marginBottom: spacing[4],
  },
  subBlockLabel: {
    marginBottom: spacing[2],
    color: colors.text.muted,
  },
  monoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  cardExample: {
    marginBottom: spacing[2],
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  skeletonContainer: {
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    backgroundColor: colors.bg.secondary,
    minHeight: 160,
    justifyContent: 'center',
  },
  toggleLoader: {
    padding: spacing[1],
  },
  dummyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
});
