-- Extend public.audit_logs if it exists, or create it if not.
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_role TEXT,
    action TEXT,
    entity_type TEXT,
    entity_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    request_method TEXT,
    endpoint TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- If audit_logs table already exists, add columns that might be missing
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_role TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_id TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS old_data JSONB;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS new_data JSONB;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS request_method TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS endpoint TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS status TEXT;

-- Enable Row Level Security (RLS) on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow admins to read audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow public insert of logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow admin read access to logs" ON public.audit_logs;

-- Insertion policy: Allow insert of logs from the app
CREATE POLICY "Allow public insert of logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Read policy: Only allow users with role 'super_admin', 'dept_admin', 'commissioner' to select logs.
CREATE POLICY "Allow admin read access to logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid()
              AND public.profiles.role IN ('super_admin', 'dept_admin', 'commissioner')
        )
    );
