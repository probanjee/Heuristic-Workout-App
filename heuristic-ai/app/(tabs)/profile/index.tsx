/**
 * HeuristicAI — Profile Tab Screen
 */

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useUserStore } from '@/store/user.store';
import { colors, spacing, typography } from '@/constants/theme';
import SyncStatusBadge from '@/components/sync/SyncStatusBadge';
import SyncProgressBar from '@/components/sync/SyncProgressBar';
import LastSyncIndicator from '@/components/sync/LastSyncIndicator';

export default function ProfileScreen() {
  const profile = useUserStore((s) => s.profile);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing[6],
          }}
        >
          <Text style={{ ...typography.scale.h1, color: colors.text.primary }}>
            PROFILE
          </Text>
          <Link href="/settings" asChild>
            <TouchableOpacity accessibilityLabel="Settings">
              <Settings size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Profile card */}
        <View
          style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 8,
            padding: spacing[4],
            borderWidth: 1,
            borderColor: colors.border.default,
            marginBottom: spacing[4],
          }}
        >
          <Text style={{ ...typography.scale.h2, color: colors.text.primary }}>
            {profile?.displayName ?? 'Athlete'}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: spacing[2],
              marginTop: spacing[2],
            }}
          >
            <View
              style={{
                backgroundColor: colors.accent.dim,
                borderRadius: 4,
                paddingHorizontal: spacing[2],
                paddingVertical: spacing[1],
              }}
            >
              <Text style={{ ...typography.scale.caption, color: colors.accent.primary }}>
                {(profile?.goal ?? 'strength').toUpperCase()}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.bg.elevated,
                borderRadius: 4,
                paddingHorizontal: spacing[2],
                paddingVertical: spacing[1],
              }}
            >
              <Text style={{ ...typography.scale.caption, color: colors.text.secondary }}>
                {(profile?.trainingLevel ?? 'intermediate').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Sync Status Section */}
        <View style={{ marginBottom: spacing[4] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <SyncStatusBadge />
            <LastSyncIndicator />
          </View>
          <SyncProgressBar />
        </View>

        {/* Dev Options */}
        <View style={{ marginTop: spacing[6] }}>
          <Text
            style={{
              ...typography.scale.label,
              color: colors.text.muted,
              marginBottom: spacing[2],
            }}
          >
            DEVELOPMENT TOOLS
          </Text>
          <Link href="/dev/design-system" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 8,
                padding: spacing[4],
                borderWidth: 1,
                borderColor: colors.border.default,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              accessibilityLabel="View design system showcase"
            >
              <Text
                style={{
                  ...typography.scale.bodyM,
                  fontFamily: 'Syne_700Bold',
                  color: colors.accent.primary,
                }}
              >
                VIEW DESIGN SYSTEM
              </Text>
              <Text style={{ ...typography.scale.label, color: colors.text.muted }}>
                →
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/dev/database-test" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 8,
                padding: spacing[4],
                borderWidth: 1,
                borderColor: colors.border.default,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: spacing[2],
              }}
              accessibilityLabel="View database developer tools"
            >
              <Text
                style={{
                  ...typography.scale.bodyM,
                  fontFamily: 'Syne_700Bold',
                  color: colors.accent.primary,
                }}
              >
                DATABASE DEV TOOL
              </Text>
              <Text style={{ ...typography.scale.label, color: colors.text.muted }}>
                →
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/dev/heuristic-engine-test" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 8,
                padding: spacing[4],
                borderWidth: 1,
                borderColor: colors.border.default,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: spacing[2],
              }}
              accessibilityLabel="View heuristic engine test tool"
            >
              <Text
                style={{
                  ...typography.scale.bodyM,
                  fontFamily: 'Syne_700Bold',
                  color: colors.accent.primary,
                }}
              >
                HEURISTIC ENGINE TESTER
              </Text>
              <Text style={{ ...typography.scale.label, color: colors.text.muted }}>
                →
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/dev/analytics-preview" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 8,
                padding: spacing[4],
                borderWidth: 1,
                borderColor: colors.border.default,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: spacing[2],
              }}
              accessibilityLabel="View analytics and progress dashboard developer tools"
            >
              <Text
                style={{
                  ...typography.scale.bodyM,
                  fontFamily: 'Syne_700Bold',
                  color: colors.accent.primary,
                }}
              >
                ANALYTICS SANDBOX
              </Text>
              <Text style={{ ...typography.scale.label, color: colors.text.muted }}>
                →
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/dev/firebase-auth-debug" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 8,
                padding: spacing[4],
                borderWidth: 1,
                borderColor: colors.border.default,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: spacing[2],
              }}
              accessibilityLabel="View Firebase Authentication developer tools"
            >
              <Text
                style={{
                  ...typography.scale.bodyM,
                  fontFamily: 'Syne_700Bold',
                  color: colors.accent.primary,
                }}
              >
                FIREBASE AUTH DEBUGGER
              </Text>
              <Text style={{ ...typography.scale.label, color: colors.text.muted }}>
                →
              </Text>
             </TouchableOpacity>
          </Link>

          <Link href={"/dev/sync-debug" as any} asChild>
            <TouchableOpacity
              style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 8,
                padding: spacing[4],
                borderWidth: 1,
                borderColor: colors.border.default,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: spacing[2],
              }}
              accessibilityLabel="View synchronization developer tools"
            >
              <Text
                style={{
                  ...typography.scale.bodyM,
                  fontFamily: 'Syne_700Bold',
                  color: colors.accent.primary,
                }}
              >
                SYNC DEBUG CONSOLE
              </Text>
              <Text style={{ ...typography.scale.label, color: colors.text.muted }}>
                →
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href={"/dev/system-health" as any} asChild>
            <TouchableOpacity
              style={{
                backgroundColor: colors.bg.secondary,
                borderRadius: 8,
                padding: spacing[4],
                borderWidth: 1,
                borderColor: colors.border.default,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: spacing[2],
              }}
              accessibilityLabel="View application performance and crash metrics"
            >
              <Text
                style={{
                  ...typography.scale.bodyM,
                  fontFamily: 'Syne_700Bold',
                  color: colors.accent.primary,
                }}
              >
                SYSTEM HEALTH MONITOR
              </Text>
              <Text style={{ ...typography.scale.label, color: colors.text.muted }}>
                →
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

