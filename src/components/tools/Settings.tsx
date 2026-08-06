'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Save } from 'lucide-react';

export default function Settings({ theme }: { theme: 'dark' | 'light' }) {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<'homme' | 'femme'>('homme');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUsername(user.user_metadata.username || '');
            const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
            if (profile?.avatar_url) setAvatar(profile.avatar_url.includes('homme') ? 'homme' : 'femme');
        }
    };
    fetchProfile();
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.auth.updateUser({ data: { username } });
        await supabase.from('profiles').upsert({ id: user.id, avatar_url: `/${avatar === 'homme' ? 'avatar-homme' : 'avatar-femme'}.png` });
        alert('Paramètres enregistrés !');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-lg p-6 bg-slate-900 rounded-3xl border border-slate-800">
        <h2 className="text-xl font-bold mb-6">Paramètres du profil</h2>
        <div className="flex flex-col gap-4">
            <label className="text-sm font-medium">Nom d'utilisateur</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="p-3 rounded-xl bg-black/20 border border-slate-700 outline-none" />
            
            <label className="text-sm font-medium">Avatar</label>
            <div className="flex gap-4">
                <button onClick={() => setAvatar('homme')} className={`p-2 rounded-xl border ${avatar === 'homme' ? 'border-red-500' : 'border-slate-700'}`}>
                    <img src="/avatar-homme.png" alt="homme" className="w-16 h-16 rounded-full" />
                </button>
                <button onClick={() => setAvatar('femme')} className={`p-2 rounded-xl border ${avatar === 'femme' ? 'border-red-500' : 'border-slate-700'}`}>
                    <img src="/avatar-femme.png" alt="femme" className="w-16 h-16 rounded-full" />
                </button>
            </div>
            
            <button onClick={saveSettings} disabled={loading} className="mt-4 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
        </div>
    </div>
  );
}
