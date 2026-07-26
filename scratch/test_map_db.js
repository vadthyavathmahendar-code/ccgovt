import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMapInsert() {
  try {
    const tempEmail = `temp_map_${Date.now()}@ccgovt.test`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail, password: 'SecurePassword123!'
    });
    if (authError) throw authError;
    const userId = authData.user.id;

    await supabase.from('profiles').upsert([{
      id: userId, role: 'citizen', email: tempEmail, full_name: 'Temp Map Citizen'
    }]);

    console.log('Inserting complaint with coordinates (17.3850, 78.4867)...');
    const { data, error } = await supabase.from('complaints').insert([{
      user_id: userId,
      title: 'GIS Test Complaint',
      category: 'Roads',
      priority: 'Medium',
      status: 'Pending',
      latitude: 17.3850,
      longitude: 78.4867,
      civic_address: 'Charminar Road, Hyderabad, Telangana'
    }]).select();

    if (error) {
      console.error('❌ Insertion failed:', error.message);
    } else {
      console.log('✅ Insertion succeeded! Details:');
      console.log(`   - ID: ${data[0].id}`);
      console.log(`   - Latitude: ${data[0].latitude}`);
      console.log(`   - Longitude: ${data[0].longitude}`);
      console.log(`   - Civic Address: ${data[0].civic_address}`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testMapInsert();
