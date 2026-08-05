'use client';
import { useState, useEffect } from 'react';
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
  { id: 'voiceover', title: '🎙️ Voix-Off' },
  { id: 'assets', title: '🖼️ Assets' },
  { id: 'editing', title: '✂️ Montage' },
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

  const bgClass = theme === 'dark' ? 'bg-[#050608]' : 'bg-slate-50';
  const colBgClass = theme === 'dark' ? 'bg-[#0a0c10]' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';
  const textClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-800';

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
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
  };

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
      <div className="flex justify-between items-center w-full shrink-0">
        <h2 className="text-xl font-bold flex items-center gap-2">
            <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Studio Kanban</span>
        </h2>
        
        {!isAdding ? (
            <button onClick={() => setIsAdding(true)} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-md flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Nouvelle Vidéo
            </button>
        ) : (
            <form onSubmit={handleAdd} className="flex gap-2">
                <input 
                    type="text" autoFocus
                    value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Titre de la vidéo..."
                    className={`px-4 py-2 rounded-xl border ${borderClass} ${bgClass} ${textClass} outline-none focus:border-red-500 text-sm w-64`}
                />
                <button type="submit" disabled={!newTitle.trim()} className="p-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                    <Check className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="p-2 rounded-xl bg-slate-600 text-white hover:bg-slate-700">
                    <X className="w-4 h-4" />
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
                  {columnVideos.map(video => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={video.id}
                      draggable
                      onDragStart={(e: any) => handleDragStart(e, video)}
                      className={`group relative p-4 rounded-xl border ${borderClass} ${bgClass} shadow-sm cursor-grab active:cursor-grabbing hover:border-red-500/50 transition-colors`}
                    >
                        {editingId === video.id ? (
                            <div className="flex flex-col gap-2">
                                <input 
                                    type="text" autoFocus
                                    value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)}
                                    onBlur={saveEdit} onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                                    className={`w-full p-2 rounded-lg bg-black/10 dark:bg-white/10 outline-none text-sm ${textClass}`}
                                />
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-2">
                                <span className={`text-sm font-medium leading-tight ${textClass}`}>{video.title}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEditing(video)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => handleDelete(video.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        )}
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
    </div>
  );
}
