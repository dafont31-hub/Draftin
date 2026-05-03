import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { generateOrderReport } from '../services/reportService';
import { Activity, Bell, AlertTriangle } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const Home = ({ setActiveTab, equipos = [], ordenes = [], planMantenimiento = [], groups = [], refreshData }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const safeOrdenes = Array.isArray(ordenes) ? ordenes : [];
  const safePlan = Array.isArray(planMantenimiento) ? planMantenimiento : [];
  const safeEquipos = Array.isArray(equipos) ? equipos : [];

  const upcomingMaintenance = [
    ...safePlan.filter(item => {
      if (!item.fecha_proxima) return false;
      const today = new Date();
      const itemDate = new Date(item.fecha_proxima);
      return itemDate >= today || itemDate.toLocaleDateString() === today.toLocaleDateString();
    }).map(m => ({ ...m, isPlan: true, date: m.fecha_proxima })),
    ...safeOrdenes.filter(o => 
      o.estado !== 'Finalizada' && (
        o.tipo === 'Auditoría' || 
        o.tipo === 'Inspección' || 
        (o.titulo || '').toLowerCase().includes('inspección')
      )
    ).map(o => ({ ...o, isOrder: true, date: o.fecha_programada || o.created_at }))
  ]
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(0, 8);

  // FILTRO INDUSTRIAL REVISADO (Mapeo de Equipos a Grupos SaaS)
  const getGrupoId = (eq) => {
    if (!eq) return 'Otros';
    const n = (eq.nombre || '').toUpperCase();
    const s = (eq.sistema || '').toUpperCase();
    
    // 1. PRIORIDAD: DESGASIFICADOR (Independiente del sistema)
    if (n.includes('DESGASIFICADOR')) {
       const match = groups.find(g => g.nombre.toUpperCase().includes('DESGAS') || g.grupo_id.toUpperCase().includes('DESGAS'));
       return match ? (match.grupo_id || match.nombre) : 'Desgasificador';
    }

    // 2. PRIORIDAD: TRATAMIENTO DE AGUA (Descalcificadores)
    if (n.includes('DESCALC') || n.includes('SUAVIZADOR') || n.includes('TRIPLEX') || s.includes('AGUA')) {
       const match = groups.find(g => g.nombre.toUpperCase().includes('DESCALC') || g.grupo_id.toUpperCase().includes('DESCALC'));
       return match ? (match.grupo_id || match.nombre) : 'Descalcificadores';
    }

    // 3. PRIORIDAD: GRUPO TÉRMICO (Intercambiadores)
    if (s.includes('TÉRMICO') || s.includes('TERMICO') || n.includes('INTERCAMB') || n.includes('TÉRMICO') || n.includes('TERMICO')) {
       const match = groups.find(g => g.nombre.toUpperCase().includes('TÉRMICO') || g.nombre.toUpperCase().includes('TERMICO') || g.grupo_id.toUpperCase().includes('TERM'));
       return match ? (match.grupo_id || match.nombre) : 'Grupo Térmico';
    }

    // 4. PRIORIDAD: CALDERAS Y QUEMADORES (Generación)
    if (n.includes('CALDERA') || n.includes('QUEMADOR') || s.includes('GENERACIÓN')) {
       const match = groups.find(g => g.nombre.toUpperCase().includes('CALDERA') || g.grupo_id.toUpperCase().includes('CALDERA'));
       return match ? (match.grupo_id || match.nombre) : 'Calderas';
    }
    
    // 5. PRIORIDAD: LIMPIEZA
    if (s.includes('LIMPIEZA') || n.includes('LAVADERO') || n.includes('ARCO') || n.includes('SATÉLITE') || n.includes('ZPR45')) {
       const match = groups.find(g => g.nombre.toUpperCase().includes('LIMPIEZA') || g.grupo_id.toUpperCase().includes('LIMPIEZA'));
       return match ? (match.grupo_id || match.nombre) : 'Limpieza';
    }

    // 6. Búsqueda genérica final
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
    if (n.includes('RACK')) return 'chemical_3d.png'; 
    if (n.includes('COLECTOR')) return 'collector_3d.png';
    if (n.includes('DESGAS')) return 'degasser_3d.png';
    if (n.includes('TRIPLEX')) return 'softener_triplex_3d.png';
    if (n.includes('DESCALC') || n.includes('SUAVIZADOR') || n.includes('DUPLEX')) return 'softener_3d.png';
    if (n.includes('INTERCAMB') || n.includes('TÉRMICO') || n.includes('TERMICO')) return 'heat_exchanger_3d.png';
    if (n.includes('DEPÓSITO') || n.includes('DEPOSITO') || n.includes('TANQUE') || n.includes('BOTELLA') || n.includes('ACUMULADOR')) return 'tanks_3d.png';
    if (n.includes('ARCO') || n.includes('LAVADERO') || n.includes('LIMPIEZA') || n.includes('ZPR45') || n.includes('SATÉLITE')) return 'chemical_3d.png';
    return 'boiler_3d.png';
  };

  const getGroupStatus = (gid) => {
    const inGroup = safeEquipos.filter(eq => getGrupoId(eq) === gid);
    if (safeOrdenes.some(o => inGroup.some(eq => eq.id === o.equipo_id) && o.estado !== 'Finalizada' && o.prioridad === 'Urgente')) return 'Crítico';
    return safeOrdenes.some(o => inGroup.some(eq => eq.id === o.equipo_id) && o.estado !== 'Finalizada') ? 'Alarma' : 'Operativo';
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10 relative">
      {/* STATS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Órdenes Abiertas', val: 0, color: 'text-white' },
          { label: 'En Proceso', val: 0, color: 'text-primary' },
          { label: 'Urgentes', val: 0, color: 'text-red-500' },
          { label: 'Finalizadas', val: 0, color: 'text-[#00FF88]' }
        ].map((s, i) => (
          <div key={i} className="flex flex-col gap-0.5 border-l border-white/5 pl-3">
             <span className="text-[6px] font-black text-white/30 uppercase tracking-[0.2em]">{s.label}</span>
             <span className={`text-xl font-black ${s.color} tracking-tighter`}>{s.val}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center justify-between h-10 mb-6">
            <h3 className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] flex items-center gap-3 italic">
                <div className="w-1.5 h-3 bg-primary shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.5)]"></div>
                Estado de los Sectores
            </h3>
            <div className="flex gap-2">
              {selectedGroup && (
                <button onClick={() => setSelectedGroup(null)} className="text-[8px] font-black text-primary border border-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-all uppercase tracking-widest">
                  ‹ Volver
                </button>
              )}
            </div>
          </div>

          {!selectedGroup ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
              {groups.sort((a, b) => a.orden - b.orden).map((g, idx) => {
                const gid = g.grupo_id || g.nombre;
                const status = getGroupStatus(gid);
                
                return (
                  <div 
                    key={g.id} 
                    onClick={() => setSelectedGroup(gid)} 
                    className="aspect-square bg-white/[0.03] border border-white/5 backdrop-blur-md hover:bg-white/[0.07] transition-all flex flex-col items-center gap-1.5 relative group justify-center rounded-[8px] shadow-lg p-2 cursor-pointer"
                  >
                     <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${status === 'Operativo' ? 'bg-[#00FF88] shadow-[0_0_10px_#00FF88]' : 'bg-red-500 shadow-[0_0_10px_#EF4444] animate-pulse'}`}></div>

                     <div className="relative w-[85%] h-[85%] flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/20 blur-[20px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <img 
                          src={`/${g.imagen || g.image}`} 
                          className="w-full h-full object-contain mix-blend-screen group-hover:scale-110 transition-all duration-1000 relative z-10"
                          style={{ 
                            filter: 'brightness(1.6) contrast(1.2)',
                            maskImage: 'radial-gradient(circle, black 50%, transparent 95%)',
                            WebkitMaskImage: 'radial-gradient(circle, black 50%, transparent 95%)'
                          }} 
                          alt="" 
                        />
                     </div>
                     <span className="text-[7px] font-black uppercase text-white/40 tracking-tighter group-hover:text-primary transition-colors text-center px-0.5 line-clamp-1">{g.nombre}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 animate-in slide-in-from-bottom-6 duration-500">
                {safeEquipos
                  .filter(eq => getGrupoId(eq).toLowerCase() === selectedGroup.toLowerCase())
                  .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
                  .map(eq => (
                  <div key={eq.id} className="aspect-square bg-white/[0.01] border border-white/5 backdrop-blur-sm flex flex-col items-center gap-1.5 group hover:border-primary/30 transition-all rounded-[6px] relative overflow-hidden shadow-md justify-center p-1.5">
                    <div className="relative w-[80%] h-[80%] flex items-center justify-center">
                      <div className="absolute inset-0 bg-primary/5 blur-[10px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <img 
                        src={`/${getImage(eq.nombre)}`} 
                        className="w-full h-full object-contain mix-blend-screen group-hover:scale-110 transition-all duration-700"
                        style={{ 
                          filter: `brightness(1.5) contrast(1.3) ${(eq.nombre || '').toUpperCase().includes('RACK') ? 'grayscale(1) contrast(1.5)' : ''}`,
                          maskImage: 'radial-gradient(circle, black 40%, transparent 90%)',
                          WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 90%)'
                        }} 
                        alt="" 
                      />
                    </div>
                    <span className="text-[6px] font-black uppercase text-center text-white/20 line-clamp-1 leading-tight tracking-tighter group-hover:text-white transition-colors z-10 px-0.5">{eq.nombre}</span>
                  </div>
                ))}
              </div>
              {safeEquipos.filter(eq => getGrupoId(eq).toLowerCase() === selectedGroup.toLowerCase()).length === 0 && (
                <div className="col-span-full py-12 text-center border border-dashed border-white/5 rounded-[24px] flex flex-col items-center gap-4">
                   <AlertTriangle className="text-white/10 w-8 h-8" />
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">No hay unidades en este sector</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* CALENDARIO LATERAL */}
        <div className="flex-1 min-w-0 space-y-6">
           <div className="flex items-center h-10">
              <h3 className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] flex items-center gap-3">
                  <div className="w-1.5 h-3 bg-blue-500 shadow-[0_0_15px_#3B82F6]"></div>
                  REVISIONES E INSPECCIONES
               </h3>
           </div>
           
           {/* CONTADOR DE DÍAS PARA INSPECCIÓN OFICIAL */}
           {(() => {
             const nextReg = safePlan
               .filter(p => p.tipo?.toUpperCase() === 'REGLAMENTARIO')
               .sort((a, b) => new Date(a.proxima_fecha) - new Date(b.proxima_fecha))[0];
             
             if (!nextReg) return null;
             
             const days = Math.ceil((new Date(nextReg.proxima_fecha) - new Date()) / (1000 * 60 * 60 * 24));
             const isUrgent = days <= 30;

             return (
               <div className={`mb-6 p-4 rounded-xl border ${isUrgent ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'} animate-pulse`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${isUrgent ? 'text-red-500' : 'text-blue-400'}`}>Plazo Legal Inspección</span>
                    <span className="text-[10px] font-black text-white">{days} DÍAS</span>
                  </div>
                  <h4 className="text-[11px] font-bold text-white uppercase leading-tight mb-1">{nextReg.tarea}</h4>
                  <p className="text-[8px] text-gray-500 font-bold uppercase">
                    {safeEquipos.find(e => e.id === nextReg.equipo_id)?.nombre || 'EQUIPO PRINCIPAL'}
                  </p>
               </div>
             );
           })()}

            <div className="flex flex-col gap-4 border-l border-white/5 pl-4">
              {upcomingMaintenance.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => item.isOrder && generateOrderReport(item, safeEquipos)}
                  className={`flex flex-col gap-1 group transition-all p-1.5 rounded-lg ${item.isOrder ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}`}
                  title={item.isOrder ? "Descargar Acta PDF" : ""}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${item.isOrder ? 'bg-orange-500 animate-pulse' : 'bg-blue-400'}`}></div>
                    <span className={`text-[8px] font-black uppercase tracking-widest leading-none transition-colors line-clamp-1 ${item.isOrder ? 'text-white' : 'text-blue-400/80 group-hover:text-blue-400'}`}>
                      {item.isOrder ? item.titulo : item.tarea}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[6px] text-white/10 font-bold uppercase group-hover:text-white/30 transition-colors">
                      {item.isOrder 
                        ? (safeEquipos.find(e => e.id === item.equipo_id)?.nombre || 'PLANTA')
                        : (safeEquipos.find(e => e.id === item.equipo_id)?.nombre || 'PLANTA')
                      }
                    </span>
                    <span className="text-[8px] font-black text-white/20 group-hover:text-white/60 transition-colors">
                      {item.date ? new Date(item.date).toLocaleDateString() : '--'}
                    </span>
                  </div>
                  {item.isOrder && (
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-[6px] font-black text-orange-500/50 uppercase tracking-[0.2em]">{item.estado}</span>
                      <span className="text-[5px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase italic">Descargar PDF ›</span>
                    </div>
                  )}
                </div>
              ))}
              {upcomingMaintenance.length === 0 && (
                <span className="text-[7px] font-black text-white/10 uppercase tracking-widest">No hay hitos programados</span>
              )}
            </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: CONSUMOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-white/5">
        {/* CONSUMO GAS */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col h-[220px] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF6B00]/40 to-transparent"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">TELEMETRÍA: CONSUMO GAS</span>
              <div className="text-3xl font-black text-white tracking-tighter flex items-baseline gap-2">
                0 <span className="text-[12px] text-white/30 font-medium uppercase">m³/h</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
               <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse shadow-[0_0_10px_#FF6B00]"></div>
               <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">Live SCADA</span>
            </div>
          </div>
            <div className="w-full h-[140px] -ml-4">
              {chartReady && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
                  <AreaChart data={[
                    {h:'00:00',v:0},{h:'04:00',v:0},{h:'08:00',v:0},{h:'12:00',v:0},
                    {h:'16:00',v:0},{h:'20:00',v:0},{h:'24:00',v:0}
                  ]}>
                    <defs>
                      <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#FF6B00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="h" 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={8} 
                      tickLine={false} 
                      axisLine={false}
                      tick={{fill: 'rgba(255,255,255,0.3)', fontWeight: 800}}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={8} 
                      tickLine={false} 
                      axisLine={false}
                      tick={{fill: 'rgba(255,255,255,0.3)', fontWeight: 800}}
                      domain={[0, 1500]}
                    />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px'}}
                      itemStyle={{color: '#FF6B00'}}
                    />
                    <Area type="monotone" dataKey="v" stroke="#FF6B00" strokeWidth={3} fill="url(#gasGradient)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
        </div>

        {/* CONSUMO AGUA */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col h-[220px] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">TELEMETRÍA: CONSUMO AGUA</span>
              <div className="text-3xl font-black text-primary tracking-tighter flex items-baseline gap-2">
                0 <span className="text-[12px] text-primary/40 font-medium uppercase">m³/h</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#FF6B00]"></div>
               <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">Active Link</span>
            </div>
          </div>
            <div className="w-full h-[140px] -ml-4">
              {chartReady && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
                  <AreaChart data={[
                    {h:'00:00',v:0},{h:'04:00',v:0},{h:'08:00',v:0},{h:'12:00',v:0},
                    {h:'16:00',v:0},{h:'20:00',v:0},{h:'24:00',v:0}
                  ]}>
                    <defs>
                      <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary-color)" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="var(--primary-color)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="h" 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={8} 
                      tickLine={false} 
                      axisLine={false}
                      tick={{fill: 'rgba(255,255,255,0.3)', fontWeight: 800}}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={8} 
                      tickLine={false} 
                      axisLine={false}
                      tick={{fill: 'rgba(255,255,255,0.3)', fontWeight: 800}}
                      domain={[0, 600]}
                    />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px'}}
                      itemStyle={{color: 'var(--primary-color)'}}
                    />
                    <Area type="monotone" dataKey="v" stroke="var(--primary-color)" strokeWidth={3} fill="url(#waterGradient)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
