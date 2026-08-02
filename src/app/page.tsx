'use client';
import { useState } from 'react';
import VideoProcessor from '@/components/VideoProcessor';
import CharacterCounter from '@/components/tools/CharacterCounter';
import ReverseVideo from '@/components/tools/ReverseVideo';
import { Video, LayoutGrid, Type, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <main className="h-screen w-screen bg-slate-50 text-slate-900 font-sans p-4 flex flex-col overflow-hidden">
      
      {/* App Header */}
      <header className="flex-none flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all active:scale-95"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>
          <h1 className="font-bold text-base tracking-tight text-slate-950">
            CreatorStudio
          </h1>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* Navigation */}
        <AnimatePresence>
            {isSidebarOpen && (
            <motion.nav 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex-none flex md:flex-col gap-2 overflow-hidden"
            >
                {TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeToolId === tool.id;
                return (
                    <button
                    key={tool.id}
                    onClick={() => setActiveToolId(tool.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium flex-1 md:flex-none ${
                        isActive 
                        ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
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
        <section className="flex-1 bg-white border border-slate-200 shadow-sm rounded-3xl p-8 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full max-w-2xl flex flex-col items-center justify-center">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-slate-950 mb-2">
                        {TOOLS.find(t => t.id === activeToolId)?.name}
                    </h2>
                    <p className="text-sm text-slate-500">
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

