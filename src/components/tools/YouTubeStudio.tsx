'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Film, ArrowLeft } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/components/ui/Toast';
import { errorMessage } from '@/lib/api/errors';
import { createProject, deleteProject, listProjects } from '@/lib/api/projects';
import type { Project } from '@/lib/types/database';
import ProjectBoard from './ProjectBoard';

export default function YouTubeStudio() {
  const { user, isLoading: isUserLoading } = useUser();
  const toast = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      setProjects(await listProjects(user.id));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }
    fetch();
  }, [fetch, isUserLoading, user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProjectName.trim();
    if (!name || !user || isCreating) return;

    setIsCreating(true);
    try {
      const created = await createProject(user.id, name);
      setProjects((prev) => [created, ...prev]);
      setNewProjectName('');
      toast.success(`Projet « ${name} » créé.`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Supprimer « ${project.name} » et toutes ses tâches ?`)) return;

    setProjects((prev) => prev.filter((p) => p.id !== project.id));
    if (activeProjectId === project.id) setActiveProjectId(null);

    try {
      await deleteProject(project.id);
    } catch (error) {
      setProjects((prev) => [project, ...prev]);
      toast.error(errorMessage(error));
    }
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);

  if (activeProject) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-none">
          <h2 className="text-xl font-bold text-slate-100">{activeProject.name}</h2>
          <button
            onClick={() => setActiveProjectId(null)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 px-4 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux projets
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <ProjectBoard projectId={activeProject.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <form onSubmit={handleCreate} className="flex gap-2 mb-8">
          <input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Nom du nouveau projet"
            className="flex-1 p-3 rounded-xl bg-[#050608] border border-slate-800 text-slate-200 outline-none focus:border-red-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!newProjectName.trim() || isCreating}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <Plus className="w-5 h-5" /> {isCreating ? 'Création...' : 'Créer'}
          </button>
        </form>

        {isLoading ? (
          <div className="py-16 text-center text-slate-500">Chargement des projets...</div>
        ) : projects.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Film className="w-6 h-6 text-slate-600" />
            </div>
            <p className="font-semibold text-slate-300">Aucun projet pour le moment</p>
            <p className="text-sm text-slate-500 max-w-xs">
              Créez votre premier projet ci-dessus pour organiser votre production.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {projects.map((project) => (
                <motion.div
                  layout
                  key={project.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  onClick={() => setActiveProjectId(project.id)}
                  className="group p-6 border border-slate-800 rounded-2xl flex justify-between items-center cursor-pointer hover:border-red-500/40 transition-colors bg-[#050608]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Film className="w-5 h-5 text-slate-500 shrink-0" />
                    <span className="font-semibold text-slate-200 truncate">
                      {project.name}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(project, e)}
                    aria-label={`Supprimer ${project.name}`}
                    className="p-2 rounded-lg text-slate-600 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
