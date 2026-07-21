-- ==============================================================================
-- CIVICS CONNECT ENTERPRISE - SPRINT 01 MIGRATION
-- Migration Name: 20260721000000_sprint_01_security_and_system_config.sql
-- Target Database: Supabase PostgreSQL
-- ==============================================================================

-- 1. Create System Configurations Table
CREATE TABLE IF NOT EXISTS public.system_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table & Column Documentation
COMMENT ON TABLE public.system_configurations IS 'Stores global application runtime metadata, feature flags, and system parameters.';
COMMENT ON COLUMN public.system_configurations.config_key IS 'Unique lookup identifier for configuration keys.';
COMMENT ON COLUMN public.system_configurations.config_value IS 'String or JSON encoded setting payload.';
COMMENT ON COLUMN public.system_configurations.is_public IS 'Flag controlling public read access via Row Level Security.';

-- 2. Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_system_config_key ON public.system_configurations(config_key);
CREATE INDEX IF NOT EXISTS idx_system_config_public ON public.system_configurations(is_public);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;

-- 4. Row Level Security Policies
-- Policy 1: Allow public read access for public configuration parameters
CREATE POLICY "Allow public read for public system configurations" 
ON public.system_configurations 
FOR SELECT 
USING (is_public = true);

-- Policy 2: Allow admin-only write operations
CREATE POLICY "Allow admin write access to system configurations" 
ON public.system_configurations 
FOR ALL 
USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('super_admin', 'admin', 'dept_admin')
    )
);

-- 5. Seed Data Installation
INSERT INTO public.system_configurations (config_key, config_value, description, is_public)
VALUES 
    ('app_name', 'Civics Connect Enterprise', 'Application Display Title', true),
    ('app_version', '1.0.0', 'Current Platform Release Version', true),
    ('maintenance_mode', 'false', 'Global Emergency Maintenance Mode Flag', true),
    ('max_file_size_mb', '5', 'Maximum File Upload Size Limit in Megabytes', true),
    ('allowed_file_types', 'image/jpeg,image/png,image/webp', 'Permitted Upload File MIME Types', true)
ON CONFLICT (config_key) DO UPDATE 
SET config_value = EXCLUDED.config_value, 
    updated_at = timezone('utc'::text, now());
