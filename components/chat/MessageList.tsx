import React from 'react';
import { FlatList, View } from 'react-native';
import type { Message } from '@/hooks/useRealtimeMessages';
import { MessageItem } from './MessageItem';

export function MessageList({ messages, currentUserId }: { messages: Message[]; currentUserId?: string }) {
  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MessageItem message={item} isOwn={item.user_id === currentUserId} />
      )}
      contentContainerStyle={{ padding: 12 }}
      ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
    />
  );
}