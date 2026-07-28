import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardQueries() {
  try {
    console.log('--- TESTING USER DASHBOARD SELECT QUERIES ---');

    // 1. Sign In
    console.log('1. Logging in as citizen_1@ccgovt.test...');
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: 'citizen_1@ccgovt.test',
      password: '123456789'
    });
    if (authErr) throw authErr;
    const userId = authData.user.id;
    console.log('   ✅ Signin OK. UUID:', userId);

    // 2. Fetch Profile
    console.log('2. Querying profiles table...');
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (profileErr) {
      console.warn('   ⚠️ Profile query error:', profileErr.message);
    } else {
      console.log('   ✅ Profile query OK. Role:', profile.role);
    }

    // 3. Fetch History
    console.log('3. Querying complaints table...');
    const { data: complaints, error: complaintsErr } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (complaintsErr) {
      console.warn('   ⚠️ Complaints query error:', complaintsErr.message);
    } else {
      console.log('   ✅ Complaints query OK. Count:', complaints?.length);
    }

    // 4. Fetch Broadcasts
    console.log('4. Querying broadcasts table...');
    const { data: broadcasts, error: broadcastsErr } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    if (broadcastsErr) {
      console.warn('   ⚠️ Broadcasts query error:', broadcastsErr.message);
    } else {
      console.log('   ✅ Broadcasts query OK. Count:', broadcasts?.length);
    }

    console.log('\n🌟 ALL DB FETCHES AND QUERIES EXECUTED WITHOUT CRASHING!');
  } catch (err) {
    console.error('❌ Diagnostic test failed:', err.message);
  }
}

testDashboardQueries();
