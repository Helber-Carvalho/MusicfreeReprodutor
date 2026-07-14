/**
 * PlayerBar / index.tsx — Barra inferior de controle de reprodução.
 *
 * Exibida permanentemente na parte inferior da tela. Mostra:
 *   - Informações da música atual (título + artista) à esquerda
 *   - Controles (anterior, play/pause, próximo) à direita
 *
 * Estados possíveis:
 *   - Nenhuma música selecionada: exibe "No music selected" centralizado
 *   - Música carregada: exibe info + controles
 *
 * O botão de play/pause alterna entre ▶️ (tocando) e ⏸ (pausado).
 */

import { View, Text, TouchableOpacity } from 'react-native';
import { Music } from '../../models/Music';
import { styles } from './styles';

/** Propriedades recebidas do componente pai (Home) */
interface PlayerBarProps {
  /** Música atualmente em reprodução (null = player vazio) */
  currentMusic: Music | null;
  /** Se o áudio está tocando no momento (para alternar ícone play/pause) */
  isPlaying: boolean;
  /** Callback para alternar entre play e pause */
  onPlayPause: () => void;
  /** Callback para pular para a próxima música */
  onNext: () => void;
  /** Callback para voltar para a música anterior */
  onPrevious: () => void;
}

/**
 * Componente PlayerBar — controles de reprodução na parte inferior.
 *
 * @param currentMusic — Música atual (null exibe estado vazio)
 * @param isPlaying — true mostra ⏸, false mostra ▶️
 * @param onPlayPause — toggle play/pause
 * @param onNext — próxima música
 * @param onPrevious — música anterior / reiniciar
 */
export function PlayerBar({ currentMusic, isPlaying, onPlayPause, onNext, onPrevious }: PlayerBarProps) {
  /** Estado vazio: nenhuma música carregada */
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
