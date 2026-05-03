import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Equipos = ({ equipos = [], categories = [] }) => {
  const [activeCategory, setActiveCategory] = useState('SALA TÉRMICA');
  const [saveMsg, setSaveMsg] = useState(null);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].nombre);
    }
  }, [categories, activeCategory]);

  const displayCategories = categories.length > 0 
    ? categories 
    : [
        { nombre: 'SALA TÉRMICA', grupo_id: 'SALA TÉRMICA' }, 
        { nombre: 'LIMPIEZA', grupo_id: 'LIMPIEZA' }, 
        { nombre: 'ARCO DE DESINFECCIÓN', grupo_id: 'ARCO DE DESINFECCIÓN' }
      ];

  const getImage = (nombre) => {
    const n = nombre.toUpperCase();
    if (n.includes('QUEMADOR')) return 'burner_3d.png';
    if (n.includes('CALDERA')) return 'boiler_3d.png';
    if (n.includes('COLECTOR') || n.includes('RACK')) return 'collector_3d.png';
    if (n.includes('DESGAS')) return 'degasser_3d.png';
    if (n.includes('TRIPLEX')) return 'softener_triplex_3d.png';
    if (n.includes('DESCALC') || n.includes('DUPLEX')) return 'softener_3d.png';
    if (n.includes('INTERCAMBIADOR') || n.includes('INTERCAMB') || n.includes('TÉRMICO') || n.includes('TERMICO')) return 'heat_exchanger_3d.png';
    if (n.includes('DEPÓSITO') || n.includes('DEPOSITO') || n.includes('TANQUE') || n.includes('BOTELLA') || n.includes('ACUMULADOR')) return 'tanks_3d.png';
    if (n.includes('ARCO') || n.includes('LAVADERO') || n.includes('LIMPIEZA') || n.includes('ZPR45') || n.includes('SATÉLITE')) return 'chemical_3d.png';
    return 'boiler_3d.png';
  };

  const getGrupo = (eq) => {
    if (!eq) return 'Otros';
    const n = (eq.nombre || '').toUpperCase();
    const s = (eq.sistema || '').toUpperCase();
    
    // 1. PRIORIDAD: DESGASIFICADOR
    if (n.includes('DESGASIFICADOR')) {
       const match = displayCategories.find(g => g.nombre.toUpperCase().includes('DESGAS') || (g.grupo_id && g.grupo_id.toUpperCase().includes('DESGAS')));
       return match ? match.nombre : 'DESGASIFICADOR';
    }

    // 2. PRIORIDAD: TRATAMIENTO DE AGUA (Descalcificadores)
    if (n.includes('DESCALC') || n.includes('SUAVIZADOR') || n.includes('TRIPLEX') || s.includes('AGUA')) {
       const match = displayCategories.find(g => g.nombre.toUpperCase().includes('DESCALC') || (g.grupo_id && g.grupo_id.toUpperCase().includes('DESCALC')));
       return match ? match.nombre : 'DESCALCIFICADORES';
    }

    // 3. PRIORIDAD: GRUPO TÉRMICO (Intercambiadores)
    if (s.includes('TÉRMICO') || s.includes('TERMICO') || n.includes('INTERCAMB') || n.includes('TÉRMICO') || n.includes('TERMICO')) {
       const match = displayCategories.find(g => g.nombre.toUpperCase().includes('TÉRMICO') || g.nombre.toUpperCase().includes('TERMICO') || (g.grupo_id && g.grupo_id.toUpperCase().includes('TERM')));
       return match ? match.nombre : 'GRUPO TÉRMICO';
    }

    // 4. PRIORIDAD: CALDERAS Y QUEMADORES (Generación)
    if (n.includes('CALDERA') || n.includes('QUEMADOR') || s.includes('GENERACIÓN')) {
       const match = displayCategories.find(g => g.nombre.toUpperCase().includes('CALDERA') || (g.grupo_id && g.grupo_id.toUpperCase().includes('CALDERA')));
       return match ? match.nombre : 'CALDERAS';
    }
    
    // 5. PRIORIDAD: LIMPIEZA
    if (s.includes('LIMPIEZA') || n.includes('LAVADERO') || n.includes('ARCO') || n.includes('SATÉLITE') || n.includes('ZPR45')) {
       const match = displayCategories.find(g => g.nombre.toUpperCase().includes('LIMPIEZA') || (g.grupo_id && g.grupo_id.toUpperCase().includes('LIMPIEZA')));
       return match ? match.nombre : 'LIMPIEZA';
    }

    // Fallback exacto o genérico
    const matchGeneric = displayCategories.find(g => {
      const gName = (g.nombre || '').toUpperCase();
      const gId = (g.grupo_id || '').toUpperCase();
      return (s === gId || s === gName || n.includes(gName) || n.includes(gId));
    });
    
    return matchGeneric ? matchGeneric.nombre : displayCategories[0].nombre;
  };

  const filteredEquipos = equipos
    .filter(eq => getGrupo(eq) === activeCategory)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true }));

  const statusLEDs = {
    'Operativo': 'bg-[#00FF88]',
    'Operativa': 'bg-[#00FF88]',
    'Alarma': 'bg-[#FF6B00]',
    'Crítico': 'bg-[#FF0044]',
  };

  return (
    <div className="animate-in fade-in duration-300 flex flex-col h-full relative">
      {saveMsg && (
        <div className="fixed top-20 right-10 bg-primary text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-right duration-300 z-50 shadow-xl">
          {saveMsg}
        </div>
      )}
      {/* Pestañas de categorías dinámicas */}
      <div className="flex border-b border-[#222] mb-5 overflow-x-auto no-scrollbar px-1">
        {displayCategories.map((cat) => (
          <button
            key={cat.id || cat.nombre}
            onClick={() => setActiveCategory(cat.nombre)}
            className={`whitespace-nowrap px-6 py-3 text-[10px] font-black tracking-[0.2em] relative transition-all ${
              activeCategory === cat.nombre ? 'text-[#FF6B00]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {cat.nombre}
            {activeCategory === cat.nombre && (
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
                  <input 
                    className="bg-transparent border-none text-white text-[12px] font-black uppercase tracking-wide focus:ring-0 p-0 w-full"
                    defaultValue={eq.nombre}
                    onBlur={async (e) => {
                      const { error } = await supabase.from('equipos').update({ nombre: e.target.value }).eq('id', eq.id);
                      if (!error) {
                        setSaveMsg('Equipo actualizado');
                        setTimeout(() => setSaveMsg(null), 2000);
                      }
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${statusLEDs[eq.estado] || 'bg-gray-700'} ${eq.estado !== 'Operativo' && eq.estado !== 'Operativa' ? 'animate-pulse' : ''}`}></div>
                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{eq.estado}</p>
                   <span className="text-[#333] text-[10px]">•</span>
                   <p className="text-[9px] font-medium text-gray-600 uppercase tracking-tight">{eq.sistema || 'General'}</p>
                </div>
              </div>

              {/* ID y Flecha Derecha */}
              <div className="flex flex-col items-end justify-between h-14 pl-4 border-l border-[#222]">
                <input 
                  className="bg-[#0A0A0A] border border-[#222] text-[8px] font-black text-gray-500 px-1.5 py-0.5 rounded tracking-widest uppercase text-right w-20 outline-none focus:border-primary/50"
                  defaultValue={eq.id_tecnico}
                  onBlur={async (e) => {
                    const { error } = await supabase.from('equipos').update({ id_tecnico: e.target.value }).eq('id', eq.id);
                    if (!error) {
                      setSaveMsg('ID Técnico actualizado');
                      setTimeout(() => setSaveMsg(null), 2000);
                    }
                  }}
                />
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
