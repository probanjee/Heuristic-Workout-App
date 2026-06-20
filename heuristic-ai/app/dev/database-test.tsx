/**
 * File: app/dev/database-test.tsx
 * Purpose: Dev utility screen for verifying database connections, seeding, and queries
 * Dependencies: react, react-native, expo-router, lucide-react-native, @/components/ui, @/database, @/database/seed/exercises.seed
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Database as DbIcon, ShieldCheck, Play } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { database } from '@/database';
import { seedExercises } from '@/database/seed/exercises.seed';
import { H2, H3, BodyMedium, BodySmall, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function DatabaseTestScreen() {
  const router = useRouter();
  const [dbStatus, setDbStatus] = useState<'CHECKING' | 'CONNECTED' | 'ERROR'>('CHECKING');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [exerciseCount, setExerciseCount] = useState<number | null>(null);
  const [firstFiveNames, setFirstFiveNames] = useState<string[]>([]);
  const [seeding, setSeeding] = useState<boolean>(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setDbStatus('CHECKING');
    try {
      // Perform simple count query to verify DB initialization and schema
      const count = await database.get('exercises').query().fetchCount();
      setDbStatus('CONNECTED');
      setExerciseCount(count);
      
      // Fetch names to show
      const list = await database.get('exercises').query().fetch();
      const names = list.slice(0, 5).map((item: any) => item.name);
      setFirstFiveNames(names);
    } catch (error) {
      console.error('[HeuristicAI] DB Connection check failed:', error);
      setDbStatus('ERROR');
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedExercises(database);
      await checkConnection();
    } catch (error) {
      console.error('[HeuristicAI] Seeding failed:', error);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setSeeding(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
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
        <H2 style={styles.headerTitle}>DATABASE DEV TOOL</H2>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* DB Connection Status */}
        <Card style={styles.card} variant="elevated">
          <View style={styles.statusRow}>
            <DbIcon size={24} color={dbStatus === 'CONNECTED' ? colors.success : colors.danger} />
            <H3 style={{ marginLeft: spacing[2] }}>CONNECTION STATUS</H3>
          </View>
          
          <View style={[
            styles.statusBadge, 
            { backgroundColor: dbStatus === 'CONNECTED' ? 'rgba(0, 255, 135, 0.15)' : 'rgba(255, 59, 59, 0.15)' }
          ]}>
            <Caption style={{ 
              color: dbStatus === 'CONNECTED' ? colors.success : colors.danger,
              fontFamily: 'DMMono_500Medium'
            }}>
              {dbStatus}
            </Caption>
          </View>

          {dbStatus === 'ERROR' && (
            <BodySmall style={styles.errorText}>
              Error details: {errorMessage}
            </BodySmall>
          )}
        </Card>

        {/* Database Stats */}
        <Card style={styles.card}>
          <H3 style={{ color: colors.accent.primary, marginBottom: spacing[4] }}>
            SEED & STATISTICS
          </H3>

          <View style={styles.statRow}>
            <BodyMedium>Total Seeded Exercises:</BodyMedium>
            <BodyMedium style={{ fontFamily: 'DMMono_500Medium', color: colors.accent.primary }}>
              {exerciseCount !== null ? exerciseCount : '--'}
            </BodyMedium>
          </View>

          <View style={styles.buttonRow}>
            <Button
              variant="primary"
              onPress={handleSeed}
              loading={seeding}
              style={{ flex: 1, marginRight: spacing[2] }}
              accessibilityLabel="Seed exercises into database"
            >
              SEED EXERCISES
            </Button>
            <Button
              variant="secondary"
              onPress={checkConnection}
              style={{ flex: 1 }}
              accessibilityLabel="Refresh exercise count"
            >
              COUNT EXERCISES
            </Button>
          </View>
        </Card>

        {/* Seeded Exercises List */}
        {firstFiveNames.length > 0 && (
          <Card style={styles.card} variant="glass">
            <H3 style={{ color: colors.warning, marginBottom: spacing[2] }}>
              SAMPLE RECORDS (FIRST 5)
            </H3>
            <View style={styles.list}>
              {firstFiveNames.map((name, index) => (
                <View key={index} style={styles.listItem}>
                  <Play size={10} color={colors.accent.primary} style={{ marginRight: spacing[2] }} />
                  <BodyMedium>{name}</BodyMedium>
                </View>
              ))}
            </View>
          </Card>
        )}
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
    gap: spacing[4],
  },
  card: {
    padding: spacing[4],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
    marginBottom: spacing[2],
  },
  errorText: {
    color: colors.danger,
    marginTop: spacing[2],
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderColor: colors.border.subtle,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  list: {
    marginTop: spacing[2],
    gap: spacing[2],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
});
