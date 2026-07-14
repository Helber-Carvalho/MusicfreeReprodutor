/**
 * MusicListItem / index.tsx — Item individual da lista de músicas.
 *
 * Renderiza uma única linha com:
 *   [checkbox (opcional)]  Título  |  Artista  |  Duração
 *
 * O checkbox aparece apenas quando selectionMode = true (ativado
 * por pressionamento longo).
 *
 * Comportamento de toque:
 *   - Modo normal: toca a música
 *   - Modo seleção: alterna a seleção do item
 *   - Pressionamento longo: ativa o modo seleção
 */

import { View, Text, TouchableOpacity } from 'react-native';
import { Music } from '../../models/Music';
import { formatDuration } from '../../utils/format';
import { styles } from './styles';

/** Propriedades recebidas de MusicList */
interface MusicListItemProps {
  /** Dados da música a serem exibidos */
  music: Music;
  /** Se esta música está no conjunto de selecionados */
  isSelected: boolean;
  /** Se o modo de seleção está ativo globalmente */
  selectionMode: boolean;
  /** Callback para selecionar/desselecionar */
  onSelect: (music: Music) => void;
  /** Callback para reproduzir (modo normal) */
  onPress: (music: Music) => void;
  /** Callback para ativar seleção por pressionamento longo */
  onLongPress: (music: Music) => void;
}

/**
 * Componente MusicListItem — linha individual na lista.
 *
 * Diferencia visualmente itens selecionados (fundo esverdeado #1E3A2A)
 * e exibe a duração formatada no canto direito.
 */
export function MusicListItem({ music, isSelected, selectionMode, onSelect, onPress, onLongPress }: MusicListItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      /** Modo normal → toca; modo seleção → alterna seleção */
      onPress={() => selectionMode ? onSelect(music) : onPress(music)}
      /** Pressionamento longo sempre ativa o modo seleção */
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
