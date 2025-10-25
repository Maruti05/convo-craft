import React, { useMemo, useRef } from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions, Animated, Text } from 'react-native';
import { UserCard } from './UserCard';
import type { UserSummary } from '@/hooks/useUsers';

export function UserGrid({ users, onSelect }: { users: UserSummary[]; onSelect: (id: string) => void }) {
  const { width } = useWindowDimensions();

  const numColumns = useMemo(() => {
    if (width >= 1200) return 4;
    if (width >= 900) return 3;
    if (width >= 600) return 2;
    return 1;
  }, [width]);

  const fade = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fade]);

  const renderItem = ({ item }: { item: UserSummary }) => (
    <View style={styles.item}>
      <UserCard title={item.title} thumbnail={item.thumbnail} online={item.online} onPress={() => onSelect(item.id)} />
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}> 
      {users.length === 0 ? (
        <View style={styles.empty}> 
          <Text style={styles.emptyTitle}>No users yet</Text>
          <Text style={styles.emptyBody}>Users appear here when they join or send messages.</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          key={numColumns}
          numColumns={numColumns}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          initialNumToRender={8}
          windowSize={3}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  item: {
    flex: 1,
    marginVertical: 8,
    marginHorizontal: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 14,
    color: '#6B7280',
  },
});