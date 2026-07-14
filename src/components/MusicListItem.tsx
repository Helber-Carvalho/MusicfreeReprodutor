import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Music } from '../models/Music';
import { formatDuration } from '../utils/format';

interface MusicListItemProps {
  music: Music;
  isSelected: boolean;
  selectionMode: boolean;
  onSelect: (music: Music) => void;
  onPress: (music: Music) => void;
  onLongPress: (music: Music) => void;
}

export function MusicListItem({ music, isSelected, selectionMode, onSelect, onPress, onLongPress }: MusicListItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={() => selectionMode ? onSelect(music) : onPress(music)}
      onLongPress={() => onLongPress(music)}
      activeOpacity={0.7}
    >
      {selectionMode && (
        <TouchableOpacity onPress={() => onSelect(music)} style={styles.checkbox}>
          <Text style={styles.checkboxIcon}>{isSelected ? '☑' : '☐'}</Text>
        </TouchableOpacity>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{music.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{music.artist}</Text>
      </View>
      <Text style={styles.duration}>{formatDuration(music.duration)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2A2A2A',
  },
  selected: {
    backgroundColor: '#1E3A2A',
  },
  checkbox: {
    paddingRight: 12,
  },
  checkboxIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  artist: {
    fontSize: 13,
    color: '#AAAAAA',
    marginTop: 2,
  },
  duration: {
    fontSize: 13,
    color: '#888888',
  },
});
