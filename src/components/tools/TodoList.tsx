'use client';
import { useCallback, useEffect, useState } from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, Trash2, Edit2, Check } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/components/ui/Toast';
import { errorMessage } from '@/lib/api/errors';
import {
  createTodo,
  deleteTodo,
  listTodos,
  reorderTodos,
  updateTodo,
} from '@/lib/api/todos';
import type { Todo } from '@/lib/types/database';

export default function TodoList() {
  const { user, isLoading: isUserLoading } = useUser();
  const toast = useToast();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      setTodos(await listTodos(user.id));
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newTask.trim();
    if (!text || !user) return;

    const sortOrder = todos.length
      ? Math.max(...todos.map((t) => t.sort_order)) + 1
      : 0;
    const tempId = `temp-${sortOrder}-${text.length}`;
    const optimistic: Todo = {
      id: tempId,
      user_id: user.id,
      text,
      is_completed: false,
      sort_order: sortOrder,
      created_at: '',
    };

    setTodos((prev) => [...prev, optimistic]);
    setNewTask('');

    try {
      const created = await createTodo(user.id, text, sortOrder);
      setTodos((prev) => prev.map((t) => (t.id === tempId ? created : t)));
    } catch (error) {
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
      setNewTask(text);
      toast.error(errorMessage(error));
    }
  };

  const handleDelete = async (todo: Todo) => {
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    try {
      await deleteTodo(todo.id);
    } catch (error) {
      setTodos((prev) => [...prev, todo].sort((a, b) => a.sort_order - b.sort_order));
      toast.error(errorMessage(error));
    }
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const target = todos.find((t) => t.id === editingId);
    const text = editingText.trim();
    setEditingId(null);

    if (!target || !text || text === target.text) return;

    setTodos((prev) => prev.map((t) => (t.id === target.id ? { ...t, text } : t)));
    try {
      await updateTodo(target.id, { text });
    } catch (error) {
      setTodos((prev) =>
        prev.map((t) => (t.id === target.id ? { ...t, text: target.text } : t))
      );
      toast.error(errorMessage(error));
    }
  };

  const toggleComplete = async (todo: Todo) => {
    const is_completed = !todo.is_completed;
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, is_completed } : t)));
    try {
      await updateTodo(todo.id, { is_completed });
    } catch (error) {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, is_completed: todo.is_completed } : t))
      );
      toast.error(errorMessage(error));
    }
  };

  const handleReorder = async (reordered: Todo[]) => {
    const previous = todos;
    setTodos(reordered);
    try {
      await reorderTodos(reordered);
      setTodos(reordered.map((todo, index) => ({ ...todo, sort_order: index })));
    } catch (error) {
      setTodos(previous);
      toast.error(errorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl py-10 text-center text-slate-400">
        Chargement des tâches...
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      <form onSubmit={handleAdd} className="flex gap-3 relative z-10">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Ajouter une nouvelle tâche..."
          className="flex-1 p-4 rounded-2xl border border-slate-800 bg-[#050608] text-slate-300 outline-none focus:border-red-500 transition-colors shadow-sm"
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

      <div className="rounded-3xl border border-slate-800 bg-[#0a0c10] overflow-hidden shadow-xl">
        {todos.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Aucune tâche pour le moment. Ajoutez-en une ci-dessus !
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={todos}
            onReorder={handleReorder}
            className="flex flex-col"
          >
            <AnimatePresence initial={false}>
              {todos.map((todo) => (
                <Reorder.Item
                  key={todo.id}
                  value={todo}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group flex items-center gap-3 p-4 border-b last:border-b-0 border-slate-800 bg-[#0a0c10] hover:bg-white/5 transition-colors"
                >
                  <div className="cursor-grab active:cursor-grabbing p-1 rounded-md flex-none text-slate-600 hover:text-slate-400">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <button
                    onClick={() => toggleComplete(todo)}
                    aria-label={todo.is_completed ? 'Marquer comme à faire' : 'Marquer comme terminée'}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-none ${
                      todo.is_completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {todo.is_completed && <Check className="w-4 h-4" />}
                  </button>

                  <div className="flex-1 overflow-hidden">
                    {editingId === todo.id ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-full p-1 bg-transparent border-b border-red-500 outline-none text-slate-300"
                      />
                    ) : (
                      <span
                        onDoubleClick={() => {
                          setEditingId(todo.id);
                          setEditingText(todo.text);
                        }}
                        className={`block truncate text-slate-300 ${
                          todo.is_completed ? 'line-through opacity-50' : ''
                        }`}
                      >
                        {todo.text}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex-none">
                    {editingId === todo.id ? (
                      <button
                        onClick={saveEdit}
                        aria-label="Enregistrer"
                        className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(todo.id);
                          setEditingText(todo.text);
                        }}
                        aria-label="Modifier"
                        className="p-2 rounded-xl transition-colors text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(todo)}
                      aria-label="Supprimer"
                      className="p-2 rounded-xl transition-colors text-red-500 hover:bg-red-500/10"
                    >
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
