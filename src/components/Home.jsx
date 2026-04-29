import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Home = ({ setActiveTab, equipos = [], ordenes = [], planMantenimiento = [], consumos = [], refreshData }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dataEquipos = equipos.length > 0 ? equipos : [
    { id: '00000000-0000-0000-0000-000000000001', nombre: 'CALDERA 1', id_tecnico: 'EQ-001' },
    { id: '00000000-0000-0000-0000-000000000002', nombre: 'CALDERA 2', id_tecnico: 'EQ-002' },
    { id: '00000000-0000-0000-0000-000000000003', nombre: 'QUEMADOR 1', id_tecnico: 'EQ-003' },
    { id: '00000000-0000-0000-0000-000000000004', nombre: 'QUEMADOR 2', id_tecnico: 'EQ-004' },
    { id: '00000000-0000-0000-0000-000000000005', nombre: 'INTERCAMBIADOR A', id_tecnico: 'EQ-INT-A' },
    { id: '00000000-0000-0000-0000-000000000006', nombre: 'INTERCAMBIADOR B', id_tecnico: 'EQ-INT-B' },
    { id: '00000000-0000-0000-0000-000000000007', nombre: 'INTERCAMBIADOR C', id_tecnico: 'EQ-INT-C' },
    { id: '00000000-0000-0000-0000-000000000008', nombre: 'INTERCAMBIADOR E', id_tecnico: 'EQ-INT-E' },
    { id: '00000000-0000-0000-0000-000000000009', nombre: 'DESGASIFICADOR', id_tecnico: 'EQ-009' },
    { id: '00000000-0000-0000-0000-000000000010', nombre: 'DESCALC. INT 1', id_tecnico: 'EQ-010' },
    { id: '00000000-0000-0000-0000-000000000011', nombre: 'DESCALC. INT 2', id_tecnico: 'EQ-011' },
    { id: '00000000-0000-0000-0000-000000000012', nombre: 'DESCALC. INT 3', id_tecnico: 'EQ-012' },
    { id: '00000000-0000-0000-0000-000000000013', nombre: 'DESCALC. INT 4', id_tecnico: 'EQ-013' },
    { id: '00000000-0000-0000-0000-000000000014', nombre: 'DESCALC. INT 5', id_tecnico: 'EQ-014' },
    { id: '00000000-0000-0000-0000-000000000015', nombre: 'DESCALC. INT 6', id_tecnico: 'EQ-015' },
    { id: '00000000-0000-0000-0000-000000000016', nombre: 'DESCALC. CAL 1', id_tecnico: 'EQ-016' },
    { id: '00000000-0000-0000-0000-000000000017', nombre: 'DESCALC. CAL 2', id_tecnico: 'EQ-017' },
  ];

  const getEquipmentStatus = (eqId) => {
    const openOrders = ordenes.filter(o => o.equipo_id === eqId && o.estado !== 'Finalizada');
    if (openOrders.length === 0) return 'Operativo';
    if (openOrders.some(o => o.prioridad === 'Urgente')) return 'Crítico';
    if (openOrders.some(o => o.prioridad === 'Grave')) return 'Alarma';
    return 'Alarma'; // Cualquier orden abierta dispara alarma
  };

  const stats = [
    { label: 'Órdenes abiertas', val: ordenes.filter(o => o.estado === 'Abierta').length, icon: <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
    { label: 'En Proceso', val: ordenes.filter(o => o.estado === 'En Proceso').length, icon: <svg className="w-3.5 h-3.5 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
    { label: 'Urgentes', val: ordenes.filter(o => o.estado !== 'Finalizada' && o.prioridad === 'Urgente').length, icon: <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
    { label: 'Completadas', val: ordenes.filter(o => o.estado === 'Finalizada').length, icon: <svg className="w-3.5 h-3.5 text-[#00FF88]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
  ];

  const statusLEDs = {
    'Operativo': 'bg-[#00FF88]',
    'Alarma': 'bg-[#FF6B00]',
    'Crítico': 'bg-[#FF0044]',
  };

  const getImage = (nombre) => {
    if (nombre.includes('CALDERA')) return 'boiler_3d.png';
    if (nombre.includes('QUEMADOR')) return 'burner_3d.png';
    if (nombre.includes('INTERCAMBIADOR')) return 'heat_exchanger_3d.png';
    if (nombre.includes('DESCALC')) return 'softener_3d.png';
    return 'degasser_3d.png'; // Usado para Desgasificador
  };

  const getGrupo = (nombre) => {
    if (nombre.includes('CALDERA') || nombre.includes('QUEMADOR')) return 'Calderas';
    if (nombre.includes('INTERCAMBIADOR')) return 'Grupo Térmico';
    if (nombre.includes('DESCALC')) return 'Descalcificadores';
    if (nombre.includes('DESGASIFICADOR')) return 'Desgasificador';
    return 'Otros';
  };

  const groups = [
    { id: 'Calderas', nombre: 'CALDERAS', image: 'boiler_3d.png' },
    { id: 'Descalcificadores', nombre: 'DESCALCIFICADORES', image: 'softener_3d.png' },
    { id: 'Desgasificador', nombre: 'DESGASIFICADOR', image: 'degasser_3d.png' },
    { id: 'Grupo Térmico', nombre: 'GRUPO TÉRMICO', image: 'heat_exchanger_3d.png' }
  ];

  const getGroupStatus = (grupoId) => {
    const equiposInGroup = dataEquipos.filter(eq => getGrupo(eq.nombre) === grupoId);
    if (equiposInGroup.some(eq => getEquipmentStatus(eq.id) === 'Crítico')) return 'Crítico';
    if (equiposInGroup.some(eq => getEquipmentStatus(eq.id) === 'Alarma')) return 'Alarma';
    return 'Operativo';
  };

  const handleCompleteTask = async (task) => {
    const nextDate = new Date(task.proxima_fecha);
    nextDate.setMonth(nextDate.getMonth() + task.frecuencia_meses);
    
    const { error } = await supabase
      .from('plan_mantenimiento')
      .update({ 
        ultima_fecha: task.proxima_fecha,
        proxima_fecha: nextDate.toISOString().split('T')[0]
      })
      .eq('id', task.id);

    if (!error) refreshData();
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const taskData = {
      equipo_id: formData.get('equipo_id'),
      tarea: formData.get('tarea'),
      tipo: formData.get('tipo'),
      proxima_fecha: formData.get('proxima_fecha'),
      frecuencia_meses: parseInt(formData.get('frecuencia_meses')),
    };

    let error;
    if (editingTask?.id) {
      const { error: err } = await supabase
        .from('plan_mantenimiento')
        .update(taskData)
        .eq('id', editingTask.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('plan_mantenimiento')
        .insert([taskData]);
      error = err;
    }

    if (!error) {
      setIsModalOpen(false);
      setEditingTask(null);
      refreshData();
    }
  };

  const openNewTaskModal = () => {
    setEditingTask({
      tarea: '',
      tipo: 'Preventivo',
      frecuencia_meses: 12,
      proxima_fecha: new Date().toISOString().split('T')[0],
      equipo_id: dataEquipos[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-300">
      
      {/* 1. INDICADORES (Sólidos, legibles) */}
      <div className="mb-6">
        <h2 className="text-[11px] font-black text-white tracking-widest mb-3 uppercase">DASHBOARD</h2>
        <div className="grid grid-cols-4 gap-2">
          {stats.map((s, i) => (
            <div key={i} className="industrial-card p-2.5 flex flex-col justify-between h-[70px] bg-[#141414] border border-[#222]">
               <div className="mb-0.5">{s.icon}</div>
               <div className="text-[18px] font-black leading-none text-white">{s.val}</div>
               <div className="text-[7px] text-gray-400 font-bold uppercase tracking-wide leading-tight mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. EQUIPOS PRINCIPALES */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-[11px] font-black text-white tracking-widest uppercase">
            {selectedGroup ? `EQUIPOS: ${selectedGroup}` : 'VISIÓN GENERAL DE SISTEMAS'}
          </h2>
          {selectedGroup ? (
            <button onClick={() => setSelectedGroup(null)} className="text-[#FF6B00] text-[9px] font-bold cursor-pointer uppercase flex items-center gap-1 hover:text-[#FFA057] transition-colors">
              ‹ Volver a Grupos
            </button>
          ) : (
            null
          )}
        </div>
        
        {!selectedGroup ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {groups.map(g => {
               const status = getGroupStatus(g.id);
               return (
                  <div 
                    key={g.id}
                    onClick={() => setSelectedGroup(g.id)}
                    className={`industrial-card p-4 flex flex-col items-center justify-between gap-3 cursor-pointer border transition-all aspect-square ${
                      status === 'Crítico' ? 'bg-[#FF0044]/10 border-[#FF0044]/50' : 
                      status === 'Alarma' ? 'bg-[#FF6B00]/10 border-[#FF6B00]/50' : 
                      'bg-[#141414] border-[#222] hover:bg-[#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                       <div className={`w-3 h-3 rounded-full mt-0.5 shadow-sm ${statusLEDs[status] || 'bg-gray-700'} ${status !== 'Operativo' ? 'animate-pulse' : ''}`}></div>
                       {status !== 'Operativo' && (
                         <span className={`text-[7px] font-bold bg-[#0A0A0A] border px-1.5 py-0.5 rounded shadow-inner uppercase ${status === 'Crítico' ? 'text-[#FF0044] border-[#FF0044]/50' : 'text-[#FF6B00] border-[#FF6B00]/50'}`}>
                           ALERTA
                         </span>
                       )}
                    </div>
                    <div className="flex-1 flex items-center justify-center w-full relative">
                       <img src={`/${g.image}`} className="absolute max-h-full max-w-full object-contain mix-blend-lighten drop-shadow-2xl" style={{ filter: 'contrast(1.2) brightness(1.1)' }} alt="" />
                    </div>
                    <h4 className={`text-[10px] font-black text-center leading-tight uppercase tracking-wide w-full px-1 ${
                        status === 'Crítico' ? 'text-[#FF0044]' : 
                        status === 'Alarma' ? 'text-[#FF6B00]' : 
                        'text-white'
                    }`}>
                       {g.nombre}
                    </h4>
                  </div>
               )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
            {dataEquipos
              .filter(eq => getGrupo(eq.nombre) === selectedGroup)
              .sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true, sensitivity: 'base' }))
              .map((eq) => {
              const status = getEquipmentStatus(eq.id);
              return (
                <div 
                  key={eq.id} 
                  className={`industrial-card p-3 flex flex-col items-center justify-between gap-3 cursor-pointer border transition-all aspect-[4/5] ${
                    status === 'Crítico' ? 'bg-[#FF0044]/10 border-[#FF0044]/50' : 
                    status === 'Alarma' ? 'bg-[#FF6B00]/10 border-[#FF6B00]/50' : 
                    'bg-[#141414] border-[#222] hover:bg-[#1A1A1A]'
                  }`}
                >
                  {/* Status Dot & ID */}
                  <div className="flex items-start justify-between w-full">
                    <div className={`w-2 h-2 rounded-full mt-0.5 shadow-sm ${statusLEDs[status] || 'bg-gray-700'} ${status !== 'Operativo' ? 'animate-pulse' : ''}`}></div>
                    <span className="text-[7px] font-bold text-gray-500 bg-[#0A0A0A] border border-[#333] px-1.5 py-0.5 rounded shadow-inner">
                        {eq.id_tecnico}
                    </span>
                  </div>
                  
                  {/* 3D Image */}
                  <div className="flex-1 flex items-center justify-center">
                    <img src={`/${getImage(eq.nombre)}`} className="h-12 w-12 object-contain mix-blend-lighten drop-shadow-lg" style={{ filter: 'contrast(1.2) brightness(1.1)' }} alt="" />
                  </div>
                  
                  {/* Title */}
                  <h4 className={`text-[8.5px] font-black text-center leading-tight uppercase tracking-wide w-full px-1 ${
                      status === 'Crítico' ? 'text-[#FF0044]' : 
                      status === 'Alarma' ? 'text-[#FF6B00]' : 
                      'text-white'
                  }`}>
                    {eq.nombre}
                  </h4>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 3. PLAN DE MANTENIMIENTO Y REVISIONES */}
      <div className="mb-6 pb-20">
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-[11px] font-black text-white tracking-widest uppercase">PLAN DE MANTENIMIENTO Y REVISIONES</h2>
          <button 
            onClick={openNewTaskModal}
            className="text-[#FF6B00] text-[9px] font-bold cursor-pointer uppercase hover:underline"
          >
            + Añadir Tarea
          </button>
        </div>
        
        <div className="flex flex-col gap-2.5">
          {planMantenimiento.length > 0 ? (
            planMantenimiento.slice(0, 8).map((item) => {
              const today = new Date().toISOString().split('T')[0];
              const isDue = item.proxima_fecha <= today;
              const diffTime = new Date(item.proxima_fecha) - new Date();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              return (
                <div key={item.id} className="industrial-card p-3 flex items-center gap-4 bg-[#141414] border-[#222] hover:border-[#333] transition-colors">
                  <div className={`w-1 h-10 rounded-full ${
                    item.tipo === 'Reglamentario' ? 'bg-[#FF0044]' : 
                    item.tipo === 'Preventivo' ? 'bg-[#FF6B00]' : 
                    'bg-[#00FF88]'
                  }`}></div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[7px] font-black text-gray-500 uppercase tracking-tighter">
                        {item.equipos?.nombre || 'Equipo'} • {item.id.slice(0,8)}
                      </span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm cursor-pointer ${
                          isDue ? 'bg-[#FF0044] text-white animate-pulse' : 'bg-[#0A0A0A] text-gray-400'
                      }`} onClick={() => { setEditingTask(item); setIsModalOpen(true); }}>
                        {new Date(item.proxima_fecha).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <h4 className="text-[11px] text-white font-bold mt-0.5">{item.tarea}</h4>
                    <p className="text-[8px] text-gray-500 font-medium mt-1 uppercase tracking-widest">
                      Frecuencia: {item.frecuencia_meses} Meses • {isDue ? 'VENCE HOY' : `Faltan: ${diffDays} días`}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center border-l border-[#222] pl-4 min-w-[60px]">
                      <button 
                        onClick={() => handleCompleteTask(item)}
                        className="bg-[#1A1A1A] p-2 rounded-lg border border-[#333] hover:border-[#00FF88] transition-colors group"
                        title="Marcar como Completado"
                      >
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-[#00FF88]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="industrial-card p-12 border-dashed border-[#222] flex flex-col items-center justify-center gap-2 bg-[#0A0A0A]/50">
              <svg className="w-8 h-8 text-[#222] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 text-[10px] uppercase font-bold tracking-[0.2em]">No hay tareas programadas</p>
              <p className="text-gray-700 text-[8px] uppercase font-medium">Usa el botón superior para añadir la primera</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edición/Creación de Mantenimiento */}
      {isModalOpen && editingTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="industrial-card w-full max-w-md bg-[#0A0A0A] border border-[#222] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[14px] font-black text-white tracking-widest uppercase">
                {editingTask.id ? 'EDITAR PROGRAMACIÓN' : 'NUEVA TAREA PREVENTIVA'}
              </h3>
              <button onClick={() => { setIsModalOpen(false); setEditingTask(null); }} className="text-gray-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveTask} className="flex flex-col gap-5">
              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase mb-2 block">Equipo</label>
                <select 
                  name="equipo_id"
                  defaultValue={editingTask.equipo_id}
                  className="w-full bg-[#111] border border-[#222] text-white text-[12px] p-3 rounded-md focus:border-[#FF6B00] outline-none"
                >
                  {dataEquipos.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase mb-2 block">Nombre de la Tarea</label>
                <input 
                  name="tarea"
                  type="text"
                  defaultValue={editingTask.tarea}
                  placeholder="Ej: Limpieza de filtros, Inspección Nivel B..."
                  className="w-full bg-[#111] border border-[#222] text-white text-[12px] p-3 rounded-md focus:border-[#FF6B00] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] text-gray-500 font-bold uppercase mb-2 block">Tipo de Tarea</label>
                <select 
                  name="tipo"
                  defaultValue={editingTask.tipo}
                  className="w-full bg-[#111] border border-[#222] text-white text-[12px] p-3 rounded-md focus:border-[#FF6B00] outline-none"
                >
                  <option value="Reglamentario">Reglamentario</option>
                  <option value="Preventivo">Preventivo</option>
                  <option value="Limpieza">Limpieza</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase mb-2 block">Próxima Fecha</label>
                  <input 
                    name="proxima_fecha"
                    type="date" 
                    defaultValue={editingTask.proxima_fecha}
                    className="w-full bg-[#111] border border-[#222] text-white text-[12px] p-3 rounded-md focus:border-[#FF6B00] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase mb-2 block">Frecuencia (Meses)</label>
                  <input 
                    name="frecuencia_meses"
                    type="number" 
                    defaultValue={editingTask.frecuencia_meses}
                    className="w-full bg-[#111] border border-[#222] text-white text-[12px] p-3 rounded-md focus:border-[#FF6B00] outline-none"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="bg-[#FF6B00] text-white text-[12px] font-black p-4 rounded-md mt-2 hover:bg-[#FF8533] transition-colors uppercase tracking-widest shadow-lg shadow-[#FF6B00]/20">
                {editingTask.id ? 'Guardar Cambios' : 'Crear Tarea'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
