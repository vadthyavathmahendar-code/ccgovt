import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  try {
    const tempEmail = `temp_feed_${Date.now()}@ccgovt.test`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail, password: 'SecurePassword123!'
    });
    if (authError) throw authError;
    const userId = authData.user.id;

    // Create a profile
    await supabase.from('profiles').upsert([{
      id: userId, role: 'citizen', email: tempEmail, full_name: 'Temp Feedback Citizen'
    }]);

    // Create a complaint
    const { data: complaintData, error: cErr } = await supabase.from('complaints').insert([{
      user_id: userId, title: 'Temp Feedback Complaint', category: 'Roads', priority: 'Medium', status: 'Pending'
    }]).select();
    if (cErr) throw cErr;
    const complaintId = complaintData[0].id;

    // Insert feedback with complaint_id, user_id, and rating_stars to retrieve all columns
    console.log('Inserting feedback...');
    const { data: feedbackData, error: fErr } = await supabase.from('complaint_feedback').insert([{
      complaint_id: complaintId,
      user_id: userId,
      rating_stars: 5
    }]).select();

    if (fErr) {
      console.error('Feedback insertion failed:', fErr.message);
    } else {
      console.log('✅ Feedback inserted successfully! Columns returned:');
      console.log(Object.keys(feedbackData[0]));
      console.log('Feedback Row:', feedbackData[0]);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkColumns();
