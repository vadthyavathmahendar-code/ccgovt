-- SQL Seed Script for Civics Connect Enterprise

-- Seed Profiles
INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000000', 'Super Admin Officer', 'super_admin@ccgovt.test', 'super_admin', NULL, '9000000001', 'aadhaar', '123456789001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000001', 'Roads & Lighting Commissioner', 'comm_roads_light@ccgovt.test', 'commissioner', NULL, '9000000002', 'aadhaar', '123456789002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000002', 'Water & Sanitation Commissioner', 'comm_water_sani@ccgovt.test', 'commissioner', NULL, '9000000003', 'aadhaar', '123456789003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000003', 'Roads Admin Director', 'admin_roads@ccgovt.test', 'dept_admin', 'Roads', '9100000001', 'aadhaar', '123456789001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000004', 'Sanitation Admin Director', 'admin_sanitation@ccgovt.test', 'dept_admin', 'Sanitation', '9100000002', 'aadhaar', '123456789002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000005', 'Water Supply Admin Director', 'admin_water_supply@ccgovt.test', 'dept_admin', 'Water Supply', '9100000003', 'aadhaar', '123456789003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000006', 'Street Lighting Admin Director', 'admin_street_lighting@ccgovt.test', 'dept_admin', 'Street Lighting', '9100000004', 'aadhaar', '123456789004')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000007', 'Roads Officer 1', 'emp_road_1@ccgovt.test', 'employee', 'Roads', '92000001', 'aadhaar', '123456789001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000008', 'Roads Officer 2', 'emp_road_2@ccgovt.test', 'employee', 'Roads', '92000002', 'aadhaar', '123456789002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000009', 'Roads Officer 3', 'emp_road_3@ccgovt.test', 'employee', 'Roads', '92000003', 'aadhaar', '123456789003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000010', 'Sanitation Officer 1', 'emp_sani_1@ccgovt.test', 'employee', 'Sanitation', '92000011', 'aadhaar', '123456789011')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000011', 'Sanitation Officer 2', 'emp_sani_2@ccgovt.test', 'employee', 'Sanitation', '92000012', 'aadhaar', '123456789012')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000012', 'Sanitation Officer 3', 'emp_sani_3@ccgovt.test', 'employee', 'Sanitation', '92000013', 'aadhaar', '123456789013')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000013', 'Water Supply Officer 1', 'emp_wate_1@ccgovt.test', 'employee', 'Water Supply', '92000021', 'aadhaar', '123456789021')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000014', 'Water Supply Officer 2', 'emp_wate_2@ccgovt.test', 'employee', 'Water Supply', '92000022', 'aadhaar', '123456789022')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000015', 'Water Supply Officer 3', 'emp_wate_3@ccgovt.test', 'employee', 'Water Supply', '92000023', 'aadhaar', '123456789023')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000016', 'Street Lighting Officer 1', 'emp_stre_1@ccgovt.test', 'employee', 'Street Lighting', '92000031', 'aadhaar', '123456789031')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000017', 'Street Lighting Officer 2', 'emp_stre_2@ccgovt.test', 'employee', 'Street Lighting', '92000032', 'aadhaar', '123456789032')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000018', 'Street Lighting Officer 3', 'emp_stre_3@ccgovt.test', 'employee', 'Street Lighting', '92000033', 'aadhaar', '123456789033')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000019', 'Citizen Resident 1', 'citizen_1@ccgovt.test', 'citizen', NULL, '9900000001', 'aadhaar', '123456789001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000020', 'Citizen Resident 2', 'citizen_2@ccgovt.test', 'citizen', NULL, '9900000002', 'aadhaar', '123456789002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000021', 'Citizen Resident 3', 'citizen_3@ccgovt.test', 'citizen', NULL, '9900000003', 'aadhaar', '123456789003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000022', 'Citizen Resident 4', 'citizen_4@ccgovt.test', 'citizen', NULL, '9900000004', 'aadhaar', '123456789004')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000023', 'Citizen Resident 5', 'citizen_5@ccgovt.test', 'citizen', NULL, '9900000005', 'aadhaar', '123456789005')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000024', 'Citizen Resident 6', 'citizen_6@ccgovt.test', 'citizen', NULL, '9900000006', 'aadhaar', '123456789006')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000025', 'Citizen Resident 7', 'citizen_7@ccgovt.test', 'citizen', NULL, '9900000007', 'aadhaar', '123456789007')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000026', 'Citizen Resident 8', 'citizen_8@ccgovt.test', 'citizen', NULL, '9900000008', 'aadhaar', '123456789008')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000027', 'Citizen Resident 9', 'citizen_9@ccgovt.test', 'citizen', NULL, '9900000009', 'aadhaar', '123456789009')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000028', 'Citizen Resident 10', 'citizen_10@ccgovt.test', 'citizen', NULL, '9900000010', 'aadhaar', '123456789010')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000029', 'Citizen Resident 11', 'citizen_11@ccgovt.test', 'citizen', NULL, '9900000011', 'aadhaar', '123456789011')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000030', 'Citizen Resident 12', 'citizen_12@ccgovt.test', 'citizen', NULL, '9900000012', 'aadhaar', '123456789012')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000031', 'Citizen Resident 13', 'citizen_13@ccgovt.test', 'citizen', NULL, '9900000013', 'aadhaar', '123456789013')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000032', 'Citizen Resident 14', 'citizen_14@ccgovt.test', 'citizen', NULL, '9900000014', 'aadhaar', '123456789014')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000033', 'Citizen Resident 15', 'citizen_15@ccgovt.test', 'citizen', NULL, '9900000015', 'aadhaar', '123456789015')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000034', 'Citizen Resident 16', 'citizen_16@ccgovt.test', 'citizen', NULL, '9900000016', 'aadhaar', '123456789016')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000035', 'Citizen Resident 17', 'citizen_17@ccgovt.test', 'citizen', NULL, '9900000017', 'aadhaar', '123456789017')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000036', 'Citizen Resident 18', 'citizen_18@ccgovt.test', 'citizen', NULL, '9900000018', 'aadhaar', '123456789018')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000037', 'Citizen Resident 19', 'citizen_19@ccgovt.test', 'citizen', NULL, '9900000019', 'aadhaar', '123456789019')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)
VALUES ('00000000-0000-0000-0000-000000000038', 'Citizen Resident 20', 'citizen_20@ccgovt.test', 'citizen', NULL, '9900000020', 'aadhaar', '123456789020')
ON CONFLICT (id) DO NOTHING;

