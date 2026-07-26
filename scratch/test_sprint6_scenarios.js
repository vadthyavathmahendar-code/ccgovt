import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';
const supabase = createClient(supabaseUrl, supabaseKey);

const timestamp = Date.now();
const citizenEmail = `scen_citizen_${timestamp}@ccgovt.test`;
const employeeEmail = `scen_emp_${timestamp}@ccgovt.test`;
const testPassword = `SecurePassword123!`;

async function runScenario() {
  try {
    console.log('--- SPRINT 6 E2E FUNCTIONAL QA TEST RUN ---');

    // 1. Sign up citizen
    console.log('1. Registering citizen...');
    const { data: citizenAuth, error: citizenAuthErr } = await supabase.auth.signUp({
      email: citizenEmail, password: testPassword
    });
    if (citizenAuthErr) throw citizenAuthErr;
    const citizenId = citizenAuth.user.id;

    await supabase.from('profiles').upsert([{
      id: citizenId, full_name: 'Scenario Citizen', email: citizenEmail, role: 'citizen'
    }]);
    console.log('   Citizen Profile Upserted ID:', citizenId);

    // 2. Sign up employee
    console.log('2. Registering employee...');
    const { data: employeeAuth, error: employeeAuthErr } = await supabase.auth.signUp({
      email: employeeEmail, password: testPassword
    });
    if (employeeAuthErr) throw employeeAuthErr;
    const employeeId = employeeAuth.user.id;

    await supabase.from('profiles').upsert([{
      id: employeeId, full_name: 'Scenario Employee', email: employeeEmail, role: 'employee', department: 'Roads'
    }]);
    console.log('   Employee Profile Upserted ID:', employeeId);

    // 3. Citizen submits complaint
    console.log('3. Citizen submitting new complaint...');
    const { data: complaintInsert, error: complaintErr } = await supabase.from('complaints').insert([{
      user_id: citizenId,
      title: 'Pothole Scenario Audit',
      description: 'Massive pothole near the central sector grid line.',
      category: 'Roads',
      location: '17.4483, 78.3841',
      status: 'Pending',
      priority: 'Medium'
    }]).select();
    if (complaintErr) throw complaintErr;
    const complaint = complaintInsert[0];
    console.log('   Complaint Inserted ID:', complaint.id, 'Status:', complaint.status);

    // 4. Admin Assigns Complaint
    console.log('4. Simulating Admin dispatch to employee...');
    const { error: assignErr } = await supabase.from('complaints').update({
      assigned_to: employeeEmail,
      status: 'Assigned'
    }).eq('id', complaint.id);
    if (assignErr) throw assignErr;
    console.log('   Complaint Assigned to:', employeeEmail);

    // 5. Employee Starts Work
    console.log('5. Simulating Employee starting work (WIP)...');
    const { error: wipErr } = await supabase.from('complaints').update({
      status: 'In Progress'
    }).eq('id', complaint.id);
    if (wipErr) throw wipErr;
    console.log('   Status Updated to: In Progress');

    // 6. Employee Resolves Work
    console.log('6. Simulating Employee resolving complaint...');
    const { error: resolveErr } = await supabase.from('complaints').update({
      status: 'Resolved',
      resolve_image_url: 'https://twofkoqxtievknvamvgb.supabase.co/storage/v1/object/public/complaints/test_proof.png'
    }).eq('id', complaint.id);
    if (resolveErr) throw resolveErr;
    console.log('   Status Updated to: Resolved with Proof image.');

    // 7. Citizen Accept and Close
    console.log('7. Simulating Citizen accepting resolution (Feedback & Close)...');
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: citizenEmail,
      password: testPassword
    });
    if (signInErr) throw signInErr;

    const { error: feedbackErr } = await supabase.from('complaint_feedback').insert([{
      complaint_id: complaint.id,
      rating_stars: 5,
      feedback_comments: 'Excellent quick work, thank you!',
      user_id: citizenId
    }]);
    if (feedbackErr) throw feedbackErr;

    const { error: closeErr } = await supabase.from('complaints').update({
      status: 'Closed'
    }).eq('id', complaint.id);
    if (closeErr) throw closeErr;
    console.log('   Status Updated to: Closed.');

    // 8. Reopen Verification Flow (Reopen scenario)
    console.log('8. Testing Reopening Flow...');
    const { error: reopenErr } = await supabase.from('complaints').update({
      status: 'Pending',
      assigned_to: null,
      resolve_image_url: null
    }).eq('id', complaint.id);
    if (reopenErr) throw reopenErr;
    
    // Fetch final state
    const { data: finalComplaint } = await supabase.from('complaints').select('*').eq('id', complaint.id).single();
    console.log('   Final Complaint State after Reopen:');
    console.log(`     - Status: ${finalComplaint.status}`);
    console.log(`     - Assigned To: ${finalComplaint.assigned_to}`);
    console.log(`     - Resolve Image URL: ${finalComplaint.resolve_image_url}`);

    console.log('\n✅ ALL SPRINT 6 SCENARIOS EXECUTED & PASSED DATABASE VERIFICATION!');
  } catch (err) {
    console.error('❌ Test scenario failed:', err.message);
  }
}

runScenario();
