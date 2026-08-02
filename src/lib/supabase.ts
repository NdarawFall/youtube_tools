import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fjtrapericwnpoaluwhk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdHJhcGVyaWN3bnBvYWx1d2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Nzk5NzksImV4cCI6MjEwMTI1NTk3OX0.zFM8DCR9_jdvB3ryRDohjBA-zAjZYpU4U1E7m9lX6Eg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
