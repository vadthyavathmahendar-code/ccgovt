-- ==============================================================================
-- CIVICS CONNECT ENTERPRISE - SPRINT 03 EXTENSION MIGRATION
-- Migration Name: 20260721000002_sprint_03_enterprise_schema_and_rls.sql
-- Target Database: Supabase PostgreSQL Engine (Existing Schema Compatible)
-- ==============================================================================

-- 1. Create Wards & Municipal Boundaries Table (New Table)
CREATE TABLE IF NOT EXISTS public.wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_name TEXT NOT NULL,
    ward_number INTEGER UNIQUE NOT NULL,
    zone_name TEXT NOT NULL,
    boundary_lat NUMERIC(10, 6),
    boundary_lng NUMERIC(10, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Extend Existing Complaints Table (ALTER TABLE ONLY - complaints.id is BIGINT)
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 6);
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 6);
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS civic_address TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS ward_id UUID REFERENCES public.wards(id) ON DELETE SET NULL;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS servicenow_ticket_number TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS servicenow_sys_id TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS is_fake_flagged BOOLEAN DEFAULT false;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS parent_duplicate_id BIGINT REFERENCES public.complaints(id) ON DELETE SET NULL;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS reopen_count INTEGER DEFAULT 0;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- 2b. Sanitize Pre-Existing Data in Complaints Table
UPDATE public.complaints 
SET priority = 'Medium' 
WHERE priority IS NULL OR priority NOT IN ('Low', 'Medium', 'High', 'Critical');

UPDATE public.complaints 
SET status = 'Pending' 
WHERE status IS NULL OR status NOT IN ('Pending', 'Triaged', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Closed');

-- 2c. Attach Check Constraints Safely
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_complaint_status') THEN
        ALTER TABLE public.complaints ADD CONSTRAINT check_complaint_status 
        CHECK (status IN ('Pending', 'Triaged', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Closed'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_complaint_priority') THEN
        ALTER TABLE public.complaints ADD CONSTRAINT check_complaint_priority 
        CHECK (priority IN ('Low', 'Medium', 'High', 'Critical'));
    END IF;
END $$;

-- 3. Create Complaint Updates / Audit History Table (complaint_id BIGINT matching complaints.id)
CREATE TABLE IF NOT EXISTS public.complaint_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id BIGINT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    update_notes TEXT,
    updated_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Citizen Feedback & Ratings Table (complaint_id BIGINT matching complaints.id)
CREATE TABLE IF NOT EXISTS public.complaint_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id BIGINT UNIQUE NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating_stars INTEGER CHECK (rating_stars BETWEEN 1 AND 5) NOT NULL,
    feedback_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create File Attachments Mapping Table (complaint_id BIGINT matching complaints.id)
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id BIGINT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create System Transaction Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    record_id TEXT,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Performance & GIS Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON public.complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_complaints_sn_ticket ON public.complaints(servicenow_ticket_number);
CREATE INDEX IF NOT EXISTS idx_complaints_geo ON public.complaints(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_complaint_updates_cid ON public.complaint_updates(complaint_id);

-- 8. Enable Row Level Security (RLS) across all tables
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 9. Row Level Security Policies

-- Wards Policies: Public Read
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to wards') THEN
        CREATE POLICY "Allow public read access to wards" ON public.wards FOR SELECT USING (true);
    END IF;
END $$;

-- Broadcasts Policies: Public Read, Admin Write
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to broadcasts') THEN
        CREATE POLICY "Allow public read access to broadcasts" ON public.broadcasts FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow staff insert to broadcasts') THEN
        CREATE POLICY "Allow staff insert to broadcasts" ON public.broadcasts FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('dept_admin', 'commissioner', 'super_admin')
            )
        );
    END IF;
END $$;

-- Complaints Policies:
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Citizens can select own complaints') THEN
        CREATE POLICY "Citizens can select own complaints" ON public.complaints FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff and Admins can view complaints') THEN
        CREATE POLICY "Staff and Admins can view complaints" ON public.complaints FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('employee', 'dept_admin', 'commissioner', 'super_admin')
            )
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Citizens can insert complaints') THEN
        CREATE POLICY "Citizens can insert complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff and Admins can update complaints') THEN
        CREATE POLICY "Staff and Admins can update complaints" ON public.complaints FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('employee', 'dept_admin', 'commissioner', 'super_admin')
            )
        );
    END IF;
END $$;

-- Complaint Updates Policies:
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users and Staff can read complaint updates') THEN
        CREATE POLICY "Users and Staff can read complaint updates" ON public.complaint_updates FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.complaints c WHERE c.id = complaint_updates.complaint_id AND (c.user_id = auth.uid() OR EXISTS (
                    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('employee', 'dept_admin', 'commissioner', 'super_admin')
                ))
            )
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can insert complaint updates') THEN
        CREATE POLICY "Staff can insert complaint updates" ON public.complaint_updates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

-- Complaint Feedback Policies:
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Citizens can read and insert own feedback') THEN
        CREATE POLICY "Citizens can read and insert own feedback" ON public.complaint_feedback FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can view complaint feedback') THEN
        CREATE POLICY "Staff can view complaint feedback" ON public.complaint_feedback FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('employee', 'dept_admin', 'commissioner', 'super_admin')
            )
        );
    END IF;
END $$;

-- Attachments Policies:
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can access complaint attachments') THEN
        CREATE POLICY "Users can access complaint attachments" ON public.attachments FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.complaints c WHERE c.id = attachments.complaint_id AND (c.user_id = auth.uid() OR EXISTS (
                    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('employee', 'dept_admin', 'commissioner', 'super_admin')
                ))
            )
        );
    END IF;
END $$;

-- 10. Seed Data Setup for Wards
INSERT INTO public.wards (ward_name, ward_number, zone_name, boundary_lat, boundary_lng)
VALUES 
    ('Banjara Hills', 93, 'Khairatabad Zone', 17.4156, 78.4347),
    ('Jubilee Hills', 94, 'Khairatabad Zone', 17.4319, 78.4072),
    ('Madhapur', 107, 'Serilingampally Zone', 17.4483, 78.3915),
    ('Charminar', 49, 'Charminar Zone', 17.3616, 78.4747),
    ('Secunderabad', 147, 'Secunderabad Zone', 17.4399, 78.4983)
ON CONFLICT (ward_number) DO NOTHING;
