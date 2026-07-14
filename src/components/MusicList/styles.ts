/**
 * MusicList / styles.ts — Estilos do componente MusicList.
 *
 * Define o layout da FlatList: ocupa todo o espaço disponível (flex: 1)
 * e adiciona um padding inferior para evitar que o último item fique
 * escondido atrás da PlayerBar.
 */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  /** A lista ocupa toda a altura disponível com fundo escuro */
  list: {
    flex: 1,
    backgroundColor: '#121212',
  },
  /** Espaçamento inferior para não colar na PlayerBar */
  content: {
    paddingBottom: 16,
  },
});
