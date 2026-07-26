import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const tables = ['complaints', 'complaint_updates', 'complaint_verifications', 'complaint_escalations', 'notifications', 'audit_logs'];
  
  for (const table of tables) {
    console.log(`Checking table: ${table}...`);
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Table ${table} error:`, error.message);
    } else {
      console.log(`✅ Table ${table} exists. Sample:`, data);
    }
  }
}

checkSchema();
