import { useEffect, useMemo, useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export type Room = {
  id: string;
  title: string;
  thumbnail?: string | null;
};

export function useRooms() {
  const supabase = getSupabaseClient();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch room_ids from messages and dedupe client-side.
      const { data, error } = await supabase
        .from('messages')
        .select('room_id')
        .order('room_id', { ascending: true })
        .limit(500);
      if (error) throw error;

      const ids = Array.from(new Set((data ?? []).map((d: any) => d.room_id).filter(Boolean)));
      const populated = ids.map((id) => ({ id, title: id.toUpperCase(), thumbnail: null }));

      // Ensure a default room exists for empty databases.
      const finalRooms = populated.length > 0 ? populated : [{ id: 'public', title: 'PUBLIC', thumbnail: null }];
      setRooms(finalRooms);
    } catch (e: any) {
      logger.warn('fetchRooms failed', e);
      setError(e?.message ?? 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const hasRooms = useMemo(() => rooms.length > 0, [rooms]);

  return { rooms, loading, error, refresh: fetchRooms, hasRooms };
}