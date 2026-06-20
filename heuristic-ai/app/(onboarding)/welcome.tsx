/**
 * HeuristicAI — Onboarding: Welcome Screen
 * Full-screen hero with animated logo + headline
 * Source of truth: APP_FLOW.md § 2, TASK.md Task 3, UI_UX_BRIEF.md
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { MotiView } from 'moti';
import { Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function WelcomeScreen() {
  const router = useRouter();
  const { complete } = useOnboarding();

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(onboarding)/goals');
  };

  const handleSkip = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Complete onboarding as guest with default values
    await complete(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Animated logo mark using Moti for continuous pulse */}
        <Animated.View
          entering={FadeIn.delay(200).duration(800)}
          style={styles.logoContainer}
        >
          <MotiView
            from={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1.05, opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 1500,
              loop: true,
              repeatReverse: true,
            }}
            style={styles.logoBg}
          >
            <Zap size={36} color={colors.accent.primary} strokeWidth={2.5} />
          </MotiView>
        </Animated.View>

        {/* Tagline / Headline */}
        <Animated.View entering={FadeInUp.delay(400).duration(800)}>
          <Text style={styles.headline}>
            Your workout adapts.{'\n'}You just show up.
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View entering={FadeInUp.delay(600).duration(800)}>
          <Text style={styles.subtext}>
            HeuristicAI learns your real-time performance limits using edge computer vision and smart fatigue mapping. No guesswork. Pure progression.
          </Text>
        </Animated.View>

        {/* Divider rule */}
        <Animated.View
          entering={FadeIn.delay(700).duration(400)}
          style={styles.rule}
        />

        {/* Actions */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(600)}
          style={styles.ctaContainer}
        >
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={handleStart}
            accessibilityLabel="Let's Build Your Profile"
            accessibilityRole="button"
          >
            <Text style={styles.primaryCtaText}>LET'S BUILD YOUR PROFILE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ghostCta}
            onPress={handleSkip}
            accessibilityLabel="Skip profile setup and train as guest"
            accessibilityRole="button"
          >
            <Text style={styles.ghostCtaText}>SKIP FOR NOW</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing[6],
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: spacing[8],
  },
  logoBg: {
    width: 64,
    height: 64,
    backgroundColor: colors.accent.dim,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  subtext: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: colors.text.secondary,
    marginBottom: spacing[6],
  },
  rule: {
    width: 48,
    height: 2,
    backgroundColor: colors.accent.primary,
    marginBottom: spacing[10],
  },
  ctaContainer: {
    gap: spacing[3],
  },
  primaryCta: {
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingVertical: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  primaryCtaText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 14,
    letterSpacing: 0.5,
    color: colors.text.inverse,
  },
  ghostCta: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingVertical: spacing[4],
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  ghostCtaText: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.text.secondary,
  },
});
