/**
 * MusicRepository.ts — Camada de acesso a dados musicais.
 *
 * Responsável por obter músicas do dispositivo, seja da biblioteca de mídia
 * nativa (Android MediaStore) ou por seleção manual do usuário (Document Picker).
 *
 * Padrão: Repository (singleton via export da instância)
 * Todas as operações de IO são assíncronas e tratam erros internamente,
 * retornando arrays vazios em caso de falha para evitar crashes na UI.
 */

import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Music } from '../models/Music';

/**
 * Representa um álbum da biblioteca de mídia do dispositivo.
 * Útil para futuras features de navegação por álbuns.
 */
export interface AlbumInfo {
  id: string;
  title: string;
  assetCount: number;
  coverUrl?: string;
}

export class MusicRepository {

  /**
   * Carrega todas as músicas do dispositivo.
   *
   * Fluxo:
   *   1. Verifica se não é web (MediaStore não existe em web)
   *   2. Solicita permissão de leitura de mídia
   *   3. Se autorizado, chama loadFromMediaStore()
   *
   * @returns Lista de músicas encontradas (vazia se sem permissão ou erro)
   */
  async loadSongs(): Promise<Music[]> {
    if (Platform.OS === 'web') return [];

    try {
      const { requestPermissionsAsync } = await import('expo-media-library');
      const { status } = await requestPermissionsAsync();
      if (status !== 'granted') return [];
      return this.loadFromMediaStore();
    } catch {
      return [];
    }
  }

  /**
   * Carrega a lista de álbuns da biblioteca de mídia.
   * Atualmente não usado na UI, mas disponível para expansão.
   */
  async loadAlbums(): Promise<AlbumInfo[]> {
    if (Platform.OS === 'web') return [];

    try {
      const { getAlbumsAsync } = await import('expo-media-library/legacy');
      return getAlbumsAsync({ includeSmartAlbums: false });
    } catch {
      return [];
    }
  }

  /**
   * Método privado — consulta o MediaStore do Android em busca de arquivos de áudio.
   *
   * Usa a API Query do expo-media-library (disponível no SDK 57+)
   * para buscar até 5000 arquivos do tipo AUDIO.
   *
   * Cada asset é convertido para o modelo Music, com tratamento individual
   * de erros para que um arquivo corrompido não quebre o carregamento completo.
   */
  private async loadFromMediaStore(): Promise<Music[]> {
    try {
      const { Query, AssetField, MediaType } = await import('expo-media-library');
      const assets = await new Query()
        .eq(AssetField.MEDIA_TYPE, MediaType.AUDIO)
        .limit(5000)
        .exe();

      if (assets.length === 0) return [];

      const songs: Music[] = [];

      for (const asset of assets) {
        try {
          const [filename, duration, uri] = await Promise.all([
            asset.getFilename(),
            asset.getDuration(),
            asset.getUri(),
          ]);
          songs.push({
            id: asset.id,
            title: this.cleanFilename(filename),
            artist: 'Unknown Artist',
            album: '',
            duration: duration ? Math.round(duration / 1000) : 0,
            path: uri,
          });
        } catch {
          continue;
        }
      }

      return songs;
    } catch {
      return [];
    }
  }

  /**
   * Abre o seletor de arquivos nativo para o usuário escolher músicas manualmente.
   *
   * Útil quando:
   *   - A permissão de mídia não foi concedida
   *   - O usuário quer importar músicas de pastas específicas
   *   - Estamos em ambiente web (onde MediaStore não existe)
   *
   * Usa expo-document-picker com filtro audio/* e suporte a múltipla seleção.
   */
  async pickAudioFiles(): Promise<Music[]> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return [];

      return result.assets.map((file, index) => ({
        id: `picked-${Date.now()}-${index}`,
        title: this.cleanFilename(file.name || 'Unknown'),
        artist: 'Unknown Artist',
        album: '',
        duration: 0,
        path: file.uri,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Remove a extensão do arquivo e substitui underscores por espaços.
   *
   * Exemplo:
   *   "Michel_Teló_-_Ai_Se_Eu_Te_Pego.mp3" → "Michel Teló - Ai Se Eu Te Pego"
   */
  private cleanFilename(name: string): string {
    return name.replace(/\.[^.]+$/, '').replace(/[_]/g, ' ');
  }
}

/** Instância única do repositório (singleton) */
export const musicRepository = new MusicRepository();
