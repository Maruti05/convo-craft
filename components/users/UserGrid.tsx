import React, { useMemo, useRef } from 'react';
import { FlatList, StyleSheet, View, Animated, Text, Image, Pressable } from 'react-native';
import type { UserSummary } from '@/hooks/useUsers';

export type UserFeedItem = UserSummary & {
  lastMessage?: string;
  unreadCount?: number;
  lastActive?: string; // ISO string
};

export function UserGrid({ users, onSelect }: { users: UserFeedItem[]; onSelect: (id: string) => void }) {
  const fade = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [fade]);

  const data = useMemo(() => users, [users]);

  const renderItem = ({ item }: { item: UserFeedItem }) => {
    const letter = item.title?.[0]?.toUpperCase() ?? '#';
    const timeText = formatTimestamp(item.lastActive);
    const hasUnread = (item.unreadCount ?? 0) > 0;

    return (
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={() => onSelect(item.id)}>
        <View style={styles.avatarWrapper}>
          {item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLetter}>{letter}</Text>
            </View>
          )}
          <View style={[styles.statusDot, item.online ? styles.online : styles.offline]} />
        </View>

        <View style={styles.centerCol}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          </View>
          <Text style={styles.preview} numberOfLines={1}>{item.lastMessage ?? 'Say hello 👋'}</Text>
        </View>

        <View style={styles.metaCol}>
          <Text style={styles.timestamp}>{timeText}</Text>
          {hasUnread && (
            <View style={styles.badge}><Text style={styles.badgeText}>{Math.min(item.unreadCount!, 99)}</Text></View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <Animated.View style={{ opacity: fade, flex: 1 }}>
      {data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No users yet</Text>
          <Text style={styles.emptyBody}>Users appear when they join or send messages.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.list}
          initialNumToRender={12}
          windowSize={4}
        />
      )}
    </Animated.View>
  );
}

function formatTimestamp(iso?: string) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 76, // indent to align with text, below avatar
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  rowPressed: {
    backgroundColor: '#F9FAFB',
  },
  avatarWrapper: {
    position: 'relative',
    width: 48,
    height: 48,
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  statusDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  online: { backgroundColor: '#10B981' },
  offline: { backgroundColor: '#9CA3AF' },
  centerCol: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  preview: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  metaCol: {
    alignItems: 'flex-end',
    minWidth: 64,
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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