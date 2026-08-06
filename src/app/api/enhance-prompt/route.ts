import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';
const MAX_PROMPT_LENGTH = 8_000;
const REQUEST_TIMEOUT_MS = 30_000;

const SYSTEM_INSTRUCTION = `Tu es un expert en ingénierie de prompts.
Réécris le prompt fourni pour le rendre plus précis, structuré et efficace :
- clarifie l'intention et le résultat attendu ;
- ajoute le contexte et les contraintes utiles ;
- précise le format de sortie souhaité ;
- reste dans la langue du prompt d'origine.
Réponds uniquement avec le prompt optimisé, sans préambule ni commentaire.`;

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Vous devez être connecté.' }, { status: 401 });
  }

  let prompt: string;
  try {
    const body = await request.json();
    prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  if (!prompt) {
    return NextResponse.json({ error: 'Le prompt est vide.' }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Le prompt dépasse ${MAX_PROMPT_LENGTH} caractères.` },
      { status: 413 }
    );
  }

  // La clé reste côté serveur : elle n'est jamais transmise au navigateur.
  const { data: profile } = await supabase
    .from('profiles')
    .select('gemini_api_key')
    .eq('id', user.id)
    .maybeSingle();

  const apiKey = profile?.gemini_api_key;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Aucune clé API Gemini enregistrée. Ajoutez-la dans les paramètres.' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // On journalise le détail côté serveur, on renvoie un message neutre au
      // client pour ne rien divulguer de la configuration.
      console.error('Gemini API error', response.status, data?.error?.message);

      const message =
        response.status === 404
          ? `Le modèle « ${GEMINI_MODEL} » est introuvable ou retiré. Ajustez la variable GEMINI_MODEL.`
          : response.status === 403
            ? 'Clé API Gemini refusée. Vérifiez sa validité et ses autorisations.'
            : response.status === 400
              ? 'Requête refusée par Gemini. La clé API est probablement invalide.'
              : response.status === 429
                ? 'Quota Gemini dépassé. Réessayez plus tard.'
                : 'Le service Gemini est momentanément indisponible.';

      return NextResponse.json({ error: message }, { status: response.status });
    }

    // Un candidat peut revenir vide si la génération a été interrompue
    // (filtre de sécurité, limite de tokens...).
    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (typeof text !== 'string' || !text.trim()) {
      console.error('Gemini empty response', candidate?.finishReason);
      return NextResponse.json(
        {
          error:
            candidate?.finishReason === 'SAFETY'
              ? 'Gemini a bloqué ce prompt pour des raisons de sécurité.'
              : "Gemini n'a renvoyé aucun résultat exploitable.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ result: text.trim() });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      console.error('Gemini request timed out');
      return NextResponse.json(
        { error: 'Gemini met trop de temps à répondre. Réessayez.' },
        { status: 504 }
      );
    }
    console.error('Gemini request failed', error);
    return NextResponse.json(
      { error: 'Impossible de contacter le service Gemini.' },
      { status: 502 }
    );
  }
}
