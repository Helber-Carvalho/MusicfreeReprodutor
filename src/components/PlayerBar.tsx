import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Music } from '../models/Music';

interface PlayerBarProps {
  currentMusic: Music | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function PlayerBar({ currentMusic, isPlaying, onPlayPause, onNext, onPrevious }: PlayerBarProps) {
  if (!currentMusic) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No music selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{currentMusic.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{currentMusic.artist}</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity onPress={onPrevious} style={styles.controlButton}>
          <Text style={styles.controlIcon}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext} style={styles.controlButton}>
          <Text style={styles.controlIcon}>⏭</Text>
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
    borderTopWidth: 0.5,
    borderTopColor: '#333',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  artist: {
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    padding: 8,
  },
  controlIcon: {
    fontSize: 20,
  },
  playButton: {
    backgroundColor: '#1DB954',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 18,
  },
});
