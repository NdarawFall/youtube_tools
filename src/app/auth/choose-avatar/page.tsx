'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AVATARS = [
  { id: 'homme' as const, label: 'Homme', src: '/avatar-homme.png' },
  { id: 'femme' as const, label: 'Femme', src: '/avatar-femme.png' },
];

export default function ChooseAvatarPage() {
  const [selected, setSelected] = useState<'homme' | 'femme' | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Pre-fill username from Google metadata if available
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setUsername(user.user_metadata.full_name);
      } else if (user?.user_metadata?.name) {
        setUsername(user.user_metadata.name);
      }
    });
  }, []);

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/'); return; }

    const avatarUrl = `/avatar-${selected}.png`;
    const gender = selected;

    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      username: username || user.email?.split('@')[0] || 'Utilisateur',
      avatar_url: avatarUrl,
      gender,
    });

    // Also update user metadata
    await supabase.auth.updateUser({ data: { avatar_url: avatarUrl, gender, username } });

    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-[#050608] flex flex-col items-center justify-center px-6 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md bg-white/[0.02] border border-white/[0.07] rounded-3xl p-10 flex flex-col gap-8"
      >
        <div className="text-center">
          <h1 className="text-3xl font-black text-white mb-2">Choisissez votre avatar</h1>
          <p className="text-slate-500 text-sm">{"Une dernière étape avant d'accéder à votre studio."}</p>
        </div>

        {/* Avatar Selection */}
        <div className="grid grid-cols-2 gap-4">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setSelected(avatar.id)}
              className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 ${
                selected === avatar.id
                  ? 'border-red-500 bg-red-500/10 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]'
                  : 'border-white/[0.08] hover:border-white/20 bg-white/[0.02]'
              }`}
            >
              {selected === avatar.id && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </motion.div>
              )}
              <div className={`w-24 h-24 rounded-full overflow-hidden border-2 transition-all ${selected === avatar.id ? 'border-red-500' : 'border-white/10'}`}>
                <img src={avatar.src} alt={avatar.label} className="w-full h-full object-cover" />
              </div>
              <span className={`text-sm font-bold transition-colors ${selected === avatar.id ? 'text-red-400' : 'text-slate-400'}`}>
                {avatar.label}
              </span>
            </button>
          ))}
        </div>

        {/* Username field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{"Nom d'utilisateur"}</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Comment vous appelle-t-on ?"
            className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-200 outline-none focus:border-red-500 transition-colors text-sm"
          />
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected || loading}
          className="w-full py-4 rounded-2xl bg-white text-[#050608] font-black text-base hover:bg-slate-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xl"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accéder à mon Studio →'}
        </button>
      </motion.div>
    </main>
  );
}
