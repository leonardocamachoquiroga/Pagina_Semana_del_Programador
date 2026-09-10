import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
};

export function getServerSupabaseClient(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient<Database>(supabaseUrl, serviceRoleKey, clientOptions);
}

export function getServerReadClient(): SupabaseClient<Database> | null {
  const adminClient = getServerSupabaseClient();
  if (adminClient) return adminClient;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient<Database>(supabaseUrl, supabaseAnonKey, clientOptions);
}
