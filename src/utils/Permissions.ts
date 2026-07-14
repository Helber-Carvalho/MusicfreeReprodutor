/**
 * Permissions.ts — Gerenciamento de permissões do dispositivo.
 *
 * Centraliza as solicitações de permissão do Android para evitar
 * duplicação de lógica e manter a consistência das mensagens.
 *
 * Permissões necessárias:
 *   - Android 13+: READ_MEDIA_AUDIO  (acesso à biblioteca de músicas)
 *   - Android < 13: READ_EXTERNAL_STORAGE (acesso genérico a arquivos)
 *   - iOS: gerenciaudo automaticamente pelo expo-media-library
 */

import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Solicita ao usuário permissão para ler arquivos de áudio do dispositivo.
 *
 * Retorna:
 *   - true  → permissão concedida (ou plataforma não-Android)
 *   - false → permissão negada ou erro na solicitação
 *
 * Uso típico:
 *   const granted = await requestMediaPermissions();
 *   if (!granted) { mostrarAlertaDePermissao(); }
 */
export async function requestMediaPermissions(): Promise<boolean> {
  // No web e iOS a permissão é gerenciada pelo próprio Expo, não precisamos solicitar manualmente
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        {
          title: 'Permissão de Leitura de Mídia',
          message: 'O app precisa acessar suas músicas para reproduzi-las.',
          buttonPositive: 'Permitir',
          buttonNegative: 'Negar',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
}
