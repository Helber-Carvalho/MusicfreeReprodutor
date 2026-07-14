/**
 * TopBar / index.tsx — Barra superior com o título do app e botões de ação.
 *
 * Exibe o nome "MusicApp" à esquerda e dois botões à direita:
 *   - 📋 Fila (Queue): abre o modal com a fila de reprodução
 *   - ⚙️ Configurações (Settings): abre o modal de opções
 *
 * Este componente é substituído pela SelectionBar quando o modo
 * de seleção múltipla está ativo.
 */

import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

/** Propriedades recebidas do componente pai (Home) */
interface TopBarProps {
  /** Callback chamado ao tocar no botão de configurações */
  onSettingsPress: () => void;
  /** Callback chamado ao tocar no botão de fila */
  onQueuePress: () => void;
}

/**
 * Componente TopBar — barra superior fixa.
 *
 * @param onSettingsPress — Abre o modal de configurações
 * @param onQueuePress — Abre o modal da fila de reprodução
 */
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
