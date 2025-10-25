import type { Room } from '@/hooks/useRooms';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type RoomWithActivity = Room & {
  messageCount: number;
  lastActive?: string | null;
  activityLevel: 'high' | 'medium' | 'low';
};

/**
 * Computes activity stats for rooms based on recent messages, categorizing rooms by activity level.
 * Fetches latest N message headers (room_id, created_at) and aggregates client-side.
 */
export function useRoomActivity(limit: number = 1000) {
  const supabase = getSupabaseClient();
  const [rooms, setRooms] = useState<RoomWithActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('room_id, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;

      const counts = new Map<string, number>();
      const latest = new Map<string, string>();
      (data ?? []).forEach((row: any) => {
        const id = row.room_id as string;
        const ts = row.created_at as string;
        counts.set(id, (counts.get(id) ?? 0) + 1);
        if (!latest.has(id) || (latest.get(id)! < ts)) latest.set(id, ts);
      });

      const ids = Array.from(counts.keys());
      const list: RoomWithActivity[] = ids.map(id => {
        const count = counts.get(id) ?? 0;
        const level: RoomWithActivity['activityLevel'] = count >= 20 ? 'high' : count >= 5 ? 'medium' : 'low';
        return { id, title: id.toUpperCase(), thumbnail: null, messageCount: count, lastActive: latest.get(id) ?? null, activityLevel: level };
      });

      if (list.length === 0) {
        setRooms([{ id: 'public', title: 'PUBLIC', thumbnail: null, messageCount: 0, lastActive: null, activityLevel: 'low' }]);
      } else {
        setRooms(list);
      }
    } catch (e: any) {
      logger.warn('fetchRoomActivity failed', e);
      setError(e?.message ?? 'Failed to load room activity');
    } finally {
      setLoading(false);
    }
  }, [supabase, limit]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const groups = useMemo(() => {
    const high = rooms.filter(r => r.activityLevel === 'high');
    const medium = rooms.filter(r => r.activityLevel === 'medium');
    const low = rooms.filter(r => r.activityLevel === 'low');
    return { high, medium, low };
  }, [rooms]);

  return { rooms, groups, loading, error, refresh: fetchActivity };
}