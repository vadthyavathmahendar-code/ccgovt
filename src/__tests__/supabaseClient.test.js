import { describe, it, expect } from 'vitest';
import { supabase } from '../supabaseClient';

describe('Supabase Client Initialization Tests', () => {
  it('should initialize the Supabase client instance', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });

  it('should target the configured Supabase URL domain', () => {
    expect(supabase.supabaseUrl).toBeDefined();
    expect(supabase.supabaseUrl).toMatch(/twofkoqxtievknvamvgb\.supabase\.co/);
  });
});
