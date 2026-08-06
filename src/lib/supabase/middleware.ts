import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Rafraîchit la session Supabase et renvoie la réponse porteuse des cookies
 * mis à jour, ainsi que l'utilisateur courant (ou null).
 *
 * IMPORTANT : toujours renvoyer l'objet `response` produit ici (ou en recopier
 * les cookies), sinon la session rafraîchie est perdue et l'utilisateur est
 * déconnecté de façon aléatoire.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // `getUser()` et non `getSession()` : seul getUser revalide le jeton auprès
  // du serveur Supabase. getSession fait confiance au cookie, qui est falsifiable.
  const { data: { user } } = await supabase.auth.getUser();

  return { response, user };
}
