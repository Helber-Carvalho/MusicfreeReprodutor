/**
 * MusicListItem / styles.ts — Estilos do item individual da lista.
 *
 * Layout horizontal com:
 *   [checkbox] [info: título + artista] [duração]
 *
 * Cada item tem uma borda inferior sutil (#2A2A2A) que separa
 * visualmente as linhas. O fundo do item selecionado muda para
 * um tom esverdeado escuro (#1E3A2A) inspirado no Spotify.
 */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  /** Container principal da linha: layout horizontal com padding e borda inferior */
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2A2A2A',
  },
  /** Destaque visual para música selecionada (fundo verde escuro) */
  selected: {
    backgroundColor: '#1E3A2A',
  },
  /** Espaço reservado para o checkbox no modo seleção */
  checkbox: {
    paddingRight: 12,
  },
  /** Símbolo do checkbox (☐ não selecionado / ☑ selecionado) */
  checkboxIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  /** Área de texto (título + artista) que ocupa o espaço disponível */
  info: {
    flex: 1,
    marginRight: 12,
  },
  /** Nome da música em negrito médio */
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  /** Nome do artista em cinza claro abaixo do título */
  artist: {
    fontSize: 13,
    color: '#AAAAAA',
    marginTop: 2,
  },
  /** Duração formatada (mm:ss) no canto direito, em cinza médio */
  duration: {
    fontSize: 13,
    color: '#888888',
  },
});
