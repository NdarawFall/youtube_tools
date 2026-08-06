import { supabase } from '@/lib/supabase/client';
import { toApiError } from './errors';
import type { Project } from '@/lib/types/database';

export async function listProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw toApiError(error, 'Impossible de charger les projets.');
  return data ?? [];
}

export async function createProject(userId: string, name: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: userId, name })
    .select()
    .single();

  if (error) throw toApiError(error, 'Impossible de créer le projet.');
  return data;
}

export async function renameProject(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('projects').update({ name }).eq('id', id);
  if (error) throw toApiError(error, 'Impossible de renommer le projet.');
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw toApiError(error, 'Impossible de supprimer le projet.');
}
