import { Audio, AVPlaybackStatus } from 'expo-av';
import { Music } from '../models/Music';

export type PlayerStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'LOADING';

export interface PlaybackState {
  music: Music | null;
  status: PlayerStatus;
  positionMillis: number;
  durationMillis: number;
}

export class PlayerManager {
  private initialized = false;
  private sound: Audio.Sound | null = null;
  private _music: Music | null = null;
  private _status: PlayerStatus = 'IDLE';
  private _positionMillis = 0;
  private _durationMillis = 0;
  private onStateChange: ((state: PlaybackState) => void) | null = null;

  private async ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch {}
  }

  get state(): PlaybackState {
    return {
      music: this._music,
      status: this._status,
      positionMillis: this._positionMillis,
      durationMillis: this._durationMillis,
    };
  }

  subscribe(callback: (state: PlaybackState) => void) {
    this.onStateChange = callback;
  }

  unsubscribe() {
    this.onStateChange = null;
  }

  private emit() {
    this.onStateChange?.(this.state);
  }

  private updateStatus(status: PlayerStatus, extras?: Partial<PlaybackState>) {
    this._status = status;
    if (extras) {
      if (extras.positionMillis !== undefined) this._positionMillis = extras.positionMillis;
      if (extras.durationMillis !== undefined) this._durationMillis = extras.durationMillis;
    }
    this.emit();
  }

  async play(music: Music) {
    await this.ensureInitialized();
    try {
      this._music = music;
      this.updateStatus('LOADING');

      if (this.sound) {
        await this.sound.unloadAsync();
      }

      this.sound = new Audio.Sound();
      this.sound.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate);

      await this.sound.loadAsync({ uri: music.path }, { shouldPlay: true });
    } catch {
      this.updateStatus('IDLE');
    }
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    this._durationMillis = status.durationMillis ?? 0;
    this._positionMillis = status.positionMillis ?? 0;

    if (status.isPlaying) {
      this._status = 'PLAYING';
    } else if (status.didJustFinish) {
      this._status = 'IDLE';
      this._positionMillis = 0;
    } else {
      this._status = 'PAUSED';
    }

    this.emit();
  };

  async togglePlayPause() {
    await this.ensureInitialized();
    if (this._status === 'PLAYING') {
      await this.sound?.pauseAsync();
    } else if (this._status === 'PAUSED') {
      await this.sound?.playAsync();
    } else if (this._music && this._status === 'IDLE') {
      await this.play(this._music);
    }
  }

  async stop() {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
    this._music = null;
    this._positionMillis = 0;
    this._durationMillis = 0;
    this.updateStatus('IDLE');
  }

  async seekTo(positionMillis: number) {
    await this.ensureInitialized();
    await this.sound?.setPositionAsync(positionMillis);
  }

  async next(musics: Music[], current: Music): Promise<Music | null> {
    const idx = musics.findIndex((m) => m.id === current.id);
    if (idx < musics.length - 1) {
      const nextMusic = musics[idx + 1];
      await this.play(nextMusic);
      return nextMusic;
    }
    return null;
  }

  async previous(musics: Music[], current: Music): Promise<Music | null> {
    const idx = musics.findIndex((m) => m.id === current.id);
    if (idx > 0) {
      const prevMusic = musics[idx - 1];
      await this.play(prevMusic);
      return prevMusic;
    }
    if (this._positionMillis > 3000) {
      await this.seekTo(0);
      return current;
    }
    return null;
  }

  async cleanup() {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }
}

export const playerManager = new PlayerManager();
