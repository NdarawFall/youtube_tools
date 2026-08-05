'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, GripVertical, Check, X } from 'lucide-react';

interface YoutubeVideo {
  id: string;
  user_id?: string;
  title: string;
  status: string;
  order: number;
}

const COLUMNS = [
  { id: 'idea', title: '💡 Idée' },
  { id: 'script', title: '📝 Script' },
  { id: 'thumbnail', title: '🖼️ Miniature' },
  { id: 'voiceover', title: '🎙️ Voix-Off' },
  { id: 'assets', title: '🖼️ Assets' },
  { id: 'editing', title: '✂️ Montage' },
  { id: 'music', title: '🎵 Musique' },
  { id: 'publication', title: '🚀 Publication' },
];

export default function KanbanBoard({ theme }: { theme: 'dark' | 'light' }) {
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  const [draggedVideo, setDraggedVideo] = useState<YoutubeVideo | null>(null);
  const [modalVideo, setModalVideo] = useState<YoutubeVideo | null>(null);

  const bgClass = theme === 'dark' ? 'bg-[#050608]' : 'bg-slate-50';
  const colBgClass = theme === 'dark' ? 'bg-[#0a0c10]' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';
  const textClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-800';

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true });
        
      if (!error && data) {
        setVideos(data);
      }
    }
    setIsLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !userId) return;

    const newOrder = videos.length > 0 ? Math.max(...videos.map(v => v.order)) + 1 : 0;
    const tempId = `temp-${Date.now()}`;
    const optimisticVideo: YoutubeVideo = { id: tempId, title: newTitle, status: 'idea', order: newOrder, user_id: userId };
    
    setVideos(prev => [...prev, optimisticVideo]);
    setNewTitle('');
    setIsAdding(false);

    const { data, error } = await supabase
      .from('youtube_videos')
      .insert([{ title: newTitle, status: 'idea', order: newOrder, user_id: userId }])
      .select()
      .single();

    if (!error && data) {
      setVideos(prev => prev.map(v => v.id === tempId ? data : v));
    } else {
      setVideos(prev => prev.filter(v => v.id !== tempId));
      alert("Erreur lors de l'ajout de la vidéo");
    }
  };

  const handleDelete = async (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    await supabase.from('youtube_videos').delete().eq('id', id);
  };

  const startEditing = (video: YoutubeVideo) => {
    setEditingId(video.id);
    setEditingTitle(video.title);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setVideos(prev => prev.map(v => v.id === editingId ? { ...v, title: editingTitle } : v));
    const currentEditId = editingId;
    setEditingId(null);
    await supabase.from('youtube_videos').update({ title: editingTitle }).eq('id', currentEditId);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, video: YoutubeVideo) => {
    setDraggedVideo(video);
    // Needed for Firefox
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', video.id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (!draggedVideo) return;
    if (draggedVideo.status === targetStatus) {
        setDraggedVideo(null);
        return;
    }

    // Update status optimistically
    setVideos(prev => prev.map(v => v.id === draggedVideo.id ? { ...v, status: targetStatus } : v));
    const movedVideoId = draggedVideo.id;
    setDraggedVideo(null);

    // Save to Supabase
    await supabase.from('youtube_videos').update({ status: targetStatus }).eq('id', movedVideoId);
  };

  if (isLoading) {
    return <div className={`w-full py-10 text-center ${textClass}`}>Chargement du studio...</div>;
  }

  return (
    <div className="w-full flex flex-col gap-6 h-full min-h-[600px] overflow-hidden">
      {/* Header Actions */}
      <div className="flex justify-end items-center w-full shrink-0">
        {!isAdding ? (
            <button onClick={() => setIsAdding(true)} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-md flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Nouvelle Tâche
            </button>
        ) : (
            <form onSubmit={handleAdd} className="flex gap-2 items-center">
                <input 
                    type="text" autoFocus
                    value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ajouter une tâche..."
                    className={`px-4 py-2.5 rounded-xl border ${borderClass} ${bgClass} ${textClass} outline-none focus:border-red-500 text-sm w-72`}
                />
                <button type="submit" disabled={!newTitle.trim()} className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm shadow-md transition-all">
                    <Check className="w-4 h-4" /> OK
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2.5 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-600 flex items-center gap-1.5 text-sm shadow-md transition-all">
                    <X className="w-4 h-4" /> Annuler
                </button>
            </form>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start w-full">
        {COLUMNS.map(column => {
          const columnVideos = videos.filter(v => v.status === column.id);
          
          return (
            <div 
              key={column.id}
              className={`flex-none w-72 rounded-2xl border ${borderClass} ${colBgClass} flex flex-col max-h-full overflow-hidden shadow-lg`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className={`p-4 font-bold text-sm border-b ${borderClass} flex justify-between items-center bg-black/5 dark:bg-white/5`}>
                <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>{column.title}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                    {columnVideos.length}
                </span>
              </div>

              {/* Column Content */}
              <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-3 min-h-[150px]">
                <AnimatePresence>
                  {columnVideos.map((video, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={video.id}
                      draggable
                      // @ts-ignore
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, video)}
                      onClick={() => { setModalVideo(video); setEditingTitle(video.title); }}
                      className={`group relative p-4 rounded-xl border ${borderClass} ${bgClass} shadow-sm cursor-grab active:cursor-grabbing hover:border-red-500/50 transition-colors`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                                <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                                    theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                                }`}>{index + 1}</span>
                                <span className={`text-sm font-medium leading-tight ${textClass} truncate`}>{video.title}</span>
                            </div>
                        </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Visual feedback for empty columns */}
                {columnVideos.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400 opacity-50">
                        Glisser ici
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Task Modal */}
      {modalVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-lg rounded-3xl p-8 border ${borderClass} ${bgClass} shadow-2xl`}>
                <h3 className={`text-xl font-bold mb-6 ${textClass}`}>Détails de la tâche</h3>
                <textarea 
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className={`w-full h-32 p-4 rounded-xl bg-black/10 dark:bg-white/10 outline-none text-sm ${textClass} mb-6`}
                />
                <div className="flex justify-between gap-3">
                    <button onClick={() => { handleDelete(modalVideo.id); setModalVideo(null); }} className="px-5 py-2.5 rounded-xl bg-red-900/20 text-red-500 font-semibold text-sm hover:bg-red-900/40">Supprimer</button>
                    <div className="flex gap-3">
                        <button onClick={() => setModalVideo(null)} className="px-5 py-2.5 rounded-xl bg-slate-700 text-white font-semibold text-sm hover:bg-slate-600">Fermer</button>
                        <button onClick={() => { 
                            setVideos(prev => prev.map(v => v.id === modalVideo.id ? { ...v, title: editingTitle } : v));
                            supabase.from('youtube_videos').update({ title: editingTitle }).eq('id', modalVideo.id);
                            setModalVideo(null);
                        }} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700">Enregistrer</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
