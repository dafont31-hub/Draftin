
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dcdtfyjjjqwesokptjuy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZHRmeWpqanF3ZXNva3B0anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODI5MTUsImV4cCI6MjA5Mjg1ODkxNX0.CSIWdUWrqHhzbTRBkWS7FbGfXCvcbKJt-n6P9Bt7Yho'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const { data: tabs, error: e1 } = await supabase.from('app_config_pestanas').select('*')
  console.log('Tabs:', JSON.stringify(tabs, null, 2))
  if (e1) console.error('Error tabs:', e1)

  const { data: rev, error: e2 } = await supabase.from('revisiones_diarias').select('*').limit(1)
  console.log('Revisiones sample:', JSON.stringify(rev, null, 2))
  if (e2) console.error('Error rev:', e2)
}

check()
