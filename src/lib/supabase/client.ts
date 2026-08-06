import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

/**
 * Client Supabase pour les composants client.
 *
 * Utilise `createBrowserClient` (et non `createClient`) pour que la session soit
 * stockée en cookies : c'est ce qui permet au proxy, aux Server Components et
 * aux Route Handlers de voir la même session que le navigateur.
 *
 * L'instance est créée à la première utilisation, jamais à l'import : le
 * prérendu au build évalue ces modules sans variables d'environnement, et une
 * création immédiate y ferait échouer la compilation.
 */
export function createClient(): SupabaseClient {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}

/**
 * Instance partagée. Le proxy diffère la création jusqu'au premier accès à une
 * propriété, ce qui préserve l'écriture `supabase.from(...)` dans les
 * composants sans instancier quoi que ce soit au chargement du module.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property, _receiver) {
    const instance = createClient();
    const value = Reflect.get(instance, property, instance);
    // Les méthodes doivent rester liées au client, pas au proxy.
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
