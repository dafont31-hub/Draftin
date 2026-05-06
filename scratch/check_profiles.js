import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcdtfyjjjqwesokptjuy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZHRmeWpqanF3ZXNva3B0anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODI5MTUsImV4cCI6MjA5Mjg1ODkxNX0.CSIWdUWrqHhzbTRBkWS7FbGfXCvcbKJt-n6P9Bt7Yho';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    const { data, error } = await supabase.from('perfiles').select('email, rol, nombre').limit(5);
    if (error) {
        console.error("Error fetching profiles:", error);
    } else {
        console.log("Profiles found:", data);
    }
}

checkProfiles();
