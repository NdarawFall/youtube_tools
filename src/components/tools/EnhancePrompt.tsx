'use client';
import { useState } from 'react';
import { Sparkles, Copy, Check, AlertCircle } from 'lucide-react';

export default function EnhancePrompt() {
  const [prompt, setPrompt] = useState('');
  const [enhanced, setEnhanced] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const enhance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "L'optimisation a échoué.");
        return;
      }
      setEnhanced(data.result);
    } catch {
      setError('Problème de connexion. Vérifiez votre réseau.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(enhanced);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Collez votre prompt ici..."
          className="flex-1 w-full p-4 rounded-xl bg-slate-900 border border-slate-700 outline-none focus:border-red-500 transition-colors text-slate-200 resize-none"
        />

        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-950/40 border border-red-900 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={enhance}
          disabled={loading || !prompt.trim()}
          className="py-4 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            'Optimisation...'
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Optimiser le prompt
            </>
          )}
        </button>
      </div>

      <div className="relative flex flex-col gap-2">
        <div className="flex-1 w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 overflow-y-auto whitespace-pre-wrap">
          <p className="font-bold mb-2">Résultat :</p>
          {enhanced || (
            <span className="text-slate-500">Le résultat apparaîtra ici...</span>
          )}
        </div>
        {enhanced && (
          <button
            onClick={copyToClipboard}
            aria-label="Copier le résultat"
            className="absolute top-4 right-4 p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
