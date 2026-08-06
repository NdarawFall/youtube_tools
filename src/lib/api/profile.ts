import { supabase } from '@/lib/supabase/client';
import { toApiError } from './errors';
import type { Profile } from '@/lib/types/database';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw toApiError(error, 'Impossible de charger le profil.');
  return data;
}

export interface ProfileUpdate {
  username: string;
  avatarUrl: string;
  geminiApiKey: string | null;
}

/**
 * Met à jour le profil et les métadonnées d'authentification.
 * Le profil lui-même est créé par le trigger `on_auth_user_created`, on ne fait
 * donc qu'un update : plus d'upsert qui échouait silencieusement à l'inscription.
 */
export async function updateProfile(
  userId: string,
  { username, avatarUrl, geminiApiKey }: ProfileUpdate
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      username,
      avatar_url: avatarUrl,
      gemini_api_key: geminiApiKey,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw toApiError(error, "Impossible d'enregistrer le profil.");

  const { error: authError } = await supabase.auth.updateUser({
    data: { username, avatar_url: avatarUrl },
  });

  if (authError) {
    throw new Error('Profil enregistré, mais la session n\'a pas pu être mise à jour.');
  }
}
