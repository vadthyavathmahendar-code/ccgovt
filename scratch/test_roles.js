import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';
const supabase = createClient(supabaseUrl, supabaseKey);

const timestamp = Date.now();
const testEmail = `test_admin_${timestamp}@ccgovt.test`;
const testPassword = `SecurePassword123!`;

async function runTest() {
  try {
    console.log('Registering user in auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) throw authError;
    const userId = authData.user.id;
    console.log('Registered user ID:', userId);

    console.log('Inserting profile row with role=dept_admin...');
    const { error: profileError } = await supabase.from('profiles').upsert([{
      id: userId,
      full_name: 'Test Administrator',
      email: testEmail,
      phone: '9998887776',
      role: 'dept_admin',
      govt_id_type: 'admin_id',
      govt_id_number: 'ADM12345',
      updated_at: new Date().toISOString()
    }], { onConflict: 'id' });

    if (profileError) throw profileError;
    console.log('Profile upsert succeeded.');

    console.log('Querying own profile from database...');
    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
    } else {
      console.log('Fetched Profile Role:', profileData.role);
      console.log('Fetched Profile Details:', profileData);
    }

  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runTest();
