import { createClient } from '@supabase/supabase-api';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function syncPlanes() {
  const { data: planes } = await supabase.from('plan_mantenimiento').select('*');
  console.log('Planes actuales:', planes);
}

syncPlanes();
