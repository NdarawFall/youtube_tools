# Supabase Setup

## 1. Database Schema
Execute the following SQL commands in your Supabase SQL Editor:

```sql
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  username text
);

alter table public.profiles enable row level security;

do $$
begin
  if not exists (select from pg_policies where policyname = 'Users can view own profile') then
    create policy "Users can view own profile" on public.profiles
      for select using (auth.uid() = id);
  end if;
end
$$;
```

## 2. Authentication Settings
1. Go to your Supabase Dashboard.
2. Navigate to **Authentication** > **Providers**.
3. Enable the **Email** provider.
4. Navigate to **Authentication** > **URL Configuration**.
5. Set the **Site URL** to your production/local URL (e.g., `http://localhost:3000`).
6. Set the **Redirect URLs** to `http://localhost:3000/auth/callback` (add your production URL here as well).
