/* eslint-disable */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co';
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  try {
    console.log('Testing upload of dummy buffer to complaints bucket...');
    const buffer = global.Buffer.from('dummy image content');
    const fileName = `test_${Date.now()}.png`;
    const filePath = `user_uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from('complaint_images')
      .upload(filePath, buffer, {
        contentType: 'image/png'
      });

    if (error) {
      console.error('❌ Upload failed with error:', error);
    } else {
      console.log('✅ Upload succeeded! Data:', data);
    }
  } catch (err) {
    console.error('❌ Exception thrown:', err.message);
  }
}

testUpload();
