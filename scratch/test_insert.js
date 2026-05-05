
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dcdtfyjjjqwesokptjuy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZHRmeWpqanF3ZXNva3B0anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODI5MTUsImV4cCI6MjA5Mjg1ODkxNX0.CSIWdUWrqHhzbTRBkWS7FbGfXCvcbKJt-n6P9Bt7Yho'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  // Querying pg_policies is not possible with anon key usually, but I can try to insert and see if it fails.
  const { error } = await supabase.from('revisiones_diarias').insert([{ fecha: '2000-01-01' }])
  console.log('Insert test result:', error ? error.message : 'Success')
}

check()
