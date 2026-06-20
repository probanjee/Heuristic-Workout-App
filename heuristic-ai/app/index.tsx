import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { storageAdapter } from '@/services/storage/storage-adapter';
import { useUserStore } from '@/store/user.store';

const ONBOARDING_KEY = 'onboarding_complete';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);
  const _hasHydrated = useUserStore((s) => s._hasHydrated);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!_hasHydrated) return;
      try {
        const value = await storageAdapter.getItem(ONBOARDING_KEY);
        if (value === 'true') {
          useUserStore.setState({ onboardingComplete: true });
        } else {
          useUserStore.setState({ onboardingComplete: false });
        }
      } catch (err) {
        console.error('[HeuristicAI] storageAdapter read failed:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();
  }, [_hasHydrated]);

  if (!_hasHydrated || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0A0A0A',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#00FF87" />
      </View>
    );
  }

  if (onboardingComplete) {
    return <Redirect href="/(tabs)/workout" />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}

