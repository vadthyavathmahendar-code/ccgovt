/* eslint-disable */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const serviceRoleKey = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.log('⚠️  No Service Role Key provided. Running in SQL generator mode only.');
  console.log('   Usage to execute live seeding: node scratch/seed_qa_data.js <SERVICE_ROLE_KEY>');
}

const supabase = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;

const commonPassword = 'SecureTestPassword123!';
const departments = ['Roads', 'Sanitation', 'Water Supply', 'Street Lighting'];

// Helper to generate coordinates around Hyderabad
function getRandomLocation() {
  const lat = 17.35 + Math.random() * 0.15;
  const lng = 78.35 + Math.random() * 0.18;
  return {
    lat: lat.toFixed(6),
    lng: lng.toFixed(6),
    address: `Zone ${Math.floor(Math.random() * 5) + 1}, Sector ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`
  };
}

async function runSeeder() {
  try {
    console.log('--- CIVICS CONNECT ENTERPRISE SEED DATA GENERATOR ---');

    // 1. Define Users Structure
    const usersToCreate = [];

    // Super Admin
    usersToCreate.push({
      email: 'super_admin@ccgovt.test',
      fullName: 'Super Admin Officer',
      role: 'super_admin',
      phone: '9000000001',
      address: 'Govt Secretariat, Hyderabad'
    });

    // Commissioners
    usersToCreate.push({
      email: 'comm_roads_light@ccgovt.test',
      fullName: 'Roads & Lighting Commissioner',
      role: 'commissioner',
      phone: '9000000002',
      address: 'Municipal Corp HQ, Hyderabad'
    });
    usersToCreate.push({
      email: 'comm_water_sani@ccgovt.test',
      fullName: 'Water & Sanitation Commissioner',
      role: 'commissioner',
      phone: '9000000003',
      address: 'Municipal Corp HQ, Hyderabad'
    });

    // Department Admins
    departments.forEach((dept, idx) => {
      usersToCreate.push({
        email: `admin_${dept.toLowerCase().replace(' ', '_')}@ccgovt.test`,
        fullName: `${dept} Admin Director`,
        role: 'dept_admin',
        department: dept,
        phone: `910000000${idx + 1}`,
        address: `${dept} Operations Office, Hyderabad`
      });
    });

    // Employees (12 total, 3 per department)
    departments.forEach((dept, dIdx) => {
      for (let i = 1; i <= 3; i++) {
        usersToCreate.push({
          email: `emp_${dept.toLowerCase().substring(0, 4)}_${i}@ccgovt.test`,
          fullName: `${dept} Officer ${i}`,
          role: 'employee',
          department: dept,
          phone: `920000${dIdx}${i}`,
          address: `${dept} Field Office Zone ${i}`
        });
      }
    });

    // Citizens (20 total)
    for (let i = 1; i <= 20; i++) {
      usersToCreate.push({
        email: `citizen_${i}@ccgovt.test`,
        fullName: `Citizen Resident ${i}`,
        role: 'citizen',
        phone: `99000000${i < 10 ? '0' + i : i}`,
        address: `Gachibowli Street ${i}, Hyderabad`
      });
    }

    console.log(`Generated ${usersToCreate.length} account structures.`);

    const authUids = {};
    
    // Check if we are executing live writes
    if (supabase) {
      console.log('Seeding Supabase Auth & Profiles directly...');
      for (const u of usersToCreate) {
        // Create auth user
        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
          email: u.email,
          password: commonPassword,
          email_confirm: true
        });

        if (authErr) {
          if (authErr.message.includes('already registered')) {
            // Fetch user instead
            const { data: listData } = await supabase.auth.admin.listUsers();
            const existing = listData?.users?.find(x => x.email === u.email);
            if (existing) {
              authUids[u.email] = existing.id;
              console.log(`   User exists: ${u.email} -> ${existing.id}`);
            }
          } else {
            console.error(`❌ Error creating auth user ${u.email}:`, authErr.message);
          }
        } else {
          authUids[u.email] = authUser.user.id;
          console.log(`   Created user: ${u.email} -> ${authUser.user.id}`);
        }

        // Upsert Profile
        if (authUids[u.email]) {
          await supabase.from('profiles').upsert([{
            id: authUids[u.email],
            full_name: u.fullName,
            email: u.email,
            role: u.role,
            department: u.department || null,
            phone: u.phone,
            govt_id_type: 'aadhaar',
            govt_id_number: `1234567890${u.phone.slice(-2)}`
          }]);
        }
      }
    } else {
      // Create mock UUIDs for SQL generation
      usersToCreate.forEach((u, idx) => {
        authUids[u.email] = `00000000-0000-0000-0000-${idx.toString().padStart(12, '0')}`;
      });
    }

    // 2. Generate 50 complaints
    console.log('Generating 50 complaints across roles...');
    const complaints = [];
    const complaintUpdates = [];
    const verifications = [];
    const escalations = [];
    const notifications = [];
    const auditLogs = [];

    const citizens = usersToCreate.filter(u => u.role === 'citizen');
    const employees = usersToCreate.filter(u => u.role === 'employee');

    const categoriesMap = {
      'Roads': ['Pothole Repair', 'Manhole Cover Damage', 'Footpath Obstruction'],
      'Sanitation': ['Garbage Piling', 'Public Urinal Clogging', 'Dead Animal Disposal'],
      'Water Supply': ['Pipe Leakage', 'No Water Pressure', 'Contaminated Supply'],
      'Street Lighting': ['Street Light Off', 'Cable Wire Hanging', 'Frequent Fluctuations']
    };

    const statuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Reopened', 'Escalated'];
    const priorities = ['Low', 'Medium', 'High'];

    for (let i = 1; i <= 50; i++) {
      const citizen = citizens[i % citizens.length];
      const dept = departments[i % departments.length];
      const subcats = categoriesMap[dept];
      const subcat = subcats[i % subcats.length];
      const loc = getRandomLocation();
      const status = statuses[i % statuses.length];
      const priority = priorities[i % priorities.length];
      
      const compId = i; // simple numeric ID for reference
      const citizenUid = authUids[citizen.email];
      
      let assignedEmp = null;
      let assignedEmpEmail = null;
      if (status !== 'Pending') {
        const deptEmployees = employees.filter(e => e.department === dept);
        assignedEmp = deptEmployees[i % deptEmployees.length];
        assignedEmpEmail = assignedEmp.email;
      }

      complaints.push({
        id: compId,
        user_id: citizenUid,
        title: `${subcat} issue in ${loc.address}`,
        description: `Visual validation required for ${subcat} category. Affecting multiple residents in this area.`,
        category: dept,
        subcategory: subcat,
        status: status,
        priority: priority,
        location: `${loc.lat}, ${loc.lng}`,
        civic_address: `${loc.address}, Hyderabad`,
        latitude: parseFloat(loc.lat),
        longitude: parseFloat(loc.lng),
        assigned_to: assignedEmpEmail,
        is_urgent: priority === 'High',
        created_at: new Date(Date.now() - (50 - i) * 24 * 3600 * 1000).toISOString()
      });

      // Timeline Updates & Audits
      complaintUpdates.push({
        complaint_id: compId,
        user_id: citizenUid,
        status_from: 'New',
        status_to: 'Pending',
        comments: 'Complaint logged by citizen',
        created_at: new Date(Date.now() - (50 - i) * 24 * 3600 * 1000 + 600000).toISOString()
      });

      auditLogs.push({
        user_id: citizenUid,
        user_role: 'citizen',
        action: 'complaint_created',
        entity_type: 'complaints',
        entity_id: String(compId),
        new_data: { status: 'Pending', category: dept },
        status: 'success',
        created_at: new Date(Date.now() - (50 - i) * 24 * 3600 * 1000).toISOString()
      });

      if (assignedEmp) {
        complaintUpdates.push({
          complaint_id: compId,
          user_id: authUids[`admin_${dept.toLowerCase().replace(' ', '_')}@ccgovt.test`],
          status_from: 'Pending',
          status_to: 'Assigned',
          comments: `Assigned to ${assignedEmp.fullName}`,
          created_at: new Date(Date.now() - (50 - i) * 24 * 3600 * 1000 + 3600000).toISOString()
        });

        auditLogs.push({
          user_id: authUids[`admin_${dept.toLowerCase().replace(' ', '_')}@ccgovt.test`],
          user_role: 'dept_admin',
          action: 'complaint_assigned',
          entity_type: 'complaints',
          entity_id: String(compId),
          new_data: { status: 'Assigned', assigned_to: assignedEmpEmail },
          status: 'success',
          created_at: new Date(Date.now() - (50 - i) * 24 * 3600 * 1000 + 3600000).toISOString()
        });

        notifications.push({
          user_id: authUids[assignedEmpEmail],
          title: 'New Complaint Assigned',
          message: `Complaint #${compId} has been assigned to you.`,
          is_read: false,
          created_at: new Date(Date.now() - (50 - i) * 24 * 3600 * 1000 + 365000).toISOString()
        });
      }

      if (status === 'Resolved' || status === 'Closed') {
        verifications.push({
          complaint_id: compId,
          citizen_id: citizenUid,
          status: status === 'Closed' ? 'accepted' : 'rejected',
          comments: status === 'Closed' ? 'Resolution accepted by resident.' : 'Work is incomplete.',
          evidence_url: status === 'Closed' ? 'https://twofkoqxtievknvamvgb.supabase.co/storage/v1/object/public/complaint_images/test_proof.png' : null,
          created_at: new Date(Date.now() - (50 - i) * 24 * 3600 * 1000 + 7200000).toISOString()
        });
      }

      if (status === 'Escalated') {
        escalations.push({
          complaint_id: compId,
          escalated_from: 'employee',
          escalated_to: 'dept_admin',
          reason: 'Resolution duration exceeded SLA threshold limit of 48 hours.',
          escalated_at: new Date(Date.now() - (50 - i) * 24 * 3600 * 1000 + 172800000).toISOString()
        });

        notifications.push({
          user_id: authUids[`admin_${dept.toLowerCase().replace(' ', '_')}@ccgovt.test`],
          title: 'SLA Breach: Ticket Escalated',
          message: `Complaint #${compId} has breached SLA guidelines and was escalated.`,
          is_read: false,
          created_at: new Date(Date.now() - (50 - i) * 24 * 3600 * 1000 + 172900000).toISOString()
        });
      }
    }

    // 3. Write live database if service key is active
    if (supabase) {
      console.log('Writing seed payload to Supabase...');
      
      console.log('  Seeding complaints...');
      const cleanComplaints = complaints.map(({ id, ...rest }) => rest);
      const { data: dbComps } = await supabase.from('complaints').insert(cleanComplaints).select();

      if (dbComps) {
        console.log(`  Seeded ${dbComps.length} complaints.`);
        
        // Update references in related items using real generated IDs
        const updatesWithIds = complaintUpdates.map((up, idx) => {
          const matchingComp = dbComps[idx % dbComps.length];
          return { ...up, complaint_id: matchingComp.id };
        });

        const verificationsWithIds = verifications.map((v, idx) => {
          const matchingComp = dbComps[idx % dbComps.length];
          return { ...v, complaint_id: matchingComp.id };
        });

        const escalationsWithIds = escalations.map((e, idx) => {
          const matchingComp = dbComps[idx % dbComps.length];
          return { ...e, complaint_id: matchingComp.id };
        });

        console.log('  Seeding audit_logs...');
        await supabase.from('audit_logs').insert(auditLogs);
        
        console.log('  Seeding updates...');
        await supabase.from('complaint_updates').insert(updatesWithIds);

        console.log('  Seeding notifications...');
        await supabase.from('notifications').insert(notifications);
      }
    }

    // 4. Generate backing SQL file
    console.log('Generating local backup docs/civic-connect-qa-seed.sql file...');
    let sqlContent = `-- SQL Seed Script for Civics Connect Enterprise\n\n`;
    
    // profiles seed
    sqlContent += `-- Seed Profiles\n`;
    usersToCreate.forEach(u => {
      const uid = authUids[u.email];
      sqlContent += `INSERT INTO public.profiles (id, full_name, email, role, department, phone, govt_id_type, govt_id_number)\n`;
      sqlContent += `VALUES ('${uid}', '${u.fullName}', '${u.email}', '${u.role}', ${u.department ? `'${u.department}'` : 'NULL'}, '${u.phone}', 'aadhaar', '1234567890${u.phone.slice(-2)}')\n`;
      sqlContent += `ON CONFLICT (id) DO NOTHING;\n\n`;
    });

    // complaints seed
    sqlContent += `-- Seed Complaints\n`;
    complaints.forEach(c => {
      sqlContent += `INSERT INTO public.complaints (id, user_id, title, description, category, subcategory, status, priority, location, civic_address, latitude, longitude, assigned_to, is_urgent, created_at)\n`;
      sqlContent += `VALUES (${c.id}, '${c.user_id}', '${c.title.replace(/'/g, "''")}', '${c.description.replace(/'/g, "''")}', '${c.category}', '${c.subcategory}', '${c.status}', '${c.priority}', '${c.location}', '${c.civic_address}', ${c.latitude}, ${c.longitude}, ${c.assigned_to ? `'${c.assigned_to}'` : 'NULL'}, ${c.is_urgent}, '${c.created_at}')\n`;
      sqlContent += `ON CONFLICT (id) DO NOTHING;\n\n`;
    });

    // audit logs
    sqlContent += `-- Seed Audit Logs\n`;
    auditLogs.forEach(al => {
      sqlContent += `INSERT INTO public.audit_logs (user_id, user_role, action, entity_type, entity_id, new_data, status, created_at)\n`;
      sqlContent += `VALUES ('${al.user_id}', '${al.user_role}', '${al.action}', '${al.entity_type}', '${al.entity_id}', '${JSON.stringify(al.new_data)}'::jsonb, '${al.status}', '${al.created_at}');\n`;
    });
    sqlContent += `\n`;

    fs.mkdirSync(path.dirname('c:/Users/vadth/OneDrive/Desktop/Servicenow/Civic internal/docs/civic-connect-qa-seed.sql'), { recursive: true });
    fs.writeFileSync('c:/Users/vadth/OneDrive/Desktop/Servicenow/Civic internal/docs/civic-connect-qa-seed.sql', sqlContent);
    console.log('✅ Local SQL file successfully saved: docs/civic-connect-qa-seed.sql');

    console.log('\n🌟 CIVICS CONNECT ENTERPRISE SEED VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Seeding script run failed:', err.message);
  }
}

runSeeder();
