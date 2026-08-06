import { supabase } from '@/lib/supabase/client';
import { toApiError } from './errors';
import type { Todo } from '@/lib/types/database';

export async function listTodos(userId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) throw toApiError(error, 'Impossible de charger les tâches.');
  return data ?? [];
}

export async function createTodo(
  userId: string,
  text: string,
  sortOrder: number
): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .insert({ user_id: userId, text, sort_order: sortOrder })
    .select()
    .single();

  if (error) throw toApiError(error, "Impossible d'ajouter la tâche.");
  return data;
}

export async function updateTodo(
  id: string,
  changes: Partial<Pick<Todo, 'text' | 'is_completed'>>
): Promise<void> {
  const { error } = await supabase.from('todos').update(changes).eq('id', id);
  if (error) throw toApiError(error, 'Impossible de mettre à jour la tâche.');
}

export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) throw toApiError(error, 'Impossible de supprimer la tâche.');
}

/**
 * Réordonne la liste. On n'envoie que les lignes dont la position a réellement
 * changé, au lieu de réécrire toute la table à chaque glisser-déposer.
 */
export async function reorderTodos(todos: Todo[]): Promise<void> {
  const changed = todos
    .map((todo, index) => ({ todo, index }))
    .filter(({ todo, index }) => todo.sort_order !== index);

  if (changed.length === 0) return;

  const results = await Promise.all(
    changed.map(({ todo, index }) =>
      supabase.from('todos').update({ sort_order: index }).eq('id', todo.id)
    )
  );

  const failure = results.find((result) => result.error);
  if (failure?.error) {
    throw toApiError(failure.error, "Impossible d'enregistrer le nouvel ordre.");
  }
}
