import { describe, it, expect } from 'vitest';
import { env } from '../config/env';

describe('Sprint 1 Security & Environment Tests', () => {
  it('should successfully export environment object', () => {
    expect(env).toBeDefined();
    expect(typeof env).toBe('object');
  });

  it('should load a valid Supabase URL starting with https://', () => {
    expect(env.SUPABASE_URL).toBeDefined();
    expect(env.SUPABASE_URL).toMatch(/^https:\/\/.+/);
    expect(env.SUPABASE_URL).not.toContain('localhost');
  });

  it('should load a non-empty Supabase Anon Key', () => {
    expect(env.SUPABASE_ANON_KEY).toBeDefined();
    expect(env.SUPABASE_ANON_KEY.length).toBeGreaterThan(15);
  });

  it('should default APP_ENV to development or production', () => {
    expect(['development', 'staging', 'production']).toContain(env.APP_ENV);
  });
});
