-- Standalone Relational SQL Seed for Civics Connect Enterprise
-- Resolves user references dynamically at runtime via profile subqueries

-- 1. Seed Profiles
-- Super Admin
INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000000', 'super_admin@ccgovt.test', 'Super Admin General', 'super_admin', NULL, '9000000001', 'Secretariat Building, Hyderabad', 0, 'aadhaar', '123456789001', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Commissioners
INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'comm_roads_light@ccgovt.test', 'Commissioner of Infrastructure (Roads & Lighting)', 'commissioner', NULL, '9000000002', 'GHMC Head Office, Hyderabad', 0, 'aadhaar', '123456789002', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000002', 'comm_water_sani@ccgovt.test', 'Commissioner of Environment (Water & Sanitation)', 'commissioner', NULL, '9000000003', 'GHMC Head Office, Hyderabad', 0, 'aadhaar', '123456789003', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Department Admins
INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'admin_roads@ccgovt.test', 'Roads Administrative Director', 'dept_admin', 'Roads', '9100000001', 'Roads Control Center, Hyderabad', 0, 'aadhaar', '123456789001', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Seed Complaints
-- 2. Seed Complaints
INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (1, '00000000-0000-0000-0000-000000000000', 'Pothole Repair reported at Madhapur', 'Citizens report a severe pothole repair hazard near the local residential sector. Requesting immediate inspection.', 'Roads', 'Pothole Repair', 'Pending', 'Medium', '17.40, 78.45', 'Madhapur, Sector 1, Hyderabad', 17.40, 78.45, NULL, false, now());
