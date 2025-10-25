import { useMemo } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';

export function useSession() {
  const { session, user, loading } = useAuthContext();
  return useMemo(() => ({ session, user, loading }), [session, user, loading]);
}