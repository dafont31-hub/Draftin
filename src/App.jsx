import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [equipos, setEquipos] = useState([])

  useEffect(() => {
    fetchEquipos()
  }, [])

  async function fetchEquipos() {
    const { data } = await supabase.from('equipos').select('*')
    if (data) setEquipos(data)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">
            ⚙️ Gestión de Calderas
          </h1>
          <p className="text-gray-600 mt-2">Panel de Control Principal - PWA</p>
        </header>
        
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {equipos.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-lg">No hay equipos registrados o no hay conexión (Offline).</p>
            </div>
          ) : (
            equipos.map(equipo => (
              <div key={equipo.id} className="p-6 bg-white shadow-md rounded-xl border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-gray-800">{equipo.nombre}</h2>
                <div className="mt-4 space-y-2">
                  <p className="text-gray-600 flex items-center">
                    <span className="font-semibold w-24">Ubicación:</span> {equipo.ubicacion}
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <span className="font-semibold w-24">Marca:</span> {equipo.marca || 'N/A'}
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <span className="font-semibold w-24">S/N:</span> {equipo.numero_serie || 'N/A'}
                  </p>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  )
}

export default App
