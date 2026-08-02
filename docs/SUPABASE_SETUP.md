# Supabase Setup

## 1. Database Schema
Execute the following SQL commands in your Supabase SQL Editor:

```sql
-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  username text
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policy for users to view their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
```

## 2. Authentication Provider
1. Go to your Supabase Dashboard.
2. Navigate to **Authentication** > **Providers**.
3. Enable the **Email** provider.
