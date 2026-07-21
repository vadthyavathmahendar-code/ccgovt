/**
 * Environment Variables Central Validator
 * Guarantees required environment variables exist at application runtime.
 */
const DEFAULT_SUPABASE_URL = 'https://twofkoqxtievknvamvgb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';

const getEnv = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error('CRITICAL WARNING: VITE_SUPABASE_URL is missing from .env');
  }

  if (!supabaseAnonKey) {
    console.error('CRITICAL WARNING: VITE_SUPABASE_ANON_KEY is missing from .env');
  }

  return {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
    APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  };
};

export const env = getEnv();
