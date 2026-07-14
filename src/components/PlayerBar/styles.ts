/**
 * PlayerBar / styles.ts — Estilos da barra inferior de reprodução.
 *
 * A PlayerBar fica fixa na parte inferior com:
 *   - Fundo escuro (#1E1E1E) e borda superior sutil
 *   - Layout horizontal: [info da música] [controles]
 *   - Botão play/pause em destaque verde (#1DB954, tom Spotify)
 */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  /** Container principal: layout horizontal com fundo escuro e borda superior */
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
  /** Texto centralizado exibido quando não há música selecionada */
  emptyText: {
    color: '#666',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  /** Container das informações da música (título + artista) */
  info: {
    flex: 1,
    marginRight: 16,
  },
  /** Nome da música, negrito semi-bold */
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  /** Nome do artista em cinza claro */
  artist: {
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 1,
  },
  /** Container dos botões de controle (anterior, play, próximo) */
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  /** Botão de controle secundário (anterior/próximo) */
  controlButton: {
    padding: 8,
  },
  /** Ícone dentro do botão de controle secundário */
  controlIcon: {
    fontSize: 20,
  },
  /** Botão de play/pause: circular verde (#1DB954) com 40px de diâmetro */
  playButton: {
    backgroundColor: '#1DB954',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Ícone dentro do botão play/pause */
  playIcon: {
    fontSize: 18,
  },
});
