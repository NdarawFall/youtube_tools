/** Types des lignes renvoyées par Supabase. Reflètent le schéma de `private/NOTES.md`. */

export type TaskStatus =
  | 'idea'
  | 'script'
  | 'thumbnail'
  | 'voiceover'
  | 'assets'
  | 'editing'
  | 'music'
  | 'publication';

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  gemini_api_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string | null;
  content: string;
  status: TaskStatus;
  created_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  text: string;
  is_completed: boolean;
  sort_order: number;
  created_at: string;
}
