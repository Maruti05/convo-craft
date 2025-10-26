import React, { useEffect, useState } from 'react';
import { Screen } from '@/components/layout/Screen';
import { View, Text, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuthContext } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { user, signOut } = useAuthContext();
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem('theme').then(v => setDark(v === 'dark'));
  }, []);

  const toggleDark = async () => {
    const next = !dark;
    setDark(next);
    await AsyncStorage.setItem('theme', next ? 'dark' : 'light');
    Alert.alert('Theme updated', 'Restart the app to apply the theme.');
  };

  const deleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will remove your profile and sign you out. Deleting the auth account requires admin privileges and is typically done server-side.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user) await supabase.from('profiles').delete().eq('id', user.id);
              await signOut();
              router.replace('/(auth)/login');
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.header}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Dark Mode</Text>
            <Switch value={dark} onValueChange={toggleDark} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Pressable style={styles.row} onPress={() => router.push('/(tabs)/about')}>
            <Text style={styles.label}>About</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </Pressable>
          <Pressable style={styles.row} onPress={deleteAccount}>
            <Text style={[styles.label, { color: '#D32F2F' }]}>Delete Account</Text>
            <Ionicons name="trash-outline" size={20} color="#D32F2F" />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#111827' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  label: { fontSize: 16, color: '#111827' },
});