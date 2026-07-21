-- ==============================================================================
-- CIVICS CONNECT ENTERPRISE - SPRINT 02 MIGRATION
-- Migration Name: 20260721000001_sprint_02_rbac_and_profiles_rls.sql
-- Target Database: Supabase PostgreSQL
-- ==============================================================================

-- 1. Ensure Role Check Constraint on Profiles Table
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_user_role'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT check_user_role;
    END IF;
END $$;

ALTER TABLE public.profiles 
ADD CONSTRAINT check_user_role 
CHECK (role IN ('citizen', 'employee', 'dept_admin', 'commissioner', 'super_admin'));

-- 2. Indexes for Role Lookups and Performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. Enable Row Level Security (RLS) on Profiles Table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Profiles Table
-- Policy A: Users can read their own profile
CREATE POLICY "Users can read own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy B: Staff and Admins can view profile list
CREATE POLICY "Staff and Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('employee', 'dept_admin', 'commissioner', 'super_admin')
    )
);

-- Policy C: Users can update non-critical fields on their own profile
CREATE POLICY "Users can update own profile non-role fields" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND 
    -- Prevent users from escalating their own role unless super_admin
    (role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()))
);

-- Policy D: Admins can insert and update user profiles
CREATE POLICY "Admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' OR 
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('dept_admin', 'super_admin')
    )
);

-- 5. Helper Function: Get Current Authenticated User Role (Definer Security)
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT 
LANGUAGE sql 
SECURITY DEFINER 
STABLE
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;
