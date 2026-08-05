'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Reorder, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, Trash2, Edit2, Check } from 'lucide-react';

interface Todo {
  id: string;
  user_id?: string;
  text: string;
  is_completed: boolean;
  order: number;
}

export default function TodoList({ theme }: { theme: 'dark' | 'light' }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const bgClass = theme === 'dark' ? 'bg-[#0a0c10]' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';
  const textClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-800';
  const inputBgClass = theme === 'dark' ? 'bg-[#050608]' : 'bg-slate-50';

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true });
        
      if (!error && data) {
        setTodos(data);
      }
    }
    setIsLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !userId) return;

    const newOrder = todos.length > 0 ? Math.max(...todos.map(t => t.order)) + 1 : 0;
    
    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticTodo: Todo = { id: tempId, text: newTask, is_completed: false, order: newOrder, user_id: userId };
    setTodos(prev => [...prev, optimisticTodo]);
    setNewTask('');

    const { data, error } = await supabase
      .from('todos')
      .insert([{ text: newTask, order: newOrder, user_id: userId }])
      .select()
      .single();

    if (!error && data) {
      setTodos(prev => prev.map(t => t.id === tempId ? data : t));
    } else {
      // Revert on error
      setTodos(prev => prev.filter(t => t.id !== tempId));
      alert("Erreur lors de l'ajout de la tâche");
    }
  };

  const handleDelete = async (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    await supabase.from('todos').delete().eq('id', id);
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    
    setTodos(prev => prev.map(t => t.id === editingId ? { ...t, text: editingText } : t));
    const currentEditId = editingId;
    setEditingId(null);

    await supabase.from('todos').update({ text: editingText }).eq('id', currentEditId);
  };

  const toggleComplete = async (todo: Todo) => {
    const newStatus = !todo.is_completed;
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, is_completed: newStatus } : t));
    await supabase.from('todos').update({ is_completed: newStatus }).eq('id', todo.id);
  };

  const handleReorder = async (newOrder: Todo[]) => {
    // Optimistic update
    setTodos(newOrder);

    // Prepare updates for Supabase
    const updates = newOrder.map((todo, index) => ({
      ...todo,
      order: index
    }));

    // We use upsert to perform bulk update
    const { error } = await supabase.from('todos').upsert(updates);
    if (error) {
      console.error("Erreur lors de la sauvegarde de l'ordre:", error);
    }
  };

  if (isLoading) {
    return <div className={`w-full max-w-2xl py-10 text-center ${textClass}`}>Chargement des tâches...</div>;
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      {/* Formulaire d'ajout */}
      <form onSubmit={handleAdd} className="flex gap-3 relative z-10">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Ajouter une nouvelle tâche..."
          className={`flex-1 p-4 rounded-2xl border ${borderClass} ${inputBgClass} ${textClass} outline-none focus:border-red-500 transition-colors shadow-sm`}
        />
        <button 
          type="submit" 
          disabled={!newTask.trim()}
          className="px-6 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ajouter
        </button>
      </form>

      {/* Liste des tâches */}
      <div className={`rounded-3xl border ${borderClass} ${bgClass} overflow-hidden shadow-xl`}>
        {todos.length === 0 ? (
          <div className={`p-10 text-center text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            Aucune tâche pour le moment. Ajoutez-en une ci-dessus !
          </div>
        ) : (
          <Reorder.Group axis="y" values={todos} onReorder={handleReorder} className="flex flex-col">
            <AnimatePresence initial={false}>
              {todos.map((todo) => (
                <Reorder.Item 
                  key={todo.id} 
                  value={todo} 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group flex items-center gap-3 p-4 border-b last:border-b-0 ${borderClass} ${bgClass} hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
                >
                  {/* Poignée de drag */}
                  <div className={`cursor-grab active:cursor-grabbing p-1 rounded-md flex-none ${theme === 'dark' ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}>
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Checkbox */}
                  <button 
                    onClick={() => toggleComplete(todo)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-none ${todo.is_completed ? 'bg-emerald-500 border-emerald-500 text-white' : (theme === 'dark' ? 'border-slate-600 hover:border-slate-400' : 'border-slate-300 hover:border-slate-500')}`}
                  >
                    {todo.is_completed && <Check className="w-4 h-4" />}
                  </button>

                  {/* Contenu */}
                  <div className="flex-1 overflow-hidden">
                    {editingId === todo.id ? (
                      <input 
                        type="text"
                        autoFocus
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                        className={`w-full p-1 bg-transparent border-b border-red-500 outline-none ${textClass}`}
                      />
                    ) : (
                      <span 
                        onDoubleClick={() => startEditing(todo)}
                        className={`block truncate ${textClass} ${todo.is_completed ? 'line-through opacity-50' : ''}`}
                      >
                        {todo.text}
                      </span>
                    )}
                  </div>

                  {/* Actions (visible au survol) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-none">
                    {editingId === todo.id ? (
                      <button onClick={saveEdit} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl">
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => startEditing(todo)} className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(todo.id)} className={`p-2 rounded-xl transition-colors text-red-500 hover:bg-red-500/10`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
