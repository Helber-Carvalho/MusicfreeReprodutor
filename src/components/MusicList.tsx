import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Music } from '../models/Music';
import { MusicListItem } from './MusicListItem';

interface MusicListProps {
  musics: Music[];
  selectedIds: Set<string>;
  selectionMode: boolean;
  onSelect: (music: Music) => void;
  onPress: (music: Music) => void;
  onLongPress: (music: Music) => void;
}

export function MusicList({ musics, selectedIds, selectionMode, onSelect, onPress, onLongPress }: MusicListProps) {
  return (
    <FlatList
      data={musics}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MusicListItem
          music={item}
          isSelected={selectedIds.has(item.id)}
          selectionMode={selectionMode}
          onSelect={onSelect}
          onPress={onPress}
          onLongPress={onLongPress}
        />
      )}
      style={styles.list}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    paddingBottom: 16,
  },
});
