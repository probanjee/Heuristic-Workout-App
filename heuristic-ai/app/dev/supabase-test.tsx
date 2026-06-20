/**
 * File: app/dev/supabase-test.tsx
 * Purpose: Developer screen to test Supabase connectivity and auth state
 * Dependencies: react-native, lib/supabase, lib/auth, components/ui
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { getCurrentUser, getSession, signOut } from '../../lib/auth';

export default function SupabaseTestScreen() {
  const [status, setStatus] = useState<string>('Connecting...');
  const [user, setUser] = useState<any>(null);
  const [sessionCount, setSessionCount] = useState<number>(0);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const session = await getSession();
      const currentUser = await getCurrentUser();
      
      setUser(currentUser);
      
      if (currentUser) {
        setStatus('Connected (Authenticated)');
        fetchSessionCount(currentUser.id);
      } else {
        setStatus('Connected (Unauthenticated)');
      }
    } catch (error: any) {
      setStatus(`Connection Error: ${error.message}`);
    }
  };

  const fetchSessionCount = async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (!error && count !== null) {
        setSessionCount(count);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestUpload = async () => {
    Alert.alert('Upload Test', 'Triggered mock upload job');
    // Implement mock call to sync engine if needed
  };

  const handleTestFetch = async () => {
    Alert.alert('Fetch Test', 'Triggered mock fetch job');
    // Implement mock call to profile sync if needed
  };

  const handleSignOut = async () => {
    await signOut();
    checkConnection();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Connection Status:</Text>
        <Text style={styles.value}>{status}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Current User:</Text>
        <Text style={styles.value}>{user ? user.email : 'None'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Remote Sessions Found:</Text>
        <Text style={styles.value}>{sessionCount}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={handleTestUpload}>
          <Text style={styles.buttonText}>Test Upload Job</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleTestFetch}>
          <Text style={styles.buttonText}>Test Fetch Job</Text>
        </TouchableOpacity>
        
        {user && (
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  label: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
