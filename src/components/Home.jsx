import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Activity, Bell, AlertTriangle } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Home = ({ setActiveTab, equipos = [], ordenes = [], planMantenimiento = [], groups = [], refreshData }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const safeOrdenes = Array.isArray(ordenes) ? ordenes : [];
  const safePlan = Array.isArray(planMantenimiento) ? planMantenimiento : [];
  const safeEquipos = Array.isArray(equipos) ? equipos : [];

  // FILTRO INDUSTRIAL REVISADO (Mapeo de Equipos a Grupos SaaS)
  const getGrupoId = (eq) => {
    if (!eq) return 'Otros';
    const n = (eq.nombre || '').toUpperCase();
    const s = (eq.sistema || '').toUpperCase();
    
    // 1. Mapeo por palabras clave (Prioridad Alta)
    
    // PRIORIDAD 1: DESGASIFICADOR (Debe ir a su grupo, no a Calderas)
    if (n.includes('DESGASIFICADOR')) {
       const match = groups.find(g => g.nombre.toUpperCase().includes('DESGAS') || g.grupo_id.toUpperCase().includes('DESGAS'));
       return match ? (match.grupo_id || match.nombre) : 'Desgasificador';
    }

    // PRIORIDAD 2: CALDERAS Y QUEMADORES
    if (n.includes('CALDERA') || n.includes('QUEMADOR') || s.includes('GENERACIÓN')) {
       const match = groups.find(g => g.nombre.toUpperCase().includes('CALDERA') || g.grupo_id.toUpperCase().includes('CALDERA'));
       return match ? (match.grupo_id || match.nombre) : 'Calderas';
    }
    
    // PRIORIDAD 3: GRUPO TÉRMICO
    if (s.includes('TÉRMICO') || s.includes('TERMICO') || n.includes('INTERCAMB')) {
       const match = groups.find(g => g.nombre.toUpperCase().includes('TÉRMICO') || g.nombre.toUpperCase().includes('TERMICO') || g.grupo_id.toUpperCase().includes('TERM'));
       return match ? (match.grupo_id || match.nombre) : 'Grupo Térmico';
    }

    // PRIORIDAD 4: LIMPIEZA
    if (s.includes('LIMPIEZA') || n.includes('LAVADERO') || n.includes('ARCO') || n.includes('SATÉLITE') || n.includes('ZPR45')) {
       const match = groups.find(g => g.nombre.toUpperCase().includes('LIMPIEZA') || g.grupo_id.toUpperCase().includes('LIMPIEZA'));
       return match ? (match.grupo_id || match.nombre) : 'Limpieza';
    }

    // PRIORIDAD 5: TRATAMIENTO DE AGUA
    if (s.includes('AGUA') || n.includes('DESCALC')) {
       const match = groups.find(g => g.nombre.toUpperCase().includes('DESCALC') || g.grupo_id.toUpperCase().includes('DESCALC'));
       return match ? (match.grupo_id || match.nombre) : 'Descalcificadores';
    }

    // 2. Búsqueda genérica por nombre de grupo o sistema en la base de datos
    const matchGeneric = groups.find(g => {
      const gName = (g.nombre || '').toUpperCase();
      const gId = (g.grupo_id || '').toUpperCase();
      return (s === gId || s === gName || n.includes(gName) || n.includes(gId));
    });
    
    return matchGeneric ? (matchGeneric.grupo_id || matchGeneric.nombre) : 'Otros';
  };

  const getGroupName = (gid) => {
    const match = groups.find(g => (g.grupo_id === gid || g.nombre === gid));
    return match ? match.nombre : gid;
  };

  const getImage = (nombre = '') => {
    const n = nombre.toUpperCase();
    if (n.includes('QUEMADOR')) return 'burner_3d.png';
    if (n.includes('CALDERA')) return 'boiler_3d.png';
    if (n.includes('COLECTOR')) return 'collector_3d.png';
    if (n.includes('DESGAS')) return 'degasser_3d.png';
    if (n.includes('TRIPLEX')) return 'softener_triplex_3d.png';
    if (n.includes('DESCALC') || n.includes('SUAVIZADOR')) return 'softener_3d.png';
    if (n.includes('INTERCAMB') || n.includes('TÉRMICO') || n.includes('TERMICO')) return 'heat_exchanger_3d.png';
    if (n.includes('DEPÓSITO') || n.includes('DEPOSITO') || n.includes('TANQUE') || n.includes('BOTELLA') || n.includes('ACUMULADOR')) return 'tanks_3d.png';
    if (n.includes('ARCO') || n.includes('LAVADERO') || n.includes('LIMPIEZA') || n.includes('ZPR45')) return 'chemical_3d.png';
    return 'boiler_3d.png';
  };

  const getGroupStatus = (gid) => {
    const inGroup = safeEquipos.filter(eq => getGrupoId(eq) === gid);
    if (safeOrdenes.some(o => inGroup.some(eq => eq.id === o.equipo_id) && o.estado !== 'Finalizada' && o.prioridad === 'Urgente')) return 'Crítico';
    return safeOrdenes.some(o => inGroup.some(eq => eq.id === o.equipo_id) && o.estado !== 'Finalizada') ? 'Alarma' : 'Operativo';
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      {/* STATS */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Órdenes Abiertas', val: safeOrdenes.filter(o => o.estado === 'Abierta').length, color: 'text-white' },
          { label: 'En Proceso', val: safeOrdenes.filter(o => o.estado === 'En Proceso').length, color: 'text-primary' },
          { label: 'Urgentes', val: safeOrdenes.filter(o => o.estado !== 'Finalizada' && o.prioridad === 'Urgente').length, color: 'text-red-500' },
          { label: 'Finalizadas', val: safeOrdenes.filter(o => o.estado === 'Finalizada').length, color: 'text-[#00FF88]' }
        ].map((s, i) => (
          <div key={i} className="flex flex-col gap-1 border-l border-white/5 pl-4">
             <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.2em]">{s.label}</span>
             <span className={`text-2xl font-black ${s.color}`}>{s.val}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.5em] flex items-center gap-3">
               <div className="w-1.5 h-3 bg-primary shadow-[0_0_15px_var(--primary-color)]"></div>
               {selectedGroup ? `SISTEMA: ${getGroupName(selectedGroup)}` : 'MONITOR DE PLANTA'}
            </h3>
            {selectedGroup && (
              <button onClick={() => setSelectedGroup(null)} className="text-[9px] font-black text-primary border border-primary/20 px-5 py-2 rounded-xl hover:bg-primary hover:text-black transition-all uppercase tracking-widest">
                ‹ Volver
              </button>
            )}
          </div>

          {!selectedGroup ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {groups.map(g => {
                const gid = g.grupo_id || g.nombre;
                const status = getGroupStatus(gid);
                return (
                  <div key={g.id} onClick={() => setSelectedGroup(gid)} className="p-6 bg-transparent hover:bg-white/[0.03] transition-all cursor-pointer flex flex-col items-center gap-6 relative group h-[200px] justify-center rounded-3xl">
                     <div className={`absolute top-6 right-6 w-2 h-2 rounded-full ${status === 'Operativo' ? 'bg-[#00FF88] shadow-[0_0_15px_#00FF88]' : 'bg-red-500 shadow-[0_0_15px_#EF4444] animate-pulse'}`}></div>
                     <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <img src={`/${g.image}`} className="h-32 w-32 object-contain brightness-125 contrast-125 mix-blend-screen drop-shadow-[0_0_30px_rgba(255,107,0,0.2)] group-hover:scale-110 transition-all duration-700 relative z-10" alt="" />
                     </div>
                     <span className="text-[11px] font-black uppercase text-white tracking-[0.3em] group-hover:text-primary transition-colors mt-2">{g.nombre}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-6 duration-500">
              {safeEquipos
                .filter(eq => getGrupoId(eq).toLowerCase() === selectedGroup.toLowerCase())
                .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
                .map(eq => (
                <div key={eq.id} className="p-6 border border-white/5 bg-transparent flex flex-col items-center gap-6 group hover:border-primary/40 transition-all rounded-3xl">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img src={`/${getImage(eq.nombre)}`} className="h-24 w-24 object-contain brightness-150 contrast-125 mix-blend-screen drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-all" alt="" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-center text-white/80 line-clamp-2 leading-tight tracking-tighter group-hover:text-white">{eq.nombre}</span>
                </div>
              ))}
              {safeEquipos.filter(eq => getGrupoId(eq).toLowerCase() === selectedGroup.toLowerCase()).length === 0 && (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center gap-6">
                   <AlertTriangle className="text-gray-800 w-12 h-12" />
                   <p className="text-[11px] font-black text-gray-700 uppercase tracking-[0.5em]">No hay unidades en este sector</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* HITOS */}
        <div className="space-y-10">
           <h3 className="text-[11px] font-black text-white uppercase tracking-[0.5em] flex items-center gap-3">
               <div className="w-1.5 h-3 bg-blue-500 shadow-[0_0_15px_#3B82F6]"></div>
               HITOS
            </h3>
            <div className="flex flex-col gap-8 border-l border-white/10 pl-6">
              {safePlan.filter(p => p.tipo?.toUpperCase().includes('REGLAMENTARIO') || p.prioridad === 'Alta').slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">{item.tarea}</span>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] text-gray-500 font-bold uppercase">{item.equipos?.nombre || 'PLANTA'}</span>
                    <span className="text-[10px] font-black text-white/60">{item.proxima_fecha ? new Date(item.proxima_fecha).toLocaleDateString() : '--'}</span>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </div>

      {/* TELEMETRÍA SCADA */}
      <div className="mt-20 border-t border-white/5 pt-12">
           <div className="flex justify-between items-center mb-12">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.5em] flex items-center gap-3">
                <div className="w-1.5 h-3 bg-primary shadow-[0_0_15px_var(--primary-color)]"></div>
                TELEMETRÍA SCADA
              </h3>
              <div className="flex gap-16">
                 <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-gray-500 uppercase mb-2 tracking-[0.3em]">Temp. Vapor</span>
                    <span className="text-3xl font-black text-white tracking-tighter italic">184.2 <span className="text-xs text-gray-700 not-italic">°C</span></span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-gray-600 uppercase mb-2 tracking-[0.3em]">Presión Red</span>
                    <span className="text-3xl font-black text-primary tracking-tighter italic shadow-primary/20 drop-shadow-lg">10.1 <span className="text-xs text-primary/40 not-italic">BAR</span></span>
                 </div>
              </div>
           </div>
           <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{t:'00h',v:182},{t:'08h',v:190},{t:'16h',v:184},{t:'24h',v:183}]}>
                  <defs><linearGradient id="scadaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.1}/><stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                  <XAxis dataKey="t" tick={{fill:'#333',fontSize:10,fontWeight:900}} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Area type="monotone" dataKey="v" stroke="var(--primary-color)" fill="url(#scadaGradient)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
      </div>
    </div>
  );
};

export default Home;
