import { PostgrestError } from '@supabase/supabase-js';

export function toFriendlyError(err: unknown): string {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  const e = err as PostgrestError | { message?: string; code?: string };
  const code = (e as any).code as string | undefined;
  const message = (e as any).message as string | undefined;

  switch (code) {
    case '28P01':
      return 'Invalid credentials';
    case '400':
      return 'Bad request';
    case '401':
      return 'Unauthorized';
    case '403':
      return 'Forbidden';
    default:
      return message ?? 'Something went wrong';
  }
}