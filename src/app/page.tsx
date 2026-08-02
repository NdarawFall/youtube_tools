'use client';
import { useState } from 'react';
import VideoProcessor from '@/components/VideoProcessor';
import CharacterCounter from '@/components/tools/CharacterCounter';
import { Video, LayoutGrid, Settings, HelpCircle, Type } from 'lucide-react';

const TOOLS = [
  { id: 'frame-extractor', name: 'Frame Extractor', icon: Video, description: 'Extraction d\'images HD' },
  { id: 'char-counter', name: 'Script Counter', icon: Type, description: 'Statistiques de script' },
];

export default function Home() {
  const [activeToolId, setActiveToolId] = useState('frame-extractor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderTool = () => {
    switch (activeToolId) {
      case 'frame-extractor': return <VideoProcessor />;
      case 'char-counter': return <CharacterCounter />;
      default: return <div className="text-center py-20 text-slate-500">Outil en développement...</div>;
    }
  };

  return (
    <main className="h-screen w-screen bg-[#050608] text-slate-300 font-sans p-4 flex flex-col overflow-hidden">
      
      {/* App Header */}
      <header className="flex-none flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-9 h-9 rounded-xl bg-[#0a0c10] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <h1 className="font-semibold text-sm tracking-tight text-white">
            CreatorStudio
          </h1>
        </div>
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0c10] border border-slate-800 text-xs text-slate-400 hover:text-white transition-colors">
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Connexion avec Google</span>
            </button>
            <button className="p-2 text-slate-500 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
            <button className="p-2 text-slate-500 hover:text-white transition-colors"><HelpCircle className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        
        {/* Navigation */}
        {isSidebarOpen && (
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
                      ? 'bg-[#0a0c10] text-white border border-slate-800' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tool.name}
                </button>
              );
            })}
          </nav>
        )}

        {/* Content Area */}
        <section className="flex-1 bg-[#0a0c10] border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full max-w-2xl flex flex-col items-center justify-center">
                <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold text-white mb-1">
                        {TOOLS.find(t => t.id === activeToolId)?.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {TOOLS.find(t => t.id === activeToolId)?.description}
                    </p>
                </div>
                
                <div className="w-full flex justify-center">
                    {renderTool()}
                </div>
            </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="flex-none pt-4 flex items-center justify-between text-[10px] text-slate-700">
        <span>&copy; CreatorStudio</span>
        <span>2026</span>
      </footer>
    </main>
  );
}

