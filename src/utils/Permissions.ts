import { PermissionsAndroid, Platform } from 'react-native';

export async function requestMediaPermissions(): Promise<boolean> {
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
