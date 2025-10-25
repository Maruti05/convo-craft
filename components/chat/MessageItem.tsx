import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { Message } from '@/hooks/useRealtimeMessages';

export function MessageItem({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <View style={[styles.container, isOwn ? styles.right : styles.left]}>
      {message.type === 'image' && message.image_url ? (
        <Image source={{ uri: message.image_url }} style={styles.image} />
      ) : (
        <Text style={styles.text}>{message.content}</Text>
      )}
      <Text style={styles.meta}>{new Date(message.created_at).toLocaleTimeString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '75%',
    marginVertical: 6,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  left: {
    alignSelf: 'flex-start',
  },
  right: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563EB',
  },
  text: {
    color: '#111827',
    fontSize: 16,
  },
  meta: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 8,
  },
});