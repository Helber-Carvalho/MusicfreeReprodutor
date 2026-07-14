/**
 * PlayerManager.ts — Gerenciamento de reprodução de áudio.
 *
 * Responsável por controlar o ciclo de vida da reprodução usando expo-av.
 * Implementa o padrão Observer: a UI se inscreve via subscribe() e recebe
 * atualizações de estado a cada mudança (play, pause, seek, fim da música).
 *
 * Importante: esta classe NÃO gerencia filas de reprodução. A fila é
 * mantida no componente Home (src/app/index.tsx) que chama os métodos
 * play(), next(), previous() conforme necessário.
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import { Music } from '../models/Music';

/** Estados internos do player */
export type PlayerStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'LOADING';

/**
 * Estado completo de reprodução emitido para os inscritos.
 * Contém tanto a música atual quanto a posição/tempo.
 */
export interface PlaybackState {
  /** Música atualmente carregada (null se nenhuma) */
  music: Music | null;
  /** Estado atual do player */
  status: PlayerStatus;
  /** Posição atual em milissegundos (para barra de progresso) */
  positionMillis: number;
  /** Duração total em milissegundos */
  durationMillis: number;
}

export class PlayerManager {

  // ---- Estado interno privado ----

  /** Flag que indica se o áudio já foi configurado (setAudioModeAsync) */
  private initialized = false;
  /** Instância do som atualmente carregado */
  private sound: Audio.Sound | null = null;
  /** Música atualmente selecionada */
  private _music: Music | null = null;
  /** Estado atual do player */
  private _status: PlayerStatus = 'IDLE';
  /** Posição atual em ms (atualizada pelo callback de playback) */
  private _positionMillis = 0;
  /** Duração total em ms */
  private _durationMillis = 0;
  /** Callback registrado pelo componente que consome o player (ex: Home) */
  private onStateChange: ((state: PlaybackState) => void) | null = null;

  // ---- Inicialização ----

  /**
   * Configura o modo de áudio global do dispositivo.
   *
   * Só executa uma vez (protegido pela flag `initialized`).
   * Configurações:
   *   - allowsRecordingIOS: false (não precisamos gravar)
   *   - playsInSilentModeIOS: true (tocar mesmo com iPhone no silencioso)
   *   - staysActiveInBackground: true (continuar tocando em segundo plano)
   *   - shouldDuckAndroid: true (abaixar volume quando outro som tocar)
   */
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

  // ---- Leitura do estado atual ----

  /** Getter público que expõe o snapshot do estado atual */
  get state(): PlaybackState {
    return {
      music: this._music,
      status: this._status,
      positionMillis: this._positionMillis,
      durationMillis: this._durationMillis,
    };
  }

  // ---- Inscrição/notificação (padrão Observer) ----

  /**
   * Registra um callback para receber atualizações de estado.
   * A UI deve chamar isso no useEffect e retornar unsubscribe() na limpeza.
   */
  subscribe(callback: (state: PlaybackState) => void) {
    this.onStateChange = callback;
  }

  /** Remove o callback registrado */
  unsubscribe() {
    this.onStateChange = null;
  }

  /** Dispara o callback com o estado atual */
  private emit() {
    this.onStateChange?.(this.state);
  }

  /**
   * Atualiza o status interno e notifica os inscritos.
   * Permite passar extras parciais (positionMillis, durationMillis).
   */
  private updateStatus(status: PlayerStatus, extras?: Partial<PlaybackState>) {
    this._status = status;
    if (extras) {
      if (extras.positionMillis !== undefined) this._positionMillis = extras.positionMillis;
      if (extras.durationMillis !== undefined) this._durationMillis = extras.durationMillis;
    }
    this.emit();
  }

  // ---- Controles de reprodução ----

  /**
   * Carrega e reproduz uma música.
   *
   * Fluxo:
   *   1. Garante que o áudio está configurado
   *   2. Define _music e status LOADING
   *   3. Se já existia um som carregado, descarrega-o
   *   4. Cria nova instância Audio.Sound, registra callback de progresso
   *   5. Carrega o arquivo e inicia reprodução (shouldPlay: true)
   */
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

  /**
   * Callback interno do expo-av chamado a cada ~100ms durante a reprodução.
   *
   * Atualiza:
   *   - durationMillis / positionMillis (para barra de progresso)
   *   - status (PLAYING / PAUSED / IDLE quando terminar)
   *
   * Nota: o método é uma arrow function para preservar o escopo do `this`.
   */
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

  /**
   * Alterna entre reproduzir e pausar.
   *
   * Comportamento:
   *   - Se está tocando → pausa
   *   - Se está pausado → retoma
   *   - Se está IDLE mas tem música carregada → toca novamente
   */
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

  /**
   * Para a reprodução e descarrega o som da memória.
   * Reseta o estado para IDLE, position 0, music null.
   */
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

  /**
   * Move a posição de reprodução para um ponto específico.
   * @param positionMillis — Posição alvo em milissegundos
   */
  async seekTo(positionMillis: number) {
    await this.ensureInitialized();
    await this.sound?.setPositionAsync(positionMillis);
  }

  /**
   * Pula para a próxima música na lista.
   *
   * @param musics — Lista completa de músicas (para encontrar o índice)
   * @param current — Música atual
   * @returns A próxima música ou null se já estava na última
   */
  async next(musics: Music[], current: Music): Promise<Music | null> {
    const idx = musics.findIndex((m) => m.id === current.id);
    if (idx < musics.length - 1) {
      const nextMusic = musics[idx + 1];
      await this.play(nextMusic);
      return nextMusic;
    }
    return null;
  }

  /**
   * Volta para a música anterior na lista.
   *
   * Regra:
   *   - Se está nos primeiros 3 segundos → volta para a música anterior
   *   - Se passou de 3 segundos → reinicia a música atual (seekTo 0)
   *
   * @param musics — Lista completa de músicas
   * @param current — Música atual
   * @returns A música anterior, a atual (se reiniciou) ou null (se estava na primeira)
   */
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

  /**
   * Limpeza de recursos. Deve ser chamada ao desmontar o componente
   * ou quando o app for para background se necessário.
   */
  async cleanup() {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }
}

/** Instância única do player (singleton) */
export const playerManager = new PlayerManager();
