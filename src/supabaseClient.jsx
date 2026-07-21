import { createClient } from '@supabase/supabase-js';
import { env } from './config/env';

/**
 * Initializes the Supabase client using validated environment configuration.
 * Hardcoded credentials have been completely removed.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

/**
 * Audit Logger Helper Procedure
 * Writes audit trail entries to public.audit_logs table.
 */
export const logAuditTrail = async (action, targetTable, recordId = null, payload = null) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    await supabase.from('audit_logs').insert([
      {
        user_id: userId,
        action,
        target_table: targetTable,
        record_id: recordId,
        payload,
      },
    ]);
  } catch (err) {
    console.warn('Audit trail logging failed:', err?.message);
  }
};