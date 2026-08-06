import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Erreur applicative porteuse d'un message déjà lisible par l'utilisateur.
 * Les composants peuvent afficher `error.message` sans retraitement.
 */
export class ApiError extends Error {
  readonly cause?: PostgrestError;

  constructor(message: string, cause?: PostgrestError) {
    super(message);
    this.name = 'ApiError';
    this.cause = cause;
  }
}

/** Codes PostgREST / Postgres les plus courants, traduits pour l'interface. */
const MESSAGES: Record<string, string> = {
  '23505': 'Cet élément existe déjà.',
  '23503': "L'élément lié n'existe plus.",
  '23502': 'Un champ obligatoire est manquant.',
  '42501': "Vous n'avez pas les droits nécessaires.",
  PGRST116: 'Élément introuvable.',
  PGRST301: 'Session expirée. Reconnectez-vous.',
};

/**
 * Convertit une erreur Supabase en `ApiError` avec un message en français.
 * Le détail technique est journalisé en console, jamais affiché.
 */
export function toApiError(error: PostgrestError, fallback: string): ApiError {
  console.error('[supabase]', error.code, error.message, error.details);
  return new ApiError(MESSAGES[error.code] ?? fallback, error);
}

/** Extrait un message affichable de n'importe quelle valeur levée. */
export function errorMessage(error: unknown, fallback = 'Une erreur est survenue.'): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
