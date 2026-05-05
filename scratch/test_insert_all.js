
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dcdtfyjjjqwesokptjuy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZHRmeWpqanF3ZXNva3B0anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODI5MTUsImV4cCI6MjA5Mjg1ODkxNX0.CSIWdUWrqHhzbTRBkWS7FbGfXCvcbKJt-n6P9Bt7Yho'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const { error: e1 } = await supabase.from('revisiones_diarias').insert([{ fecha: '2000-01-01' }])
  console.log('revisiones_diarias:', e1 ? e1.message : 'OK')

  const { error: e2 } = await supabase.from('datos_operativos').insert([{ fecha: '2000-01-01', tipo: 'test', variable: 'test', valor: 0 }])
  console.log('datos_operativos:', e2 ? e2.message : 'OK')

  const { error: e3 } = await supabase.from('clasificacion_datos').insert([{ categoria: 'test', subcategoria: 'test', ruta_json: 'test' }])
  console.log('clasificacion_datos:', e3 ? e3.message : 'OK')
}

check()
