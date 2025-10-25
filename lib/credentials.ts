import Constants from 'expo-constants';

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

function redacted(value: string): string {
  if (!value) return '';
  const start = value.slice(0, 4);
  const end = value.slice(-4);
  return `${start}...${end}`;
}

export function getSupabaseConfig(): SupabaseConfig {
  // Expo client-side env: must be prefixed with EXPO_PUBLIC_
  const url = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const anonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
    const msg = 'Missing Supabase credentials. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.';
    // Throw an error so the app fails fast during startup.
    throw new Error(msg);
  }

  // Basic sanity checks
  if (!/^https?:\/\//.test(url)) {
    throw new Error('Invalid Supabase URL format. Must start with http(s)://');
  }
  if (anonKey.length < 20) {
    throw new Error('Invalid Supabase anon key.');
  }

  return { url, anonKey };
}

export function describeSupabaseConfigSafe(cfg: SupabaseConfig): string {
  return `Supabase(url=${cfg.url}, anonKey=${redacted(cfg.anonKey)})`;
}