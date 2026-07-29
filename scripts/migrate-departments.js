import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3b2Zrb3F4dGlldmtudmFtdmdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc3Mzk0OCwiZXhwIjoyMDgzMzQ5OTQ4fQ.9KYkk0Yjmyy10RkatXnp_JOOr6gHmYZmMdGkpqCAhH0';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log('Starting DB migration to align departments...');

  // 1. Update Profiles
  console.log('Migrating profile departments...');
  const { error: errP1 } = await supabase
    .from('profiles')
    .update({ department: 'Drainage & Sewerage' })
    .or('department.eq.Water Supply,department.eq.Water,department.eq.Drainage');

  const { error: errP2 } = await supabase
    .from('profiles')
    .update({ department: 'Sanitation & Garbage' })
    .or('department.eq.Sanitation,department.eq.Garbage');

  const { error: errP3 } = await supabase
    .from('profiles')
    .update({ department: 'Street Lighting' })
    .or('department.eq.Electricity,department.eq.Streetlights');

  if (errP1 || errP2 || errP3) {
    console.error('Profile migration failed:', errP1 || errP2 || errP3);
  } else {
    console.log('Profiles migrated successfully!');
  }

  // 2. Update Complaints
  console.log('Migrating complaint categories...');
  const { error: errC1 } = await supabase
    .from('complaints')
    .update({ category: 'Drainage & Sewerage' })
    .or('category.eq.Water Supply,category.eq.Water,category.eq.Drainage');

  const { error: errC2 } = await supabase
    .from('complaints')
    .update({ category: 'Sanitation & Garbage' })
    .or('category.eq.Sanitation,category.eq.Garbage');

  const { error: errC3 } = await supabase
    .from('complaints')
    .update({ category: 'Street Lighting' })
    .or('category.eq.Electricity,category.eq.Streetlights');

  if (errC1 || errC2 || errC3) {
    console.error('Complaint category migration failed:', errC1 || errC2 || errC3);
  } else {
    console.log('Complaint categories migrated successfully!');
  }
}

run();
