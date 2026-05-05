import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcdtfyjjjqwesokptjuy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZHRmeWpqanF3ZXNva3B0anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODI5MTUsImV4cCI6MjA5Mjg1ODkxNX0.CSIWdUWrqHhzbTRBkWS7FbGfXCvcbKJt-n6P9Bt7Yho';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEquipos() {
  const { count, error } = await supabase
    .from('equipos')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log(`Total de equipos en la base de datos: ${count}`);
    
    // Ver los últimos 5 para confirmar nombres
    const { data } = await supabase.from('equipos').select('nombre').order('created_at', { ascending: false }).limit(5);
    console.log('Últimos equipos añadidos:', data.map(d => d.nombre).join(', '));
  }
}

checkEquipos();
