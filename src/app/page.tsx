'use client';
import { useState } from 'react';
import VideoProcessor from '@/components/VideoProcessor';
import { 
  Sparkles, 
  Image as ImageIcon, 
  FileText, 
  Mic, 
  Wand2, 
  Scissors, 
  Video, 
  ShieldCheck, 
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'frame-extractor' | string>('frame-extractor');

  const upcomingTools = [
    { id: 'seo-title', name: 'Générateur Titres & Tags SEO', icon: FileText, desc: 'Optimisez le référencement de vos vidéos', tag: 'IA' },
    { id: 'audio-converter', name: 'Convertisseur Vidéo vers MP3', icon: Mic, desc: 'Extrayez l\'audio pour voix-off', tag: 'Audio' },
    { id: 'thumbnail-gen', name: 'Générateur de Miniature', icon: Wand2, desc: 'Créez des miniatures virales avec l\'IA', tag: 'IA' },
    { id: 'shorts-clipper', name: 'Découpeur de Shorts', icon: Scissors, desc: 'Transformez des vidéos longues en Shorts', tag: 'Vidéo' },
  ];

  return (
    <main className="min-h-screen w-screen flex flex-col justify-between bg-gradient-to-b from-[#07090e] via-[#0b0f19] to-[#07090e] text-slate-100 font-sans overflow-x-hidden">
      
      {/* Top Navbar */}
      <nav className="w-full border-b border-slate-800/60 bg-[#07090e]/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-md shadow-red-600/10">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              CreatorHub <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Faceless</span>
            </h2>
          </div>
        </div>

        {/* Google Login Placeholder Button */}
        <button 
          onClick={() => alert("La connexion Google sera bientôt disponible !")}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
          </svg>
          Se connecter avec Google
        </button>
      </nav>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 flex flex-col items-center">
        
        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Boîte d&apos;outils 100% Gratuite pour Youtubeurs</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-300">
            Faceless Creator Studio
          </h1>
        </div>

        {/* Tools Tabs Navigation */}
        <div className="w-full flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('frame-extractor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === 'frame-extractor'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-indigo-300" />
            Extracteur de Frame
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {upcomingTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => alert(`L'outil "${tool.name}" arrive bientôt !`)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900/40 text-slate-500 hover:text-slate-400 border border-slate-800/60 transition-all shrink-0 opacity-70 hover:opacity-100"
              >
                <Icon className="w-3.5 h-3.5 text-slate-500" />
                {tool.name}
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                  Bientôt
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Tool Area */}
        <div className="w-full flex-1 flex items-center justify-center">
          {activeTab === 'frame-extractor' && <VideoProcessor />}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/40 py-3 px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Vos médias sont traités localement sur votre ordinateur sans aucun serveur.
        </span>
        <div className="flex items-center gap-4">
          <span>Outils Faceless YouTube v1.0</span>
        </div>
      </footer>

    </main>
  );
}
