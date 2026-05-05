
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dcdtfyjjjqwesokptjuy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZHRmeWpqanF3ZXNva3B0anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODI5MTUsImV4cCI6MjA5Mjg1ODkxNX0.CSIWdUWrqHhzbTRBkWS7FbGfXCvcbKJt-n6P9Bt7Yho'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function update() {
  const { error } = await supabase.from('app_config_branding').update({
    empresa_nombre: 'LITERA MEAT',
    color_primario: '#E30613',
    logo_url: 'https://raw.githubusercontent.com/davidfontaina/Draftin/main/public/litera_meat_logo.png' // I'll use a placeholder for now or tell the user to upload it.
    // Actually, I'll use the local path for the logo if the app can serve it.
  }).neq('id', '00000000-0000-0000-0000-000000000000') // Dummy condition to update all
  
  if (error) console.error('Error:', error)
  else console.log('Branding updated to LITERA MEAT')
}

update()
