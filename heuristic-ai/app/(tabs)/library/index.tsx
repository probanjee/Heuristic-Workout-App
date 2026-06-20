/**
 * HeuristicAI — Library Tab Screen
 */

import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/constants/theme';

export default function LibraryScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        <Text style={{ ...typography.scale.h1, color: colors.text.primary }}>
          LIBRARY
        </Text>
        <Text
          style={{
            ...typography.scale.bodyM,
            color: colors.text.secondary,
            marginTop: spacing[1],
          }}
        >
          25 exercises — Week 3 implementation
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
