import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export type Message = {
  id: string;
  content: string;
  type: 'text' | 'image';
  user_id: string;
  room_id: string;
  created_at: string;
  image_url?: string | null;
};

export function useRealtimeMessages(roomId: string) {
  const supabase = getSupabaseClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setError(null);
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) {
      logger.warn('fetchMessages failed', error);
      setError(error.message);
    } else {
      setMessages(data as Message[]);
    }
    setLoading(false);
  }, [supabase, roomId]);

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, payload => {
        logger.debug('message change', payload);
        const newRow = payload.new as Message;
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, newRow]);
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(m => (m.id === newRow.id ? newRow : m)));
        } else if (payload.eventType === 'DELETE') {
          const oldRow = payload.old as Message;
          setMessages(prev => prev.filter(m => m.id !== oldRow.id));
        }
      })
      .subscribe(status => logger.info('realtime subscribe', { status }));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId, fetchMessages]);

  const sendText = async (userId: string, content: string) => {
    const { error } = await supabase.from('messages').insert({
      content,
      type: 'text',
      user_id: userId,
      room_id: roomId,
    });
    if (error) throw error;
  };

  const sendImage = async (userId: string, imageUrl: string) => {
    const { error } = await supabase.from('messages').insert({
      content: '',
      type: 'image',
      image_url: imageUrl,
      user_id: userId,
      room_id: roomId,
    });
    if (error) throw error;
  };

  return { messages, loading, error, sendText, sendImage };
}