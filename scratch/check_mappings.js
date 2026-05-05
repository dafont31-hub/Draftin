
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dcdtfyjjjqwesokptjuy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZHRmeWpqanF3ZXNva3B0anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODI5MTUsImV4cCI6MjA5Mjg1ODkxNX0.CSIWdUWrqHhzbTRBkWS7FbGfXCvcbKJt-n6P9Bt7Yho'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const { data: mappings, error: e1 } = await supabase.from('clasificacion_datos').select('*')
  console.log('Mappings count:', mappings ? mappings.length : 0)
  if (mappings && mappings.length > 0) {
      console.log('First mapping:', JSON.stringify(mappings[0], null, 2))
  }
  if (e1) console.error('Error mappings:', e1)
}

check()
