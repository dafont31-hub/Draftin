import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Activity, AlertTriangle, ClipboardList, Zap, ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import { aiService } from '../services/aiService';

const AIInsightCard = ({ otsCount, equipos = [] }) => {
  const [insight, setInsight] = useState('Analizando estado de la planta...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const getInsight = async () => {
      try {
        // Resumen técnico real para la IA
        const systems = [...new Set(equipos.map(e => e.sistema))].filter(Boolean).slice(0, 5).join(', ');
        const activeOTs = Array.isArray(safeOrdenes) ? safeOrdenes.filter(o => o.estado !== 'Finalizada').map(o => o.titulo).slice(0, 3).join(', ') : '';
        
        const text = await aiService.chat([
          { role: 'user', content: `Supervisor de Litera Meat. Sistemas: ${systems}. OTs urgentes: ${activeOTs}. Dame un insight técnico MUY corto y práctico. Nada de teorías genéricas. Usa un emoji.` }
        ], { ots: otsCount, equipos: systems });
        
        if (isMounted) setInsight(text);
      } catch (e) { 
        if (isMounted) setInsight('¡Listo para optimizar la planta! ⚙️'); 
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    getInsight();
    return () => { isMounted = false; };
  }, [otsCount, equipos.length]);

  return (
    <div className="bg-purple-600/5 border border-purple-500/20 rounded-3xl p-6 mb-8 flex items-center gap-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
      <div className={`w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.2)] ${loading ? 'animate-pulse' : ''}`}>
        <Zap size={28} />
      </div>
      <div className="flex-1">
        <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1 italic">Antigravity Insight</h4>
        <p className="text-[13px] text-gray-200 font-bold leading-relaxed">
          {insight}
        </p>
      </div>
    </div>
  );
};

