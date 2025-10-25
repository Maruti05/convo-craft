import React, { useMemo, useRef } from 'react';
import { Pressable, Text, View, Image, StyleSheet, Animated } from 'react-native';

export type UserCardProps = {
  title: string;
  thumbnail?: string | null;
  online?: boolean;
  onPress: () => void;
};

export const UserCard = React.memo(function UserCard({ title, thumbnail, online, onPress }: UserCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const avatar = useMemo(() => {
    if (thumbnail) return (
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: thumbnail }} style={styles.thumbImage} />
        <View style={[styles.statusDot, online ? styles.online : styles.offline]} />
      </View>
    );
    const letter = title?.[0]?.toUpperCase() ?? '#';
    return (
      <View style={styles.avatarWrapper}>
        <View style={styles.thumbPlaceholder}>
          <Text style={styles.thumbLetter}>{letter}</Text>
        </View>
        <View style={[styles.statusDot, online ? styles.online : styles.offline]} />
      </View>
    );
  }, [thumbnail, title, online]);

  const animateTo = (toValue: number) => {
    Animated.spring(scale, { toValue, useNativeDriver: true, friction: 6, tension: 80 }).start();
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}> 
      <Pressable
        onPress={onPress}
        onHoverIn={() => animateTo(1.03)}
        onHoverOut={() => animateTo(1)}
        onPressIn={() => animateTo(0.98)}
        onPressOut={() => animateTo(1)}
        style={({ pressed, hovered }) => [
          styles.pressable,
          hovered && styles.hovered,
          pressed && styles.pressed,
        ]}
      >
        {avatar}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pressable: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hovered: {
    backgroundColor: '#F9FAFB',
  },
  pressed: {
    backgroundColor: '#F3F4F6',
  },
  avatarWrapper: {
    position: 'relative',
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statusDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  online: {
    backgroundColor: '#10B981',
  },
  offline: {
    backgroundColor: '#9CA3AF',
  },
  thumbImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  thumbPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  thumbLetter: {
    fontSize: 28,
    fontWeight: '700',
    color: '#374151',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});