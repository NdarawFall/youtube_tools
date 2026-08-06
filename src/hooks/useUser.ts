'use client';
import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { getProfile } from '@/lib/api/profile';
import type { Profile } from '@/lib/types/database';

interface UseUserResult {
  user: User | null;
  profile: Profile | null;
  /** Nom affichable, avec repli sur l'email puis un libellé neutre. */
  displayName: string;
  isLoading: boolean;
  /** Recharge le profil, par exemple après modification dans les paramètres. */
  refresh: () => Promise<void>;
}

/**
 * Source unique de vérité pour l'utilisateur connecté et son profil.
 * Remplace les `supabase.auth.getUser()` dupliqués dans chaque composant.
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    if (!currentUser) {
      setProfile(null);
      return;
    }

    try {
      setProfile(await getProfile(currentUser.id));
    } catch {
      // Le profil peut être absent juste après l'inscription : ce n'est pas
      // bloquant, l'interface se rabat sur les métadonnées de session.
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    load().finally(() => {
      if (active) setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        load();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [load]);

  const displayName =
    profile?.username ||
    (user?.user_metadata?.username as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Utilisateur';

  return { user, profile, displayName, isLoading, refresh: load };
}
