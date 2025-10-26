import React from 'react';
import { Screen } from '@/components/layout/Screen';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const name = Constants.expoConfig?.name ?? 'Convo Craft';
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>About</Text>
        <Text style={styles.body}>{name} v{version}</Text>
        <Text style={styles.body}>Production-grade, real-time chat built with Expo + Supabase.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 14, color: '#6B7280', marginTop: 4, textAlign: 'center' },
});