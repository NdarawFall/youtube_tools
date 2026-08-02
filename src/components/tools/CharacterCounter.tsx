'use client';
import { useState, useMemo } from 'react';
import { Type, Clock, Clipboard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CharacterCounter() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = words / 150;
    const seconds = Math.round((minutes % 1) * 60);
    const displayMinutes = Math.floor(minutes);
    
    return {
      chars: text.length,
      words,
      duration: `${displayMinutes}m ${seconds}s`
    };
  }, [text]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setText(text);
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  return (
    <div className="w-full max-w-lg flex flex-col gap-4">
      <div className="relative">
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Saisissez votre script ici..."
            className="w-full h-64 p-5 bg-white border border-slate-200 rounded-2xl text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none resize-none text-slate-800 transition-all duration-200 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)]"
        />
        <button 
            onClick={handlePaste}
            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
            title="Coller depuis le presse-papier"
        >
            <Clipboard className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-3 text-xs font-semibold text-slate-600">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]"
        >
          <Type className="w-4 h-4 text-indigo-500" />
          <span>{stats.chars} caractères</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]"
        >
          <Type className="w-4 h-4 text-indigo-500" />
          <span>{stats.words} mots</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-indigo-200 text-indigo-700 shadow-[0_2px_10px_-2px_rgba(79,70,229,0.1)]"
        >
          <Clock className="w-4 h-4" />
          <span>~{stats.duration} de vidéo</span>
        </motion.div>
      </div>
    </div>
  );
}
