/**
 * format.ts — Utilitários de formatação de dados.
 *
 * Funções puras e reutilizáveis para transformar dados brutos
 * em representações legíveis para o usuário.
 */

/**
 * Converte um valor em segundos para o formato "minutos:segundos".
 *
 * Exemplos de uso:
 *   formatDuration(0)     → "0:00"
 *   formatDuration(125)   → "2:05"
 *   formatDuration(3661)  → "61:01"
 *
 * @param seconds — Duração total em segundos (inteiro ou decimal, será truncado)
 * @returns String formatada no padrão "m:ss" com zero à esquerda nos segundos
 */
export function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
