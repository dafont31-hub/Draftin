import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcdtfyjjjqwesokptjuy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZHRmeWpqanF3ZXNva3B0anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODI5MTUsImV4cCI6MjA5Mjg1ODkxNX0.CSIWdUWrqHhzbTRBkWS7FbGfXCvcbKJt-n6P9Bt7Yho';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    const { data: equipos, error: e1 } = await supabase.from('equipos').select('nombre, sistema');
    const { data: groups, error: e2 } = await supabase.from('app_config_grupos').select('nombre, grupo_id');
    
    console.log('--- EQUIPOS ---');
    console.table(equipos);
    console.log('--- GRUPOS ---');
    console.table(groups);
}

debug();
