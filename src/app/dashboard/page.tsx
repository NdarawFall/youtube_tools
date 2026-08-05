'use client';
import { useState, useEffect } from 'react';
import VideoProcessor from '@/components/VideoProcessor';
import CharacterCounter from '@/components/tools/CharacterCounter';
import ReverseVideo from '@/components/tools/ReverseVideo';
import TodoList from '@/components/tools/TodoList';
import { supabase } from '@/lib/supabase';
import { Video, LayoutGrid, Type, RefreshCw, ChevronLeft, LogOut, User, Moon, Sun, ListTodo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOOLS = [
  { id: 'frame-extractor', name: 'Frame Extractor', icon: Video, description: 'Extraction d\'images HD' },
  { id: 'char-counter', name: 'Script Counter', icon: Type, description: 'Statistiques de script' },
  { id: 'reverse-video', name: 'Reverse Video', icon: RefreshCw, description: 'Inverser une séquence' },
  { id: 'todo-list', name: 'Todo List', icon: ListTodo, description: 'Gestion des tâches interactives' },
];

export default function Dashboard() {
  const [activeToolId, setActiveToolId] = useState('frame-extractor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser({ ...user, username: user.user_metadata.username || 'Utilisateur' });
        }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const renderTool = () => {
    switch (activeToolId) {
      case 'frame-extractor': return <VideoProcessor theme={theme} />;
      case 'char-counter': return <CharacterCounter theme={theme} />;
      case 'reverse-video': return <ReverseVideo theme={theme} />;
      case 'todo-list': return <TodoList theme={theme} />;
      default: return <div className="text-center py-20 opacity-50">Outil en développement...</div>;
    }
  };

  return (
    <main className={`h-screen w-screen font-sans p-4 flex flex-col overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050608] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      
      <header className="flex-none flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2.5 rounded-2xl border transition-all active:scale-95 ${theme === 'dark' ? 'bg-[#0a0c10] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>
          <h1 className="font-bold text-base tracking-tight">Creator<span className="text-red-500 italic">Studio</span></h1>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2.5 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-[#0a0c10] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-medium ${theme === 'dark' ? 'bg-[#0a0c10] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                <User className="w-3.5 h-3.5" />
                <span>{user?.username || 'Utilisateur'}</span>
            </div>
            <button onClick={handleLogout} className="p-2.5 rounded-2xl text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
            </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        <AnimatePresence>
            {isSidebarOpen && (
            <motion.nav initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex-none flex md:flex-col gap-2 overflow-hidden">
                {TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeToolId === tool.id;
                return (
                    <button key={tool.id} onClick={() => setActiveToolId(tool.id)} className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all text-sm font-semibold flex-1 md:flex-none ${isActive ? (theme === 'dark' ? 'bg-[#0a0c10] text-red-500 border border-slate-800' : 'bg-white text-red-600 border border-slate-200 shadow-sm') : (theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-900')}`}>
                    <Icon className="w-4 h-4" />
                    {tool.name}
                    </button>
                );
                })}
            </motion.nav>
            )}
        </AnimatePresence>

        <section className={`flex-1 rounded-3xl p-8 flex flex-col items-center justify-center overflow-hidden border transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a0c10] border-slate-800' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/30'}`}>
            <div className="w-full max-w-2xl flex flex-col items-center justify-center">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-extrabold mb-2">{TOOLS.find(t => t.id === activeToolId)?.name}</h2>
                </div>
                <div className="w-full flex justify-center">{renderTool()}</div>
            </div>
        </section>
      </div>
    </main>
  );
}
