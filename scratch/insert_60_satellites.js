import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcdtfyjjjqwesokptjuy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZHRmeWpqanF3ZXNva3B0anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODI5MTUsImV4cCI6MjA5Mjg1ODkxNX0.CSIWdUWrqHhzbTRBkWS7FbGfXCvcbKJt-n6P9Bt7Yho';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertSatellites() {
  console.log('--- CARGANDO 60 SATÉLITES EN SISTEMA DE LIMPIEZA ---');
  
  const satellites = [];
  for (let i = 1; i <= 60; i++) {
    const num = i.toString().padStart(2, '0');
    satellites.push({
      nombre: `SATÉLITE ${num}`,
      id_tecnico: `EQ-SAT-${num}`,
      sistema: 'Limpieza',
      estado: 'Operativo',
      imagen_url: 'chemical_sensor_3d_icon_1777378533177.png',
      telemetria: []
    });
  }

  // Insertamos uno a uno o en bloques pequeños para evitar timeouts
  const { data, error } = await supabase
    .from('equipos')
    .insert(satellites);

  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ ÉXITO: Los 60 satélites ya están en la base de datos.');
  }
}

insertSatellites();
