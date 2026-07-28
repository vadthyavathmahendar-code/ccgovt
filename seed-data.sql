-- Standalone Relational SQL Seed for Civics Connect Enterprise
-- Resolves user references dynamically at runtime via profile subqueries

-- 1. Seed Profiles
INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('7d114193-6fd3-4f14-9231-5e6905a2147a', 'super_admin@ccgovt.test', 'Super Admin General', 'super_admin', NULL, '9000000001', 'Secretariat Building, Hyderabad', 0, 'aadhaar', '123456789001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('1187a3c1-f4ff-4134-8b91-20d570f26617', 'comm_roads_light@ccgovt.test', 'Commissioner of Infrastructure (Roads & Lighting)', 'commissioner', NULL, '9000000002', 'GHMC Head Office, Hyderabad', 0, 'aadhaar', '123456789002', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('714e11ed-41ad-4f5c-bae6-12a67cd7e19c', 'comm_water_sani@ccgovt.test', 'Commissioner of Environment (Water & Sanitation)', 'commissioner', NULL, '9000000003', 'GHMC Head Office, Hyderabad', 0, 'aadhaar', '123456789003', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('74e5dea8-8e48-4bd1-b45b-720a4e75fd85', 'admin_roads@ccgovt.test', 'Roads Administrative Director', 'dept_admin', 'Roads', '9100000001', 'Roads Control Center, Hyderabad', 0, 'aadhaar', '123456789001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('d3fb0879-980c-4336-bcdd-baf571bfecef', 'admin_sanitation@ccgovt.test', 'Sanitation Administrative Director', 'dept_admin', 'Sanitation', '9100000002', 'Sanitation Control Center, Hyderabad', 0, 'aadhaar', '123456789002', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('2a9fec04-f332-407a-be3a-a5207c96cdcf', 'admin_water_supply@ccgovt.test', 'Water Supply Administrative Director', 'dept_admin', 'Water Supply', '9100000003', 'Water Supply Control Center, Hyderabad', 0, 'aadhaar', '123456789003', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('ff4e6790-b20a-441a-9667-4536b9c52da9', 'admin_street_lighting@ccgovt.test', 'Street Lighting Administrative Director', 'dept_admin', 'Street Lighting', '9100000004', 'Street Lighting Control Center, Hyderabad', 0, 'aadhaar', '123456789004', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('ec07cc42-4735-4133-93c7-45e86fd8537d', 'emp_road_1@ccgovt.test', 'Roads Field Inspector 1', 'employee', 'Roads', '92000001', 'Roads Sub-station Office 1', 0, 'aadhaar', '123456789001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('7517db56-0a03-4401-a331-9d049c469d1f', 'emp_road_2@ccgovt.test', 'Roads Field Inspector 2', 'employee', 'Roads', '92000002', 'Roads Sub-station Office 2', 0, 'aadhaar', '123456789002', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('99b9b122-ebd4-40b1-a58c-c5f2819e2bf8', 'emp_road_3@ccgovt.test', 'Roads Field Inspector 3', 'employee', 'Roads', '92000003', 'Roads Sub-station Office 3', 0, 'aadhaar', '123456789003', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('a9cfadaf-ad7c-4c8f-b5a8-d918e846fff3', 'emp_sani_1@ccgovt.test', 'Sanitation Field Inspector 1', 'employee', 'Sanitation', '92000011', 'Sanitation Sub-station Office 1', 0, 'aadhaar', '123456789011', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('d0d26e90-24d1-4b64-8900-456c923a863d', 'emp_sani_2@ccgovt.test', 'Sanitation Field Inspector 2', 'employee', 'Sanitation', '92000012', 'Sanitation Sub-station Office 2', 0, 'aadhaar', '123456789012', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('193c0f5a-0094-4dae-9937-feb097bb47b6', 'emp_sani_3@ccgovt.test', 'Sanitation Field Inspector 3', 'employee', 'Sanitation', '92000013', 'Sanitation Sub-station Office 3', 0, 'aadhaar', '123456789013', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('269fcca0-71d5-443f-b5d6-211c8c7a40bd', 'emp_wate_1@ccgovt.test', 'Water Supply Field Inspector 1', 'employee', 'Water Supply', '92000021', 'Water Supply Sub-station Office 1', 0, 'aadhaar', '123456789021', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('16182b15-c8f6-4891-b43d-2ecd46cc15b3', 'emp_wate_2@ccgovt.test', 'Water Supply Field Inspector 2', 'employee', 'Water Supply', '92000022', 'Water Supply Sub-station Office 2', 0, 'aadhaar', '123456789022', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('4a2a5c9d-cb51-44b9-a4ce-cc623458aed0', 'emp_wate_3@ccgovt.test', 'Water Supply Field Inspector 3', 'employee', 'Water Supply', '92000023', 'Water Supply Sub-station Office 3', 0, 'aadhaar', '123456789023', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('fb1fc3e0-5f9f-40d7-abd6-cfa7cf2d1da3', 'emp_stre_1@ccgovt.test', 'Street Lighting Field Inspector 1', 'employee', 'Street Lighting', '92000031', 'Street Lighting Sub-station Office 1', 0, 'aadhaar', '123456789031', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('64204ba8-a297-4d6a-963e-5d187878015a', 'emp_stre_2@ccgovt.test', 'Street Lighting Field Inspector 2', 'employee', 'Street Lighting', '92000032', 'Street Lighting Sub-station Office 2', 0, 'aadhaar', '123456789032', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('7055e220-b361-4023-9ea2-2d549ed6dae2', 'emp_stre_3@ccgovt.test', 'Street Lighting Field Inspector 3', 'employee', 'Street Lighting', '92000033', 'Street Lighting Sub-station Office 3', 0, 'aadhaar', '123456789033', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('0ae367cd-bd3d-4deb-b051-cffe9a4cbd65', 'citizen_1@ccgovt.test', 'Citizen Resident User 1', 'citizen', NULL, '9900000001', 'Residential Colony Street 1, Hyderabad', 100, 'aadhaar', '123456789001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('f2d9d2c3-b0b3-4e16-8c57-278a92c07cfc', 'citizen_2@ccgovt.test', 'Citizen Resident User 2', 'citizen', NULL, '9900000002', 'Residential Colony Street 2, Hyderabad', 100, 'aadhaar', '123456789002', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('f9c966b5-9655-4784-8354-f8d66c72289e', 'citizen_3@ccgovt.test', 'Citizen Resident User 3', 'citizen', NULL, '9900000003', 'Residential Colony Street 3, Hyderabad', 100, 'aadhaar', '123456789003', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('4738caf3-0a6a-4312-9ce9-b1ac51648246', 'citizen_4@ccgovt.test', 'Citizen Resident User 4', 'citizen', NULL, '9900000004', 'Residential Colony Street 4, Hyderabad', 100, 'aadhaar', '123456789004', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('e635d7ce-92b5-4bc7-8363-3b36ca12f509', 'citizen_5@ccgovt.test', 'Citizen Resident User 5', 'citizen', NULL, '9900000005', 'Residential Colony Street 5, Hyderabad', 100, 'aadhaar', '123456789005', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('34286040-1565-4b67-8667-adc215aadbed', 'citizen_6@ccgovt.test', 'Citizen Resident User 6', 'citizen', NULL, '9900000006', 'Residential Colony Street 6, Hyderabad', 100, 'aadhaar', '123456789006', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('71415309-8b38-4e44-8933-734a50b7a73f', 'citizen_7@ccgovt.test', 'Citizen Resident User 7', 'citizen', NULL, '9900000007', 'Residential Colony Street 7, Hyderabad', 100, 'aadhaar', '123456789007', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('5f301260-4bc2-4820-88bc-93f1384fffd4', 'citizen_8@ccgovt.test', 'Citizen Resident User 8', 'citizen', NULL, '9900000008', 'Residential Colony Street 8, Hyderabad', 100, 'aadhaar', '123456789008', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('1e4fc909-ca0d-4fac-93a5-40998c58b442', 'citizen_9@ccgovt.test', 'Citizen Resident User 9', 'citizen', NULL, '9900000009', 'Residential Colony Street 9, Hyderabad', 100, 'aadhaar', '123456789009', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('2d73bf98-254c-416b-87b6-8f0c2646bd04', 'citizen_10@ccgovt.test', 'Citizen Resident User 10', 'citizen', NULL, '9900000010', 'Residential Colony Street 10, Hyderabad', 100, 'aadhaar', '123456789010', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('964ac6a4-5659-46c8-975a-745a4305b057', 'citizen_11@ccgovt.test', 'Citizen Resident User 11', 'citizen', NULL, '9900000011', 'Residential Colony Street 11, Hyderabad', 100, 'aadhaar', '123456789011', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('87f1b583-6e27-4c4c-8cae-b376b8eabcfe', 'citizen_12@ccgovt.test', 'Citizen Resident User 12', 'citizen', NULL, '9900000012', 'Residential Colony Street 12, Hyderabad', 100, 'aadhaar', '123456789012', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('134e02e0-ea39-4742-9921-f766046574d2', 'citizen_13@ccgovt.test', 'Citizen Resident User 13', 'citizen', NULL, '9900000013', 'Residential Colony Street 13, Hyderabad', 100, 'aadhaar', '123456789013', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('1da19db9-d02a-4b0a-965f-8a62a31bee71', 'citizen_14@ccgovt.test', 'Citizen Resident User 14', 'citizen', NULL, '9900000014', 'Residential Colony Street 14, Hyderabad', 100, 'aadhaar', '123456789014', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('5d0848fd-14d0-4d75-bbd7-a95c3ea592ae', 'citizen_15@ccgovt.test', 'Citizen Resident User 15', 'citizen', NULL, '9900000015', 'Residential Colony Street 15, Hyderabad', 100, 'aadhaar', '123456789015', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('47d3a7c0-bbc2-496b-9037-a40ed670c9dc', 'citizen_16@ccgovt.test', 'Citizen Resident User 16', 'citizen', NULL, '9900000016', 'Residential Colony Street 16, Hyderabad', 100, 'aadhaar', '123456789016', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('ec9a3127-acba-46c7-ab72-4fda57ec6a90', 'citizen_17@ccgovt.test', 'Citizen Resident User 17', 'citizen', NULL, '9900000017', 'Residential Colony Street 17, Hyderabad', 100, 'aadhaar', '123456789017', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('8e8b87c2-aea6-4b3d-b892-5753486c402d', 'citizen_18@ccgovt.test', 'Citizen Resident User 18', 'citizen', NULL, '9900000018', 'Residential Colony Street 18, Hyderabad', 100, 'aadhaar', '123456789018', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('33e92dfb-87dd-4b62-a8ee-f49c6a362bae', 'citizen_19@ccgovt.test', 'Citizen Resident User 19', 'citizen', NULL, '9900000019', 'Residential Colony Street 19, Hyderabad', 100, 'aadhaar', '123456789019', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)
VALUES ('9d649571-4c3c-4ad8-b52d-2a7d5311c49b', 'citizen_20@ccgovt.test', 'Citizen Resident User 20', 'citizen', NULL, '9900000020', 'Residential Colony Street 20, Hyderabad', 100, 'aadhaar', '123456789020', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Complaints
INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (26, (SELECT id FROM public.profiles WHERE email = 'citizen_1@ccgovt.test'), 'Dead Animal issue reported at Kukatpally', 'Citizens report a severe dead animal hazard near the local residential sector. Requesting immediate inspection.', 'Sanitation', 'Dead Animal', 'Triaged', 'Medium', '17.446812, 78.414093', 'Kukatpally, Block A, Hyderabad', 17.446812, 78.414093, NULL, false, '2026-06-04T11:19:41.376+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (27, (SELECT id FROM public.profiles WHERE email = 'citizen_2@ccgovt.test'), 'Pipe Leakage issue reported at Jubilee Hills', 'Citizens report a severe pipe leakage hazard near the local residential sector. Requesting immediate inspection.', 'Water Supply', 'Pipe Leakage', 'Assigned', 'High', '17.351814, 78.505798', 'Jubilee Hills, Sector 2, Hyderabad', 17.351814, 78.505798, 'emp_wate_3@ccgovt.test', true, '2026-06-05T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (28, (SELECT id FROM public.profiles WHERE email = 'citizen_3@ccgovt.test'), 'Street Light Off issue reported at Gachibowli', 'Citizens report a severe street light off hazard near the local residential sector. Requesting immediate inspection.', 'Street Lighting', 'Street Light Off', 'In Progress', 'Low', '17.390957, 78.477242', 'Gachibowli, Phase II, Hyderabad', 17.390957, 78.477242, 'emp_stre_1@ccgovt.test', false, '2026-06-06T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (29, (SELECT id FROM public.profiles WHERE email = 'citizen_4@ccgovt.test'), 'Pothole Repair issue reported at Gachibowli', 'Citizens report a severe pothole repair hazard near the local residential sector. Requesting immediate inspection.', 'Roads', 'Pothole Repair', 'Resolved', 'Medium', '17.436029, 78.492762', 'Gachibowli, Block B, Hyderabad', 17.436029, 78.492762, 'emp_road_2@ccgovt.test', false, '2026-06-07T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (30, (SELECT id FROM public.profiles WHERE email = 'citizen_5@ccgovt.test'), 'Dead Animal issue reported at Begumpet', 'Citizens report a severe dead animal hazard near the local residential sector. Requesting immediate inspection.', 'Sanitation', 'Dead Animal', 'Closed', 'High', '17.424145, 78.501045', 'Begumpet, Sector 1, Hyderabad', 17.424145, 78.501045, 'emp_sani_3@ccgovt.test', true, '2026-06-08T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (31, (SELECT id FROM public.profiles WHERE email = 'citizen_6@ccgovt.test'), 'Pipe Leakage issue reported at Jubilee Hills', 'Citizens report a severe pipe leakage hazard near the local residential sector. Requesting immediate inspection.', 'Water Supply', 'Pipe Leakage', 'Rejected', 'Low', '17.399156, 78.381765', 'Jubilee Hills, Phase II, Hyderabad', 17.399156, 78.381765, 'emp_wate_1@ccgovt.test', false, '2026-06-09T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (32, (SELECT id FROM public.profiles WHERE email = 'citizen_7@ccgovt.test'), 'Street Light Off issue reported at Madhapur', 'Citizens report a severe street light off hazard near the local residential sector. Requesting immediate inspection.', 'Street Lighting', 'Street Light Off', 'Reopened', 'Medium', '17.428234, 78.414242', 'Madhapur, Sector 1, Hyderabad', 17.428234, 78.414242, 'emp_stre_2@ccgovt.test', false, '2026-06-10T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (33, (SELECT id FROM public.profiles WHERE email = 'citizen_8@ccgovt.test'), 'Pothole Repair issue reported at Madhapur', 'Citizens report a severe pothole repair hazard near the local residential sector. Requesting immediate inspection.', 'Roads', 'Pothole Repair', 'Escalated', 'High', '17.457250, 78.433779', 'Madhapur, Block A, Hyderabad', 17.45725, 78.433779, 'emp_road_3@ccgovt.test', true, '2026-06-11T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (34, (SELECT id FROM public.profiles WHERE email = 'citizen_9@ccgovt.test'), 'Dead Animal issue reported at Kukatpally', 'Citizens report a severe dead animal hazard near the local residential sector. Requesting immediate inspection.', 'Sanitation', 'Dead Animal', 'Verification Pending', 'Low', '17.383503, 78.437162', 'Kukatpally, Block A, Hyderabad', 17.383503, 78.437162, 'emp_sani_1@ccgovt.test', false, '2026-06-12T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (35, (SELECT id FROM public.profiles WHERE email = 'citizen_10@ccgovt.test'), 'Pipe Leakage issue reported at Kukatpally', 'Citizens report a severe pipe leakage hazard near the local residential sector. Requesting immediate inspection.', 'Water Supply', 'Pipe Leakage', 'Pending', 'Medium', '17.342628, 78.505349', 'Kukatpally, Phase II, Hyderabad', 17.342628, 78.505349, NULL, false, '2026-06-13T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (36, (SELECT id FROM public.profiles WHERE email = 'citizen_11@ccgovt.test'), 'Street Light Off issue reported at Jubilee Hills', 'Citizens report a severe street light off hazard near the local residential sector. Requesting immediate inspection.', 'Street Lighting', 'Street Light Off', 'Triaged', 'High', '17.395304, 78.403443', 'Jubilee Hills, Sector 1, Hyderabad', 17.395304, 78.403443, NULL, true, '2026-06-14T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (37, (SELECT id FROM public.profiles WHERE email = 'citizen_12@ccgovt.test'), 'Pothole Repair issue reported at Jubilee Hills', 'Citizens report a severe pothole repair hazard near the local residential sector. Requesting immediate inspection.', 'Roads', 'Pothole Repair', 'Assigned', 'Low', '17.436176, 78.437799', 'Jubilee Hills, Block A, Hyderabad', 17.436176, 78.437799, 'emp_road_1@ccgovt.test', false, '2026-06-15T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (38, (SELECT id FROM public.profiles WHERE email = 'citizen_13@ccgovt.test'), 'Dead Animal issue reported at Kukatpally', 'Citizens report a severe dead animal hazard near the local residential sector. Requesting immediate inspection.', 'Sanitation', 'Dead Animal', 'In Progress', 'Medium', '17.430632, 78.418058', 'Kukatpally, Sector 3, Hyderabad', 17.430632, 78.418058, 'emp_sani_2@ccgovt.test', false, '2026-06-16T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (39, (SELECT id FROM public.profiles WHERE email = 'citizen_14@ccgovt.test'), 'Pipe Leakage issue reported at Kukatpally', 'Citizens report a severe pipe leakage hazard near the local residential sector. Requesting immediate inspection.', 'Water Supply', 'Pipe Leakage', 'Resolved', 'High', '17.449615, 78.394899', 'Kukatpally, Sector 3, Hyderabad', 17.449615, 78.394899, 'emp_wate_3@ccgovt.test', true, '2026-06-17T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (40, (SELECT id FROM public.profiles WHERE email = 'citizen_15@ccgovt.test'), 'Street Light Off issue reported at Jubilee Hills', 'Citizens report a severe street light off hazard near the local residential sector. Requesting immediate inspection.', 'Street Lighting', 'Street Light Off', 'Closed', 'Low', '17.330423, 78.434135', 'Jubilee Hills, Sector 3, Hyderabad', 17.330423, 78.434135, 'emp_stre_1@ccgovt.test', false, '2026-06-18T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (41, (SELECT id FROM public.profiles WHERE email = 'citizen_16@ccgovt.test'), 'Pothole Repair issue reported at Secunderabad', 'Citizens report a severe pothole repair hazard near the local residential sector. Requesting immediate inspection.', 'Roads', 'Pothole Repair', 'Rejected', 'Medium', '17.438675, 78.394457', 'Secunderabad, Phase II, Hyderabad', 17.438675, 78.394457, 'emp_road_2@ccgovt.test', false, '2026-06-19T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (42, (SELECT id FROM public.profiles WHERE email = 'citizen_17@ccgovt.test'), 'Dead Animal issue reported at Jubilee Hills', 'Citizens report a severe dead animal hazard near the local residential sector. Requesting immediate inspection.', 'Sanitation', 'Dead Animal', 'Reopened', 'High', '17.329665, 78.487209', 'Jubilee Hills, Sector 3, Hyderabad', 17.329665, 78.487209, 'emp_sani_3@ccgovt.test', true, '2026-06-20T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (43, (SELECT id FROM public.profiles WHERE email = 'citizen_18@ccgovt.test'), 'Pipe Leakage issue reported at Kukatpally', 'Citizens report a severe pipe leakage hazard near the local residential sector. Requesting immediate inspection.', 'Water Supply', 'Pipe Leakage', 'Escalated', 'Low', '17.405833, 78.389387', 'Kukatpally, Block A, Hyderabad', 17.405833, 78.389387, 'emp_wate_1@ccgovt.test', false, '2026-06-21T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (44, (SELECT id FROM public.profiles WHERE email = 'citizen_19@ccgovt.test'), 'Street Light Off issue reported at Gachibowli', 'Citizens report a severe street light off hazard near the local residential sector. Requesting immediate inspection.', 'Street Lighting', 'Street Light Off', 'Verification Pending', 'Medium', '17.427655, 78.413892', 'Gachibowli, Phase II, Hyderabad', 17.427655, 78.413892, 'emp_stre_2@ccgovt.test', false, '2026-06-22T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (45, (SELECT id FROM public.profiles WHERE email = 'citizen_20@ccgovt.test'), 'Pothole Repair issue reported at Secunderabad', 'Citizens report a severe pothole repair hazard near the local residential sector. Requesting immediate inspection.', 'Roads', 'Pothole Repair', 'Pending', 'High', '17.438767, 78.433757', 'Secunderabad, Block A, Hyderabad', 17.438767, 78.433757, NULL, true, '2026-06-23T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (46, (SELECT id FROM public.profiles WHERE email = 'citizen_1@ccgovt.test'), 'Dead Animal issue reported at Kukatpally', 'Citizens report a severe dead animal hazard near the local residential sector. Requesting immediate inspection.', 'Sanitation', 'Dead Animal', 'Triaged', 'Low', '17.366074, 78.394502', 'Kukatpally, Sector 2, Hyderabad', 17.366074, 78.394502, NULL, false, '2026-06-24T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (47, (SELECT id FROM public.profiles WHERE email = 'citizen_2@ccgovt.test'), 'Pipe Leakage issue reported at Jubilee Hills', 'Citizens report a severe pipe leakage hazard near the local residential sector. Requesting immediate inspection.', 'Water Supply', 'Pipe Leakage', 'Assigned', 'Medium', '17.439953, 78.457183', 'Jubilee Hills, Phase I, Hyderabad', 17.439953, 78.457183, 'emp_wate_2@ccgovt.test', false, '2026-06-25T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (48, (SELECT id FROM public.profiles WHERE email = 'citizen_3@ccgovt.test'), 'Street Light Off issue reported at Secunderabad', 'Citizens report a severe street light off hazard near the local residential sector. Requesting immediate inspection.', 'Street Lighting', 'Street Light Off', 'In Progress', 'High', '17.375559, 78.467769', 'Secunderabad, Sector 2, Hyderabad', 17.375559, 78.467769, 'emp_stre_3@ccgovt.test', true, '2026-06-26T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (49, (SELECT id FROM public.profiles WHERE email = 'citizen_4@ccgovt.test'), 'Pothole Repair issue reported at Banjara Hills', 'Citizens report a severe pothole repair hazard near the local residential sector. Requesting immediate inspection.', 'Roads', 'Pothole Repair', 'Resolved', 'Low', '17.440569, 78.405874', 'Banjara Hills, Block A, Hyderabad', 17.440569, 78.405874, 'emp_road_1@ccgovt.test', false, '2026-06-27T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (50, (SELECT id FROM public.profiles WHERE email = 'citizen_5@ccgovt.test'), 'Dead Animal issue reported at Kukatpally', 'Citizens report a severe dead animal hazard near the local residential sector. Requesting immediate inspection.', 'Sanitation', 'Dead Animal', 'Closed', 'Medium', '17.409152, 78.397071', 'Kukatpally, Sector 2, Hyderabad', 17.409152, 78.397071, 'emp_sani_2@ccgovt.test', false, '2026-06-28T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (51, (SELECT id FROM public.profiles WHERE email = 'citizen_6@ccgovt.test'), 'Pipe Leakage issue reported at Banjara Hills', 'Citizens report a severe pipe leakage hazard near the local residential sector. Requesting immediate inspection.', 'Water Supply', 'Pipe Leakage', 'Rejected', 'High', '17.451313, 78.510031', 'Banjara Hills, Phase I, Hyderabad', 17.451313, 78.510031, 'emp_wate_3@ccgovt.test', true, '2026-06-29T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (52, (SELECT id FROM public.profiles WHERE email = 'citizen_7@ccgovt.test'), 'Street Light Off issue reported at Jubilee Hills', 'Citizens report a severe street light off hazard near the local residential sector. Requesting immediate inspection.', 'Street Lighting', 'Street Light Off', 'Reopened', 'Low', '17.456899, 78.490125', 'Jubilee Hills, Sector 3, Hyderabad', 17.456899, 78.490125, 'emp_stre_1@ccgovt.test', false, '2026-06-30T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (53, (SELECT id FROM public.profiles WHERE email = 'citizen_8@ccgovt.test'), 'Pothole Repair issue reported at Madhapur', 'Citizens report a severe pothole repair hazard near the local residential sector. Requesting immediate inspection.', 'Roads', 'Pothole Repair', 'Escalated', 'Medium', '17.385129, 78.476864', 'Madhapur, Phase II, Hyderabad', 17.385129, 78.476864, 'emp_road_2@ccgovt.test', false, '2026-07-01T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (54, (SELECT id FROM public.profiles WHERE email = 'citizen_9@ccgovt.test'), 'Dead Animal issue reported at Begumpet', 'Citizens report a severe dead animal hazard near the local residential sector. Requesting immediate inspection.', 'Sanitation', 'Dead Animal', 'Verification Pending', 'High', '17.428671, 78.488063', 'Begumpet, Sector 3, Hyderabad', 17.428671, 78.488063, 'emp_sani_3@ccgovt.test', true, '2026-07-02T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (55, (SELECT id FROM public.profiles WHERE email = 'citizen_10@ccgovt.test'), 'Pipe Leakage issue reported at Jubilee Hills', 'Citizens report a severe pipe leakage hazard near the local residential sector. Requesting immediate inspection.', 'Water Supply', 'Pipe Leakage', 'Pending', 'Low', '17.460427, 78.522236', 'Jubilee Hills, Sector 3, Hyderabad', 17.460427, 78.522236, NULL, false, '2026-07-03T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (56, (SELECT id FROM public.profiles WHERE email = 'citizen_11@ccgovt.test'), 'Street Light Off issue reported at Kukatpally', 'Citizens report a severe street light off hazard near the local residential sector. Requesting immediate inspection.', 'Street Lighting', 'Street Light Off', 'Triaged', 'Medium', '17.424169, 78.499152', 'Kukatpally, Sector 3, Hyderabad', 17.424169, 78.499152, NULL, false, '2026-07-04T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (57, (SELECT id FROM public.profiles WHERE email = 'citizen_12@ccgovt.test'), 'Pothole Repair issue reported at Kukatpally', 'Citizens report a severe pothole repair hazard near the local residential sector. Requesting immediate inspection.', 'Roads', 'Pothole Repair', 'Assigned', 'High', '17.462815, 78.440723', 'Kukatpally, Phase II, Hyderabad', 17.462815, 78.440723, 'emp_road_3@ccgovt.test', true, '2026-07-05T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (58, (SELECT id FROM public.profiles WHERE email = 'citizen_13@ccgovt.test'), 'Dead Animal issue reported at Kukatpally', 'Citizens report a severe dead animal hazard near the local residential sector. Requesting immediate inspection.', 'Sanitation', 'Dead Animal', 'In Progress', 'Low', '17.456855, 78.375222', 'Kukatpally, Sector 3, Hyderabad', 17.456855, 78.375222, 'emp_sani_1@ccgovt.test', false, '2026-07-06T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (59, (SELECT id FROM public.profiles WHERE email = 'citizen_14@ccgovt.test'), 'Pipe Leakage issue reported at Jubilee Hills', 'Citizens report a severe pipe leakage hazard near the local residential sector. Requesting immediate inspection.', 'Water Supply', 'Pipe Leakage', 'Resolved', 'Medium', '17.420430, 78.386016', 'Jubilee Hills, Phase II, Hyderabad', 17.42043, 78.386016, 'emp_wate_2@ccgovt.test', false, '2026-07-07T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (60, (SELECT id FROM public.profiles WHERE email = 'citizen_15@ccgovt.test'), 'Street Light Off issue reported at Jubilee Hills', 'Citizens report a severe street light off hazard near the local residential sector. Requesting immediate inspection.', 'Street Lighting', 'Street Light Off', 'Closed', 'High', '17.427649, 78.432332', 'Jubilee Hills, Phase I, Hyderabad', 17.427649, 78.432332, 'emp_stre_3@ccgovt.test', true, '2026-07-08T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (61, (SELECT id FROM public.profiles WHERE email = 'citizen_16@ccgovt.test'), 'Pothole Repair issue reported at Madhapur', 'Citizens report a severe pothole repair hazard near the local residential sector. Requesting immediate inspection.', 'Roads', 'Pothole Repair', 'Rejected', 'Low', '17.447037, 78.388404', 'Madhapur, Block A, Hyderabad', 17.447037, 78.388404, 'emp_road_1@ccgovt.test', false, '2026-07-09T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (62, (SELECT id FROM public.profiles WHERE email = 'citizen_17@ccgovt.test'), 'Dead Animal issue reported at Begumpet', 'Citizens report a severe dead animal hazard near the local residential sector. Requesting immediate inspection.', 'Sanitation', 'Dead Animal', 'Reopened', 'Medium', '17.386167, 78.523677', 'Begumpet, Block A, Hyderabad', 17.386167, 78.523677, 'emp_sani_2@ccgovt.test', false, '2026-07-10T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (63, (SELECT id FROM public.profiles WHERE email = 'citizen_18@ccgovt.test'), 'Pipe Leakage issue reported at Secunderabad', 'Citizens report a severe pipe leakage hazard near the local residential sector. Requesting immediate inspection.', 'Water Supply', 'Pipe Leakage', 'Escalated', 'High', '17.463293, 78.445299', 'Secunderabad, Block B, Hyderabad', 17.463293, 78.445299, 'emp_wate_3@ccgovt.test', true, '2026-07-11T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (64, (SELECT id FROM public.profiles WHERE email = 'citizen_19@ccgovt.test'), 'Street Light Off issue reported at Kukatpally', 'Citizens report a severe street light off hazard near the local residential sector. Requesting immediate inspection.', 'Street Lighting', 'Street Light Off', 'Verification Pending', 'Low', '17.452055, 78.481669', 'Kukatpally, Sector 2, Hyderabad', 17.452055, 78.481669, 'emp_stre_1@ccgovt.test', false, '2026-07-12T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (65, (SELECT id FROM public.profiles WHERE email = 'citizen_20@ccgovt.test'), 'Pothole Repair issue reported at Madhapur', 'Citizens report a severe pothole repair hazard near the local residential sector. Requesting immediate inspection.', 'Roads', 'Pothole Repair', 'Pending', 'Medium', '17.413603, 78.389976', 'Madhapur, Block A, Hyderabad', 17.413603, 78.389976, NULL, false, '2026-07-13T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (66, (SELECT id FROM public.profiles WHERE email = 'citizen_1@ccgovt.test'), 'Dead Animal issue reported at Madhapur', 'Citizens report a severe dead animal hazard near the local residential sector. Requesting immediate inspection.', 'Sanitation', 'Dead Animal', 'Triaged', 'High', '17.377223, 78.458586', 'Madhapur, Sector 1, Hyderabad', 17.377223, 78.458586, NULL, true, '2026-07-14T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (67, (SELECT id FROM public.profiles WHERE email = 'citizen_2@ccgovt.test'), 'Pipe Leakage issue reported at Jubilee Hills', 'Citizens report a severe pipe leakage hazard near the local residential sector. Requesting immediate inspection.', 'Water Supply', 'Pipe Leakage', 'Assigned', 'Low', '17.334753, 78.453028', 'Jubilee Hills, Sector 1, Hyderabad', 17.334753, 78.453028, 'emp_wate_1@ccgovt.test', false, '2026-07-15T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (68, (SELECT id FROM public.profiles WHERE email = 'citizen_3@ccgovt.test'), 'Street Light Off issue reported at Gachibowli', 'Citizens report a severe street light off hazard near the local residential sector. Requesting immediate inspection.', 'Street Lighting', 'Street Light Off', 'In Progress', 'Medium', '17.407220, 78.517638', 'Gachibowli, Sector 3, Hyderabad', 17.40722, 78.517638, 'emp_stre_2@ccgovt.test', false, '2026-07-16T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (69, (SELECT id FROM public.profiles WHERE email = 'citizen_4@ccgovt.test'), 'Pothole Repair issue reported at Jubilee Hills', 'Citizens report a severe pothole repair hazard near the local residential sector. Requesting immediate inspection.', 'Roads', 'Pothole Repair', 'Resolved', 'High', '17.349092, 78.392831', 'Jubilee Hills, Phase II, Hyderabad', 17.349092, 78.392831, 'emp_road_3@ccgovt.test', true, '2026-07-17T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (70, (SELECT id FROM public.profiles WHERE email = 'citizen_5@ccgovt.test'), 'Dead Animal issue reported at Banjara Hills', 'Citizens report a severe dead animal hazard near the local residential sector. Requesting immediate inspection.', 'Sanitation', 'Dead Animal', 'Closed', 'Low', '17.470512, 78.395112', 'Banjara Hills, Sector 1, Hyderabad', 17.470512, 78.395112, 'emp_sani_1@ccgovt.test', false, '2026-07-18T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (71, (SELECT id FROM public.profiles WHERE email = 'citizen_6@ccgovt.test'), 'Pipe Leakage issue reported at Banjara Hills', 'Citizens report a severe pipe leakage hazard near the local residential sector. Requesting immediate inspection.', 'Water Supply', 'Pipe Leakage', 'Rejected', 'Medium', '17.398787, 78.437065', 'Banjara Hills, Sector 3, Hyderabad', 17.398787, 78.437065, 'emp_wate_2@ccgovt.test', false, '2026-07-19T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (72, (SELECT id FROM public.profiles WHERE email = 'citizen_7@ccgovt.test'), 'Street Light Off issue reported at Secunderabad', 'Citizens report a severe street light off hazard near the local residential sector. Requesting immediate inspection.', 'Street Lighting', 'Street Light Off', 'Reopened', 'High', '17.373971, 78.483257', 'Secunderabad, Sector 3, Hyderabad', 17.373971, 78.483257, 'emp_stre_3@ccgovt.test', true, '2026-07-20T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (73, (SELECT id FROM public.profiles WHERE email = 'citizen_8@ccgovt.test'), 'Pothole Repair issue reported at Jubilee Hills', 'Citizens report a severe pothole repair hazard near the local residential sector. Requesting immediate inspection.', 'Roads', 'Pothole Repair', 'Escalated', 'Low', '17.395207, 78.423581', 'Jubilee Hills, Block A, Hyderabad', 17.395207, 78.423581, 'emp_road_1@ccgovt.test', false, '2026-07-21T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (74, (SELECT id FROM public.profiles WHERE email = 'citizen_9@ccgovt.test'), 'Dead Animal issue reported at Gachibowli', 'Citizens report a severe dead animal hazard near the local residential sector. Requesting immediate inspection.', 'Sanitation', 'Dead Animal', 'Verification Pending', 'Medium', '17.382878, 78.456639', 'Gachibowli, Block A, Hyderabad', 17.382878, 78.456639, 'emp_sani_2@ccgovt.test', false, '2026-07-22T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)
VALUES (75, (SELECT id FROM public.profiles WHERE email = 'citizen_10@ccgovt.test'), 'Pipe Leakage issue reported at Jubilee Hills', 'Citizens report a severe pipe leakage hazard near the local residential sector. Requesting immediate inspection.', 'Water Supply', 'Pipe Leakage', 'Pending', 'High', '17.370372, 78.430877', 'Jubilee Hills, Phase I, Hyderabad', 17.370372, 78.430877, NULL, true, '2026-07-23T11:19:41.377+00:00')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Audit Logs
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('0ae367cd-bd3d-4deb-b051-cffe9a4cbd65', 'citizen', 'complaint_created', 'complaints', '26', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-06-04T11:19:41.376+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('f2d9d2c3-b0b3-4e16-8c57-278a92c07cfc', 'citizen', 'complaint_created', 'complaints', '27', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-06-05T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('f9c966b5-9655-4784-8354-f8d66c72289e', 'citizen', 'complaint_created', 'complaints', '28', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-06-06T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('4738caf3-0a6a-4312-9ce9-b1ac51648246', 'citizen', 'complaint_created', 'complaints', '29', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-06-07T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('e635d7ce-92b5-4bc7-8363-3b36ca12f509', 'citizen', 'complaint_created', 'complaints', '30', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-06-08T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('34286040-1565-4b67-8667-adc215aadbed', 'citizen', 'complaint_created', 'complaints', '31', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-06-09T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('71415309-8b38-4e44-8933-734a50b7a73f', 'citizen', 'complaint_created', 'complaints', '32', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-06-10T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('5f301260-4bc2-4820-88bc-93f1384fffd4', 'citizen', 'complaint_created', 'complaints', '33', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-06-11T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('1e4fc909-ca0d-4fac-93a5-40998c58b442', 'citizen', 'complaint_created', 'complaints', '34', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-06-12T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('2d73bf98-254c-416b-87b6-8f0c2646bd04', 'citizen', 'complaint_created', 'complaints', '35', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-06-13T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('964ac6a4-5659-46c8-975a-745a4305b057', 'citizen', 'complaint_created', 'complaints', '36', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-06-14T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('87f1b583-6e27-4c4c-8cae-b376b8eabcfe', 'citizen', 'complaint_created', 'complaints', '37', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-06-15T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('134e02e0-ea39-4742-9921-f766046574d2', 'citizen', 'complaint_created', 'complaints', '38', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-06-16T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('1da19db9-d02a-4b0a-965f-8a62a31bee71', 'citizen', 'complaint_created', 'complaints', '39', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-06-17T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('5d0848fd-14d0-4d75-bbd7-a95c3ea592ae', 'citizen', 'complaint_created', 'complaints', '40', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-06-18T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('47d3a7c0-bbc2-496b-9037-a40ed670c9dc', 'citizen', 'complaint_created', 'complaints', '41', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-06-19T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('ec9a3127-acba-46c7-ab72-4fda57ec6a90', 'citizen', 'complaint_created', 'complaints', '42', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-06-20T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('8e8b87c2-aea6-4b3d-b892-5753486c402d', 'citizen', 'complaint_created', 'complaints', '43', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-06-21T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('33e92dfb-87dd-4b62-a8ee-f49c6a362bae', 'citizen', 'complaint_created', 'complaints', '44', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-06-22T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('9d649571-4c3c-4ad8-b52d-2a7d5311c49b', 'citizen', 'complaint_created', 'complaints', '45', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-06-23T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('0ae367cd-bd3d-4deb-b051-cffe9a4cbd65', 'citizen', 'complaint_created', 'complaints', '46', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-06-24T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('f2d9d2c3-b0b3-4e16-8c57-278a92c07cfc', 'citizen', 'complaint_created', 'complaints', '47', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-06-25T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('f9c966b5-9655-4784-8354-f8d66c72289e', 'citizen', 'complaint_created', 'complaints', '48', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-06-26T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('4738caf3-0a6a-4312-9ce9-b1ac51648246', 'citizen', 'complaint_created', 'complaints', '49', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-06-27T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('e635d7ce-92b5-4bc7-8363-3b36ca12f509', 'citizen', 'complaint_created', 'complaints', '50', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-06-28T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('34286040-1565-4b67-8667-adc215aadbed', 'citizen', 'complaint_created', 'complaints', '51', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-06-29T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('71415309-8b38-4e44-8933-734a50b7a73f', 'citizen', 'complaint_created', 'complaints', '52', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-06-30T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('5f301260-4bc2-4820-88bc-93f1384fffd4', 'citizen', 'complaint_created', 'complaints', '53', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-07-01T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('1e4fc909-ca0d-4fac-93a5-40998c58b442', 'citizen', 'complaint_created', 'complaints', '54', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-07-02T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('2d73bf98-254c-416b-87b6-8f0c2646bd04', 'citizen', 'complaint_created', 'complaints', '55', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-07-03T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('964ac6a4-5659-46c8-975a-745a4305b057', 'citizen', 'complaint_created', 'complaints', '56', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-07-04T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('87f1b583-6e27-4c4c-8cae-b376b8eabcfe', 'citizen', 'complaint_created', 'complaints', '57', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-07-05T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('134e02e0-ea39-4742-9921-f766046574d2', 'citizen', 'complaint_created', 'complaints', '58', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-07-06T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('1da19db9-d02a-4b0a-965f-8a62a31bee71', 'citizen', 'complaint_created', 'complaints', '59', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-07-07T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('5d0848fd-14d0-4d75-bbd7-a95c3ea592ae', 'citizen', 'complaint_created', 'complaints', '60', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-07-08T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('47d3a7c0-bbc2-496b-9037-a40ed670c9dc', 'citizen', 'complaint_created', 'complaints', '61', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-07-09T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('ec9a3127-acba-46c7-ab72-4fda57ec6a90', 'citizen', 'complaint_created', 'complaints', '62', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-07-10T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('8e8b87c2-aea6-4b3d-b892-5753486c402d', 'citizen', 'complaint_created', 'complaints', '63', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-07-11T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('33e92dfb-87dd-4b62-a8ee-f49c6a362bae', 'citizen', 'complaint_created', 'complaints', '64', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-07-12T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('9d649571-4c3c-4ad8-b52d-2a7d5311c49b', 'citizen', 'complaint_created', 'complaints', '65', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-07-13T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('0ae367cd-bd3d-4deb-b051-cffe9a4cbd65', 'citizen', 'complaint_created', 'complaints', '66', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-07-14T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('f2d9d2c3-b0b3-4e16-8c57-278a92c07cfc', 'citizen', 'complaint_created', 'complaints', '67', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-07-15T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('f9c966b5-9655-4784-8354-f8d66c72289e', 'citizen', 'complaint_created', 'complaints', '68', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-07-16T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('4738caf3-0a6a-4312-9ce9-b1ac51648246', 'citizen', 'complaint_created', 'complaints', '69', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-07-17T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('e635d7ce-92b5-4bc7-8363-3b36ca12f509', 'citizen', 'complaint_created', 'complaints', '70', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-07-18T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('34286040-1565-4b67-8667-adc215aadbed', 'citizen', 'complaint_created', 'complaints', '71', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-07-19T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('71415309-8b38-4e44-8933-734a50b7a73f', 'citizen', 'complaint_created', 'complaints', '72', '{"status":"Pending","category":"Street Lighting"}'::jsonb, 'success', '2026-07-20T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('5f301260-4bc2-4820-88bc-93f1384fffd4', 'citizen', 'complaint_created', 'complaints', '73', '{"status":"Pending","category":"Roads"}'::jsonb, 'success', '2026-07-21T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('1e4fc909-ca0d-4fac-93a5-40998c58b442', 'citizen', 'complaint_created', 'complaints', '74', '{"status":"Pending","category":"Sanitation"}'::jsonb, 'success', '2026-07-22T11:19:41.377+00:00');
INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)
VALUES ('2d73bf98-254c-416b-87b6-8f0c2646bd04', 'citizen', 'complaint_created', 'complaints', '75', '{"status":"Pending","category":"Water Supply"}'::jsonb, 'success', '2026-07-23T11:19:41.377+00:00');
