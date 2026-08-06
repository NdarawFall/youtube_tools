'use client';
import { useState } from 'react';
import {
  Video,
  LayoutGrid,
  LogOut,
  ListTodo,
  Film,
  Type,
  RefreshCw,
  Sparkles,
  Settings as SettingsIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import YouTubeStudio from '@/components/tools/YouTubeStudio';
import VideoProcessor from '@/components/VideoProcessor';
import CharacterCounter from '@/components/tools/CharacterCounter';
import ReverseVideo from '@/components/tools/ReverseVideo';
import TodoList from '@/components/tools/TodoList';
import EnhancePrompt from '@/components/tools/EnhancePrompt';
import Settings from '@/components/tools/Settings';

const TOOLS = [
  {
    id: 'youtube-kanban',
    name: 'YouTube Studio',
    icon: Film,
    description: "Organisez vos projets vidéo de l'idée à la publication.",
    render: () => <YouTubeStudio />,
  },
  {
    id: 'enhance-prompt',
    name: 'Enhance Prompt',
    icon: Sparkles,
    description: 'Améliorez vos prompts pour de meilleurs résultats.',
    render: () => <EnhancePrompt />,
  },
  {
    id: 'frame-extractor',
    name: 'Frame Extractor',
    icon: Video,
    description: 'Extrayez des images haute définition de vos fichiers vidéo.',
    render: () => <VideoProcessor />,
  },
  {
    id: 'char-counter',
    name: 'Script Counter',
    icon: Type,
    description: 'Analysez la longueur de vos scripts pour estimer le temps de parole.',
    render: () => <CharacterCounter />,
  },
  {
    id: 'reverse-video',
    name: 'Reverse Video',
    icon: RefreshCw,
    description: 'Inversez le sens de lecture de vos clips pour des effets créatifs.',
    render: () => <ReverseVideo />,
  },
  {
    id: 'todo-list',
    name: 'Todo List',
    icon: ListTodo,
    description: 'Gérez vos tâches quotidiennes et restez productif.',
    render: () => <TodoList />,
  },
  {
    id: 'settings',
    name: 'Paramètres',
    icon: SettingsIcon,
    description: 'Gérez votre profil et vos clés API.',
    render: () => <Settings />,
  },
] as const;

export default function Dashboard() {
  const { profile, displayName } = useUser();
  const [activeToolId, setActiveToolId] = useState<string>(TOOLS[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeTool = TOOLS.find((tool) => tool.id === activeToolId) ?? TOOLS[0];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <main className="h-screen w-screen font-sans p-4 flex flex-col overflow-hidden bg-[#050608] text-slate-200">
      <header className="flex-none flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen((open) => !open)}
            aria-label={isSidebarOpen ? 'Masquer le menu' : 'Afficher le menu'}
            aria-expanded={isSidebarOpen}
            className="p-2.5 rounded-2xl border bg-[#0a0c10] border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-base tracking-tight hover:opacity-80 transition-opacity"
          >
            <Video className="w-5 h-5 text-red-500" />
            Creator<span className="text-red-500 italic">Studio</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-slate-800 bg-[#0a0c10]">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="w-8 h-8 rounded-full object-cover ring-2 ring-red-500"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-medium text-slate-300">{displayName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.nav
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex-none flex flex-col gap-2 overflow-hidden"
            >
              {TOOLS.map((tool, index) => {
                const Icon = tool.icon;
                const isActive = activeToolId === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveToolId(tool.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all text-sm font-semibold text-left ${
                      isActive
                        ? 'bg-[#0a0c10] text-red-500 border border-slate-800'
                        : 'text-slate-500 hover:text-slate-300'
                    } ${index === 1 ? 'mt-4 border-t border-slate-800 pt-4' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tool.name}
                  </button>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>

        <section className="flex-1 rounded-3xl p-6 md:p-8 flex flex-col overflow-hidden border border-slate-800 bg-[#0a0c10] shadow-xl">
          <div className="mb-6 flex-none">
            <h1 className="text-2xl font-extrabold">{activeTool.name}</h1>
            <p className="text-sm text-slate-500 mt-1">{activeTool.description}</p>
          </div>
          <div className="w-full flex-1 overflow-hidden flex justify-center">
            {activeTool.render()}
          </div>
        </section>
      </div>
    </main>
  );
}
