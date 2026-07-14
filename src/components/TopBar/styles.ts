/**
 * TopBar / styles.ts — Estilos do componente TopBar.
 *
 * Separação de estilos do componente para melhor organização,
 * seguindo a boa prática do artigo da Rocketseat.
 */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  /** Container principal: layout horizontal com espaçamento entre título e ações */
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E1E1E',
  },
  /** Nome do app à esquerda */
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  /** Container dos botões de ação à direita */
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  /** Área de clique de cada botão */
  button: {
    padding: 8,
  },
  /** Emoji/ícone dentro do botão */
  icon: {
    fontSize: 22,
  },
});
