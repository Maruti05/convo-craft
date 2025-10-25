import { useMemo } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';

export function useAuth() {
  const { user, loading, error, signIn, signUp, signOut } = useAuthContext();
  return useMemo(() => ({ user, loading, error, signIn, signUp, signOut }), [user, loading, error, signIn, signUp, signOut]);
}