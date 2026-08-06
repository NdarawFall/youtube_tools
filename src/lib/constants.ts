import type { TaskStatus } from '@/lib/types/database';

/** Colonnes du kanban de production, dans l'ordre du pipeline. */
export const KANBAN_COLUMNS: ReadonlyArray<{ id: TaskStatus; title: string }> = [
  { id: 'idea', title: '💡 Idée' },
  { id: 'script', title: '📝 Script' },
  { id: 'thumbnail', title: '🖼️ Miniature' },
  { id: 'voiceover', title: '🎙️ Voix-Off' },
  { id: 'assets', title: '📦 Assets' },
  { id: 'editing', title: '✂️ Montage' },
  { id: 'music', title: '🎵 Musique' },
  { id: 'publication', title: '🚀 Publication' },
];

export type AvatarId = 'homme' | 'femme';

export const AVATARS: ReadonlyArray<{ id: AvatarId; label: string; src: string }> = [
  { id: 'homme', label: 'Homme', src: '/avatar-homme.png' },
  { id: 'femme', label: 'Femme', src: '/avatar-femme.png' },
];

export const avatarUrl = (id: AvatarId) => `/avatar-${id}.png`;

/** Déduit l'avatar sélectionné depuis l'URL stockée en base. */
export const avatarIdFromUrl = (url: string | null | undefined): AvatarId =>
  url?.includes('femme') ? 'femme' : 'homme';
