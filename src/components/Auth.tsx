'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

type AuthMode = 'login' | 'signup-avatar' | 'signup-form';

interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function Auth({ theme, onClose, initialMode = 'login' }: { theme: 'dark' | 'light', onClose: () => void, initialMode?: 'login' | 'signup-avatar' }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<'homme' | 'femme' | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: Toast['type'], message: string, duration = 4000) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), duration);
  };

  const bgClass = theme === 'dark' ? 'bg-[#0a0c10]' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';
  const textClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-800';
  const inputBg = theme === 'dark' ? 'bg-[#050608]' : 'bg-slate-50';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showToast('error', `Erreur : ${error.message}`);
    } else {
      showToast('success', 'Connexion réussie ! Redirection...');
      setTimeout(() => { onClose(); window.location.href = '/dashboard'; }, 1500);
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAvatar) { showToast('error', 'Veuillez choisir un avatar.'); return; }
    if (!username.trim()) { showToast('error', 'Veuillez entrer un nom d\'utilisateur.'); return; }
    setLoading(true);

    const avatarUrl = `/avatar-${selectedAvatar}.png`;
    const gender = selectedAvatar === 'homme' ? 'homme' : 'femme';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, avatar_url: avatarUrl, gender },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      showToast('error', `Erreur : ${error.message}`);
    } else {
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          username,
          avatar_url: avatarUrl,
          gender,
        });
      }
      showToast('success', '🎉 Compte créé ! Vérifiez vos emails pour confirmer votre inscription.', 6000);
      setTimeout(() => setMode('login'), 2000);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const avatars = [
    { id: 'homme' as const, label: 'Homme', src: '/avatar-homme.png' },
    { id: 'femme' as const, label: 'Femme', src: '/avatar-femme.png' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold border ${
              toast.type === 'success'
                ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-red-950 border-red-700 text-red-300'
                : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`w-full max-w-sm p-8 rounded-3xl border ${borderClass} ${bgClass} shadow-2xl relative overflow-hidden`}
      >
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors">
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          
          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className={`text-2xl font-extrabold mb-1 ${textClass}`}>Connexion</h2>
              <p className="text-slate-500 text-sm mb-8">Ravis de vous revoir 👋</p>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border ${borderClass} ${inputBg} ${textClass} outline-none focus:border-red-500 transition-colors text-sm`}
                    type="email" placeholder="Email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border ${borderClass} ${inputBg} ${textClass} outline-none focus:border-red-500 transition-colors text-sm`}
                    type="password" placeholder="Mot de passe" value={password}
                    onChange={(e) => setPassword(e.target.value)} required
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="py-3.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 mt-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Se connecter'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-xs text-slate-600 font-medium">ou</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleLogin}
                className={`w-full py-3 rounded-xl border ${borderClass} ${inputBg} ${textClass} font-semibold text-sm hover:border-slate-600 transition-all flex items-center justify-center gap-3`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </button>

              <div className="mt-5 pt-5 border-t border-slate-800 text-center">
                <p className="text-slate-500 text-sm mb-3">Pas encore de compte ?</p>
                <button
                  onClick={() => setMode('signup-avatar')}
                  className="w-full py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition-all text-sm"
                >
                  Créer un compte gratuitement
                </button>
              </div>
            </motion.div>
          )}

          {/* ── SIGNUP STEP 1: AVATAR ── */}
          {mode === 'signup-avatar' && (
            <motion.div key="signup-avatar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className={`text-2xl font-extrabold mb-1 ${textClass}`}>Votre Avatar</h2>
              <p className="text-slate-500 text-sm mb-8">Choisissez votre représentation</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                      selectedAvatar === avatar.id
                        ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10'
                        : `${borderClass} hover:border-slate-600`
                    }`}
                  >
                    {selectedAvatar === avatar.id && (
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                    <div className={`w-20 h-20 rounded-full overflow-hidden border-2 ${selectedAvatar === avatar.id ? 'border-red-500' : 'border-slate-700'}`}>
                      <img src={avatar.src} alt={avatar.label} className="w-full h-full object-cover" />
                    </div>
                    <span className={`text-sm font-bold ${selectedAvatar === avatar.id ? 'text-red-400' : 'text-slate-400'}`}>{avatar.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => { if (!selectedAvatar) { showToast('error', 'Choisissez un avatar pour continuer.'); return; } setMode('signup-form'); }}
                disabled={!selectedAvatar}
                className="w-full py-3.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
              >
                Continuer →
              </button>

              <button onClick={() => setMode('login')} className="w-full mt-3 py-2.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
                ← Retour à la connexion
              </button>
            </motion.div>
          )}

          {/* ── SIGNUP STEP 2: FORM ── */}
          {mode === 'signup-form' && (
            <motion.div key="signup-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-500 shrink-0">
                  <img src={`/avatar-${selectedAvatar}.png`} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className={`text-xl font-extrabold ${textClass}`}>Vos Informations</h2>
                  <p className="text-slate-500 text-xs">Plus qu'une étape !</p>
                </div>
              </div>

              <form onSubmit={handleSignup} className="flex flex-col gap-4">
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border ${borderClass} ${inputBg} ${textClass} outline-none focus:border-red-500 transition-colors text-sm`}
                    type="text" placeholder="Nom d'utilisateur" value={username}
                    onChange={(e) => setUsername(e.target.value)} required
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border ${borderClass} ${inputBg} ${textClass} outline-none focus:border-red-500 transition-colors text-sm`}
                    type="email" placeholder="Email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border ${borderClass} ${inputBg} ${textClass} outline-none focus:border-red-500 transition-colors text-sm`}
                    type="password" placeholder="Mot de passe (min. 6 caractères)" value={password}
                    onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="py-3.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 mt-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "🚀 Créer mon compte"}
                </button>
              </form>

              <button onClick={() => setMode('signup-avatar')} className="w-full mt-3 py-2.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
                ← Changer d'avatar
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
