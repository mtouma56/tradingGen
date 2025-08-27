import { supabase, isSupabaseEnabled } from '../contexts/AuthContext';

// Re-export the shared Supabase client instantiated in AuthContext.
export { supabase };

// Helper used by the repository factory to know if Supabase is configured.
export const isSupabaseAvailable = () => isSupabaseEnabled;

