'use client';
import { useEffect, useState } from 'react';
import { Save, KeyRound, ExternalLink } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/components/ui/Toast';
import { errorMessage } from '@/lib/api/errors';
import { updateProfile } from '@/lib/api/profile';
import { AVATARS, avatarIdFromUrl, avatarUrl, type AvatarId } from '@/lib/constants';

export default function Settings() {
  const { user, profile, isLoading: isUserLoading, refresh } = useUser();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<AvatarId>('homme');
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Renseigne le formulaire une fois le profil chargé.
  useEffect(() => {
    if (!profile) return;
    setUsername(profile.username ?? '');
    setAvatar(avatarIdFromUrl(profile.avatar_url));
    setApiKey(profile.gemini_api_key ?? '');
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSaving) return;

    const trimmedName = username.trim();
    if (!trimmedName) {
      toast.error("Le nom d'utilisateur ne peut pas être vide.");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(user.id, {
        username: trimmedName,
        avatarUrl: avatarUrl(avatar),
        geminiApiKey: apiKey.trim() || null,
      });
      await refresh();
      toast.success('Paramètres enregistrés.');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="w-full py-16 text-center text-slate-500">
        Chargement du profil...
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-6">
      <form
        onSubmit={handleSave}
        className="max-w-xl mx-auto bg-[#050608] rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col gap-6"
      >
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-slate-400 mb-2"
          >
            Nom d&apos;utilisateur
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-4 rounded-xl bg-black/20 border border-slate-800 text-slate-200 outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="api-key"
            className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2"
          >
            <KeyRound className="w-4 h-4" /> Clé API Gemini
          </label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza..."
            autoComplete="off"
            className="w-full p-4 rounded-xl bg-black/20 border border-slate-800 text-slate-200 outline-none focus:border-red-500 transition-colors font-mono text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">
            Nécessaire pour l&apos;outil Enhance Prompt. Gratuite via{' '}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-red-400 inline-flex items-center gap-1 transition-colors"
            >
              Google AI Studio <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-400 mb-4">Avatar</span>
          <div className="flex gap-6">
            {AVATARS.map(({ id, label, src }) => (
              <button
                key={id}
                type="button"
                onClick={() => setAvatar(id)}
                aria-pressed={avatar === id}
                className={`p-2 rounded-2xl border-4 transition-all ${
                  avatar === id
                    ? 'border-red-500'
                    : 'border-transparent hover:border-slate-700'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={label} className="w-20 h-20 rounded-full" />
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  );
}
