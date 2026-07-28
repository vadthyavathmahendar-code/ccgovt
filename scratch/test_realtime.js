/* global process */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealtime() {
  console.log('--- DIAGNOSING REALTIME COMPLAINT UPDATES ---');

  // 1. Authenticate as citizen
  console.log('1. Logging in as citizen_1@ccgovt.test...');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'citizen_1@ccgovt.test',
    password: '123456789'
  });
  if (authErr) {
    console.error('Login failed:', authErr.message);
    return;
  }
  const userId = authData.user.id;
  console.log('✅ Logged in successfully. User ID:', userId);

  // 2. Fetch a complaint to update
  console.log('2. Fetching user complaints...');
  const { data: complaints, error: compErr } = await supabase
    .from('complaints')
    .select('*')
    .eq('user_id', userId)
    .limit(1);
  if (compErr || !complaints || complaints.length === 0) {
    console.error('No complaints found to test with.', compErr?.message);
    return;
  }
  const targetComplaint = complaints[0];
  console.log(`✅ Found complaint: ID=${targetComplaint.id}, Status=${targetComplaint.status}`);

  // 3. Subscribe to Realtime Channel
  console.log('3. Registering Realtime channel subscription...');
  let eventReceived = false;

  const channel = supabase.channel('realtime_test_channel')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'complaints', filter: `id=eq.${targetComplaint.id}` },
      (payload) => {
        console.log('🎉 REALTIME EVENT RECEIVED!', payload.new);
        eventReceived = true;
      }
    )
    .subscribe((status) => {
      console.log(`📡 Subscription status transitioned to: ${status}`);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Channel active. Triggering test update...');
        // Perform update in 1 second
        setTimeout(async () => {
          const newStatus = targetComplaint.status === 'Pending' ? 'In Progress' : 'Pending';
          console.log(`4. Updating status from ${targetComplaint.status} to ${newStatus}...`);
          const { error: updateErr } = await supabase
            .from('complaints')
            .update({ status: newStatus })
            .eq('id', targetComplaint.id);

          if (updateErr) {
            console.error('Update failed:', updateErr.message);
          } else {
            console.log('✅ Database updated successfully.');
          }

          // Wait 3 seconds for realtime event
          setTimeout(() => {
            if (eventReceived) {
              console.log('🌟 SUCCESS: Realtime updates are active and working!');
            } else {
              console.error('❌ FAILURE: Realtime event was NEVER received. Realtime publication is likely disabled for the complaints table.');
            }
            channel.unsubscribe();
            process.exit(0);
          }, 3000);
        }, 1000);
      }
    });
}

testRealtime();
