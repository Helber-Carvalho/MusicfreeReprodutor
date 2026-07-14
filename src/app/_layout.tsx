/**
 * _layout.tsx — Layout raiz do app (Expo Router).
 *
 * Este arquivo é obrigatório no Expo Router e define o layout que
 * envolve TODAS as telas do aplicativo. age como substituto do
 * antigo App.tsx em projetos sem Expo Router.
 *
 * O Stack Navigator gerencia a pilha de telas. Como este app tem
 * apenas uma tela (Home), não há navegação entre telas, mas o
 * layout permanece preparado para expansão futura.
 *
 * Referência: https://docs.expo.dev/router/layouts/
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Componente de layout raiz exportado como default (exigência do Expo Router).
 *
 * Configurações:
 *   - StatusBar: estilo claro (ícones brancos) para o tema escuro
 *   - Stack Navigator: sem cabeçalho (headerShown: false), fundo escuro #121212
 *
 * Se no futuro houver múltiplas telas, basta adicionar arquivos .tsx
 * dentro de src/app/ que o Expo Router cria as rotas automaticamente.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#121212' },
        }}
      />
    </>
  );
}
