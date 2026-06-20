/**
 * HeuristicAI — GuestModeCard Component
 * Brutalist layout detailing Anonymous Guest constraints and actions.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../../constants/theme';

interface GuestModeCardProps {
  onPressGuest: () => void;
  loading?: boolean;
}

export const GuestModeCard: React.FC<GuestModeCardProps> = ({ onPressGuest, loading = false }) => {
  return (
    <View
      style={{
        backgroundColor: colors.bg.secondary,
        borderWidth: 1,
        borderColor: colors.warning,
        borderRadius: 4,
        padding: spacing[4],
        marginTop: spacing[2],
        gap: spacing[3],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
        <Text style={{ fontFamily: 'Syne_800ExtraBold', fontSize: 14, color: colors.warning }}>
          [!] OFFLINE GUEST MODE
        </Text>
      </View>
      <Text
        style={{
          fontFamily: 'IBMPlexSans_400Regular',
          fontSize: 12,
          color: colors.text.secondary,
          lineHeight: 16,
        }}
      >
        You can train and log workouts immediately. All data will be saved locally on this device. However, if you delete the app or lose your phone, your progress will be lost. You can upgrade to a permanent account at any time in Settings.
      </Text>
      <TouchableOpacity
        onPress={onPressGuest}
        disabled={loading}
        style={{
          backgroundColor: colors.bg.elevated,
          borderWidth: 1,
          borderColor: colors.border.default,
          paddingVertical: spacing[3],
          borderRadius: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <ActivityIndicator color={colors.accent.primary} size="small" />
        ) : (
          <Text
            style={{
              fontFamily: 'Syne_700Bold',
              fontSize: 12,
              color: colors.accent.primary,
              letterSpacing: 0.5,
            }}
          >
            START TRAINING AS GUEST
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default GuestModeCard;
