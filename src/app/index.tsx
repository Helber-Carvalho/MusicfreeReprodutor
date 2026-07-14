/**
 * index.tsx — Tela principal do MusicApp (rota inicial "/").
 *
 * Esta é a tela única do aplicativo (arquivo de rota do Expo Router).
 * Centraliza toda a lógica de estado da UI: lista de músicas, busca,
 * seleção múltipla, player, fila e modais.
 *
 * Fluxo geral:
 *   1. Ao montar, carrega as músicas do dispositivo via MusicRepository
 *   2. Inscreve-se no PlayerManager para receber atualizações de reprodução
 *   3. Renderiza a interface com TopBar, SearchBar, MusicList e PlayerBar
 *   4. Gerencia modais sobrepostos (Configurações, Fila, Confirmar Exclusão)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Modal, Text, TouchableOpacity, SectionList,
  StyleSheet, Dimensions, Alert, ActivityIndicator,
} from 'react-native';
import { TopBar } from '../components/TopBar';
import { SearchBar } from '../components/SearchBar';
import { MusicList } from '../components/MusicList';
import { PlayerBar } from '../components/PlayerBar';
import { musicRepository } from '../services/MusicRepository';
import { playerManager } from '../services/PlayerManager';
import { Music } from '../models/Music';

/** Opções fixas do menu de configurações (placeholder para versões futuras) */
const SETTINGS_OPTIONS = ['Equalizer', 'Sound Quality', 'Sleep Timer', 'About'];

/**
 * Componente Home — tela principal do aplicativo.
 *
 * Exportado como default (exigência do Expo Router para arquivos de rota).
 * Corresponde ao arquivo src/app/index.tsx que renderiza a rota "/".
 */
