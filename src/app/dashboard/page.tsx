'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Video, LayoutGrid, LogOut, User, Moon, Sun, ListTodo, Film, Type, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import YouTubeStudio from '@/components/tools/YouTubeStudio';
import VideoProcessor from '@/components/VideoProcessor';
import CharacterCounter from '@/components/tools/CharacterCounter';
import ReverseVideo from '@/components/tools/ReverseVideo';
import TodoList from '@/components/tools/TodoList';

const TOOLS = [
  { id: 'youtube-kanban', name: 'YouTube Studio', icon: Film, description: 'Organisez vos projets vidéo de l\'idée à la publication.' },
  { id: 'frame-extractor', name: 'Frame Extractor', icon: Video, description: 'Extrayez facilement des images haute définition de vos fichiers vidéo.' },
  { id: 'char-counter', name: 'Script Counter', icon: Type, description: 'Analysez la longueur de vos scripts pour optimiser le temps de parole.' },
  { id: 'reverse-video', name: 'Reverse Video', icon: RefreshCw, description: 'Inversez le sens de lecture de vos clips pour des effets créatifs.' },
  { id: 'todo-list', name: 'Todo List', icon: ListTodo, description: 'Gérez vos tâches quotidiennes et restez productif.' },
];

interface DashboardUser extends SupabaseUser {
  username?: string;
}

export default function Dashboard() {
  const [activeToolId, setActiveToolId] = useState('youtube-kanban');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const theme = 'dark';

  useEffect(() => {
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser({ ...user, username: user.user_metadata.username || 'Utilisateur' });
            // Fetch avatar from profiles table
            const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
            if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
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
      case 'youtube-kanban': return <YouTubeStudio theme={theme} />;
      case 'frame-extractor': return <VideoProcessor theme={theme} />;
      case 'char-counter': return <CharacterCounter theme={theme} />;
      case 'reverse-video': return <ReverseVideo theme={theme} />;
      case 'todo-list': return <TodoList theme={theme} />;
      default: return <div className="text-center py-20 opacity-50">Outil en développement...</div>;
    }
  };

  return (
    <main className="h-screen w-screen font-sans p-4 flex flex-col overflow-hidden bg-[#050608] text-slate-200">
      <header className="flex-none flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 rounded-2xl border bg-[#0a0c10] border-slate-800 text-slate-400">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 font-bold text-base tracking-tight">
            <Video className="w-5 h-5 text-red-500" />
            Creator<span className="text-red-500 italic">Studio</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-medium border-slate-800 bg-[#0a0c10] text-slate-300`}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover ring-1 ring-red-500/50" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
                <span>{user?.username || 'Utilisateur'}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 p-2.5 rounded-2xl text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Deconnexion
            </button>
        </div>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <AnimatePresence>
            {isSidebarOpen && (
            <motion.nav initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex-none flex flex-col gap-2 overflow-hidden">
                {TOOLS.map((tool, index) => {
                const Icon = tool.icon;
                const isActive = activeToolId === tool.id;
                return (
                    <button key={tool.id} onClick={() => setActiveToolId(tool.id)} className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all text-sm font-semibold ${isActive ? 'bg-[#0a0c10] text-red-500 border border-slate-800' : 'text-slate-500 hover:text-slate-300'} ${index === 1 ? 'mt-4 border-t border-slate-800 pt-4' : ''}`}>
                    <Icon className="w-4 h-4" />
                    {tool.name}
                    </button>
                );
                })}
            </motion.nav>
            )}
        </AnimatePresence>

        <section className="flex-1 rounded-3xl p-6 md:p-8 flex flex-col overflow-hidden border border-slate-800 bg-[#0a0c10] shadow-xl">
            <div className="w-full h-full flex flex-col overflow-hidden">
                <div className="mb-6 flex-none">
                    <h2 className="text-2xl font-extrabold">{TOOLS.find(t => t.id === activeToolId)?.name}</h2>
                    <p className="text-sm text-slate-500 mt-1">{TOOLS.find(t => t.id === activeToolId)?.description}</p>
                </div>
                <div className="w-full flex-1 overflow-hidden flex justify-center">
                    {renderTool()}
                </div>
            </div>
        </section>
      </div>
    </main>
  );
}
