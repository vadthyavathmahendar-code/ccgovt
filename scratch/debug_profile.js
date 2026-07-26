import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  console.log('Querying profiles table...');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(10);
  
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Successfully fetched profiles count:', data.length);
    console.log('Fetched profiles sample:', data);
  }
}

checkProfiles();
