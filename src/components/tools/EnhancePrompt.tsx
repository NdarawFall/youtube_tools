'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, Copy, Check } from 'lucide-react';

export default function EnhancePrompt({ theme }: { theme: 'dark' | 'light' }) {
  const [prompt, setPrompt] = useState('');
  const [enhanced, setEnhanced] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const enhance = async () => {
    setLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Non connecté');

        const { data: profile } = await supabase.from('profiles').select('gemini_api_key').eq('id', user.id).single();
        if (!profile?.gemini_api_key) throw new Error('Clé API manquante dans les paramètres');

        // Note: Pour une sécurité maximale, cet appel devrait se faire dans une Edge Function.
        // Ici, appel direct simplifié pour le prototypage.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${profile.gemini_api_key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: `Optimise ce prompt pour une IA : ${prompt}` }] }] })
        });
        const data = await response.json();
        setEnhanced(data.candidates[0].content.parts[0].text);
    } catch (e: any) {
        alert(e.message);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(enhanced);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Collez votre prompt ici..." className="flex-1 w-full p-4 rounded-xl bg-slate-900 border border-slate-700 outline-none text-slate-200" />
            <button onClick={enhance} disabled={loading || !prompt.trim()} className="py-4 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50">
                {loading ? 'Optimisation...' : <><Sparkles className="w-4 h-4"/> Optimiser le prompt</>}
            </button>
        </div>
        <div className="relative flex flex-col gap-2">
            <div className="flex-1 w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 overflow-y-auto">
                <p className="font-bold mb-2">Résultat :</p>
                {enhanced || 'Le résultat apparaîtra ici...'}
            </div>
            {enhanced && (
                <button onClick={copyToClipboard} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
            )}
        </div>
    </div>
  );
}
