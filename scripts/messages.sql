<--Use these SQL statements to create public.messages with safe defaults
create table if not exists public.messages (   id uuid default gen_random_uuid() primary key,   content text not null default '',   type text not null check (type in ('text','image')),   image_url text,   user_id uuid not null,   room_id text not null default 'public',   created_at timestamptz not null default now() );
<--Enable row-level security and policies for basic read/insert/update/delete.
create policy "messages select" on public.messages for select using (true);
create policy "messages insert own" on public.messages for insert with check (auth.uid() = user_id);
create policy "messages update own" on public.messages for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "messages delete own" on public.messages for delete using (auth.uid() = user_id);
<--Improve query performance for room listing and per-room reads.
create index if not exists messages_room_id_idx on public.messages (room_id); create index if not exists messages_room_created_idx on public.messages (room_id, created_at); create index if not exists messages_user_id_idx on public.messages (user_id);
alter publication supabase_realtime add table public.messages;

<--Useful Queries 
<--Distinct rooms (used by dashboard):
select distinct room_id from public.messages where room_id is not null order by room_id;
<--Latest messages for a room:
select * from public.messages where room_id = 'public' order by created_at asc limit 200;
<--Count messages per room:
select room_id, count(*) as message_count from public.messages group by room_id order by room_id;