const Home = ({ t, setActiveTab, equipos = [], ordenes = [], planMantenimiento = [], groups = [], refreshData }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const safeOrdenes = Array.isArray(ordenes) ? ordenes : [];
  const safePlan = Array.isArray(planMantenimiento) ? planMantenimiento : [];
  const safeEquipos = Array.isArray(equipos) ? equipos : [];

  const upcomingMaintenance = [
    ...safePlan.filter(item => {
      if (!item.proxima_fecha) return false;
      const today = new Date();
      const itemDate = new Date(item.proxima_fecha);
      return itemDate >= today || itemDate.toLocaleDateString() === today.toLocaleDateString();
    }).map(m => ({ ...m, isPlan: true, date: m.proxima_fecha })),
    ...safeOrdenes.filter(o =>
      o.estado !== 'Finalizada' && (
        o.tipo === 'Auditoría' ||
        o.tipo === 'Inspección' ||
        (o.titulo || '').toLowerCase().includes('inspección')
      )
    ).map(o => ({ ...o, isOrder: true, date: o.fecha_programada || o.created_at }))
  ]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  const getGrupoId = (eq) => {
    if (!eq) return 'Otros';
    const n = (eq.nombre || '').toUpperCase();
    const s = (eq.sistema || '').toUpperCase();
    if (n.includes('DESGASIFICADOR')) {
      const match = groups.find(g => g.nombre.toUpperCase().includes('DESGAS') || g.grupo_id.toUpperCase().includes('DESGAS'));
      return match ? (match.grupo_id || match.nombre) : 'Desgasificador';
    }
    if (n.includes('DESCALC') || n.includes('SUAVIZADOR') || n.includes('TRIPLEX') || s.includes('AGUA')) {
      const match = groups.find(g => g.nombre.toUpperCase().includes('DESCALC') || g.grupo_id.toUpperCase().includes('DESCALC'));
      return match ? (match.grupo_id || match.nombre) : 'Descalcificadores';
    }
    if (s.includes('TÉRMICO') || s.includes('TERMICO') || n.includes('INTERCAMB') || n.includes('TÉRMICO') || n.includes('TERMICO')) {
      const match = groups.find(g => g.nombre.toUpperCase().includes('TÉRMICO') || g.nombre.toUpperCase().includes('TERMICO') || g.grupo_id.toUpperCase().includes('TERM'));
      return match ? (match.grupo_id || match.nombre) : 'Grupo Térmico';
    }
    if (n.includes('CALDERA') || n.includes('QUEMADOR') || s.includes('GENERACIÓN')) {
      const match = groups.find(g => g.nombre.toUpperCase().includes('CALDERA') || g.grupo_id.toUpperCase().includes('CALDERA'));
      return match ? (match.grupo_id || match.nombre) : 'Calderas';
    }
    if (s.includes('LIMPIEZA') || n.includes('LAVADERO') || n.includes('ARCO') || n.includes('SATÉLITE') || n.includes('ZPR45')) {
      const match = groups.find(g => g.nombre.toUpperCase().includes('LIMPIEZA') || g.grupo_id.toUpperCase().includes('LIMPIEZA'));
      return match ? (match.grupo_id || match.nombre) : 'Limpieza';
    }
    const matchGeneric = groups.find(g => {
      const gName = (g.nombre || '').toUpperCase();
      const gId = (g.grupo_id || '').toUpperCase();
      return (s === gId || s === gName || n.includes(gName) || n.includes(gId));
    });
    return matchGeneric ? (matchGeneric.grupo_id || matchGeneric.nombre) : 'Otros';
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
    if (safeOrdenes.some(o => inGroup.some(eq => eq.id === o.equipo_id) && o.estado !== 'Finalizada' && o.prioridad === 'Urgente')) return 'critical';
    return safeOrdenes.some(o => inGroup.some(eq => eq.id === o.equipo_id) && o.estado !== 'Finalizada') ? 'warning' : 'ok';
  };

  const stats = [
    {
      label: 'Órdenes Activas',
      val: safeOrdenes.filter(o => o.estado !== 'Finalizada').length,
      color: '#fff',
      accent: 'rgba(255,255,255,0.06)',
      icon: <ClipboardList size={20} />,
      sub: 'Total sin cerrar',
      onClick: () => setActiveTab('tareas'),
    },
    {
      label: 'En Ejecución',
      val: safeOrdenes.filter(o => o.estado === 'En Progreso').length,
      color: 'var(--primary)',
      accent: 'rgba(255,107,0,0.08)',
      icon: <Activity size={20} />,
      sub: 'En progreso ahora',
      onClick: () => setActiveTab('tareas'),
    },
    {
      label: 'Estado Crítico',
      val: safeOrdenes.filter(o => o.prioridad === 'Urgente' && o.estado !== 'Finalizada').length,
      color: '#EF4444',
      accent: 'rgba(239,68,68,0.08)',
      icon: <AlertTriangle size={20} />,
      sub: 'Urgencia alta',
      onClick: () => setActiveTab('tareas'),
    },
    {
      label: 'Eficiencia Mes',
      val: '94%',
      color: '#10B981',
      accent: 'rgba(16,185,129,0.08)',
      icon: <TrendingUp size={20} />,
      sub: 'vs 91% mes anterior',
      onClick: () => setActiveTab('analiticas'),
    },
  ];

  const nextReg = safePlan
    .filter(p => p.tipo?.toUpperCase() === 'REGLAMENTARIO')
    .sort((a, b) => new Date(a.proxima_fecha) - new Date(b.proxima_fecha))[0];
  const daysToInspection = nextReg
    ? Math.ceil((new Date(nextReg.proxima_fecha) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, animation: 'fade-in-up 0.5s ease' }}>
      <AIInsightCard otsCount={safeOrdenes.length} equipos={safeEquipos} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {stats.map((s, i) => (
          <button
            key={i}
            onClick={s.onClick}
            style={{
              background: s.accent,
              border: `1px solid rgba(255,255,255,0.07)`,
              borderRadius: 16,
              padding: '20px 22px',
              display: 'flex', flexDirection: 'column', gap: 12,
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.25s ease',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = `${s.color}30`; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4)` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${s.color}30, transparent)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</span>
              <div style={{ color: s.color, opacity: 0.7 }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.val}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontWeight: 500 }}>{s.sub}</span>
              <ArrowRight size={12} color={s.color} style={{ opacity: 0.5 }} />
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 3, height: 18, background: 'var(--primary)', borderRadius: 3, boxShadow: '0 0 12px rgba(255,107,0,0.5)' }} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}>
                {selectedGroup ? `Equipos — ${selectedGroup}` : t('estado_sectores') || 'Estado de Sectores'}
              </h3>
            </div>
            {selectedGroup && (
              <button
                onClick={() => setSelectedGroup(null)}
                style={{
                  fontSize: 12, fontWeight: 600, color: 'var(--primary)',
                  background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)',
                  padding: '4px 12px', borderRadius: 8, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                ← Volver
              </button>
            )}
          </div>

          {!selectedGroup ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 12 }}>
              {groups.sort((a, b) => a.orden - b.orden).map((g) => {
                const gid = g.grupo_id || g.nombre;
                const status = getGroupStatus(gid);
                const statusColor = status === 'ok' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444';
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroup(gid)}
                    style={{
                      aspectRatio: '1', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 8, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', padding: 12,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,107,0,0.25)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: '50%', background: statusColor, boxShadow: `0 0 10px ${statusColor}`, animation: status !== 'ok' ? 'pulse-glow 1.5s ease infinite' : 'none' }} />
                    <div style={{ position: 'relative', width: '75%', height: '75%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={`/${g.imagen || g.image}`} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'screen', filter: 'brightness(1.7) contrast(1.15)', maskImage: 'radial-gradient(circle, black 55%, transparent 95%)', WebkitMaskImage: 'radial-gradient(circle, black 55%, transparent 95%)', transition: 'transform 0.6s ease' }} alt="" />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{g.nombre}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10, animation: 'fade-in-up 0.35s ease' }}>
              {safeEquipos.filter(eq => getGrupoId(eq).toLowerCase() === selectedGroup.toLowerCase()).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '')).map(eq => (
                <div key={eq.id} style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, position: 'relative', overflow: 'hidden', transition: 'all 0.25s ease' }}>
                  <div style={{ width: '78%', height: '78%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={`/${getImage(eq.nombre)}`} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'screen', filter: 'brightness(1.5) contrast(1.2)', maskImage: 'radial-gradient(circle, black 45%, transparent 90%)', WebkitMaskImage: 'radial-gradient(circle, black 45%, transparent 90%)' }} alt="" />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', letterSpacing: '0.03em' }}>{eq.nombre}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {daysToInspection !== null && (
            <div style={{ background: daysToInspection <= 30 ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)', border: `1px solid ${daysToInspection <= 30 ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'}`, borderRadius: 16, padding: '18px 20px', animation: daysToInspection <= 30 ? 'pulse-glow 2s ease infinite' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: daysToInspection <= 30 ? '#EF4444' : '#3B82F6' }}>Plazo Legal</span>
                <div style={{ fontSize: 20, fontWeight: 800, color: daysToInspection <= 30 ? '#EF4444' : '#3B82F6', fontFamily: 'var(--font-mono)' }}>{daysToInspection}d</div>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.3, marginBottom: 4 }}>{nextReg.tarea}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{safeEquipos.find(e => e.id === nextReg.equipo_id)?.nombre || 'Equipo Principal'}</p>
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '20px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 3, height: 18, background: '#3B82F6', borderRadius: 3, boxShadow: '0 0 12px rgba(59,130,246,0.5)' }} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{t('revisiones_inspecciones') || 'Inspecciones'}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {upcomingMaintenance.map((item, idx) => (
                <div key={idx} style={{ padding: '12px 0', borderBottom: idx < upcomingMaintenance.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: item.isOrder ? 'var(--primary)' : '#3B82F6', boxShadow: item.isOrder ? '0 0 8px rgba(255,107,0,0.5)' : '0 0 8px rgba(59,130,246,0.5)' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3, flex: 1 }}>{item.isOrder ? item.titulo : item.tarea}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 14 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>{safeEquipos.find(e => e.id === item.equipo_id)?.nombre || 'Planta'}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{item.date ? new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '--'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
