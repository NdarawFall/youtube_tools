'use client';
import { useState } from 'react';
import VideoProcessor from '@/components/VideoProcessor';
import { Video, ShieldCheck, Sparkles, LayoutGrid, Settings, HelpCircle } from 'lucide-react';

// To be moved to a registry/config later for modularity
const TOOLS = [
  { id: 'frame-extractor', name: 'Frame Extractor', icon: Video, description: 'Extraction HD locale' },
];

export default function Home() {
  const [activeToolId, setActiveToolId] = useState('frame-extractor');

  const renderTool = () => {
    switch (activeToolId) {
      case 'frame-extractor': return <VideoProcessor />;
      default: return <div className="text-center py-20 text-slate-500">Outil en développement...</div>;
    }
  };

  return (
    <main className="h-screen w-screen bg-[#050608] text-slate-200 font-sans p-4 flex flex-col overflow-hidden">
      
      {/* App Header */}
      <header className="flex-none flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <h1 className="font-bold text-base tracking-tight text-white">
            Creator<span className="text-indigo-400">Studio</span>
          </h1>
        </div>
        <div className="flex items-center gap-1">
            <button className="p-2 text-slate-500 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
            <button className="p-2 text-slate-500 hover:text-white transition-colors"><HelpCircle className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Main Container - Centered and Scroll-Free */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        
        {/* Navigation - Fixed Width */}
        <nav className="w-full md:w-48 flex-none flex md:flex-col gap-1">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeToolId === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveToolId(tool.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm flex-1 md:flex-none ${
                    isActive 
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                    : 'text-slate-500 hover:bg-slate-900/50 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tool.name}
              </button>
            );
          })}
        </nav>

        {/* Content Area - Perfectly Centered */}
        <section className="flex-1 bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full max-w-2xl flex flex-col items-center justify-center">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-white mb-1">
                        {TOOLS.find(t => t.id === activeToolId)?.name}
                    </h2>
                    <p className="text-sm text-slate-400">
                        {TOOLS.find(t => t.id === activeToolId)?.description}
                    </p>
                </div>
                
                <div className="w-full flex justify-center">
                    {renderTool()}
                </div>
            </div>
        </section>
      </div>

      {/* Footer - Minimal */}
      <footer className="flex-none pt-4 flex items-center justify-between text-[10px] text-slate-700">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-800" /> Traitement local
        </span>
        <span>v1.0</span>
      </footer>
    </main>
  );
}
