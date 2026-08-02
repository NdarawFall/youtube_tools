'use client';
import { useState } from 'react';
import VideoProcessor from '@/components/VideoProcessor';
import CharacterCounter from '@/components/tools/CharacterCounter';
import ReverseVideo from '@/components/tools/ReverseVideo';
import { Video, LayoutGrid, Type, RefreshCw, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOOLS = [
  { id: 'frame-extractor', name: 'Frame Extractor', icon: Video, description: 'Extraction d\'images HD' },
  { id: 'char-counter', name: 'Script Counter', icon: Type, description: 'Statistiques de script' },
  { id: 'reverse-video', name: 'Reverse Video', icon: RefreshCw, description: 'Inverser une séquence' },
];

export default function Home() {
  const [activeToolId, setActiveToolId] = useState('frame-extractor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderTool = () => {
    switch (activeToolId) {
      case 'frame-extractor': return <VideoProcessor />;
      case 'char-counter': return <CharacterCounter />;
      case 'reverse-video': return <ReverseVideo />;
      default: return <div className="text-center py-20 text-slate-500">Outil en développement...</div>;
    }
  };

  return (
    <main className="h-screen w-screen bg-[#050608] text-slate-300 font-sans p-4 flex flex-col overflow-hidden">
      
      {/* App Header */}
      <header className="flex-none flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2.5 rounded-xl bg-[#0a0c10] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all active:scale-95"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>
          <h1 className="font-semibold text-sm tracking-tight text-white">
            CreatorStudio
          </h1>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        
        {/* Navigation */}
        <AnimatePresence>
            {isSidebarOpen && (
            <motion.nav 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 192, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex-none flex md:flex-col gap-1 overflow-hidden"
            >
                {TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeToolId === tool.id;
                return (
                    <button
                    key={tool.id}
                    onClick={() => setActiveToolId(tool.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm flex-1 md:flex-none ${
                        isActive 
                        ? 'bg-[#0a0c10] text-white border border-slate-800' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-[#0a0c10]/50'
                    }`}
                    >
                    <Icon className="w-4 h-4" />
                    {tool.name}
                    </button>
                );
                })}
            </motion.nav>
            )}
        </AnimatePresence>

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
    </main>
  );
}

