// Compatibilidad para imports existentes: este módulo solo expone el cliente público.
// La clave service role vive exclusivamente en supabase-server.ts.
export { hasPublicSupabaseConfig, supabaseBrowser } from './supabase-browser';
