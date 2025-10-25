import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/components/useColorScheme';

export type ScreenProps = {
  children: React.ReactNode;
  backgroundColor?: string;
  keyboardVerticalOffset?: number;
  contentStyle?: any;
};

export function Screen({ children, backgroundColor, keyboardVerticalOffset = 0, contentStyle }: ScreenProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const bg = backgroundColor ?? (isDark ? '#0B1220' : '#F3F4F6');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={bg} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <View style={[styles.flex, contentStyle]}> {children} </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
});