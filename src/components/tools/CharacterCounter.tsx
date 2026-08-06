'use client';
import { useState, useMemo } from 'react';
import { Type, Clock, Clipboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';

/** Débit de parole moyen retenu pour l'estimation, en mots par minute. */
const WORDS_PER_MINUTE = 150;

export default function CharacterCounter() {
  const toast = useToast();
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const words = text.split(/\s+/).filter(Boolean).length;
    const totalSeconds = Math.round((words / WORDS_PER_MINUTE) * 60);

    return {
      chars: text.length,
      words,
      duration: `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`,
    };
  }, [text]);

  const handlePaste = async () => {
    try {
      setText(await navigator.clipboard.readText());
    } catch {
      toast.error("Impossible d'accéder au presse-papier.");
    }
  };

  return (
    <div className="w-full max-w-lg flex flex-col gap-4 relative">
      <div className="relative z-10">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Saisissez votre script ici..."
          className="w-full h-64 p-5 bg-[#0a0c10] border border-slate-800 rounded-2xl text-sm text-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none transition-all duration-200 shadow-lg"
        />
        <button
          onClick={handlePaste}
          title="Coller depuis le presse-papier"
          aria-label="Coller depuis le presse-papier"
          className="absolute top-4 right-4 p-2 rounded-xl transition-colors bg-slate-800 hover:bg-slate-700 text-slate-400"
        >
          <Clipboard className="w-4 h-4" />
        </button>
      </div>

      <motion.div
        aria-hidden
        className="absolute inset-0 z-0 opacity-10 rounded-2xl overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, #ef4444 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
        animate={{ backgroundPosition: ['0px 0px', '24px 24px'] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-tr from-red-500/10 via-orange-500/10 to-transparent blur-2xl rounded-2xl"
      />

      <div className="flex gap-3 text-xs font-semibold z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-[#0a0c10] px-4 py-2 rounded-xl border border-slate-800 text-slate-400 shadow-sm"
        >
          <Type className="w-4 h-4 text-red-500" />
          <span>{stats.chars} caractères</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-[#0a0c10] px-4 py-2 rounded-xl border border-slate-800 text-slate-400 shadow-sm"
        >
          <Type className="w-4 h-4 text-red-500" />
          <span>{stats.words} mots</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-[#0a0c10] px-4 py-2 rounded-xl border border-red-900 text-red-400 shadow-sm"
        >
          <Clock className="w-4 h-4" />
          <span>~{stats.duration} de vidéo</span>
        </motion.div>
      </div>
    </div>
  );
}
