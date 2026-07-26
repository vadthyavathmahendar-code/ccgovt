import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';
const supabase = createClient(supabaseUrl, supabaseKey);

const testEmail = 'test_admin_1785061821030@ccgovt.test';
const testPassword = 'SecurePassword123!';

async function runCheck() {
  try {
    console.log('Logging in as test admin...');
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (authError) throw authError;
    console.log('Admin login successful.');

    console.log('Querying profile of civicconnect2@gmail.com...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'civicconnect2@gmail.com');

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      console.log('QueryResult:', data);
    }
  } catch (err) {
    console.error('Check failed:', err);
  }
}

runCheck();
