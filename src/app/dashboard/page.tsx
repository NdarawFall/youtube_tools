'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Video, LayoutGrid, LogOut, User, Plus, Trash2, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import ProjectBoard from '@/components/tools/ProjectBoard';

interface DashboardUser extends SupabaseUser {
  username?: string;
}

interface Project {
    id: string;
    name: string;
}

export default function Dashboard() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const theme = 'dark'; // Assuming dark theme for now

  useEffect(() => {
    const fetchUserAndProjects = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser({ ...user, username: user.user_metadata.username || 'Utilisateur' });
            const { data: projects } = await supabase.from('projects').select('*').eq('user_id', user.id);
            if (projects) setProjects(projects);
        }
    };
    fetchUserAndProjects();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const addProject = async () => {
      if(!newProjectName.trim()) return;
      const { data, error } = await supabase.from('projects').insert([{name: newProjectName, user_id: user?.id}]).select().single();
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
    <main className="h-screen w-screen font-sans p-6 bg-[#050608] text-slate-200 flex flex-col">
      <header className="flex justify-between items-center pb-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Video className="w-6 h-6 text-red-500" />
          <h1 className="font-bold text-xl">Creator<span className="text-red-500 italic">Studio</span></h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-400">
            <LogOut className="w-4 h-4" /> Deconnexion
        </button>
      </header>

      <section className="flex-1 mt-6 overflow-hidden">
            {!activeProjectId ? (
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-extrabold mb-6">Vos Projets</h2>
                    <div className="flex gap-2 mb-8">
                        <input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Nom du nouveau projet" className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-red-500" />
                        <button onClick={addProject} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center gap-2"><Plus className="w-5 h-5"/> Créer</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map(p => (
                            <div key={p.id} className="p-6 border border-slate-800 rounded-2xl flex justify-between items-center cursor-pointer hover:border-slate-600 transition-all bg-slate-900/50" onClick={() => setActiveProjectId(p.id)}>
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
        </section>
    </main>
  );
}
