import { useEffect, useMemo, useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export type UserSummary = {
  id: string;
  title: string;
  thumbnail?: string | null;
  online: boolean;
};

/**
 * Lists users available for private one-to-one chats, with online/offline via Realtime presence.
 * - Tries `public.profiles` first (recommended); falls back to distinct `user_id` from `messages`.
 * - Presence channel: `presence:online-users` using user id as presence key.
 */
export function useUsers() {
  const supabase = getSupabaseClient();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Attempt to use a dedicated profiles table for better names/avatars (if present)
      const { data: profiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .limit(200);

      if (!profilesErr && Array.isArray(profiles)) {
        const list: UserSummary[] = (profiles as any[]).map(p => ({
          id: p.id,
          title: `${(p.first_name || '').trim()} ${(p.last_name || '').trim()}`.trim() || 'User',
          thumbnail: p.avatar_url || null,
          online: false,
        }));
        setUsers(list);
      } else {
        // Fallback: derive from messages table (users who have posted)
        const { data: msgs, error: msgsErr } = await supabase
          .from('messages')
          .select('user_id')
          .order('user_id', { ascending: true })
          .limit(1000);
        if (msgsErr) throw msgsErr;
        const ids = Array.from(new Set((msgs ?? []).map((m: any) => m.user_id).filter(Boolean)));
        const list: UserSummary[] = ids.map(id => ({
          id,
          title: `User ${String(id).slice(0, 8)}`,
          thumbnail: null,
          online: false,
        }));
        setUsers(list);
      }
    } catch (e: any) {
      logger.warn('fetchUsers failed', e);
      setError(e?.message ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let mounted = true;

    // Initialize presence channel; use current auth user id as presence key if available.
    async function initPresence() {
      try {
        const { data } = await supabase.auth.getUser();
        const me = data.user?.id ?? undefined;

        channel = supabase.channel('presence:online-users', {
          config: { presence: { key: me || 'anonymous' } },
        });

        channel.on('presence', { event: 'sync' }, () => {
          const state = channel!.presenceState() as Record<string, unknown[]>;
          const ids = new Set(Object.keys(state));
          if (mounted) setOnlineIds(ids);
        });

        channel.subscribe(status => {
          if (status === 'SUBSCRIBED') {
            // Advertise our presence (no sensitive data)
            channel!.track({ online: true });
          }
        });
      } catch (e) {
        logger.warn('presence init failed', e);
      }
    }

    initPresence();
    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Merge presence state into users list
  const withPresence = useMemo(() => {
    if (onlineIds.size === 0) return users;
    return users.map(u => ({ ...u, online: onlineIds.has(u.id) }));
  }, [users, onlineIds]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const hasUsers = useMemo(() => users.length > 0, [users]);

  return { users: withPresence, loading, error, refresh: fetchUsers, hasUsers };
}