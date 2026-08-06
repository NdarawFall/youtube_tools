'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save } from 'lucide-react';

export default function Settings({ theme, onProfileUpdate }: { theme: 'dark' | 'light', onProfileUpdate: () => void }) {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<'homme' | 'femme'>('homme');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUsername(user.user_metadata.username || '');
            const { data: profile } = await supabase.from('profiles').select('avatar_url, gemini_api_key').eq('id', user.id).single();
            if (profile?.avatar_url) setAvatar(profile.avatar_url.includes('homme') ? 'homme' : 'femme');
            if (profile?.gemini_api_key) setApiKey(profile.gemini_api_key);
        }
    };
    fetchProfile();
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.auth.updateUser({ data: { username } });
        await supabase.from('profiles').upsert({ id: user.id, avatar_url: `/${avatar === 'homme' ? 'avatar-homme' : 'avatar-femme'}.png`, gemini_api_key: apiKey });
        alert('Paramètres enregistrés !');
        onProfileUpdate();
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-6">
        <div className="max-w-xl mx-auto bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Paramètres du profil</h2>
            <div className="flex flex-col gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Nom d'utilisateur</label>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-4 rounded-xl bg-black/20 border border-slate-700 outline-none focus:border-red-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Clé API Gemini</label>
                    <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full p-4 rounded-xl bg-black/20 border border-slate-700 outline-none focus:border-red-500" placeholder="AIza..." />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-4">Avatar</label>
                    <div className="flex gap-6">
                        <button onClick={() => setAvatar('homme')} className={`p-2 rounded-2xl border-4 transition-all ${avatar === 'homme' ? 'border-red-500' : 'border-transparent'}`}>
                            <img src="/avatar-homme.png" alt="homme" className="w-20 h-20 rounded-full" />
                        </button>
                        <button onClick={() => setAvatar('femme')} className={`p-2 rounded-2xl border-4 transition-all ${avatar === 'femme' ? 'border-red-500' : 'border-transparent'}`}>
                            <img src="/avatar-femme.png" alt="femme" className="w-20 h-20 rounded-full" />
                        </button>
                    </div>
                </div>
                
                <button onClick={saveSettings} disabled={loading} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all active:scale-[0.98]">
                    <Save className="w-4 h-4" /> {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
            </div>
        </div>
    </div>
  );
}
