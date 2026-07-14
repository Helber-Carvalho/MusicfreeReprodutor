import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Music } from '../models/Music';

export interface AlbumInfo {
  id: string;
  title: string;
  assetCount: number;
  coverUrl?: string;
}

export class MusicRepository {
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

  async loadAlbums(): Promise<AlbumInfo[]> {
    if (Platform.OS === 'web') return [];

    try {
      const { getAlbumsAsync } = await import('expo-media-library/legacy');
      return getAlbumsAsync({ includeSmartAlbums: false });
    } catch {
      return [];
    }
  }

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

  private cleanFilename(name: string): string {
    return name.replace(/\.[^.]+$/, '').replace(/[_]/g, ' ');
  }
}

export const musicRepository = new MusicRepository();
