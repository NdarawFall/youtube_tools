'use client';
import { useState } from 'react';
import { Type } from 'lucide-react';

export default function CharacterCounter() {
  const [text, setText] = useState('');

  return (
    <div className="w-full max-w-lg flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Saisissez votre texte ici..."
        className="w-full h-48 p-4 bg-[#0a0c10] border border-slate-800 rounded-xl text-sm focus:border-slate-600 focus:ring-1 focus:ring-slate-600 outline-none resize-none text-slate-300"
      />
      <div className="flex gap-4 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1.5 bg-[#0a0c10] px-3 py-1.5 rounded-lg border border-slate-800">
          <Type className="w-3.5 h-3.5" />
          <span>{text.length} caractères</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#0a0c10] px-3 py-1.5 rounded-lg border border-slate-800">
          <Type className="w-3.5 h-3.5" />
          <span>{text.split(/\s+/).filter(Boolean).length} mots</span>
        </div>
      </div>
    </div>
  );
}
