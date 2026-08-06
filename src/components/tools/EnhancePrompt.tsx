'use client';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function EnhancePrompt({ theme }: { theme: 'dark' | 'light' }) {
  const [prompt, setPrompt] = useState('');
  const [enhanced, setEnhanced] = useState('');
  const [loading, setLoading] = useState(false);

  const enhance = async () => {
    setLoading(true);
    // Simulation d'appel API - À remplacer par votre intégration API réelle si besoin
    setTimeout(() => {
        setEnhanced(`[Prompt amélioré] : "${prompt}" structuré pour une IA : Agis en tant qu'expert en création de contenu YouTube. Analyse ce prompt : ${prompt}. Reformule-le de manière claire, concise, et ajoute des instructions spécifiques pour maximiser la pertinence de la réponse.`);
        setLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Collez votre prompt ici..." className="w-full h-40 p-4 rounded-xl bg-slate-900 border border-slate-700 outline-none text-slate-200" />
        <button onClick={enhance} disabled={loading || !prompt.trim()} className="py-3 px-6 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50">
            {loading ? 'Optimisation...' : <><Sparkles className="w-4 h-4"/> Optimiser le prompt</>}
        </button>
        {enhanced && (
            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-300">
                <p className="font-bold mb-2">Résultat :</p>
                {enhanced}
            </div>
        )}
    </div>
  );
}
