import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load .env file from the correct path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSqlFunction() {
  try {
    console.log('Testing exec_sql function...');
    
    // Try a simple SELECT query
    const testQuery = 'SELECT * FROM manga LIMIT 1';
    console.log('Executing query:', testQuery);
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: testQuery 
    });

    if (error) {
      console.error('Error executing SQL function:', error);
    } else {
      console.log('Successfully executed SQL function!');
      console.log('Data returned:', data);
    }
  } catch (err) {
    console.error('Exception while executing SQL function:', err);
  }
}

testSqlFunction(); 