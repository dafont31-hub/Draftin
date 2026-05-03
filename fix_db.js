import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcdtfyjjjqwesokptjuy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZHRmeWpqanF3ZXNva3B0anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODI5MTUsImV4cCI6MjA5Mjg1ODkxNX0.CSIWdUWrqHhzbTRBkWS7FbGfXCvcbKJt-n6P9Bt7Yho';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    // 1. Añadir pestaña IA
    const { error: e1 } = await supabase.from('app_config_pestanas').upsert({
        label: 'AI_CHAT',
        icon: 'ai_chat',
        tab_id: 'ai_chat',
        orden: 5,
        roles: ['admin', 'operario']
    }, { onConflict: 'tab_id' });

    if (e1) console.error("Error añadiendo pestaña IA:", e1);
    else console.log("Pestaña IA activada.");
}

fix();
