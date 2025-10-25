# Convo Craft

Production-grade, real-time chat (text and images) built with Expo + Supabase, featuring secure authentication, reusable components, strong validation, and clean architecture.

## Features
- Global auth provider (Supabase) with persistent sessions
- Email/password login and registration with zod validation
- Real-time messaging via Supabase Realtime
- Image uploads to Supabase Storage
- Modular UI components and hooks
- Centralized logging and friendly error mapping
- Type-safe code (TypeScript) and basic tests

## Setup
1. Create a Supabase project and configure:
   - Auth: Email signup enabled
   - Storage: Create a bucket named `chat-images` (public)
   - Database: Create table `messages`

```sql
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  content text not null default '',
  type text not null check (type in ('text','image')),
  image_url text,
  user_id uuid not null,
  room_id text not null default 'public',
  created_at timestamp with time zone default now()
);

-- Recommended RLS policies
alter table public.messages enable row level security;
create policy "messages read" on public.messages for select using (true);
create policy "messages insert" on public.messages for insert with check (auth.uid() = user_id);
```

2. Configure environment variables (client-side):
   - In Expo, use `EXPO_PUBLIC_*` variables to expose to the client app.

Add to `app.json` under `expo.extra` (or use `app.config.js`):
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_SUPABASE_URL": "https://YOUR-PROJECT.supabase.co",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "YOUR-ANON-KEY"
    }
  }
}
```

3. Install dependencies:
```
npm install
npx expo install expo-image-picker
```

4. Run:
```
npm run web
```

## Architecture
- `providers/AuthProvider.tsx` global session and auth actions
- `hooks/useAuth.ts` and `hooks/useSession.ts` consumption APIs
- `hooks/useRealtimeMessages.ts` real-time stream and send APIs
- `components/chat/*` modular chat UI
- `lib/supabase.ts` client + persistent session
- `lib/credentials.ts` fail-fast credential validation
- `lib/upload.ts` image pick and upload helpers
- `utils/validation.ts` zod schemas and helpers
- `utils/errors.ts` friendly error messages
- `utils/logger.ts` structured logging

## Security & Best Practices
- Persistent sessions via AsyncStorage with token auto-refresh
- RLS enforced on `messages` table; clients can only insert their own messages
- Avoid logging secrets; logger only prints redacted values
- Validations enforce strong passwords and proper emails
- Error boundaries provided by Expo Router

## Testing
- Basic tests can be added with `react-test-renderer` for hooks and components
- Example test locations: `components/__tests__/`

## Customization
- Bucket name, room IDs, and message limits are easily adjustable in `hooks/useRealtimeMessages.ts` and `lib/upload.ts`
- UI styles are isolated in components; swap themes/colors as needed

## Troubleshooting
- If you see `Missing Supabase credentials`, ensure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are correctly set and available in Expo `extra`
- Ensure the `chat-images` bucket is public or provide signed URLs if making private
- Confirm Realtime is enabled in your Supabase project