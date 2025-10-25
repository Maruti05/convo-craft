import { Screen } from '@/components/layout/Screen';
import { UserGrid } from '@/components/users/UserGrid';
import { useUsers } from '@/hooks/useUsers';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function HomeTab() {
  const router = useRouter();
  const { users, loading, error } = useUsers();

  const openDM = (userId: string) => {
    const myId = 'me'; // TODO: replace with actual session user id
    const roomId = [myId, userId].sort().join(':');
    router.push({ pathname: '/chat/[room]', params: { room: roomId } });
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
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
    <Screen>
      <View style={styles.container}>
        <Text style={styles.header}>Active Users</Text>
        <UserGrid users={users} onSelect={(id) => openDM(id)} />
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
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  error: {
    color: 'red',
  },
});