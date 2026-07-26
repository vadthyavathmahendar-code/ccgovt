import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSessionFlow() {
  try {
    console.log('--- TESTING AUTHENTICATION LIFECYCLE FLOW ---');

    const tempEmail = `auth_test_${Date.now()}@ccgovt.test`;
    const tempPassword = 'SecurePassword123!';

    // 1. Sign Up & Autologin
    console.log('1. Signing up user:', tempEmail);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: tempEmail,
      password: tempPassword
    });
    if (signUpErr) throw signUpErr;
    console.log('   ✅ Signup succeeded. User ID:', signUpData.user.id);

    // 2. Fetch Session (Page Refresh Simulation)
    console.log('2. Simulating page refresh (fetching session)...');
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) throw sessionErr;
    
    if (sessionData.session) {
      console.log('   ✅ Session recovered successfully for:', sessionData.session.user.email);
    } else {
      throw new Error('No session was returned after signup');
    }

    // 3. Sign Out (Logout Simulation)
    console.log('3. Simulating logout...');
    const { error: signOutErr } = await supabase.auth.signOut();
    if (signOutErr) throw signOutErr;
    console.log('   ✅ Signout completed successfully.');

    // 4. Verify Session is cleared
    console.log('4. Verifying session is cleared after logout...');
    const { data: clearedSessionData } = await supabase.auth.getSession();
    if (clearedSessionData.session) {
      throw new Error('Session was NOT cleared after signout');
    } else {
      console.log('   ✅ Verified: Session is null.');
    }

    console.log('\n🌟 ALL AUTH LIFECYCLE CONTROLS OPERATE PERFECTLY!');
  } catch (err) {
    console.error('❌ Auth flow test failed:', err.message);
  }
}

testSessionFlow();
