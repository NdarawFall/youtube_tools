import { supabase } from '@/lib/supabase/client';
import { toApiError } from './errors';
import type { Task, TaskStatus } from '@/lib/types/database';

export async function listTasks(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw toApiError(error, 'Impossible de charger les tâches.');
  return data ?? [];
}

export async function createTask(
  projectId: string,
  status: TaskStatus,
  title = 'Nouvelle tâche'
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ project_id: projectId, status, title, content: '' })
    .select()
    .single();

  if (error) throw toApiError(error, 'Impossible de créer la tâche.');
  return data;
}

export async function updateTask(
  id: string,
  changes: Partial<Pick<Task, 'title' | 'content' | 'status'>>
): Promise<void> {
  const { error } = await supabase.from('tasks').update(changes).eq('id', id);
  if (error) throw toApiError(error, 'Impossible de mettre à jour la tâche.');
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw toApiError(error, 'Impossible de supprimer la tâche.');
}
