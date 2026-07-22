import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logAuditEvent } from '../utils/auditLogger';
import { supabase } from '../supabaseClient';

// Mock Supabase client
vi.mock('../supabaseClient', () => {
  const mockInsert = vi.fn().mockImplementation(() => ({
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
  }));
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      },
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    },
  };
});

describe('Sprint 5 Audit Logging Engine Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully call logAuditEvent and construct the correct insert payload', async () => {
    const mockInsert = supabase.from('audit_logs').insert;

    await logAuditEvent({
      userId: 'test-user-id',
      userRole: 'citizen',
      action: 'complaint_created',
      entityType: 'complaints',
      entityId: 'complaint-123',
      oldData: null,
      newData: { title: 'Broken pipe' },
      status: 'success',
    });

    expect(supabase.from).toHaveBeenCalledWith('audit_logs');
    expect(mockInsert).toHaveBeenCalled();
    const passedPayload = mockInsert.mock.calls[0][0][0];

    expect(passedPayload.user_id).toBe('test-user-id');
    expect(passedPayload.user_role).toBe('citizen');
    expect(passedPayload.action).toBe('complaint_created');
    expect(passedPayload.status).toBe('success');
    expect(passedPayload.new_data).toEqual({ title: 'Broken pipe' });
  });

  it('should sanitize sensitive data keys (passwords, tokens, keys)', async () => {
    const mockInsert = supabase.from('audit_logs').insert;

    await logAuditEvent({
      userId: 'test-user-id',
      userRole: 'citizen',
      action: 'auth_login',
      entityType: 'auth',
      oldData: { password: 'my-super-secret-password' },
      newData: { apiKey: 'sb_publishable_key', jwt: 'xyz123' },
      status: 'success',
    });

    const passedPayload = mockInsert.mock.calls[0][0][0];
    expect(passedPayload.old_data.password).toBe('[REDACTED]');
    expect(passedPayload.new_data.apiKey).toBe('[REDACTED]');
    expect(passedPayload.new_data.jwt).toBe('[REDACTED]');
  });
});
