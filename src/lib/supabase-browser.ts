import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY?.trim();

export const hasPublicSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseBrowser: SupabaseClient<Database> | null = hasPublicSupabaseConfig
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    })
  : null;
