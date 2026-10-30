import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_STORAGE_URL_KEY = 'auratask_supabase_url';
const SUPABASE_STORAGE_KEY_KEY = 'auratask_supabase_anon_key';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  // 1. Check environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey && !envUrl.includes('your-project-id')) {
    return { url: envUrl.trim(), anonKey: envKey.trim() };
  }

  // 2. Check browser localStorage override
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem(SUPABASE_STORAGE_URL_KEY) || '';
    const localKey = localStorage.getItem(SUPABASE_STORAGE_KEY_KEY) || '';
    if (localUrl && localKey) {
      return { url: localUrl.trim(), anonKey: localKey.trim() };
    }
  }

  return { url: envUrl, anonKey: envKey };
}

export function saveDynamicSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window === 'undefined') return;
  if (!url || !anonKey) {
    localStorage.removeItem(SUPABASE_STORAGE_URL_KEY);
    localStorage.removeItem(SUPABASE_STORAGE_KEY_KEY);
  } else {
    localStorage.setItem(SUPABASE_STORAGE_URL_KEY, url.trim());
    localStorage.setItem(SUPABASE_STORAGE_KEY_KEY, anonKey.trim());
  }
  // Reset cached client
  cachedClient = null;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    !url.includes('your-project-id')
  );
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  const { url, anonKey } = getSupabaseCredentials();
  if (cachedClient) return cachedClient;

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client', err);
    return null;
  }
}

export async function testSupabaseConnection(
  testUrl?: string, 
  testKey?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const url = testUrl || getSupabaseCredentials().url;
    const anonKey = testKey || getSupabaseCredentials().anonKey;

    if (!url || !anonKey) {
      return { success: false, message: 'URL and Anon Key are required.' };
    }

    if (!url.startsWith('https://')) {
      return { success: false, message: 'URL must start with https://' };
    }

    const testClient = createClient(url, anonKey);
    const { error } = await testClient.from('tasks').select('id').limit(1);

    if (error) {
      // If table doesn't exist yet, give helpful message
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Connected to Supabase, but "tasks" table was not found. Please run supabase/schema.sql in the SQL Editor.',
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Connection failed: ${msg}` };
  }
}
