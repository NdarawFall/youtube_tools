# CreatorStudio

Tableau de bord tout-en-un pour les créateurs de contenu « faceless » : centraliser
les idées, suivre le pipeline de production vidéo, et regrouper les outils du
quotidien dans un seul espace de travail.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** · **Framer Motion** · **lucide-react**
- **Supabase** (authentification + PostgreSQL)
- **ffmpeg.wasm** pour le traitement vidéo côté navigateur

## Démarrage

```bash
npm install
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

### Variables d'environnement

Créez un fichier `.env.local` à la racine :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<votre-projet>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre-clé-anon>
```

## Structure

```text
src/
├── app/                    Routes (App Router)
│   ├── page.tsx            Landing publique
│   ├── dashboard/          Espace de travail (protégé)
│   └── auth/               Callback OAuth et onboarding
├── components/
│   ├── tools/              Les outils du dashboard
│   └── Auth.tsx            Modale de connexion / inscription
├── lib/
│   └── supabase/           Clients Supabase (client, serveur, middleware)
└── middleware.ts           Session, garde d'authentification, blocage mobile
```

## Outils disponibles

| Outil | Rôle |
| --- | --- |
| YouTube Studio | Projets vidéo et kanban de production |
| Enhance Prompt | Optimisation de prompts via Gemini |
| Frame Extractor | Extraction de la première / dernière image d'une vidéo |
| Script Counter | Analyse de la longueur des scripts |
| Reverse Video | Inversion du sens de lecture d'un clip |
| Todo List | Gestion des tâches quotidiennes |
| Paramètres | Profil, avatar, clé API |

## Base de données

Les scripts SQL et les commandes d'administration Supabase sont regroupés dans
`private/NOTES.md` (non versionné).

## Scripts

```bash
npm run dev      # serveur de développement
npm run build    # build de production
npm run start    # serveur de production
npm run lint     # linter
```

## Note sur le support mobile

L'interface est conçue pour ordinateur et tablette. Les visiteurs mobiles sont
redirigés vers `/mobile-restricted` par le middleware.
