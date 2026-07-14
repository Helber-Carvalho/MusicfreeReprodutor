/**
 * MusicList / index.tsx — Lista virtualizada de músicas.
 *
 * Usa FlatList do React Native para renderizar eficientemente
 * grandes coleções de músicas. Cada item é delegado ao componente
 * MusicListItem, que lida com a aparência individual.
 *
 * Suporta modo de seleção múltipla (selectionMode) ativado via
 * pressionamento longo em um item.
 */

import { FlatList } from 'react-native';
import { Music } from '../../models/Music';
import { MusicListItem } from '../MusicListItem';
import { styles } from './styles';

/** Propriedades recebidas do componente pai (Home) */
interface MusicListProps {
  /** Lista completa (ou filtrada) de músicas a serem exibidas */
  musics: Music[];
  /** Conjunto de IDs das músicas atualmente selecionadas */
  selectedIds: Set<string>;
  /** Se true, a UI de seleção (checkboxes) fica visível */
  selectionMode: boolean;
  /** Callback ao tocar no checkbox ou em um item no modo seleção */
  onSelect: (music: Music) => void;
  /** Callback ao tocar em um item (executa a música, a menos que esteja em selectionMode) */
  onPress: (music: Music) => void;
  /** Callback ao pressionar longo (ativa selectionMode) */
  onLongPress: (music: Music) => void;
}

/**
 * Componente MusicList — FlatList estilizada com delegação para MusicListItem.
 *
 * @param musics — Array de músicas para renderizar
 * @param selectedIds — IDs selecionados (para destacar visualmente)
 * @param selectionMode — Se true, exibe checkboxes ao lado de cada item
 * @param onSelect — Lida com toggle de seleção
 * @param onPress — Lida com toque normal (reproduzir)
 * @param onLongPress — Lida com toque longo (entrar em seleção)
 */
export function MusicList({ musics, selectedIds, selectionMode, onSelect, onPress, onLongPress }: MusicListProps) {
  return (
    <FlatList
      /** Fonte de dados da lista */
      data={musics}
      /** Estratégia de chave única para cada item (obrigatório no FlatList) */
      keyExtractor={(item) => item.id}
      /** Renderiza cada item delegando para MusicListItem */
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
      /** Oculta a barra de rolagem para um visual mais limpo */
      showsVerticalScrollIndicator={false}
    />
  );
}
