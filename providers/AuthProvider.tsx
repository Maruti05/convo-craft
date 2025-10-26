import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, data?: Record<string, string>) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure a profile record exists for this user with appropriate names
  async function ensureProfile(u: User) {
    try {
      const email = (u.email as string | undefined) ?? '';
      const firstName = String((u.user_metadata as any)?.firstName ?? (u.user_metadata as any)?.first_name ?? '').trim();
      const lastName = String((u.user_metadata as any)?.lastName ?? (u.user_metadata as any)?.last_name ?? '').trim();
      const displayName = `${firstName} ${lastName}`.trim() || (email ? email.split('@')[0] : 'User');
      const avatarUrl = ((u.user_metadata as any)?.avatar_url as string | undefined) ?? null;
      await supabase.from('profiles').upsert({
        id: u.id,
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        display_name: displayName,
        avatar_url: avatarUrl,
      }, { onConflict: 'id' });
      logger.info('ensureProfile upserted', { userId: u.id, displayName });
    } catch (e) {
      logger.warn('ensureProfile failed', e);
    }
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        logger.error('auth.getSession failed');
        setError(error.message);
      }
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      logger.info('Auth state change', { event });
      setSession(newSession);
      setUser(newSession?.user ?? null);
      // Ensure profile exists on sign-in or user update
      if (newSession?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        await ensureProfile(newSession.user);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e: any) {
      logger.warn('signIn failed');
      setError(e?.message ?? 'Sign in failed');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, data?: Record<string, string>) => {
    setError(null);
    setLoading(true);
    try {
      const { data: result, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data },
      });
      if (error) throw error;
      logger.info('signUp success', { userId: result.user?.id });
      if (result.user) {
        await ensureProfile(result.user);
      }
    } catch (e: any) {
      logger.warn('signUp failed');
      setError(e?.message ?? 'Registration failed');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (e: any) {
      logger.warn('signOut failed');
      setError(e?.message ?? 'Sign out failed');
      throw e;
    }
  };

  const value = useMemo<AuthContextValue>(() => ({ user, session, loading, error, signIn, signUp, signOut }), [user, session, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}