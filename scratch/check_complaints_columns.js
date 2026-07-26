import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkComplaints() {
  try {
    const tempEmail = `temp_comp_${Date.now()}@ccgovt.test`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail, password: 'SecurePassword123!'
    });
    if (authError) throw authError;
    const userId = authData.user.id;

    await supabase.from('profiles').upsert([{
      id: userId, role: 'citizen', email: tempEmail, full_name: 'Temp Column Citizen'
    }]);

    const { data, error } = await supabase.from('complaints').insert([{
      user_id: userId, title: 'Temp Column Check', category: 'Roads', priority: 'Medium', status: 'Pending'
    }]).select();

    if (error) {
      console.error('Failed:', error.message);
    } else {
      console.log('✅ Columns in complaints table:');
      console.log(Object.keys(data[0]));
      console.log('Row details:', data[0]);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkComplaints();