export default function Home() {

  // ========================================================================
  // Estados da UI
  // ========================================================================

  /** Texto digitado na barra de busca para filtrar a lista */
  const [search, setSearch] = useState('');
  /** Lista completa de músicas carregadas do dispositivo */
  const [musics, setMusics] = useState<Music[]>([]);
  /** Flag de carregamento inicial (exibe spinner enquanto carrega) */
  const [loading, setLoading] = useState(true);

  // ---- Seleção múltipla ----

  /** Conjunto de IDs das músicas atualmente selecionadas */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  /** Se true, a interface de seleção múltipla está ativa */
  const [selectionMode, setSelectionMode] = useState(false);

  // ---- Player ----

  /** Música atualmente em reprodução (null se nenhuma) */
  const [currentMusic, setCurrentMusic] = useState<Music | null>(null);
  /** Se o áudio está tocando (para alternar ícone play/pause) */
  const [isPlaying, setIsPlaying] = useState(false);

  // ---- Modais ----

  /** Controla a visibilidade do modal de Configurações */
  const [showSettings, setShowSettings] = useState(false);
  /** Controla a visibilidade do modal da Fila de reprodução */
  const [showQueue, setShowQueue] = useState(false);
  /** Controla a visibilidade do modal de confirmação de exclusão */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /** Fila de reprodução (ordem das músicas a tocar) */
  const [queue, setQueue] = useState<Music[]>([]);

  // ========================================================================
  // Efeitos colaterais (useEffect)
  // ========================================================================

  /**
   * Efeito de inicialização: carrega as músicas do dispositivo.
   *
   * Executa apenas uma vez ao montar o componente (array de dependências vazio).
   * A função loadSongs() lida internamente com permissões e fallbacks.
   */
  useEffect(() => {
    musicRepository.loadSongs().then((songs) => {
      setMusics(songs);
      setLoading(false);
    });
  }, []);

  /**
   * Efeito de inscrição no PlayerManager.
   *
   * Toda vez que o player muda de estado (play, pause, progresso, fim da música),
   * o callback é disparado e atualiza currentMusic e isPlaying.
   *
   * A função de limpeza (return) remove a inscrição ao desmontar o componente
   * para evitar memory leaks.
   */
  useEffect(() => {
    playerManager.subscribe((state) => {
      setCurrentMusic(state.music);
      setIsPlaying(state.status === 'PLAYING');
    });
    return () => playerManager.unsubscribe();
  }, []);

  // ========================================================================
  // Dados derivados
  // ========================================================================

  /**
   * Lista filtrada com base no texto da busca.
   *
   * Filtra por título OU artista (case-insensitive).
   * Recalcula automaticamente sempre que `search` ou `musics` mudam.
   */
  const filtered = musics.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.artist.toLowerCase().includes(search.toLowerCase())
  );

  /** Lista de músicas selecionadas (útil para operações em lote) */
  const selectedMusics = filtered.filter((m) => selectedIds.has(m.id));

  // ========================================================================
  // Handlers — Seleção múltipla
  // ========================================================================

  /**
   * Alterna a seleção de uma música: adiciona se não estiver selecionada,
   * remove se já estiver.
   */
  function toggleSelect(music: Music) {
    const next = new Set(selectedIds);
    if (next.has(music.id)) {
      next.delete(music.id);
    } else {
      next.add(music.id);
    }
    setSelectedIds(next);
  }

  /**
   * Ativa o modo de seleção a partir de um pressionamento longo.
   * Seleciona apenas a música que foi pressionada.
   */
  function enterSelectionMode(music: Music) {
    setSelectionMode(true);
    setSelectedIds(new Set([music.id]));
  }

  /** Sai do modo de seleção e limpa todas as seleções */
  function cancelSelection() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  /** Seleciona todas as músicas visíveis (filtro atual) */
  function selectAll() {
    setSelectedIds(new Set(filtered.map((m) => m.id)));
  }

  // ========================================================================
  // Handlers — Ações em lote (modo seleção)
  // ========================================================================

  /** Placeholder: abre um alerta informando que a feature está em desenvolvimento */
  function handleAddToPlaylist() {
    Alert.alert('Add to Playlist', 'Feature coming soon');
  }

  /** Abre o modal de confirmação de exclusão */
  function handleDelete() {
    setShowDeleteConfirm(true);
  }

  /**
   * Confirma a exclusão das músicas selecionadas.
   *
   * Remove da lista local (não afeta o MediaStore do dispositivo) e
   * para a reprodução se a música atual foi deletada.
   */
  function confirmDelete() {
    setMusics((prev) => prev.filter((m) => !selectedIds.has(m.id)));
    if (currentMusic && selectedIds.has(currentMusic.id)) {
      playerManager.stop();
    }
    cancelSelection();
    setShowDeleteConfirm(false);
  }

  /**
   * Adiciona as músicas selecionadas à fila, inserindo logo após
   * a música atual (se houver) ou ao final da fila.
   */
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

  // ========================================================================
  // Handlers — Player
  // ========================================================================

  /**
   * Toca uma música ou alterna seleção (dependendo do modo atual).
   *
   * Se estiver em selectionMode, o toque alterna a seleção (não toca).
   * Caso contrário, inicia a reprodução e adiciona à fila se não estiver.
   */
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

  /** Alterna entre reproduzir e pausar */
  const handlePlayPause = useCallback(async () => {
    await playerManager.togglePlayPause();
  }, []);

  /** Pula para a próxima música na lista completa */
  const handleNext = useCallback(async () => {
    if (currentMusic) {
      await playerManager.next(musics, currentMusic);
    }
  }, [currentMusic, musics]);

  /** Volta para a música anterior (ou reinicia a atual se > 3 segundos) */
  const handlePrevious = useCallback(async () => {
    if (currentMusic) {
      await playerManager.previous(musics, currentMusic);
    }
  }, [currentMusic, musics]);

  // ========================================================================
  // Handlers — Fila de reprodução
  // ========================================================================

  /**
   * Remove uma música da fila.
   *
   * Se a música removida for a que está tocando, tenta tocar
   * a próxima disponível. Se não houver mais músicas, para o player.
   */
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

  /**
   * Dados estruturados para a SectionList do modal da fila.
   *
   * Seções:
   *   - "Now Playing": a música atual (se houver)
   *   - "Up Next": as próximas músicas na fila
   */
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

  /** Abre o seletor de arquivos para o usuário importar músicas manualmente */
  async function handlePickFiles() {
    const picked = await musicRepository.pickAudioFiles();
    if (picked.length > 0) {
      setMusics((prev) => [...prev, ...picked]);
    }
  }

  // ========================================================================
  // Renderização
  // ========================================================================

  return (
    <View style={styles.container}>

      {/*
        =====================================================================
        TopBar / SelectionBar
        =====================================================================
        Se o modo de seleção estiver ativo, substitui a TopBar por uma
        SelectionBar com opções de "Cancel", contador e "Select All".
      */}
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

      {/*
        =====================================================================
        SearchBar — Campo de busca/filtro
        =====================================================================
      */}
      <SearchBar value={search} onChangeText={setSearch} />

      {/*
        =====================================================================
        Conteúdo principal
        =====================================================================
        Três estados possíveis:
          1. loading === true    → spinner de carregamento
          2. musics.length === 0 → mensagem vazia + botão para importar
          3. tem músicas         → MusicList + (opcional) SelectionActions
      */}
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

          {/*
            =================================================================
            SelectionActions — Barra de ações no modo seleção
            =================================================================
            Exibe botões para: Adicionar à playlist, Excluir, Tocar em seguida
          */}
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

      {/*
        =====================================================================
        PlayerBar — Barra inferior de reprodução
        =====================================================================
        Sempre visível, mesmo sem música selecionada (mostra "No music selected").
      */}
      <PlayerBar
        currentMusic={currentMusic}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />

      {/*
        =====================================================================
        Modal de Configurações
        =====================================================================
        Slide-up com opções de configuração (placeholder).
        Fecha ao tocar no "✕" ou no backdrop semi-transparente.
      */}
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

      {/*
        =====================================================================
        Modal da Fila de Reprodução
        =====================================================================
        SectionList com "Now Playing" e "Up Next".
        Cada item tem um botão "✕" para remover da fila.
      */}
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

      {/*
        =====================================================================
        Modal de Confirmação de Exclusão
        =====================================================================
        Exibe "Delete music(s)?" com opções Cancel / Delete.
        O Delete fica vermelho (#E53935) para indicar ação destrutiva.
      */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>
              Delete music{selectedIds.size > 1 ? 's' : ''}?
            </Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete {selectedIds.size} selected music
              {selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancel}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDelete}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ========================================================================
// Estilos
// ========================================================================

/**
 * Folha de estilos principal da tela Home.
 *
 * Organizados por ordem de uso no JSX:
 *   1. Container principal e estados (loading, empty)
 *   2. SelectionBar (substitui a TopBar no modo seleção)
 *   3. SelectionActions (barra inferior no modo seleção)
 *   4. Modais (Settings, Queue, DeleteConfirm)
 *
 * Padrão de cores do tema escuro:
 *   - Fundo principal:       #121212
 *   - Superfície (cards):    #1E1E1E
 *   - Superfície elevada:    #2A2A2A
 *   - Texto primário:        #FFFFFF
 *   - Texto secundário:      #AAAAAA / #888888 / #666
 *   - Destaque (accent):     #1DB954 (verde)
 *   - Perigo (delete):       #E53935 (vermelho)
 */
const styles = StyleSheet.create({

  // ---- Container principal ----
  container: { flex: 1, backgroundColor: '#121212' },

  // ---- Loading ----
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#AAAAAA', fontSize: 14, marginTop: 12 },

  // ---- Estado vazio (sem músicas) ----
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyText: { color: '#888888', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  pickButton: { backgroundColor: '#1DB954', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  pickButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },

  // ---- SelectionBar (topo, modo seleção) ----
  selectionBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#1E1E1E',
  },
  selectionCancel: { fontSize: 16, color: '#FFFFFF' },
  selectionCount: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  selectionAction: { fontSize: 16, fontWeight: '600', color: '#1DB954' },

  // ---- SelectionActions (base, modo seleção) ----
  selectionActions: {
    flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10,
    paddingHorizontal: 16, backgroundColor: '#1E1E1E',
    borderTopWidth: 0.5, borderTopColor: '#333',
  },
  selectionActionBtn: { alignItems: 'center', paddingVertical: 4, paddingHorizontal: 12 },
  actionIcon: { fontSize: 20, marginBottom: 4 },
  actionLabel: { fontSize: 11, color: '#AAAAAA' },

  // ---- Modais (genérico) ----
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: '#1E1E1E', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '50%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  closeIcon: { fontSize: 20, color: '#AAAAAA', padding: 4 },

  // ---- Modal: Settings ----
  settingItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#333',
  },
  settingText: { fontSize: 16, color: '#FFFFFF' },
  settingArrow: { fontSize: 20, color: '#666' },

  // ---- Modal: Queue ----
  emptyQueue: { color: '#666', fontSize: 14, textAlign: 'center', paddingVertical: 32 },
  queueItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: '#333',
  },
  queueInfo: { flex: 1 },
  queueTitle: { fontSize: 15, color: '#FFFFFF' },
  queueArtist: { fontSize: 12, color: '#AAAAAA', marginTop: 2 },
  removeIcon: { fontSize: 14, color: '#888', padding: 8 },
  sectionHeader: {
    fontSize: 13, fontWeight: '600', color: '#888888',
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 12, marginBottom: 4,
  },

  // ---- Modal: Delete Confirm ----
  confirmOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  confirmBox: {
    backgroundColor: '#2A2A2A', borderRadius: 16, padding: 24,
    marginHorizontal: 32, width: '80%', maxWidth: 360,
  },
  confirmTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  confirmMessage: { fontSize: 14, color: '#AAAAAA', lineHeight: 20, marginBottom: 24 },
  confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  confirmCancel: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#3A3A3A' },
  confirmCancelText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  confirmDelete: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#E53935' },
  confirmDeleteText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
