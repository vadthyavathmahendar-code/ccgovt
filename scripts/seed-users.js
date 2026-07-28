/* global process */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Define endpoints & keys
const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.argv[2];

if (!serviceRoleKey) {
  console.error('\n❌ ERROR: Supabase Service Role Key is required to run the automated seeder.');
  console.error('   Please run as: SUPABASE_SERVICE_ROLE_KEY=your_key npm run seed');
  console.error('   Or: npm run seed -- your_key\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const commonPassword = '123456789';
const departments = ['Roads', 'Sanitation', 'Water Supply', 'Street Lighting'];

// Mappings for categories and departments
const categoriesMap = {
  'Roads': ['Pothole Repair', 'Traffic Signal'],
  'Sanitation': ['Garbage', 'Dead Animal'],
  'Water Supply': ['Pipe Leakage', 'Drainage'],
  'Street Lighting': ['Street Light Off']
};

function getRandomHyderabadLocation() {
  // Center coordinates around Hyderabad / Gachibowli / Secunderabad
  const baseLat = 17.40;
  const baseLng = 78.45;
  const latOffset = (Math.random() - 0.5) * 0.15;
  const lngOffset = (Math.random() - 0.5) * 0.15;
  const lat = (baseLat + latOffset).toFixed(6);
  const lng = (baseLng + lngOffset).toFixed(6);

  const zones = ['Madhapur', 'Gachibowli', 'Secunderabad', 'Begumpet', 'Banjara Hills', 'Jubilee Hills', 'Kukatpally'];
  const sectors = ['Sector 1', 'Sector 2', 'Sector 3', 'Phase I', 'Phase II', 'Block A', 'Block B'];
  const address = `${zones[Math.floor(Math.random() * zones.length)]}, ${sectors[Math.floor(Math.random() * sectors.length)]}, Hyderabad`;

  return { lat, lng, address };
}

async function runSeed() {
  try {
    console.log('\n🚀 Starting Civics Connect Enterprise Automated Seeder...\n');

    // 1. Compile User Accounts Schema
    const users = [];

    // Super Admin
    users.push({
      email: 'super_admin@ccgovt.test',
      fullName: 'Super Admin General',
      role: 'super_admin',
      phone: '9000000001',
      address: 'Secretariat Building, Hyderabad'
    });

    // Commissioners
    users.push({
      email: 'comm_roads_light@ccgovt.test',
      fullName: 'Commissioner of Infrastructure (Roads & Lighting)',
      role: 'commissioner',
      phone: '9000000002',
      address: 'GHMC Head Office, Hyderabad'
    });
    users.push({
      email: 'comm_water_sani@ccgovt.test',
      fullName: 'Commissioner of Environment (Water & Sanitation)',
      role: 'commissioner',
      phone: '9000000003',
      address: 'GHMC Head Office, Hyderabad'
    });

    // Department Admins
    departments.forEach((dept, idx) => {
      users.push({
        email: `admin_${dept.toLowerCase().replace(' ', '_')}@ccgovt.test`,
        fullName: `${dept} Administrative Director`,
        role: 'dept_admin',
        department: dept,
        phone: `910000000${idx + 1}`,
        address: `${dept} Control Center, Hyderabad`
      });
    });

    // Employees (12 total, 3 per department)
    departments.forEach((dept, dIdx) => {
      for (let i = 1; i <= 3; i++) {
        users.push({
          email: `emp_${dept.toLowerCase().substring(0, 4)}_${i}@ccgovt.test`,
          fullName: `${dept} Field Inspector ${i}`,
          role: 'employee',
          department: dept,
          phone: `920000${dIdx}${i}`,
          address: `${dept} Sub-station Office ${i}`
        });
      }
    });

    // Citizens (20 total)
    for (let i = 1; i <= 20; i++) {
      users.push({
        email: `citizen_${i}@ccgovt.test`,
        fullName: `Citizen Resident User ${i}`,
        role: 'citizen',
        phone: `99000000${i < 10 ? '0' + i : i}`,
        address: `Residential Colony Street ${i}, Hyderabad`
      });
    }

    console.log(`👤 Preparing to seed ${users.length} accounts...`);

    const authUids = {};

    // Create auth accounts and profiles
    for (const u of users) {
      // 1. Supabase Auth Registration
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email: u.email,
        password: commonPassword,
        email_confirm: true
      });

      if (authErr) {
        if (authErr.message.includes('already registered') || authErr.message.includes('already exists')) {
          // List existing users to recover UUID
          const { data: listData } = await supabase.auth.admin.listUsers();
          const existing = listData?.users?.find(x => x.email === u.email);
          if (existing) {
            authUids[u.email] = existing.id;
            console.log(`   ✔ User already exists: ${u.email} (UUID recovered)`);
          } else {
            console.error(`   ❌ Failed to locate existing user UUID for ${u.email}`);
            continue;
          }
        } else {
          console.error(`   ❌ Error creating ${u.email}:`, authErr.message);
          continue;
        }
      } else {
        authUids[u.email] = authUser.user.id;
        console.log(`   ✔ Registered Auth user: ${u.email}`);
      }

      // 2. Insert Profile (upsert to handle duplication cleanly)
      const profilePayload = {
        id: authUids[u.email],
        email: u.email,
        full_name: u.fullName,
        role: u.role,
        department: u.department || null,
        phone: u.phone,
        address: u.address,
        points: u.role === 'citizen' ? Math.floor(Math.random() * 150) : 0,
        govt_id_type: 'aadhaar',
        govt_id_number: `1234567890${u.phone.slice(-2)}`,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert([profilePayload]);

      if (profileErr) {
        console.error(`   ❌ Profiles upsert error for ${u.email}:`, profileErr.message);
      }
    }

    console.log('\n📋 Seeding 50 complaints across Hyderabad with full history workflows...\n');

    const citizens = users.filter(u => u.role === 'citizen');
    const employees = users.filter(u => u.role === 'employee');
    const admins = users.filter(u => u.role === 'dept_admin');

    const statuses = ['Pending', 'Triaged', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected', 'Reopened', 'Escalated', 'Verification Pending'];
    const priorities = ['Low', 'Medium', 'High'];

    const complaintsToInsert = [];
    const updatesToInsert = [];
    const verificationsToInsert = [];
    const escalationsToInsert = [];
    const notificationsToInsert = [];
    const auditLogsToInsert = [];

    for (let i = 1; i <= 50; i++) {
      const citizen = citizens[i % citizens.length];
      const dept = departments[i % departments.length];
      const subcats = categoriesMap[dept];
      const subcat = subcats[i % subcats.length];
      const loc = getRandomHyderabadLocation();
      const status = statuses[i % statuses.length];
      const priority = priorities[i % priorities.length];
      const citizenUid = authUids[citizen.email];
      
      const deptEmployees = employees.filter(e => e.department === dept);
      const employee = deptEmployees[i % deptEmployees.length];

      complaintsToInsert.push({
        user_id: citizenUid,
        title: `${subcat} issue reported at ${loc.address.split(',')[0]}`,
        description: `Citizens report a severe ${subcat.toLowerCase()} hazard near the local residential sector. Requesting immediate inspection.`,
        category: dept,
        subcategory: subcat,
        status: status,
        priority: priority,
        location: `${loc.lat}, ${loc.lng}`,
        civic_address: loc.address,
        latitude: parseFloat(loc.lat),
        longitude: parseFloat(loc.lng),
        assigned_to: (status !== 'Pending' && status !== 'Triaged') ? employee.email : null,
        is_urgent: priority === 'High',
        created_at: new Date(Date.now() - (55 - i) * 24 * 3600 * 1000).toISOString()
      });
    }

    // Insert complaints to obtain dynamic primary key IDs
    const { data: insertedComplaints, error: complaintsErr } = await supabase
      .from('complaints')
      .insert(complaintsToInsert)
      .select();

    if (complaintsErr) {
      throw new Error(`Complaints seeding failed: ${complaintsErr.message}`);
    }

    console.log(`✔ Created ${insertedComplaints.length} complaints.`);

    // Build timeline events, verifications, escalations, audits & notifications dynamically using real IDs
    insertedComplaints.forEach((comp, idx) => {
      const citizen = citizens[idx % citizens.length];
      const dept = comp.category;
      const citizenUid = authUids[citizen.email];
      const employee = employees.filter(e => e.department === dept)[idx % employees.filter(e => e.department === dept).length];
      const deptAdmin = admins.filter(a => a.department === dept)[0];

      // Base creation records
      updatesToInsert.push({
        complaint_id: comp.id,
        user_id: citizenUid,
        status_from: 'New',
        status_to: 'Pending',
        comments: 'Complaint registered by resident.',
        created_at: comp.created_at
      });

      auditLogsToInsert.push({
        user_id: citizenUid,
        user_role: 'citizen',
        action: 'complaint_created',
        entity_type: 'complaints',
        entity_id: String(comp.id),
        new_data: { status: 'Pending', category: dept },
        status: 'success',
        created_at: comp.created_at
      });

      // Triaged state
      if (comp.status !== 'Pending') {
        const triageTime = new Date(new Date(comp.created_at).getTime() + 1800000).toISOString();
        updatesToInsert.push({
          complaint_id: comp.id,
          user_id: authUids[deptAdmin.email],
          status_from: 'Pending',
          status_to: 'Triaged',
          comments: 'Category and location coordinates verified by admin.',
          created_at: triageTime
        });
      }

      // Assigned state
      if (comp.assigned_to) {
        const assignTime = new Date(new Date(comp.created_at).getTime() + 3600000).toISOString();
        updatesToInsert.push({
          complaint_id: comp.id,
          user_id: authUids[deptAdmin.email],
          status_from: 'Triaged',
          status_to: 'Assigned',
          comments: `Assigned to ${employee.fullName} for field action.`,
          created_at: assignTime
        });

        notificationsToInsert.push({
          user_id: authUids[employee.email],
          title: 'Field Ticket Assigned',
          message: `Complaint #${comp.id} has been dispatched to you.`,
          is_read: false,
          created_at: assignTime
        });
      }

      // Verification Pending state
      if (comp.status === 'Verification Pending' || comp.status === 'Resolved' || comp.status === 'Closed') {
        const resolveTime = new Date(new Date(comp.created_at).getTime() + 7200000).toISOString();
        updatesToInsert.push({
          complaint_id: comp.id,
          user_id: authUids[employee.email],
          status_from: 'Assigned',
          status_to: 'Verification Pending',
          comments: 'Work completed. Submitting for citizen verification.',
          created_at: resolveTime
        });

        notificationsToInsert.push({
          user_id: citizenUid,
          title: 'Verification Requested',
          message: `Please verify resolution of Complaint #${comp.id}.`,
          is_read: false,
          created_at: resolveTime
        });
      }

      // Citizen Feedback verification
      if (comp.status === 'Resolved' || comp.status === 'Closed') {
        const closeTime = new Date(new Date(comp.created_at).getTime() + 14400000).toISOString();
        const accept = comp.status === 'Closed';

        verificationsToInsert.push({
          complaint_id: comp.id,
          citizen_id: citizenUid,
          status: accept ? 'accepted' : 'rejected',
          comments: accept ? 'Resolution verified. Excellent response time.' : 'Issue persists. Work incomplete.',
          evidence_url: accept ? 'https://twofkoqxtievknvamvgb.supabase.co/storage/v1/object/public/complaint_images/resolution_proof.png' : null,
          created_at: closeTime
        });

        updatesToInsert.push({
          complaint_id: comp.id,
          user_id: citizenUid,
          status_from: 'Verification Pending',
          status_to: comp.status,
          comments: accept ? 'Ticket closed successfully.' : 'Resolution rejected by citizen. Reopened for field action.',
          created_at: closeTime
        });
      }

      // Escalation state
      if (comp.status === 'Escalated') {
        const escalateTime = new Date(new Date(comp.created_at).getTime() + 172800000).toISOString();
        escalationsToInsert.push({
          complaint_id: comp.id,
          escalated_from: 'employee',
          escalated_to: 'dept_admin',
          reason: 'SLA target breached. Field verification delayed.',
          escalated_at: escalateTime
        });

        notificationsToInsert.push({
          user_id: authUids[deptAdmin.email],
          title: 'SLA Escalation Alert',
          message: `Complaint #${comp.id} has breached SLA and was escalated to you.`,
          is_read: false,
          created_at: escalateTime
        });
      }
    });

    console.log('Inserting timeline updates, verifications, escalations, audits & notifications...');
    await supabase.from('complaint_updates').insert(updatesToInsert);
    await supabase.from('audit_logs').insert(auditLogsToInsert);
    if (verificationsToInsert.length > 0) await supabase.from('complaint_verifications').insert(verificationsToInsert);
    if (escalationsToInsert.length > 0) await supabase.from('complaint_escalations').insert(escalationsToInsert);
    if (notificationsToInsert.length > 0) await supabase.from('notifications').insert(notificationsToInsert);

    console.log('\n💾 Generating standalone seed-data.sql backup file...\n');
    let sqlContent = `-- Standalone Relational SQL Seed for Civics Connect Enterprise\n`;
    sqlContent += `-- Resolves user references dynamically at runtime via profile subqueries\n\n`;

    // Seed Profiles
    sqlContent += `-- 1. Seed Profiles\n`;
    users.forEach(u => {
      const uid = authUids[u.email];
      sqlContent += `INSERT INTO public.profiles (id, email, full_name, role, department, phone, address, points, govt_id_type, govt_id_number, created_at, updated_at)\n`;
      sqlContent += `VALUES ('${uid}', '${u.email}', '${u.fullName}', '${u.role}', ${u.department ? `'${u.department}'` : 'NULL'}, '${u.phone}', '${u.address}', ${u.role === 'citizen' ? 100 : 0}, 'aadhaar', '1234567890${u.phone.slice(-2)}', now(), now())\n`;
      sqlContent += `ON CONFLICT (id) DO NOTHING;\n\n`;
    });

    // Seed Complaints
    sqlContent += `-- 2. Seed Complaints\n`;
    insertedComplaints.forEach((comp, idx) => {
      const citizen = citizens[idx % citizens.length];
      sqlContent += `INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)\n`;
      sqlContent += `VALUES (${comp.id}, (SELECT id FROM public.profiles WHERE email = '${citizen.email}'), '${comp.title.replace(/'/g, "''")}', '${comp.description.replace(/'/g, "''")}', '${comp.category}', '${comp.subcategory}', '${comp.status}', '${comp.priority}', '${comp.location}', '${comp.civic_address}', ${comp.latitude}, ${comp.longitude}, ${comp.assigned_to ? `'${comp.assigned_to}'` : 'NULL'}, ${comp.is_urgent}, '${comp.created_at}')\n`;
      sqlContent += `ON CONFLICT (id) DO NOTHING;\n\n`;
    });

    // Seed Audit Logs
    sqlContent += `-- 3. Seed Audit Logs\n`;
    auditLogsToInsert.forEach(al => {
      sqlContent += `INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)\n`;
      sqlContent += `VALUES ('${al.user_id}', '${al.user_role}', '${al.action}', '${al.entity_type}', '${al.entity_id}', '${JSON.stringify(al.new_data)}'::jsonb, '${al.status}', '${al.created_at}');\n`;
    });

    fs.writeFileSync(path.resolve('./seed-data.sql'), sqlContent);
    console.log('✔ Successfully saved: ./seed-data.sql');

    console.log('\n🌟 AUTOMATED SEEDING PROCESS COMPLETED SUCCESSFULLY!');
    console.log('   All 39 users can now log in using the password: "123456789"\n');

  } catch (err) {
    console.error('\n❌ Seeding operation aborted due to error:', err.message);
    process.exit(1);
  }
}

runSeed();
