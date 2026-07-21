-- ==============================================================================
-- CIVICS CONNECT ENTERPRISE - SPRINT 03 MIGRATION
-- Migration Name: 20260721000002_sprint_03_enterprise_schema_and_rls.sql
-- Target Database: Supabase PostgreSQL Engine
-- ==============================================================================

-- 1. Create Wards & Municipal Boundaries Table
CREATE TABLE IF NOT EXISTS public.wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_name VARCHAR(100) NOT NULL,
    ward_number INT UNIQUE NOT NULL,
    zone_name VARCHAR(100) NOT NULL,
    boundary_lat DECIMAL(10, 6),
    boundary_lng DECIMAL(10, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.wards IS 'Stores municipal ward boundaries and geographic zones.';

-- 2. Refine & Upgrade Main Complaints Table Schema
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'Medium' NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending' NOT NULL,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    civic_address TEXT,
    ward_id UUID REFERENCES public.wards(id) ON DELETE SET NULL,
    servicenow_ticket_number VARCHAR(50),
    servicenow_sys_id VARCHAR(50),
    image_url TEXT,
    resolve_image_url TEXT,
    admin_reply TEXT,
    assigned_to VARCHAR(150),
    is_urgent BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false,
    is_fake_flagged BOOLEAN DEFAULT false,
    parent_duplicate_id UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
    reopen_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Check Constraints for Data Quality
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

-- 3. Create Complaint Activity Updates / Audit History Table
CREATE TABLE IF NOT EXISTS public.complaint_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    update_notes TEXT,
    updated_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by_name VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Citizen Feedback & Ratings Table
CREATE TABLE IF NOT EXISTS public.complaint_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID UNIQUE NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating_stars INT CHECK (rating_stars BETWEEN 1 AND 5) NOT NULL,
    feedback_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create File Attachments Mapping Table
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size_bytes INT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create System Transaction Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50) NOT NULL,
    record_id UUID,
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
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 9. Row Level Security Policies

-- Wards Policies: Public Read
CREATE POLICY "Allow public read access to wards" 
ON public.wards FOR SELECT USING (true);

-- Complaints Policies:
-- A: Citizens can read their own complaints
CREATE POLICY "Citizens can select own complaints" 
ON public.complaints FOR SELECT 
USING (auth.uid() = user_id);

-- B: Staff, Dept Heads, Commissioners & Admins can read complaints
CREATE POLICY "Staff and Admins can view complaints" 
ON public.complaints FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('employee', 'dept_admin', 'commissioner', 'super_admin')
    )
);

-- C: Citizens can insert new complaints
CREATE POLICY "Citizens can insert complaints" 
ON public.complaints FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- D: Staff and Admins can update complaints
CREATE POLICY "Staff and Admins can update complaints" 
ON public.complaints FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('employee', 'dept_admin', 'commissioner', 'super_admin')
    )
);

-- Complaint Updates Policies:
CREATE POLICY "Users and Staff can read complaint updates" 
ON public.complaint_updates FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.complaints c 
        WHERE c.id = complaint_updates.complaint_id 
        AND (c.user_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('employee', 'dept_admin', 'commissioner', 'super_admin')
        ))
    )
);

CREATE POLICY "Staff can insert complaint updates" 
ON public.complaint_updates FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Complaint Feedback Policies:
CREATE POLICY "Citizens can read and insert own feedback" 
ON public.complaint_feedback FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view complaint feedback" 
ON public.complaint_feedback FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('employee', 'dept_admin', 'commissioner', 'super_admin')
    )
);

-- Attachments Policies:
CREATE POLICY "Users can access complaint attachments" 
ON public.attachments FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.complaints c 
        WHERE c.id = attachments.complaint_id 
        AND (c.user_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('employee', 'dept_admin', 'commissioner', 'super_admin')
        ))
    )
);

-- 10. Seed Data Setup for Wards
INSERT INTO public.wards (ward_name, ward_number, zone_name, boundary_lat, boundary_lng)
VALUES 
    ('Banjara Hills', 93, 'Khairatabad Zone', 17.4156, 78.4347),
    ('Jubilee Hills', 94, 'Khairatabad Zone', 17.4319, 78.4072),
    ('Madhapur', 107, 'Serilingampally Zone', 17.4483, 78.3915),
    ('Charminar', 49, 'Charminar Zone', 17.3616, 78.4747),
    ('Secunderabad', 147, 'Secunderabad Zone', 17.4399, 78.4983)
ON CONFLICT (ward_number) DO NOTHING;
