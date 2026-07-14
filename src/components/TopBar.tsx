import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TopBarProps {
  onSettingsPress: () => void;
  onQueuePress: () => void;
}

export function TopBar({ onSettingsPress, onQueuePress }: TopBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MusicApp</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onQueuePress} style={styles.button}>
          <Text style={styles.icon}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSettingsPress} style={styles.button}>
          <Text style={styles.icon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E1E1E',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    padding: 8,
  },
  icon: {
    fontSize: 22,
  },
});
