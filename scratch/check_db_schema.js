import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcdtfyjjjqwesokptjuy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZHRmeWpqanF3ZXNva3B0anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODI5MTUsImV4cCI6MjA5Mjg1ODkxNX0.CSIWdUWrqHhzbTRBkWS7FbGfXCvcbKJt-n6P9Bt7Yho';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking revisiones_diarias columns...");
    const { data, error } = await supabase.from('revisiones_diarias').select('*').limit(1);
    if (error) {
        console.error("Error fetching table:", error);
    } else {
        console.log("Columns found:", data.length > 0 ? Object.keys(data[0]) : "No data to infer columns");
    }
}

checkSchema();