-- Seed Complaints
INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (1, '00000000-0000-0000-0000-000000000020', 'Public Urinal Clogging issue in Zone 3, Sector B', 'Visual validation required for Public Urinal Clogging category. Affecting multiple residents in this area.', 'Sanitation', 'Public Urinal Clogging', 'Assigned', 'Medium', '17.404619, 78.387286', 'Zone 3, Sector B, Hyderabad', 17.404619, 78.387286, 'emp_sani_2@ccgovt.test', false, '2026-06-09T10:54:13.558Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (2, '00000000-0000-0000-0000-000000000021', 'Contaminated Supply issue in Zone 2, Sector A', 'Visual validation required for Contaminated Supply category. Affecting multiple residents in this area.', 'Water Supply', 'Contaminated Supply', 'In Progress', 'High', '17.452538, 78.435839', 'Zone 2, Sector A, Hyderabad', 17.452538, 78.435839, 'emp_wate_3@ccgovt.test', true, '2026-06-10T10:54:13.559Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (3, '00000000-0000-0000-0000-000000000022', 'Street Light Off issue in Zone 4, Sector C', 'Visual validation required for Street Light Off category. Affecting multiple residents in this area.', 'Street Lighting', 'Street Light Off', 'Resolved', 'Low', '17.452805, 78.522634', 'Zone 4, Sector C, Hyderabad', 17.452805, 78.522634, 'emp_stre_1@ccgovt.test', false, '2026-06-11T10:54:13.559Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (4, '00000000-0000-0000-0000-000000000023', 'Manhole Cover Damage issue in Zone 1, Sector C', 'Visual validation required for Manhole Cover Damage category. Affecting multiple residents in this area.', 'Roads', 'Manhole Cover Damage', 'Closed', 'Medium', '17.477137, 78.376662', 'Zone 1, Sector C, Hyderabad', 17.477137, 78.376662, 'emp_road_2@ccgovt.test', false, '2026-06-12T10:54:13.559Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (5, '00000000-0000-0000-0000-000000000024', 'Dead Animal Disposal issue in Zone 1, Sector A', 'Visual validation required for Dead Animal Disposal category. Affecting multiple residents in this area.', 'Sanitation', 'Dead Animal Disposal', 'Reopened', 'High', '17.447570, 78.421840', 'Zone 1, Sector A, Hyderabad', 17.44757, 78.42184, 'emp_sani_3@ccgovt.test', true, '2026-06-13T10:54:13.559Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (6, '00000000-0000-0000-0000-000000000025', 'Pipe Leakage issue in Zone 4, Sector D', 'Visual validation required for Pipe Leakage category. Affecting multiple residents in this area.', 'Water Supply', 'Pipe Leakage', 'Escalated', 'Low', '17.436819, 78.419713', 'Zone 4, Sector D, Hyderabad', 17.436819, 78.419713, 'emp_wate_1@ccgovt.test', false, '2026-06-14T10:54:13.559Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (7, '00000000-0000-0000-0000-000000000026', 'Cable Wire Hanging issue in Zone 5, Sector A', 'Visual validation required for Cable Wire Hanging category. Affecting multiple residents in this area.', 'Street Lighting', 'Cable Wire Hanging', 'Pending', 'Medium', '17.370326, 78.479286', 'Zone 5, Sector A, Hyderabad', 17.370326, 78.479286, NULL, false, '2026-06-15T10:54:13.559Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (8, '00000000-0000-0000-0000-000000000027', 'Footpath Obstruction issue in Zone 2, Sector D', 'Visual validation required for Footpath Obstruction category. Affecting multiple residents in this area.', 'Roads', 'Footpath Obstruction', 'Assigned', 'High', '17.379767, 78.377040', 'Zone 2, Sector D, Hyderabad', 17.379767, 78.37704, 'emp_road_3@ccgovt.test', true, '2026-06-16T10:54:13.559Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (9, '00000000-0000-0000-0000-000000000028', 'Garbage Piling issue in Zone 3, Sector C', 'Visual validation required for Garbage Piling category. Affecting multiple residents in this area.', 'Sanitation', 'Garbage Piling', 'In Progress', 'Low', '17.464442, 78.447179', 'Zone 3, Sector C, Hyderabad', 17.464442, 78.447179, 'emp_sani_1@ccgovt.test', false, '2026-06-17T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (10, '00000000-0000-0000-0000-000000000029', 'No Water Pressure issue in Zone 3, Sector C', 'Visual validation required for No Water Pressure category. Affecting multiple residents in this area.', 'Water Supply', 'No Water Pressure', 'Resolved', 'Medium', '17.422528, 78.366154', 'Zone 3, Sector C, Hyderabad', 17.422528, 78.366154, 'emp_wate_2@ccgovt.test', false, '2026-06-18T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (11, '00000000-0000-0000-0000-000000000030', 'Frequent Fluctuations issue in Zone 3, Sector B', 'Visual validation required for Frequent Fluctuations category. Affecting multiple residents in this area.', 'Street Lighting', 'Frequent Fluctuations', 'Closed', 'High', '17.369334, 78.389622', 'Zone 3, Sector B, Hyderabad', 17.369334, 78.389622, 'emp_stre_3@ccgovt.test', true, '2026-06-19T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (12, '00000000-0000-0000-0000-000000000031', 'Pothole Repair issue in Zone 2, Sector B', 'Visual validation required for Pothole Repair category. Affecting multiple residents in this area.', 'Roads', 'Pothole Repair', 'Reopened', 'Low', '17.410286, 78.483813', 'Zone 2, Sector B, Hyderabad', 17.410286, 78.483813, 'emp_road_1@ccgovt.test', false, '2026-06-20T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (13, '00000000-0000-0000-0000-000000000032', 'Public Urinal Clogging issue in Zone 3, Sector C', 'Visual validation required for Public Urinal Clogging category. Affecting multiple residents in this area.', 'Sanitation', 'Public Urinal Clogging', 'Escalated', 'Medium', '17.377508, 78.395955', 'Zone 3, Sector C, Hyderabad', 17.377508, 78.395955, 'emp_sani_2@ccgovt.test', false, '2026-06-21T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (14, '00000000-0000-0000-0000-000000000033', 'Contaminated Supply issue in Zone 1, Sector B', 'Visual validation required for Contaminated Supply category. Affecting multiple residents in this area.', 'Water Supply', 'Contaminated Supply', 'Pending', 'High', '17.483433, 78.529778', 'Zone 1, Sector B, Hyderabad', 17.483433, 78.529778, NULL, true, '2026-06-22T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (15, '00000000-0000-0000-0000-000000000034', 'Street Light Off issue in Zone 1, Sector A', 'Visual validation required for Street Light Off category. Affecting multiple residents in this area.', 'Street Lighting', 'Street Light Off', 'Assigned', 'Low', '17.363822, 78.425144', 'Zone 1, Sector A, Hyderabad', 17.363822, 78.425144, 'emp_stre_1@ccgovt.test', false, '2026-06-23T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (16, '00000000-0000-0000-0000-000000000035', 'Manhole Cover Damage issue in Zone 4, Sector B', 'Visual validation required for Manhole Cover Damage category. Affecting multiple residents in this area.', 'Roads', 'Manhole Cover Damage', 'In Progress', 'Medium', '17.408162, 78.430673', 'Zone 4, Sector B, Hyderabad', 17.408162, 78.430673, 'emp_road_2@ccgovt.test', false, '2026-06-24T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (17, '00000000-0000-0000-0000-000000000036', 'Dead Animal Disposal issue in Zone 3, Sector C', 'Visual validation required for Dead Animal Disposal category. Affecting multiple residents in this area.', 'Sanitation', 'Dead Animal Disposal', 'Resolved', 'High', '17.402454, 78.529448', 'Zone 3, Sector C, Hyderabad', 17.402454, 78.529448, 'emp_sani_3@ccgovt.test', true, '2026-06-25T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (18, '00000000-0000-0000-0000-000000000037', 'Pipe Leakage issue in Zone 5, Sector B', 'Visual validation required for Pipe Leakage category. Affecting multiple residents in this area.', 'Water Supply', 'Pipe Leakage', 'Closed', 'Low', '17.374779, 78.388862', 'Zone 5, Sector B, Hyderabad', 17.374779, 78.388862, 'emp_wate_1@ccgovt.test', false, '2026-06-26T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (19, '00000000-0000-0000-0000-000000000038', 'Cable Wire Hanging issue in Zone 3, Sector D', 'Visual validation required for Cable Wire Hanging category. Affecting multiple residents in this area.', 'Street Lighting', 'Cable Wire Hanging', 'Reopened', 'Medium', '17.361957, 78.488663', 'Zone 3, Sector D, Hyderabad', 17.361957, 78.488663, 'emp_stre_2@ccgovt.test', false, '2026-06-27T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (20, '00000000-0000-0000-0000-000000000019', 'Footpath Obstruction issue in Zone 2, Sector C', 'Visual validation required for Footpath Obstruction category. Affecting multiple residents in this area.', 'Roads', 'Footpath Obstruction', 'Escalated', 'High', '17.485698, 78.439507', 'Zone 2, Sector C, Hyderabad', 17.485698, 78.439507, 'emp_road_3@ccgovt.test', true, '2026-06-28T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (21, '00000000-0000-0000-0000-000000000020', 'Garbage Piling issue in Zone 1, Sector D', 'Visual validation required for Garbage Piling category. Affecting multiple residents in this area.', 'Sanitation', 'Garbage Piling', 'Pending', 'Low', '17.443084, 78.470191', 'Zone 1, Sector D, Hyderabad', 17.443084, 78.470191, NULL, false, '2026-06-29T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (22, '00000000-0000-0000-0000-000000000021', 'No Water Pressure issue in Zone 5, Sector D', 'Visual validation required for No Water Pressure category. Affecting multiple residents in this area.', 'Water Supply', 'No Water Pressure', 'Assigned', 'Medium', '17.450226, 78.366507', 'Zone 5, Sector D, Hyderabad', 17.450226, 78.366507, 'emp_wate_2@ccgovt.test', false, '2026-06-30T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (23, '00000000-0000-0000-0000-000000000022', 'Frequent Fluctuations issue in Zone 1, Sector C', 'Visual validation required for Frequent Fluctuations category. Affecting multiple residents in this area.', 'Street Lighting', 'Frequent Fluctuations', 'In Progress', 'High', '17.356627, 78.508950', 'Zone 1, Sector C, Hyderabad', 17.356627, 78.50895, 'emp_stre_3@ccgovt.test', true, '2026-07-01T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (24, '00000000-0000-0000-0000-000000000023', 'Pothole Repair issue in Zone 5, Sector C', 'Visual validation required for Pothole Repair category. Affecting multiple residents in this area.', 'Roads', 'Pothole Repair', 'Resolved', 'Low', '17.381330, 78.504773', 'Zone 5, Sector C, Hyderabad', 17.38133, 78.504773, 'emp_road_1@ccgovt.test', false, '2026-07-02T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (25, '00000000-0000-0000-0000-000000000024', 'Public Urinal Clogging issue in Zone 5, Sector B', 'Visual validation required for Public Urinal Clogging category. Affecting multiple residents in this area.', 'Sanitation', 'Public Urinal Clogging', 'Closed', 'Medium', '17.497803, 78.506003', 'Zone 5, Sector B, Hyderabad', 17.497803, 78.506003, 'emp_sani_2@ccgovt.test', false, '2026-07-03T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (26, '00000000-0000-0000-0000-000000000025', 'Contaminated Supply issue in Zone 2, Sector A', 'Visual validation required for Contaminated Supply category. Affecting multiple residents in this area.', 'Water Supply', 'Contaminated Supply', 'Reopened', 'High', '17.414023, 78.384660', 'Zone 2, Sector A, Hyderabad', 17.414023, 78.38466, 'emp_wate_3@ccgovt.test', true, '2026-07-04T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (27, '00000000-0000-0000-0000-000000000026', 'Street Light Off issue in Zone 1, Sector D', 'Visual validation required for Street Light Off category. Affecting multiple residents in this area.', 'Street Lighting', 'Street Light Off', 'Escalated', 'Low', '17.397486, 78.474204', 'Zone 1, Sector D, Hyderabad', 17.397486, 78.474204, 'emp_stre_1@ccgovt.test', false, '2026-07-05T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (28, '00000000-0000-0000-0000-000000000027', 'Manhole Cover Damage issue in Zone 4, Sector D', 'Visual validation required for Manhole Cover Damage category. Affecting multiple residents in this area.', 'Roads', 'Manhole Cover Damage', 'Pending', 'Medium', '17.429761, 78.502898', 'Zone 4, Sector D, Hyderabad', 17.429761, 78.502898, NULL, false, '2026-07-06T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (29, '00000000-0000-0000-0000-000000000028', 'Dead Animal Disposal issue in Zone 1, Sector B', 'Visual validation required for Dead Animal Disposal category. Affecting multiple residents in this area.', 'Sanitation', 'Dead Animal Disposal', 'Assigned', 'High', '17.486390, 78.509871', 'Zone 1, Sector B, Hyderabad', 17.48639, 78.509871, 'emp_sani_3@ccgovt.test', true, '2026-07-07T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (30, '00000000-0000-0000-0000-000000000029', 'Pipe Leakage issue in Zone 3, Sector C', 'Visual validation required for Pipe Leakage category. Affecting multiple residents in this area.', 'Water Supply', 'Pipe Leakage', 'In Progress', 'Low', '17.484052, 78.476047', 'Zone 3, Sector C, Hyderabad', 17.484052, 78.476047, 'emp_wate_1@ccgovt.test', false, '2026-07-08T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (31, '00000000-0000-0000-0000-000000000030', 'Cable Wire Hanging issue in Zone 3, Sector C', 'Visual validation required for Cable Wire Hanging category. Affecting multiple residents in this area.', 'Street Lighting', 'Cable Wire Hanging', 'Resolved', 'Medium', '17.413181, 78.499336', 'Zone 3, Sector C, Hyderabad', 17.413181, 78.499336, 'emp_stre_2@ccgovt.test', false, '2026-07-09T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (32, '00000000-0000-0000-0000-000000000031', 'Footpath Obstruction issue in Zone 1, Sector A', 'Visual validation required for Footpath Obstruction category. Affecting multiple residents in this area.', 'Roads', 'Footpath Obstruction', 'Closed', 'High', '17.359024, 78.350795', 'Zone 1, Sector A, Hyderabad', 17.359024, 78.350795, 'emp_road_3@ccgovt.test', true, '2026-07-10T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (33, '00000000-0000-0000-0000-000000000032', 'Garbage Piling issue in Zone 2, Sector B', 'Visual validation required for Garbage Piling category. Affecting multiple residents in this area.', 'Sanitation', 'Garbage Piling', 'Reopened', 'Low', '17.452232, 78.523530', 'Zone 2, Sector B, Hyderabad', 17.452232, 78.52353, 'emp_sani_1@ccgovt.test', false, '2026-07-11T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (34, '00000000-0000-0000-0000-000000000033', 'No Water Pressure issue in Zone 3, Sector B', 'Visual validation required for No Water Pressure category. Affecting multiple residents in this area.', 'Water Supply', 'No Water Pressure', 'Escalated', 'Medium', '17.462577, 78.413350', 'Zone 3, Sector B, Hyderabad', 17.462577, 78.41335, 'emp_wate_2@ccgovt.test', false, '2026-07-12T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (35, '00000000-0000-0000-0000-000000000034', 'Frequent Fluctuations issue in Zone 1, Sector B', 'Visual validation required for Frequent Fluctuations category. Affecting multiple residents in this area.', 'Street Lighting', 'Frequent Fluctuations', 'Pending', 'High', '17.464785, 78.487040', 'Zone 1, Sector B, Hyderabad', 17.464785, 78.48704, NULL, true, '2026-07-13T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (36, '00000000-0000-0000-0000-000000000035', 'Pothole Repair issue in Zone 1, Sector B', 'Visual validation required for Pothole Repair category. Affecting multiple residents in this area.', 'Roads', 'Pothole Repair', 'Assigned', 'Low', '17.388134, 78.435365', 'Zone 1, Sector B, Hyderabad', 17.388134, 78.435365, 'emp_road_1@ccgovt.test', false, '2026-07-14T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (37, '00000000-0000-0000-0000-000000000036', 'Public Urinal Clogging issue in Zone 2, Sector C', 'Visual validation required for Public Urinal Clogging category. Affecting multiple residents in this area.', 'Sanitation', 'Public Urinal Clogging', 'In Progress', 'Medium', '17.366589, 78.499196', 'Zone 2, Sector C, Hyderabad', 17.366589, 78.499196, 'emp_sani_2@ccgovt.test', false, '2026-07-15T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (38, '00000000-0000-0000-0000-000000000037', 'Contaminated Supply issue in Zone 2, Sector B', 'Visual validation required for Contaminated Supply category. Affecting multiple residents in this area.', 'Water Supply', 'Contaminated Supply', 'Resolved', 'High', '17.438545, 78.526364', 'Zone 2, Sector B, Hyderabad', 17.438545, 78.526364, 'emp_wate_3@ccgovt.test', true, '2026-07-16T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (39, '00000000-0000-0000-0000-000000000038', 'Street Light Off issue in Zone 5, Sector C', 'Visual validation required for Street Light Off category. Affecting multiple residents in this area.', 'Street Lighting', 'Street Light Off', 'Closed', 'Low', '17.473175, 78.498533', 'Zone 5, Sector C, Hyderabad', 17.473175, 78.498533, 'emp_stre_1@ccgovt.test', false, '2026-07-17T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (40, '00000000-0000-0000-0000-000000000019', 'Manhole Cover Damage issue in Zone 1, Sector B', 'Visual validation required for Manhole Cover Damage category. Affecting multiple residents in this area.', 'Roads', 'Manhole Cover Damage', 'Reopened', 'Medium', '17.425707, 78.449510', 'Zone 1, Sector B, Hyderabad', 17.425707, 78.44951, 'emp_road_2@ccgovt.test', false, '2026-07-18T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (41, '00000000-0000-0000-0000-000000000020', 'Dead Animal Disposal issue in Zone 3, Sector B', 'Visual validation required for Dead Animal Disposal category. Affecting multiple residents in this area.', 'Sanitation', 'Dead Animal Disposal', 'Escalated', 'High', '17.454306, 78.412055', 'Zone 3, Sector B, Hyderabad', 17.454306, 78.412055, 'emp_sani_3@ccgovt.test', true, '2026-07-19T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (42, '00000000-0000-0000-0000-000000000021', 'Pipe Leakage issue in Zone 5, Sector B', 'Visual validation required for Pipe Leakage category. Affecting multiple residents in this area.', 'Water Supply', 'Pipe Leakage', 'Pending', 'Low', '17.432056, 78.483698', 'Zone 5, Sector B, Hyderabad', 17.432056, 78.483698, NULL, false, '2026-07-20T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (43, '00000000-0000-0000-0000-000000000022', 'Cable Wire Hanging issue in Zone 4, Sector C', 'Visual validation required for Cable Wire Hanging category. Affecting multiple residents in this area.', 'Street Lighting', 'Cable Wire Hanging', 'Assigned', 'Medium', '17.442667, 78.525170', 'Zone 4, Sector C, Hyderabad', 17.442667, 78.52517, 'emp_stre_2@ccgovt.test', false, '2026-07-21T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (44, '00000000-0000-0000-0000-000000000023', 'Footpath Obstruction issue in Zone 5, Sector A', 'Visual validation required for Footpath Obstruction category. Affecting multiple residents in this area.', 'Roads', 'Footpath Obstruction', 'In Progress', 'High', '17.358634, 78.423175', 'Zone 5, Sector A, Hyderabad', 17.358634, 78.423175, 'emp_road_3@ccgovt.test', true, '2026-07-22T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (45, '00000000-0000-0000-0000-000000000024', 'Garbage Piling issue in Zone 5, Sector B', 'Visual validation required for Garbage Piling category. Affecting multiple residents in this area.', 'Sanitation', 'Garbage Piling', 'Resolved', 'Low', '17.396198, 78.377233', 'Zone 5, Sector B, Hyderabad', 17.396198, 78.377233, 'emp_sani_1@ccgovt.test', false, '2026-07-23T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (46, '00000000-0000-0000-0000-000000000025', 'No Water Pressure issue in Zone 1, Sector D', 'Visual validation required for No Water Pressure category. Affecting multiple residents in this area.', 'Water Supply', 'No Water Pressure', 'Closed', 'Medium', '17.406957, 78.379800', 'Zone 1, Sector D, Hyderabad', 17.406957, 78.3798, 'emp_wate_2@ccgovt.test', false, '2026-07-24T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (47, '00000000-0000-0000-0000-000000000026', 'Frequent Fluctuations issue in Zone 4, Sector C', 'Visual validation required for Frequent Fluctuations category. Affecting multiple residents in this area.', 'Street Lighting', 'Frequent Fluctuations', 'Reopened', 'High', '17.454401, 78.504345', 'Zone 4, Sector C, Hyderabad', 17.454401, 78.504345, 'emp_stre_3@ccgovt.test', true, '2026-07-25T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (48, '00000000-0000-0000-0000-000000000027', 'Pothole Repair issue in Zone 4, Sector C', 'Visual validation required for Pothole Repair category. Affecting multiple residents in this area.', 'Roads', 'Pothole Repair', 'Escalated', 'Low', '17.464420, 78.381225', 'Zone 4, Sector C, Hyderabad', 17.46442, 78.381225, 'emp_road_1@ccgovt.test', false, '2026-07-26T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (49, '00000000-0000-0000-0000-000000000028', 'Public Urinal Clogging issue in Zone 2, Sector A', 'Visual validation required for Public Urinal Clogging category. Affecting multiple residents in this area.', 'Sanitation', 'Public Urinal Clogging', 'Pending', 'Medium', '17.466529, 78.382109', 'Zone 2, Sector A, Hyderabad', 17.466529, 78.382109, NULL, false, '2026-07-27T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (50, '00000000-0000-0000-0000-000000000029', 'Contaminated Supply issue in Zone 4, Sector D', 'Visual validation required for Contaminated Supply category. Affecting multiple residents in this area.', 'Water Supply', 'Contaminated Supply', 'Assigned', 'High', '17.416748, 78.513621', 'Zone 4, Sector D, Hyderabad', 17.416748, 78.513621, 'emp_wate_3@ccgovt.test', true, '2026-07-28T10:54:13.560Z')
ON CONFLICT (id) DO NOTHING;

-- Seed Audit Logs
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000020', 'citizen', 'complaint_created', 'complaints', '1', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-06-09T10:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000004', 'dept_admin', 'complaint_assigned', 'complaints', '1', '{"status":"Assigned","assigned_to":"emp_sani_2@ccgovt.test"}'::jsonb, 'success', '2026-06-09T11:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000021', 'citizen', 'complaint_created', 'complaints', '2', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-06-10T10:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000005', 'dept_admin', 'complaint_assigned', 'complaints', '2', '{"status":"Assigned","assigned_to":"emp_wate_3@ccgovt.test"}'::jsonb, 'success', '2026-06-10T11:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000022', 'citizen', 'complaint_created', 'complaints', '3', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-06-11T10:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000006', 'dept_admin', 'complaint_assigned', 'complaints', '3', '{"status":"Assigned","assigned_to":"emp_stre_1@ccgovt.test"}'::jsonb, 'success', '2026-06-11T11:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000023', 'citizen', 'complaint_created', 'complaints', '4', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-06-12T10:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'dept_admin', 'complaint_assigned', 'complaints', '4', '{"status":"Assigned","assigned_to":"emp_road_2@ccgovt.test"}'::jsonb, 'success', '2026-06-12T11:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000024', 'citizen', 'complaint_created', 'complaints', '5', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-06-13T10:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000004', 'dept_admin', 'complaint_assigned', 'complaints', '5', '{"status":"Assigned","assigned_to":"emp_sani_3@ccgovt.test"}'::jsonb, 'success', '2026-06-13T11:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000025', 'citizen', 'complaint_created', 'complaints', '6', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-06-14T10:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000005', 'dept_admin', 'complaint_assigned', 'complaints', '6', '{"status":"Assigned","assigned_to":"emp_wate_1@ccgovt.test"}'::jsonb, 'success', '2026-06-14T11:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000026', 'citizen', 'complaint_created', 'complaints', '7', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-06-15T10:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000027', 'citizen', 'complaint_created', 'complaints', '8', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-06-16T10:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'dept_admin', 'complaint_assigned', 'complaints', '8', '{"status":"Assigned","assigned_to":"emp_road_3@ccgovt.test"}'::jsonb, 'success', '2026-06-16T11:54:13.559Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000028', 'citizen', 'complaint_created', 'complaints', '9', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-06-17T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000004', 'dept_admin', 'complaint_assigned', 'complaints', '9', '{"status":"Assigned","assigned_to":"emp_sani_1@ccgovt.test"}'::jsonb, 'success', '2026-06-17T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000029', 'citizen', 'complaint_created', 'complaints', '10', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-06-18T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000005', 'dept_admin', 'complaint_assigned', 'complaints', '10', '{"status":"Assigned","assigned_to":"emp_wate_2@ccgovt.test"}'::jsonb, 'success', '2026-06-18T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000030', 'citizen', 'complaint_created', 'complaints', '11', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-06-19T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000006', 'dept_admin', 'complaint_assigned', 'complaints', '11', '{"status":"Assigned","assigned_to":"emp_stre_3@ccgovt.test"}'::jsonb, 'success', '2026-06-19T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000031', 'citizen', 'complaint_created', 'complaints', '12', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-06-20T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'dept_admin', 'complaint_assigned', 'complaints', '12', '{"status":"Assigned","assigned_to":"emp_road_1@ccgovt.test"}'::jsonb, 'success', '2026-06-20T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000032', 'citizen', 'complaint_created', 'complaints', '13', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-06-21T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000004', 'dept_admin', 'complaint_assigned', 'complaints', '13', '{"status":"Assigned","assigned_to":"emp_sani_2@ccgovt.test"}'::jsonb, 'success', '2026-06-21T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000033', 'citizen', 'complaint_created', 'complaints', '14', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-06-22T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000034', 'citizen', 'complaint_created', 'complaints', '15', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-06-23T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000006', 'dept_admin', 'complaint_assigned', 'complaints', '15', '{"status":"Assigned","assigned_to":"emp_stre_1@ccgovt.test"}'::jsonb, 'success', '2026-06-23T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000035', 'citizen', 'complaint_created', 'complaints', '16', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-06-24T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'dept_admin', 'complaint_assigned', 'complaints', '16', '{"status":"Assigned","assigned_to":"emp_road_2@ccgovt.test"}'::jsonb, 'success', '2026-06-24T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000036', 'citizen', 'complaint_created', 'complaints', '17', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-06-25T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000004', 'dept_admin', 'complaint_assigned', 'complaints', '17', '{"status":"Assigned","assigned_to":"emp_sani_3@ccgovt.test"}'::jsonb, 'success', '2026-06-25T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000037', 'citizen', 'complaint_created', 'complaints', '18', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-06-26T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000005', 'dept_admin', 'complaint_assigned', 'complaints', '18', '{"status":"Assigned","assigned_to":"emp_wate_1@ccgovt.test"}'::jsonb, 'success', '2026-06-26T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000038', 'citizen', 'complaint_created', 'complaints', '19', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-06-27T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000006', 'dept_admin', 'complaint_assigned', 'complaints', '19', '{"status":"Assigned","assigned_to":"emp_stre_2@ccgovt.test"}'::jsonb, 'success', '2026-06-27T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000019', 'citizen', 'complaint_created', 'complaints', '20', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-06-28T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'dept_admin', 'complaint_assigned', 'complaints', '20', '{"status":"Assigned","assigned_to":"emp_road_3@ccgovt.test"}'::jsonb, 'success', '2026-06-28T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000020', 'citizen', 'complaint_created', 'complaints', '21', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-06-29T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000021', 'citizen', 'complaint_created', 'complaints', '22', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-06-30T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000005', 'dept_admin', 'complaint_assigned', 'complaints', '22', '{"status":"Assigned","assigned_to":"emp_wate_2@ccgovt.test"}'::jsonb, 'success', '2026-06-30T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000022', 'citizen', 'complaint_created', 'complaints', '23', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-07-01T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000006', 'dept_admin', 'complaint_assigned', 'complaints', '23', '{"status":"Assigned","assigned_to":"emp_stre_3@ccgovt.test"}'::jsonb, 'success', '2026-07-01T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000023', 'citizen', 'complaint_created', 'complaints', '24', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-07-02T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'dept_admin', 'complaint_assigned', 'complaints', '24', '{"status":"Assigned","assigned_to":"emp_road_1@ccgovt.test"}'::jsonb, 'success', '2026-07-02T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000024', 'citizen', 'complaint_created', 'complaints', '25', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-07-03T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000004', 'dept_admin', 'complaint_assigned', 'complaints', '25', '{"status":"Assigned","assigned_to":"emp_sani_2@ccgovt.test"}'::jsonb, 'success', '2026-07-03T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000025', 'citizen', 'complaint_created', 'complaints', '26', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-07-04T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000005', 'dept_admin', 'complaint_assigned', 'complaints', '26', '{"status":"Assigned","assigned_to":"emp_wate_3@ccgovt.test"}'::jsonb, 'success', '2026-07-04T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000026', 'citizen', 'complaint_created', 'complaints', '27', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-07-05T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000006', 'dept_admin', 'complaint_assigned', 'complaints', '27', '{"status":"Assigned","assigned_to":"emp_stre_1@ccgovt.test"}'::jsonb, 'success', '2026-07-05T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000027', 'citizen', 'complaint_created', 'complaints', '28', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-07-06T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000028', 'citizen', 'complaint_created', 'complaints', '29', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-07-07T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000004', 'dept_admin', 'complaint_assigned', 'complaints', '29', '{"status":"Assigned","assigned_to":"emp_sani_3@ccgovt.test"}'::jsonb, 'success', '2026-07-07T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000029', 'citizen', 'complaint_created', 'complaints', '30', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-07-08T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000005', 'dept_admin', 'complaint_assigned', 'complaints', '30', '{"status":"Assigned","assigned_to":"emp_wate_1@ccgovt.test"}'::jsonb, 'success', '2026-07-08T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000030', 'citizen', 'complaint_created', 'complaints', '31', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-07-09T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000006', 'dept_admin', 'complaint_assigned', 'complaints', '31', '{"status":"Assigned","assigned_to":"emp_stre_2@ccgovt.test"}'::jsonb, 'success', '2026-07-09T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000031', 'citizen', 'complaint_created', 'complaints', '32', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-07-10T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'dept_admin', 'complaint_assigned', 'complaints', '32', '{"status":"Assigned","assigned_to":"emp_road_3@ccgovt.test"}'::jsonb, 'success', '2026-07-10T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000032', 'citizen', 'complaint_created', 'complaints', '33', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-07-11T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000004', 'dept_admin', 'complaint_assigned', 'complaints', '33', '{"status":"Assigned","assigned_to":"emp_sani_1@ccgovt.test"}'::jsonb, 'success', '2026-07-11T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000033', 'citizen', 'complaint_created', 'complaints', '34', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-07-12T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000005', 'dept_admin', 'complaint_assigned', 'complaints', '34', '{"status":"Assigned","assigned_to":"emp_wate_2@ccgovt.test"}'::jsonb, 'success', '2026-07-12T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000034', 'citizen', 'complaint_created', 'complaints', '35', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-07-13T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000035', 'citizen', 'complaint_created', 'complaints', '36', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-07-14T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'dept_admin', 'complaint_assigned', 'complaints', '36', '{"status":"Assigned","assigned_to":"emp_road_1@ccgovt.test"}'::jsonb, 'success', '2026-07-14T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000036', 'citizen', 'complaint_created', 'complaints', '37', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-07-15T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000004', 'dept_admin', 'complaint_assigned', 'complaints', '37', '{"status":"Assigned","assigned_to":"emp_sani_2@ccgovt.test"}'::jsonb, 'success', '2026-07-15T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000037', 'citizen', 'complaint_created', 'complaints', '38', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-07-16T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000005', 'dept_admin', 'complaint_assigned', 'complaints', '38', '{"status":"Assigned","assigned_to":"emp_wate_3@ccgovt.test"}'::jsonb, 'success', '2026-07-16T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000038', 'citizen', 'complaint_created', 'complaints', '39', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-07-17T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000006', 'dept_admin', 'complaint_assigned', 'complaints', '39', '{"status":"Assigned","assigned_to":"emp_stre_1@ccgovt.test"}'::jsonb, 'success', '2026-07-17T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000019', 'citizen', 'complaint_created', 'complaints', '40', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-07-18T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'dept_admin', 'complaint_assigned', 'complaints', '40', '{"status":"Assigned","assigned_to":"emp_road_2@ccgovt.test"}'::jsonb, 'success', '2026-07-18T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000020', 'citizen', 'complaint_created', 'complaints', '41', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-07-19T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000004', 'dept_admin', 'complaint_assigned', 'complaints', '41', '{"status":"Assigned","assigned_to":"emp_sani_3@ccgovt.test"}'::jsonb, 'success', '2026-07-19T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000021', 'citizen', 'complaint_created', 'complaints', '42', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-07-20T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000022', 'citizen', 'complaint_created', 'complaints', '43', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-07-21T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000006', 'dept_admin', 'complaint_assigned', 'complaints', '43', '{"status":"Assigned","assigned_to":"emp_stre_2@ccgovt.test"}'::jsonb, 'success', '2026-07-21T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000023', 'citizen', 'complaint_created', 'complaints', '44', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-07-22T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'dept_admin', 'complaint_assigned', 'complaints', '44', '{"status":"Assigned","assigned_to":"emp_road_3@ccgovt.test"}'::jsonb, 'success', '2026-07-22T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000024', 'citizen', 'complaint_created', 'complaints', '45', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-07-23T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000004', 'dept_admin', 'complaint_assigned', 'complaints', '45', '{"status":"Assigned","assigned_to":"emp_sani_1@ccgovt.test"}'::jsonb, 'success', '2026-07-23T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000025', 'citizen', 'complaint_created', 'complaints', '46', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-07-24T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000005', 'dept_admin', 'complaint_assigned', 'complaints', '46', '{"status":"Assigned","assigned_to":"emp_wate_2@ccgovt.test"}'::jsonb, 'success', '2026-07-24T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000026', 'citizen', 'complaint_created', 'complaints', '47', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-07-25T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000006', 'dept_admin', 'complaint_assigned', 'complaints', '47', '{"status":"Assigned","assigned_to":"emp_stre_3@ccgovt.test"}'::jsonb, 'success', '2026-07-25T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000027', 'citizen', 'complaint_created', 'complaints', '48', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-07-26T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'dept_admin', 'complaint_assigned', 'complaints', '48', '{"status":"Assigned","assigned_to":"emp_road_1@ccgovt.test"}'::jsonb, 'success', '2026-07-26T11:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000028', 'citizen', 'complaint_created', 'complaints', '49', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-07-27T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000029', 'citizen', 'complaint_created', 'complaints', '50', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-07-28T10:54:13.560Z');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('00000000-0000-0000-0000-000000000005', 'dept_admin', 'complaint_assigned', 'complaints', '50', '{"status":"Assigned","assigned_to":"emp_wate_3@ccgovt.test"}'::jsonb, 'success', '2026-07-28T11:54:13.560Z');

