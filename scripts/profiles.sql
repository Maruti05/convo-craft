-- public.profiles table for chat app (extended version)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  
  -- Basic details
  username text unique not null,                -- @username / handle
  full_name text,                               -- display name
  email text unique,                            -- optional (synced from auth.users)
  avatar_url text,                              -- profile picture
  bio text,                                     -- "about" section

  -- Personal information
  gender text check (gender in ('male', 'female', 'other')) default 'other',
  date_of_birth date,
  nationality text,
  occupation text,
  languages_known text[],                       -- array of languages ['English', 'Hindi', 'Kannada']

  -- Social / followers system
  followers uuid[] default '{}',                -- array of user IDs following this user
  following uuid[] default '{}',                -- array of user IDs this user follows

  -- Chat-related info
  is_online boolean default false,
  last_seen timestamp with time zone,
  status text default 'Hey there! I am using ChatApp',
  typing_to uuid references public.profiles(id) on delete set null,

  -- Device / notification info
  device_type text,                             -- 'android', 'ios', 'web'
  push_token text,

  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

--RLS
alter table public.profiles enable row level security;

-- ✅ Allow everyone to view public profiles
create policy "Anyone can view public profiles"
on public.profiles
for select
using (true);

-- ✏️ Allow users to update only their own profile
create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, full_name, avatar_url, nationality, occupation)
  values (
    new.id,
    new.email,
    lower(split_part(new.email, '@', 1)),  -- default username from email
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'Unknown',
    'Unemployed'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
