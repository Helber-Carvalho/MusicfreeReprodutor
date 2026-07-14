/**
 * Music.ts — Modelo de dados que representa uma faixa de áudio.
 *
 * Esta interface define a estrutura única de música usada em todo o app.
 * Tanto as músicas carregadas da biblioteca quanto as importadas manualmente
 * são convertidas para este formato.
 */
export interface Music {
  /** Identificador único da música (ex: ID do MediaStore ou timestamp para arquivos importados) */
  id: string;
  /** Nome visível da música (extraído do nome do arquivo ou metadado) */
  title: string;
  /** Nome do artista (atualmente fixo como 'Unknown Artist' até implementarmos leitura de metadados) */
  artist: string;
  /** Nome do álbum (ainda não utilizado na UI, reservado para versões futuras) */
  album: string;
  /** Duração total em segundos (convertida de milissegundos vindos do MediaStore) */
  duration: number;
  /** URI ou caminho do arquivo de áudio no dispositivo */
  path: string;
}
