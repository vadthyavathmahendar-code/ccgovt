import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';
const supabase = createClient(supabaseUrl, supabaseKey);


async function testPriorities() {
  try {
    const tempEmail = `temp_prio_${Date.now()}@ccgovt.test`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail,
      password: 'SecurePassword123!'
    });
    if (authError) throw authError;
    const userId = authData.user.id;

    await supabase.from('profiles').upsert([{
      id: userId, full_name: 'Temp Prio Citizen', email: tempEmail, role: 'citizen'
    }]);

    const priorities = ['low', 'medium', 'high', 'Low', 'Medium', 'High', 'LOW', 'MEDIUM', 'HIGH', 'Normal', 'minor', 'major', 'critical', 'Low Priority', 'Medium Priority', 'High Priority'];
    
    for (const p of priorities) {
      console.log(`Testing priority: '${p}'...`);
      const { data, error } = await supabase.from('complaints').insert([{
        user_id: userId,
        title: 'Priority Test',
        description: 'Testing constraint',
        category: 'Roads',
        location: '17.44, 78.38',
        status: 'Pending',
        priority: p
      }]).select();
      
      if (error) {
        console.log(`  ❌ Failed: ${error.message}`);
      } else {
        console.log(`  ✅ Succeeded! Priority '${p}' works. Inserted ID:`, data[0].id);
        return;
      }
    }
  } catch (err) {
    console.error('Error during test:', err.message);
  }
}

testPriorities();
