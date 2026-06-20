/**
 * HeuristicAI — Global Error Boundary Component
 * Catches JavaScript rendering exceptions, displays diagnostics, and handles recovery.
 * Source of truth: TASK.md § 9, UI_UX_BRIEF.md
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useUserStore } from '@/store/user.store';
import { useWorkoutStore } from '@/store/workout.store';
import { useSyncStore } from '@/store/sync.store';
import { monitoringService } from '@/services/monitoring/monitoring-service';
import { colors, spacing, typography, radius } from '@/constants/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const infoStr = errorInfo.componentStack || '';
    this.setState({ errorInfo: infoStr });
    
    // Log crash to monitoring service
    monitoringService.logCrash(error, infoStr).catch((e) => {
      console.error('[ErrorBoundary] Failed to log crash:', e);
    });
  }

  private handleReset = () => {
    // Clear Zustand states
    try {
      useWorkoutStore.getState().resetWorkout();
      useSyncStore.getState().resetSyncError();
      this.setState({ hasError: false, error: null, errorInfo: null });
    } catch (e) {
      console.error('[ErrorBoundary] Failed to reset state:', e);
    }
  };

  private handleWipeAll = async () => {
    try {
      useUserStore.getState().resetOnboarding();
      useWorkoutStore.getState().resetWorkout();
      useSyncStore.getState().resetSyncError();
      
      // Attempt dev settings reload
      if (__DEV__ && Platform.OS !== 'web') {
        const { DevSettings } = require('react-native');
        DevSettings.reload();
      } else {
        this.setState({ hasError: false, error: null, errorInfo: null });
      }
    } catch (e) {
      console.error('[ErrorBoundary] Failed to wipe application data:', e);
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.glitchTitle}>CRITICAL FAILURE</Text>
            <Text style={styles.subtitle}>HEURISTIC_AI RUNTIME HALTED</Text>
          </View>

          <ScrollView style={styles.errorBox} contentContainerStyle={styles.errorBoxContent}>
            <Text style={styles.errorLabel}>ERROR MESSAGE:</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.toString() || 'Unknown runtime error occurred.'}
            </Text>

            {this.state.errorInfo && (
              <>
                <Text style={[styles.errorLabel, { marginTop: spacing[4] }]}>STACK TRACE:</Text>
                <Text style={styles.stackTrace}>{this.state.errorInfo.trim()}</Text>
              </>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={this.handleReset}
              accessibilityLabel="Recover and try again"
              accessibilityHint="Clears current session and returns to normal application flow"
            >
              <Text style={styles.primaryButtonText}>RECOVER FLOW</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={this.handleWipeAll}
              accessibilityLabel="Hard reset application data"
              accessibilityHint="Clears all preferences, local databases and reloads onboarding"
            >
              <Text style={styles.secondaryButtonText}>RESET USER STORAGE</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    padding: spacing[6],
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing[6],
  },
  glitchTitle: {
    ...typography.scale.h1,
    color: colors.danger,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    ...typography.scale.label,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  errorBox: {
    flex: 1,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.danger,
    borderRadius: radius.md,
    marginBottom: spacing[6],
    maxHeight: '60%',
  },
  errorBoxContent: {
    padding: spacing[4],
  },
  errorLabel: {
    ...typography.scale.tag,
    color: colors.text.muted,
    marginBottom: spacing[1],
  },
  errorMessage: {
    ...typography.scale.bodyL,
    color: colors.text.primary,
    fontFamily: typography.fonts.mono,
  },
  stackTrace: {
    ...typography.scale.caption,
    color: colors.text.secondary,
    fontFamily: typography.fonts.mono,
    fontSize: 10,
    lineHeight: 14,
  },
  actions: {
    gap: spacing[3],
  },
  primaryButton: {
    backgroundColor: colors.accent.primary,
    padding: spacing[4],
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  primaryButtonText: {
    ...typography.scale.tag,
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: spacing[4],
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  secondaryButtonText: {
    ...typography.scale.tag,
    color: colors.text.secondary,
  },
});
