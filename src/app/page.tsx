import VideoProcessor from '@/components/VideoProcessor';
import { Film, ShieldCheck, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="h-screen w-screen flex flex-col justify-between p-4 sm:p-6 overflow-hidden bg-gradient-to-b from-[#07090e] via-[#0b0f19] to-[#07090e]">
      
      {/* Header (Compact) */}
      <header className="flex flex-col items-center text-center mt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-2 backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Extraction d&apos;Images HD</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-300">
          Frame Extractor
        </h1>
        
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-1">
          Extrayez instantanément la première ou dernière image de n&apos;importe quelle vidéo sans aucun transfert de données.
        </p>
      </header>

      {/* Main Interactive Processor */}
      <div className="flex-1 flex items-center justify-center py-2">
        <VideoProcessor />
      </div>

      {/* Footer (Compact) */}
      <footer className="flex items-center justify-center gap-6 text-[11px] text-slate-500 py-1 border-t border-slate-800/40">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Traitement 100% sécurisé en local
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Film className="w-3.5 h-3.5 text-indigo-400" /> Tous formats vidéo supportés
        </span>
      </footer>

    </main>
  );
}
