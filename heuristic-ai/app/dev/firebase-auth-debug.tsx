/**
 * HeuristicAI — Firebase Authentication Developer Debug Screen
 * Location: app/dev/firebase-auth-debug.tsx
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../constants/theme';
import AuthService from '../../services/auth/auth-service';
import useAuth from '../../hooks/useAuth';

export default function FirebaseAuthDebugScreen() {
  const router = useRouter();
  const { user, logout, loading: hookLoading, isAnonymous } = useAuth();
  
  const [cachedToken, setCachedToken] = useState<string | null>(null);
  const [cachedUser, setCachedUser] = useState<any | null>(null);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<string>('UNKNOWN');

  const checkCachedData = async () => {
    const token = await AuthService.getCachedIdToken();
    const info = await AuthService.getCachedUserInfo();
    setCachedToken(token ? `${token.slice(0, 15)}...${token.slice(-15)}` : 'NULL');
    setCachedUser(info);

    // Check WatermelonDB profile status
    try {
      const { usersCollection } = require('../../database');
      const users = await usersCollection.query().fetch();
      if (users.length > 0) {
        const local = users[0];
        setDbStatus(`LOADED: UID=${local.firebaseUid || 'NULL'}, NAME=${local.displayName}`);
      } else {
        setDbStatus('NO LOCAL PROFILE FOUND');
      }
    } catch (e) {
      setDbStatus(`ERROR: ${e instanceof Error ? e.message : 'DB Failure'}`);
    }
  };

  useEffect(() => {
    checkCachedData();
  }, [user]);

  const handleForceRefresh = async () => {
    setRefreshLoading(true);
    try {
      const token = await AuthService.forceTokenRefresh();
      if (token) {
        alert('TOKEN REFRESH SUCCESSFUL');
      } else {
        alert('FAILED - NO USER SIGNED IN');
      }
      checkCachedData();
    } catch (e) {
      alert(`REFRESH ERROR: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      checkCachedData();
    } catch (e) {
      alert(`SIGNOUT ERROR: ${e instanceof Error ? e.message : 'Unknown'}`);
    }
  };

  const handleLinkMock = async () => {
    if (!AuthService.auth.currentUser) {
      alert('MUST SIGN IN AS GUEST FIRST');
      return;
    }
    try {
      // Trigger a mock db rewrite
      await AuthService.updateLocalDatabaseUid(AuthService.auth.currentUser.uid, 'upgrade_mock@example.com');
      alert('LOCAL PROFILE REWRITTEN SUCCESSFULLY');
      checkCachedData();
    } catch (e) {
      alert(`UPGRADE ERROR: ${e instanceof Error ? e.message : 'Unknown'}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        
        {/* Go back */}
        <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')} style={{ marginBottom: spacing[4] }}>
          <Text style={{ color: colors.text.secondary, fontSize: 13 }}>← BACK TO PROFILE</Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={{ marginVertical: spacing[4] }}>
          <Text style={{ ...typography.scale.h2, color: colors.accent.primary }}>
            AUTH DEBUG CONSOLE
          </Text>
          <Text style={{ ...typography.scale.caption, color: colors.text.secondary, marginTop: 4 }}>
            INSPECT REAL-TIME FIREBASE SESSION DATA
          </Text>
        </View>

        {/* Section: Auth Hook Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>[STATE: HOOK STATE]</Text>
          <View style={styles.row}>
            <Text style={styles.label}>SESSION STATUS:</Text>
            <Text style={[styles.val, { color: user ? colors.accent.primary : colors.danger }]}>
              {user ? (isAnonymous ? 'ANONYMOUS GUEST' : 'AUTHENTICATED') : 'SIGNED OUT'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>HOOK LOADING:</Text>
            <Text style={styles.val}>{hookLoading ? 'TRUE' : 'FALSE'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>FIREBASE UID:</Text>
            <Text style={[styles.val, { fontFamily: 'DMSans_400Regular' }]}>{user?.uid || 'NULL'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>EMAIL ADDRESS:</Text>
            <Text style={styles.val}>{user?.email || 'NULL'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>IS ANONYMOUS:</Text>
            <Text style={styles.val}>{isAnonymous ? 'TRUE' : 'FALSE'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PROVIDER ID:</Text>
            <Text style={styles.val}>{user?.providerData?.[0]?.providerId || (isAnonymous ? 'firebase' : 'NULL')}</Text>
          </View>
        </View>

        {/* Section: Cache Store Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>[STATE: SECURE STORE CACHE]</Text>
          <View style={styles.row}>
            <Text style={styles.label}>CACHED JWT TOKEN:</Text>
            <Text style={styles.val} numberOfLines={1}>{cachedToken || 'NULL'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CACHED USER UID:</Text>
            <Text style={styles.val}>{cachedUser?.uid || 'NULL'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CACHED ANONYMOUS:</Text>
            <Text style={styles.val}>{cachedUser?.isAnonymous ? 'TRUE' : 'FALSE'}</Text>
          </View>
        </View>

        {/* Section: SQLite WatermelonDB status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>[STATE: LOCAL WATERMELONDB]</Text>
          <Text style={[styles.val, { fontSize: 12, marginTop: 4 }]}>{dbStatus}</Text>
        </View>

        {/* Section: Actions */}
        <View style={{ gap: spacing[3], marginTop: spacing[6] }}>
          <Text style={styles.sectionTitle}>[CONSOLE ACTIONS]</Text>

          <TouchableOpacity style={styles.btn} onPress={handleForceRefresh} disabled={refreshLoading}>
            {refreshLoading ? (
              <ActivityIndicator color={colors.accent.primary} size="small" />
            ) : (
              <Text style={styles.btnText}>FORCE TOKEN REFRESH</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={handleLinkMock}>
            <Text style={styles.btnText}>MOCK UPGRADE LOCAL UID</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, { borderColor: colors.danger }]} onPress={handleSignOut}>
            <Text style={[styles.btnText, { color: colors.danger }]}>LOGOUT USER SESSION</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 4,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: spacing[2],
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  label: {
    fontFamily: 'Syne_700Bold',
    fontSize: 11,
    color: colors.text.secondary,
  },
  val: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.text.primary,
  },
  btn: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 4,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
    color: colors.accent.primary,
    letterSpacing: 0.5,
  },
});
