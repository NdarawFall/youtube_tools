'use client';
import { useState, useMemo } from 'react';
import { Type, Clock, Clipboard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CharacterCounter({ theme }: { theme: 'dark' | 'light' }) {
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

  const bgClass = theme === 'dark' ? 'bg-[#0a0c10]' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';
  const textClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-800';

  return (
    <div className="w-full max-w-lg flex flex-col gap-4 relative">
      <div className="relative z-10">
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Saisissez votre script ici..."
            className={`w-full h-64 p-5 ${bgClass} border ${borderClass} rounded-2xl text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none ${textClass} transition-all duration-200 shadow-lg`}
        />
        <button 
            onClick={handlePaste}
            className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
            title="Coller depuis le presse-papier"
        >
            <Clipboard className="w-4 h-4" />
        </button>
      </div>
      
      {/* Animated Gradient Grid Background */}
      <motion.div 
          className="absolute inset-0 -z-0 opacity-10 rounded-2xl overflow-hidden"
          style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #ef4444 1px, transparent 0)',
              backgroundSize: '24px 24px'
          }}
          animate={{ backgroundPosition: ['0px 0px', '24px 24px'] }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-red-500/10 via-orange-500/10 to-transparent blur-2xl rounded-2xl" />

      <div className="flex gap-3 text-xs font-semibold text-slate-600 z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-2 ${bgClass} px-4 py-2 rounded-xl border ${borderClass} shadow-sm`}>
          <Type className="w-4 h-4 text-red-500" />
          <span>{stats.chars} caractères</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-2 ${bgClass} px-4 py-2 rounded-xl border ${borderClass} shadow-sm`}>
          <Type className="w-4 h-4 text-red-500" />
          <span>{stats.words} mots</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-2 ${bgClass} px-4 py-2 rounded-xl border ${theme === 'dark' ? 'border-red-900' : 'border-red-200'} text-red-600 shadow-sm`}>
          <Clock className="w-4 h-4" />
          <span>~{stats.duration} de vidéo</span>
        </motion.div>
      </div>
    </div>
  );
}
