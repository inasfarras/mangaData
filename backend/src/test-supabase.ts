import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load .env file from the correct path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
console.log('Testing Supabase connection...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? '[KEY AVAILABLE]' : '[KEY MISSING]');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Try to execute a simple query
    const { data, error } = await supabase
      .from('manga')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error connecting to Supabase:', error);
    } else {
      console.log('Successfully connected to Supabase!');
      console.log('Data returned:', data);
    }
  } catch (err) {
    console.error('Exception while connecting to Supabase:', err);
  }
}

testConnection(); 