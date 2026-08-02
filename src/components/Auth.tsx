'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { X, Mail, Lock, User } from 'lucide-react';

export default function Auth({ theme, onClose }: { theme: 'dark' | 'light', onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { username } } 
      });
      if (error) alert(error.message);
      else {
        if (data.user) {
            await supabase.from('profiles').insert([{ id: data.user.id, email, username }]);
        }
        alert('Compte créé, vérifiez vos emails.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else onClose();
    }
    setLoading(false);
  };

  const bgClass = theme === 'dark' ? 'bg-[#0a0c10]' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';
  const textClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`w-full max-w-sm p-8 rounded-3xl border ${borderClass} ${bgClass} shadow-2xl`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${textClass}`}>{isSignUp ? 'Créer un compte' : 'Connexion'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input className={`w-full pl-10 p-3 rounded-xl border ${borderClass} ${bgClass} ${textClass} outline-none focus:border-red-500`} type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} required />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input className={`w-full pl-10 p-3 rounded-xl border ${borderClass} ${bgClass} ${textClass} outline-none focus:border-red-500`} type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input className={`w-full pl-10 p-3 rounded-xl border ${borderClass} ${bgClass} ${textClass} outline-none focus:border-red-500`} type="password" placeholder="Mot de passe" onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button disabled={loading} className="py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all">{loading ? '...' : isSignUp ? 'S\'inscrire' : 'Connexion'}</button>
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-xs text-slate-500 hover:text-red-500 transition-colors">
            {isSignUp ? 'Déjà un compte ? Connexion' : 'Pas de compte ? S\'inscrire'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
