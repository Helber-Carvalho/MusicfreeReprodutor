import React, { useState, useEffect, useCallback } from 'react';
import { View, Modal, Text, TouchableOpacity, SectionList, StyleSheet, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { TopBar } from '../components/TopBar';
import { SearchBar } from '../components/SearchBar';
import { MusicList } from '../components/MusicList';
import { PlayerBar } from '../components/PlayerBar';
import { musicRepository } from '../services/MusicRepository';
import { playerManager } from '../services/PlayerManager';
import { Music } from '../models/Music';

const SETTINGS_OPTIONS = ['Equalizer', 'Sound Quality', 'Sleep Timer', 'About'];

export function MainScreen() {
  const [search, setSearch] = useState('');
  const [musics, setMusics] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [currentMusic, setCurrentMusic] = useState<Music | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [queue, setQueue] = useState<Music[]>([]);

  useEffect(() => {
    musicRepository.loadSongs().then((songs) => {
      setMusics(songs);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    playerManager.subscribe((state) => {
      setCurrentMusic(state.music);
      setIsPlaying(state.status === 'PLAYING');
    });
    return () => playerManager.unsubscribe();
  }, []);

  const filtered = musics.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.artist.toLowerCase().includes(search.toLowerCase())
  );

  function toggleSelect(music: Music) {
    const next = new Set(selectedIds);
    if (next.has(music.id)) {
      next.delete(music.id);
    } else {
      next.add(music.id);
    }
    setSelectedIds(next);
  }

  function enterSelectionMode(music: Music) {
    setSelectionMode(true);
    setSelectedIds(new Set([music.id]));
  }

  function cancelSelection() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  function selectAll() {
    setSelectedIds(new Set(filtered.map((m) => m.id)));
  }

  const selectedMusics = filtered.filter((m) => selectedIds.has(m.id));

  function handleAddToPlaylist() {
    Alert.alert('Add to Playlist', 'Feature coming soon');
  }

  function handleDelete() {
    setShowDeleteConfirm(true);
  }

  function confirmDelete() {
    setMusics((prev) => prev.filter((m) => !selectedIds.has(m.id)));
    if (currentMusic && selectedIds.has(currentMusic.id)) {
      playerManager.stop();
    }
    cancelSelection();
    setShowDeleteConfirm(false);
  }

  function handlePlayNext() {
    if (!currentMusic) {
      const first = selectedMusics[0];
      if (first) playerManager.play(first);
    }
    setQueue((prev) => {
      const existing = new Set(prev.map((m) => m.id));
      const newItems = selectedMusics.filter((m) => !existing.has(m.id));
      const currentIdx = prev.findIndex((m) => m.id === currentMusic?.id);
      const insertAt = currentIdx >= 0 ? currentIdx + 1 : prev.length;
      const updated = [...prev];
      updated.splice(insertAt, 0, ...newItems);
      return updated;
    });
    cancelSelection();
  }

  const handlePress = useCallback(async (music: Music) => {
    if (selectionMode) {
      toggleSelect(music);
      return;
    }
    await playerManager.play(music);
    setQueue((prev) => {
      if (prev.find((m) => m.id === music.id)) return prev;
      return [...prev, music];
    });
  }, [selectionMode]);

  const handlePlayPause = useCallback(async () => {
    await playerManager.togglePlayPause();
  }, []);

  const handleNext = useCallback(async () => {
    if (currentMusic) {
      await playerManager.next(musics, currentMusic);
    }
  }, [currentMusic, musics]);

  const handlePrevious = useCallback(async () => {
    if (currentMusic) {
      await playerManager.previous(musics, currentMusic);
    }
  }, [currentMusic, musics]);

  function removeFromQueue(music: Music) {
    setQueue((prev) => prev.filter((m) => m.id !== music.id));
    if (currentMusic?.id === music.id) {
      const idx = queue.findIndex((m) => m.id === music.id);
      if (queue.length > 1) {
        const nextIdx = idx < queue.length - 1 ? idx + 1 : idx - 1;
        const nextMusic = queue[nextIdx];
        if (nextMusic) playerManager.play(nextMusic);
      } else {
        playerManager.stop();
      }
    }
  }

  const queueSections = [
    {
      title: 'Now Playing',
      data: currentMusic ? [currentMusic] : [],
    },
    {
      title: 'Up Next',
      data: currentMusic
        ? queue.filter((m) => m.id !== currentMusic.id)
        : queue,
    },
  ];

  async function handlePickFiles() {
    const picked = await musicRepository.pickAudioFiles();
    if (picked.length > 0) {
      setMusics((prev) => [...prev, ...picked]);
    }
  }

  return (
    <View style={styles.container}>
      {selectionMode ? (
        <View style={styles.selectionBar}>
          <TouchableOpacity onPress={cancelSelection}>
            <Text style={styles.selectionCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.selectionCount}>{selectedIds.size} selected</Text>
          <TouchableOpacity onPress={selectAll}>
            <Text style={styles.selectionAction}>Select All</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TopBar
          onSettingsPress={() => setShowSettings(true)}
          onQueuePress={() => setShowQueue(true)}
        />
      )}
      <SearchBar value={search} onChangeText={setSearch} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Loading music...</Text>
        </View>
      ) : musics.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Baixe musicas pirata</Text>
          <TouchableOpacity style={styles.pickButton} onPress={handlePickFiles}>
            <Text style={styles.pickButtonText}>Pick Audio Files</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <MusicList
            musics={filtered}
            selectedIds={selectedIds}
            selectionMode={selectionMode}
            onSelect={toggleSelect}
            onPress={handlePress}
            onLongPress={enterSelectionMode}
          />
          {selectionMode && (
            <View style={styles.selectionActions}>
              <TouchableOpacity style={styles.selectionActionBtn} onPress={handleAddToPlaylist}>
                <Text style={styles.actionIcon}>➕</Text>
                <Text style={styles.actionLabel}>Add to Playlist</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.selectionActionBtn} onPress={handleDelete}>
                <Text style={styles.actionIcon}>🗑️</Text>
                <Text style={styles.actionLabel}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.selectionActionBtn} onPress={handlePlayNext}>
                <Text style={styles.actionIcon}>⏭️</Text>
                <Text style={styles.actionLabel}>Play Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
      <PlayerBar
        currentMusic={currentMusic}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />

      <Modal visible={showSettings} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            {SETTINGS_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt} style={styles.settingItem}>
                <Text style={styles.settingText}>{opt}</Text>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={showQueue} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: Dimensions.get('window').height * 0.6 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Queue</Text>
              <TouchableOpacity onPress={() => setShowQueue(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            {queue.length === 0 ? (
              <Text style={styles.emptyQueue}>Queue is empty</Text>
            ) : (
              <SectionList
                sections={queueSections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.queueItem}>
                    <View style={styles.queueInfo}>
                      <Text style={styles.queueTitle}>{item.title}</Text>
                      <Text style={styles.queueArtist}>{item.artist}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeFromQueue(item)}>
                      <Text style={styles.removeIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
                renderSectionHeader={({ section }) =>
                  section.data.length > 0 ? (
                    <Text style={styles.sectionHeader}>{section.title}</Text>
                  ) : null
                }
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Delete music{selectedIds.size > 1 ? 's' : ''}?</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete {selectedIds.size} selected music{selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.confirmCancel} onPress={() => setShowDeleteConfirm(false)}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmDelete} onPress={confirmDelete}>
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeIcon: {
    fontSize: 20,
    color: '#AAAAAA',
    padding: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  settingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  settingArrow: {
    fontSize: 20,
    color: '#666',
  },
  emptyQueue: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 32,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  queueInfo: {
    flex: 1,
  },
  queueTitle: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  queueArtist: {
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 2,
  },
  removeIcon: {
    fontSize: 14,
    color: '#888',
    padding: 8,
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 0.5,
    borderTopColor: '#333',
  },
  selectionActionBtn: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 11,
    color: '#AAAAAA',
  },
  confirmOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  confirmBox: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    width: '80%',
    maxWidth: 360,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  confirmCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#3A3A3A',
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmDelete: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#E53935',
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E1E1E',
  },
  selectionCancel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectionAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1DB954',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  pickButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  pickButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
