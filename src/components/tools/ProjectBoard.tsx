'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { errorMessage } from '@/lib/api/errors';
import { KANBAN_COLUMNS } from '@/lib/constants';
import { createTask, deleteTask, listTasks, updateTask } from '@/lib/api/tasks';
import type { Task, TaskStatus } from '@/lib/types/database';

export default function ProjectBoard({ projectId }: { projectId: string }) {
  const toast = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [editContent, setEditContent] = useState('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      setTasks(await listTasks(projectId));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleAdd = async (status: TaskStatus) => {
    try {
      const created = await createTask(projectId, status);
      setTasks((prev) => [...prev, created]);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const handleDelete = async (task: Task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setModalTask(null);
    try {
      await deleteTask(task.id);
    } catch (error) {
      setTasks((prev) => [...prev, task]);
      toast.error(errorMessage(error));
    }
  };

  const handleSaveContent = async () => {
    if (!modalTask) return;

    const target = modalTask;
    const content = editContent;
    setModalTask(null);

    if (content === target.content) return;

    setTasks((prev) => prev.map((t) => (t.id === target.id ? { ...t, content } : t)));
    try {
      await updateTask(target.id, { content });
    } catch (error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === target.id ? { ...t, content: target.content } : t))
      );
      toast.error(errorMessage(error));
    }
  };

  const handleDrop = async (status: TaskStatus) => {
    const task = draggedTask;
    setDraggedTask(null);
    if (!task || task.status === status) return;

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      await updateTask(task.id, { status });
    } catch (error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      toast.error(errorMessage(error));
    }
  };

  if (isLoading) {
    return <div className="text-slate-400">Chargement du projet...</div>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
      {KANBAN_COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);

        return (
          <div
            key={column.id}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(column.id);
            }}
            className="flex-none w-72 rounded-2xl border border-slate-800 bg-[#0a0c10] flex flex-col max-h-full overflow-hidden shadow-lg"
          >
            <div className="p-4 font-bold text-sm border-b border-slate-800 flex justify-between items-center bg-white/5">
              <span className="text-slate-200">{column.title}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                {columnTasks.length}
              </span>
            </div>

            <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-2 min-h-[150px]">
              <AnimatePresence>
                {columnTasks.map((task) => (
                  <motion.div
                    layout
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    draggable
                    onDragStart={() => setDraggedTask(task)}
                    onDragEnd={() => setDraggedTask(null)}
                    onClick={() => {
                      setModalTask(task);
                      setEditContent(task.content);
                    }}
                    className="group p-3 rounded-lg border border-slate-800 bg-[#050608] flex justify-between items-center gap-2 cursor-grab active:cursor-grabbing hover:border-red-500/50 transition-colors"
                  >
                    <span className="flex-1 truncate text-sm text-slate-300">
                      {task.content?.trim()
                        ? task.content.slice(0, 40)
                        : task.title ?? 'Sans titre'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(task);
                      }}
                      aria-label="Supprimer la tâche"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {columnTasks.length === 0 && (
                <div className="h-20 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-600">
                  Glisser ici
                </div>
              )}

              <button
                onClick={() => handleAdd(column.id)}
                className="w-full p-2.5 rounded-lg border border-slate-800 text-slate-400 font-medium text-sm hover:border-red-500/50 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>
          </div>
        );
      })}

      {modalTask && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setModalTask(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl h-[80vh] rounded-3xl p-8 border border-slate-800 bg-[#050608] flex flex-col shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-4 text-slate-200">
              {modalTask.title ?? 'Tâche'}
            </h3>
            <textarea
              autoFocus
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Notes, script, idées..."
              className="flex-1 w-full p-4 rounded-xl bg-[#0a0c10] border border-slate-800 outline-none focus:border-red-500 transition-colors text-slate-300 resize-none"
            />
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => handleDelete(modalTask)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-500 text-sm font-semibold hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalTask(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-sm hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveContent}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
