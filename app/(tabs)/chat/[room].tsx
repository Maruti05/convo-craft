import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useSession } from '@/hooks/useSession';
import { useLocalSearchParams } from 'expo-router';
import { pickImage, uploadImage } from '@/lib/upload';
import { Screen } from '@/components/layout/Screen';

export default function ChatRoomScreen() {
  const params = useLocalSearchParams<{ room: string }>();
  const roomId = useMemo(() => String(params.room || 'public'), [params.room]);
  const { user } = useSession();
  const { messages, sendText, sendImage, error } = useRealtimeMessages(roomId);

  const onSendText = (text: string) => {
    if (!user) return;
    sendText(user.id, text).catch(() => {});
  };

  const onPickImage = async () => {
    if (!user) return;
    const uri = await pickImage();
    if (!uri) return;
    try {
      const publicUrl = await uploadImage(uri, roomId);
      await sendImage(user.id, publicUrl);
    } catch {
      // Ignore upload errors for now; surfaced elsewhere
    }
  };

  return (
    <ErrorBoundary>
      <Screen>
        <View style={styles.container}>
          {error ? (
            <View style={styles.banner}><Text style={styles.bannerText}>Error: {error}</Text></View>
          ) : null}
          <View style={styles.list}>
            <MessageList messages={messages} currentUserId={user?.id} />
          </View>
          <ChatInput onSendText={onSendText} onPickImage={onPickImage} disabled={!user} />
        </View>
      </Screen>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  banner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FEE2E2',
    borderBottomWidth: 1,
    borderColor: '#FCA5A5',
  },
  bannerText: {
    color: '#7F1D1D',
    fontSize: 13,
    fontWeight: '600',
  },
});