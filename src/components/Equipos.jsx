import React, { useState } from 'react';

const Equipos = ({ equipos = [] }) => {
  const [activeCategory, setActiveCategory] = useState('SALA TÉRMICA');
  const categories = ['SALA TÉRMICA', 'LIMPIEZA', 'ARCO DE DESINFECCIÓN'];

  const getImage = (nombre) => {
    const n = nombre.toUpperCase();
    if (n.includes('CALDERA')) return 'boiler_3d.png';
    if (n.includes('QUEMADOR')) return 'burner_3d.png';
    if (n.includes('INTERCAMBIADOR')) return 'heat_exchanger_3d.png';
    if (n.includes('DESCALC')) return 'softener_3d.png';
    if (n.includes('DESGASIFICADOR')) return 'degasser_3d.png';
    if (n.includes('ARCO')) return 'softener_3d.png'; 
    if (n.includes('SATÉLITE')) return 'softener_3d.png'; 
    return 'boiler_3d.png';
  };

  const getGrupo = (equipo) => {
    const s = (equipo.sistema || '').toUpperCase();
    const n = (equipo.nombre || '').toUpperCase();
    
    if (n.includes('ARCO')) return 'ARCO DE DESINFECCIÓN';
    if (s === 'LIMPIEZA') return 'LIMPIEZA';
    if (s === 'GENERACIÓN' || s === 'CONJUNTO TÉRMICO' || s === 'DISTRIBUCIÓN') return 'SALA TÉRMICA';
    return 'SALA TÉRMICA';
  };

  const filteredEquipos = equipos
    .filter(eq => getGrupo(eq) === activeCategory)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true }));

  const statusLEDs = {
    'Operativo': 'bg-[#00FF88]',
    'Alarma': 'bg-[#FF6B00]',
    'Crítico': 'bg-[#FF0044]',
  };

  return (
    <div className="animate-in fade-in duration-300 flex flex-col h-full">
      {/* Pestañas de categorías */}
      <div className="flex border-b border-[#222] mb-5 overflow-x-auto no-scrollbar px-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-6 py-3 text-[10px] font-black tracking-[0.2em] relative transition-all ${
              activeCategory === cat ? 'text-[#FF6B00]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {cat}
            {activeCategory === cat && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FF6B00] shadow-[0_-4px_10px_rgba(255,107,0,0.3)]"></div>
            )}
          </button>
        ))}
      </div>

      {/* Lista de equipos */}
      <div className="flex flex-col gap-3 pb-24">
        {filteredEquipos.length > 0 ? (
          filteredEquipos.map((eq) => (
            <div key={eq.id} className="industrial-card p-3.5 flex items-center justify-between cursor-pointer bg-[#141414] border-[#222] hover:border-[#333] transition-all group">
              {/* Imagen Izquierda */}
              <div className="w-16 h-16 flex items-center justify-center p-2 bg-[#0A0A0A] rounded-xl border border-[#222] mr-4 group-hover:border-[#FF6B00]/30 transition-colors">
                <img 
                  src={`/${getImage(eq.nombre)}`} 
                  className="w-full h-full object-contain mix-blend-lighten drop-shadow-xl" 
                  style={{ filter: 'contrast(1.2) brightness(1.1)' }}
                  alt="" 
                />
              </div>
              
              {/* Contenido Central */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white text-[12px] font-black uppercase tracking-wide">{eq.nombre}</h4>
                </div>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${statusLEDs[eq.estado] || 'bg-gray-700'} ${eq.estado !== 'Operativo' ? 'animate-pulse' : ''}`}></div>
                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{eq.estado}</p>
                   <span className="text-[#333] text-[10px]">•</span>
                   <p className="text-[9px] font-medium text-gray-600 uppercase tracking-tight">{eq.sistema || 'General'}</p>
                </div>
              </div>

              {/* ID y Flecha Derecha */}
              <div className="flex flex-col items-end justify-between h-14 pl-4 border-l border-[#222]">
                <span className="text-[8px] font-black text-gray-500 bg-[#0A0A0A] px-1.5 py-0.5 rounded border border-[#222] tracking-widest">{eq.id_tecnico}</span>
                <svg className="w-4 h-4 text-gray-500 group-hover:text-[#FF6B00] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center opacity-30">
            <svg className="w-12 h-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-[10px] font-black uppercase tracking-widest">No hay equipos en esta categoría</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipos;
