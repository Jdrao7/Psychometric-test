import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key for server-side operations (API routes)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a null-safe supabase client that handles missing env vars
export const supabase: SupabaseClient | null =
    supabaseUrl && supabaseKey
        ? createClient(supabaseUrl, supabaseKey)
        : null;

export const isSupabaseConfigured = (): boolean => {
    return !!(supabaseUrl && supabaseKey);
};
