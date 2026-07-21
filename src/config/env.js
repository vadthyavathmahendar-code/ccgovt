/**
 * Environment Variables Central Validator
 * Guarantees required environment variables exist at application runtime.
 */
const getEnv = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'FATAL SECURITY ERROR: VITE_SUPABASE_URL environment variable is missing. Check your .env file.'
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'FATAL SECURITY ERROR: VITE_SUPABASE_ANON_KEY environment variable is missing. Check your .env file.'
    );
  }

  return {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
    APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  };
};

export const env = getEnv();
