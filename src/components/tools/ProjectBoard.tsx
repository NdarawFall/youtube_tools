'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X } from 'lucide-react';

interface Task {
  id: string;
  project_id: string;
  title: string;
  status: string;
  content: string; // Pour les notes/scripts
}

const COLUMNS = [
  { id: 'idea', title: '💡 Idée' },
  { id: 'script', title: '📝 Script' },
  { id: 'thumbnail', title: '🖼️ Miniature' },
  { id: 'voiceover', title: '🎙️ Voix-Off' },
  { id: 'assets', title: '🖼️ Assets' },
  { id: 'editing', title: '✂️ Montage' },
  { id: 'music', title: '🎵 Musique' },
  { id: 'publication', title: '✅ Publication' }, // Checklist
];

export default function ProjectBoard({ projectId, theme }: { projectId: string, theme: 'dark' | 'light' }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [editContent, setEditContent] = useState('');

  const bgClass = theme === 'dark' ? 'bg-[#050608]' : 'bg-slate-50';
  const colBgClass = theme === 'dark' ? 'bg-[#0a0c10]' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';
  const textClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-800';

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);
        
    if (!error && data) setTasks(data);
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async (status: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ project_id: projectId, status, title: 'Nouvelle tâche', content: '' }])
      .select()
      .single();
    if (!error && data) setTasks(prev => [...prev, data]);
  };

  const updateTask = async () => {
    if (!modalTask) return;
    setTasks(prev => prev.map(t => t.id === modalTask.id ? { ...modalTask, content: editContent } : t));
    await supabase.from('tasks').update({ content: editContent }).eq('id', modalTask.id);
    setModalTask(null);
  };

  if (isLoading) return <div className={textClass}>Chargement...</div>;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full scrollbar-hide">
      {COLUMNS.map(column => (
        <div key={column.id} className={`flex-none w-72 rounded-2xl border ${borderClass} ${colBgClass} p-4 flex flex-col gap-4`}>
          <h3 className={`font-bold ${textClass}`}>{column.title}</h3>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-2">
            {column.id === 'publication' ? (
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded" /> Vidéo validée</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded" /> Vidéo publiée</label>
                </div>
            ) : (
                <>
                {tasks.filter(t => t.status === column.id).map(task => (
                <div key={task.id} className={`group p-3 rounded-lg border ${borderClass} flex justify-between items-center`}>
                    <div onClick={() => { setModalTask(task); setEditContent(task.content); }} className="flex-1 cursor-pointer truncate">
                        {task.content ? task.content.substring(0, 20) + (task.content.length > 20 ? '...' : '') : task.title}
                    </div>
                    <button onClick={() => { supabase.from('tasks').delete().eq('id', task.id); setTasks(prev => prev.filter(t => t.id !== task.id)); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
                ))}
                <button onClick={() => addTask(column.id)} className="w-full p-3 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Plus className="w-4 h-4" /> Ajouter
                </button>
                </>
            )}
          </div>
        </div>
      ))}

      {modalTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-4xl h-[80vh] rounded-3xl p-8 border ${borderClass} ${bgClass} flex flex-col`}>
                <h3 className={`text-xl font-bold mb-4 ${textClass}`}>{modalTask.title}</h3>
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className={`flex-1 w-full p-4 rounded-lg bg-black/10 ${textClass}`} />
                <div className="flex justify-between mt-6">
                    <button onClick={() => { supabase.from('tasks').delete().eq('id', modalTask.id); setTasks(prev => prev.filter(t => t.id !== modalTask.id)); setModalTask(null); }} className="text-red-500 text-sm">Supprimer</button>
                    <button onClick={updateTask} className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm">Enregistrer</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
