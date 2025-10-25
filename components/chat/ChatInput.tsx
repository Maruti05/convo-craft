import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

export function ChatInput({ onSendText, onPickImage, disabled }: { onSendText: (text: string) => void; onPickImage: () => void; disabled?: boolean }) {
  const [text, setText] = useState('');

  const send = () => {
    const value = text.trim();
    if (!value) return;
    onSendText(value);
    setText('');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imageBtn} onPress={onPickImage} disabled={disabled}>
        <Text style={styles.imageBtnText}>+</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type a message"
        placeholderTextColor="#9CA3AF"
      />
      <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={disabled}>
        <Text style={styles.sendText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 8,
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBtnText: {
    fontSize: 20,
    color: '#374151',
  },
});