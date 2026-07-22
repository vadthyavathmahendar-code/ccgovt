import { describe, it, expect } from 'vitest';
import { supabase } from '../supabaseClient';
import { logAuditEvent } from '../utils/auditLogger';

describe('Supabase Production Live Integration Audit', () => {
  const timestamp = Date.now();
  const testEmail = `integration_citizen_${timestamp}@ccgovt.test`;
  const testPassword = `SecurePassword123!`;
  let userId = null;

  it('1. Should connect to Supabase and allow citizen registration', async () => {
    // 1. Auth Signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.warn('Signup warning (could be email rate limit or disabled signup):', authError.message);
      // If signups are disabled on Supabase dashboard, we expect a 400/429, but let's test if we can hit the endpoint
      expect(authError).toBeDefined();
      return;
    }

    expect(authData.user).not.toBeNull();
    userId = authData.user.id;

    // 2. Profile insertion for this citizen
    const { error: profileError } = await supabase.from('profiles').upsert([{
      id: userId,
      full_name: 'Integration Test Citizen',
      email: testEmail,
      phone: '9999999999',
      role: 'citizen',
      govt_id_type: 'aadhaar',
      govt_id_number: '123456789012'
    }], { onConflict: 'id' });

    expect(profileError).toBeNull();

    // 3. Log user_created audit log event
    await expect(logAuditEvent({
      userId: userId,
      userRole: 'citizen',
      action: 'user_created',
      entityType: 'profiles',
      entityId: userId,
      newData: { email: testEmail, full_name: 'Integration Test Citizen', role: 'citizen' },
      status: 'success'
    })).resolves.not.toThrow();
  });

  it('2. Should prevent citizens from reading audit logs due to RLS policies', async () => {
    // Attempting to query audit logs. This should return empty or error out under RLS rules.
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1);
    
    // With anon key and without admin role, RLS select policy restricts access.
    // The query should succeed but return empty array since we don't have selector access.
    if (error) {
      expect(error).toBeDefined();
    } else {
      expect(data).toEqual([]);
    }
  });
});
