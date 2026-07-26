
const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';

async function dumpSchema() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const schema = await res.json();
    
    const tables = ['complaints', 'complaint_updates', 'profiles'];
    for (const t of tables) {
      console.log(`\n=================== TABLE: ${t} ===================`);
      const def = schema?.definitions?.[t];
      if (def) {
        console.log('Properties:');
        for (const [propName, propVal] of Object.entries(def.properties || {})) {
          console.log(`  - ${propName}: ${propVal.type} (${propVal.format || ''}) - ${propVal.description || ''}`);
        }
      } else {
        console.log(`❌ Table ${t} not found in definitions.`);
      }
    }
  } catch (err) {
    console.error('Error fetching schema:', err);
  }
}

dumpSchema();
