import { ChatGrid } from '@/components/chat/ChatGrid';
import { Screen } from '@/components/layout/Screen';
import { useRoomActivity } from '@/hooks/useRoomActivity';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function GroupsScreen() {
  const { loading, error,groups } = useRoomActivity();
  const { high, medium, low } = groups;
  const router = useRouter();

  const onSelect = (id: string) => {
    router.push({ pathname: '/(tabs)/chat/[room]', params: { room: id } });
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text>Loading...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.error}>Error: {error}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor="#F3F4F6">
      <View style={styles.container}>
        <Text style={styles.header}>Groups</Text>
        <Text style={styles.subheader}>Join a public channel to chat</Text>
        <Text style={styles.sectionTitle}>Highly Active</Text>
        <ChatGrid rooms={high} onSelect={onSelect} />
        <Text style={styles.sectionTitle}>Moderately Active</Text>
        <ChatGrid rooms={medium} onSelect={onSelect} />
        <Text style={styles.sectionTitle}>Less Active</Text>
        <ChatGrid rooms={low} onSelect={onSelect} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },
  error: {
    color: 'red',
  },
});
