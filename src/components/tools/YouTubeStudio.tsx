'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Film } from 'lucide-react';
import ProjectBoard from './ProjectBoard';

interface Project {
    id: string;
    name: string;
    user_id: string;
}

export default function YouTubeStudio({ theme }: { theme: 'dark' | 'light' }) {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
            const { data } = await supabase.from('projects').select('*').eq('user_id', user.id);
            if (data) setProjects(data);
        }
    };
    fetchProjects();
  }, []);

  const addProject = async () => {
      if(!newProjectName.trim() || !userId) return;
      const { data, error } = await supabase.from('projects').insert([{name: newProjectName, user_id: userId}]).select().single();
      if(!error && data) {
          setProjects([...projects, data]);
          setNewProjectName('');
      }
  }

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('projects').delete().eq('id', id);
    setProjects(projects.filter(p => p.id !== id));
    if(activeProjectId === id) setActiveProjectId(null);
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
        {!activeProjectId ? (
            <div className="max-w-4xl mx-auto w-full">
                <h2 className="text-xl font-bold mb-6">Vos Projets</h2>
                <div className="flex gap-2 mb-8">
                    <input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Nom du nouveau projet" className="flex-1 p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none" />
                    <button onClick={addProject} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center gap-2"><Plus className="w-5 h-5"/> Créer</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map(p => (
                        <div key={p.id} className="p-6 border border-slate-700 rounded-2xl flex justify-between items-center cursor-pointer hover:border-slate-500 transition-all bg-slate-900/50" onClick={() => setActiveProjectId(p.id)}>
                            <div className="flex items-center gap-3">
                                <Film className="w-5 h-5 text-slate-400" />
                                <span className="font-semibold">{p.name}</span>
                            </div>
                            <button onClick={(e) => deleteProject(p.id, e)} className="p-2 hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="w-full h-full flex flex-col">
                <button onClick={() => setActiveProjectId(null)} className="mb-4 text-sm text-slate-500 hover:text-white">← Retour aux projets</button>
                <div className="flex-1 min-h-0">
                    <ProjectBoard projectId={activeProjectId} theme={theme} />
                </div>
            </div>
        )}
    </div>
  );
}
