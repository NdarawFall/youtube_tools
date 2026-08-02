'use client';
import { useState, useMemo } from 'react';
import { Type, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CharacterCounter() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const words = text.split(/\s+/).filter(Boolean).length;
    // Estimated average speaking rate: 150 words per minute
    const minutes = words / 150;
    const seconds = Math.round((minutes % 1) * 60);
    const displayMinutes = Math.floor(minutes);
    
    return {
      chars: text.length,
      words,
      duration: `${displayMinutes}m ${seconds}s`
    };
  }, [text]);

  return (
    <div className="w-full max-w-lg flex flex-col gap-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Saisissez votre script ici..."
        className="w-full h-64 p-5 bg-white border border-slate-200 rounded-2xl text-sm focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 outline-none resize-none text-slate-800 transition-all duration-200 shadow-inner"
      />
      <div className="flex gap-3 text-xs font-semibold text-slate-600">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <Type className="w-4 h-4 text-indigo-500" />
          <span>{stats.chars} caractères</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <Type className="w-4 h-4 text-indigo-500" />
          <span>{stats.words} mots</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-indigo-200 text-indigo-700 shadow-sm"
        >
          <Clock className="w-4 h-4" />
          <span>~{stats.duration} de vidéo</span>
        </motion.div>
      </div>
    </div>
  );
}
