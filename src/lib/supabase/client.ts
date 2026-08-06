import { createBrowserClient } from '@supabase/ssr';

/**
 * Client Supabase pour les composants client.
 *
 * Utilise `createBrowserClient` (et non `createClient`) pour que la session soit
 * stockée en cookies : c'est ce qui permet au middleware, aux Server Components
 * et aux Route Handlers de voir la même session que le navigateur.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Instance partagée, pour les composants qui n'ont pas besoin d'en créer une. */
export const supabase = createClient();
