import { supabase } from '../supabaseClient';

const sanitizeData = (data) => {
  if (!data) return null;
  try {
    const sanitized = JSON.parse(JSON.stringify(data));
    const sensitiveKeys = ['password', 'confirmpassword', 'token', 'secret', 'key', 'apikey', 'jwt'];
    
    const scanAndSanitize = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key in obj) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          scanAndSanitize(obj[key]);
        }
      }
    };

    scanAndSanitize(sanitized);
    return sanitized;
  } catch {
    return { error: 'Serialization failed during sanitization' };
  }
};

export const logAuditEvent = async ({
  userId = null,
  userRole = 'anonymous',
  action,
  entityType = 'system',
  entityId = null,
  oldData = null,
  newData = null,
  status = 'success',
  requestMethod = 'CLIENT_ACTION',
  endpoint = typeof window !== 'undefined' ? window.location.pathname : '/',
}) => {
  try {
    let finalUserId = userId;
    let finalUserRole = userRole;

    if (!finalUserId && typeof window !== 'undefined') {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        finalUserId = session.user.id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile?.role) {
          finalUserRole = profile.role;
        }
      }
    }

    const logPayload = {
      user_id: finalUserId,
      user_role: finalUserRole,
      action,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      old_data: sanitizeData(oldData),
      new_data: sanitizeData(newData),
      ip_address: '127.0.0.1',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Node',
      request_method: requestMethod,
      endpoint,
      status,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('audit_logs').insert([logPayload]);
    if (error) {
      console.error('Database insertion failed for audit log:', error.message);
    }
  } catch (err) {
    console.error('Audit logger failure:', err);
  }
};
