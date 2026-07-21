import { createClient } from '@supabase/supabase-js';
import { env } from './config/env';

/**
 * Initializes the Supabase client using validated environment configuration.
 * Hardcoded credentials have been completely removed.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);