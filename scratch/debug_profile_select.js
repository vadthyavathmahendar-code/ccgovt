import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfile() {
  try {
    const { data: usersData, error: usersErr } = await supabase.auth.signInWithPassword({
      email: 'citizen_1@ccgovt.test',
      password: '123456789'
    });
    if (usersErr) throw usersErr;
    
    console.log('✅ Logged in successfully. User ID:', usersData.user.id);

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', usersData.user.id)
      .single();
    
    if (profileErr) throw profileErr;

    console.log('✅ Profile loaded successfully:', profile);
  } catch (err) {
    console.error('❌ Profile check failed:', err.message);
  }
}

checkProfile();
