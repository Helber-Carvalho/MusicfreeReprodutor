/**
 * SearchBar / styles.ts — Estilos do componente SearchBar.
 *
 * Input com fundo escuro (#2A2A2A), bordas arredondadas (10px)
 * e texto branco para combinar com o tema escuro do app.
 */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  /** Espaçamento externo ao redor do input */
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#121212',
  },
  /** O input em si: fundo escuro, texto claro, cantos arredondados */
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
