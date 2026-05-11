import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request) => {
  const { record } = await req.json()

  // Solo notificar si es Crítica
  if (record.prioridad !== 'Crítica') {
    return new Response(JSON.stringify({ status: 'ignored' }), { headers: { "Content-Type": "application/json" } })
  }

  console.log(`ALERTA CRÍTICA: OT #${record.folio} - ${record.titulo}`)

  // Aquí se integraría con Firebase Cloud Messaging o un servicio de Email/SMS
  // Mock de integración
  const notification = {
    to: "/topics/managers",
    notification: {
      title: "🚨 AVERÍA CRÍTICA DETECTADA",
      body: `OT #${record.folio}: ${record.titulo}. Activo: ${record.asset_id}`,
      icon: "https://draftin.app/icon.png"
    }
  }

  return new Response(JSON.stringify({ status: 'notified', data: notification }), {
    headers: { "Content-Type": "application/json" },
  })
})
