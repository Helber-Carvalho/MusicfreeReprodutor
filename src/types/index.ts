/**
 * Types / index.ts — Declarações de tipos genéricos do app.
 *
 * Centraliza os tipos compartilhados entre módulos para evitar
 * dependências circulares e facilitar a manutenção.
 */

/** Estados possíveis do player de áudio */
export type PlayerState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'STOPPED';
