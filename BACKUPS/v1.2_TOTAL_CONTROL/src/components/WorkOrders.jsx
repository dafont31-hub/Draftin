import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const WorkOrders = ({ equipos = [], ordenes = [], refreshData }) => {
  const [view, setView] = useState('list'); // 'list', 'new', 'detail'

  const generatePDF = () => {
    const doc = new jsPDF();
    const completedOrders = ordenes.filter(o => o.estado === 'Finalizada');

    if (completedOrders.length === 0) {
      alert('No hay órdenes finalizadas para reportar.');
      return;
    }

    // Cabecera del Documento
    doc.setFontSize(20);
    doc.text("DRAFTIN - REPORTE TÉCNICO", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Informe de Auditoría de Mantenimiento - Generado el ${new Date().toLocaleDateString()}`, 14, 30);

    const tableData = completedOrders.map(o => {
      const eq = equipos.find(e => e.id === o.equipo_id);
      return [
        o.id.slice(0, 8),
        eq?.nombre || 'Desconocido',
        o.titulo,
        o.tipo,
        new Date(o.updated_at || o.created_at).toLocaleDateString(),
        o.tecnico_asignado || 'N/A'
      ];
    });

    doc.autoTable({
      startY: 40,
      head: [['ID', 'Equipo', 'Trabajo Realizado', 'Tipo', 'Fecha', 'Técnico']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillStyle: '#FF6B00', textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`Reporte_Mantenimiento_Draftin_${new Date().toISOString().split('T')[0]}.pdf`);
  };
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTabDetail, setActiveTabDetail] = useState('Detalles');
  const [fotoAntes, setFotoAntes] = useState(null);
  const [fotoDespues, setFotoDespues] = useState(null);

  const fileInputAntes = useRef(null);
  const fileInputDespues = useRef(null);

  const fallbackEquipos = [
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
    { id: '00000000-0000-0000-0000-000000000017', nombre: 'DESCALC. CAL 2', id_tecnico: 'EQ-017' }
  ];

  const displayEquipos = [...(equipos.length > 0 ? equipos : fallbackEquipos)].sort((a, b) => {
    if (a.sistema !== b.sistema) return a.sistema.localeCompare(b.sistema);
    return a.nombre.localeCompare(b.nombre, undefined, { numeric: true });
  });
  
  // Estado para el formulario de nueva OT
  const [newOrder, setNewOrder] = useState({
    equipo_id: displayEquipos[0]?.id || '',
    titulo: '',
    descripcion: '',
    prioridad: 'Normal',
    tipo: 'Correctivo',
    tecnico_asignado: ''
  });

  const handleSaveOrder = async () => {
    if (!newOrder.titulo || !newOrder.equipo_id) return alert('Título y Equipo son obligatorios');
    
    const { error } = await supabase.from('ordenes_trabajo').insert([newOrder]);
    
    if (error) {
      console.error('Error saving order:', error);
      alert('Error al guardar la orden');
    } else {
      refreshData();
      setView('list');
      setNewOrder({
        equipo_id: displayEquipos[0]?.id || '',
        titulo: '',
        descripcion: '',
        prioridad: 'Normal',
        tipo: 'Correctivo',
        tecnico_asignado: ''
      });
    }
  };

  const handleCapture = (e, setFoto) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    // Aquí podrías añadir lógica para subir las fotos a Supabase Storage si fuera necesario
    const { error } = await supabase
      .from('ordenes_trabajo')
      .update({ 
        estado: newStatus,
        foto_antes: fotoAntes, // Guardando como base64 por ahora para el ejemplo funcional
        foto_despues: fotoDespues
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating status:', error);
    } else {
      refreshData();
      setView('list');
      setFotoAntes(null);
      setFotoDespues(null);
    }
  };

  if (view === 'new') {
    return (
      <div className="flex flex-col h-full bg-[#0A0A0A] animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('list')} className="p-1">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-[12px] font-black text-white tracking-widest uppercase">NUEVA ORDEN DE TRABAJO</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-20 no-scrollbar">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-gray-500 uppercase">Equipo *</label>
            <select 
              value={newOrder.equipo_id}
              onChange={(e) => setNewOrder({...newOrder, equipo_id: e.target.value})}
              className="w-full bg-[#141414] border border-[#222] rounded-lg py-3 px-3 text-[11px] text-white font-medium focus:outline-none focus:border-[#FF6B00] appearance-none"
            >
              {displayEquipos.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.nombre} ({eq.id_tecnico})</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-gray-500 uppercase">Título *</label>
            <input 
              type="text" 
              value={newOrder.titulo}
              onChange={(e) => setNewOrder({...newOrder, titulo: e.target.value})}
              placeholder="Ej: Revisión de válvulas"
              className="w-full bg-[#141414] border border-[#222] rounded-lg py-3 px-3 text-[11px] text-white font-medium focus:outline-none focus:border-[#FF6B00]" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-gray-500 uppercase">Descripción</label>
            <textarea 
              rows="3" 
              value={newOrder.descripcion}
              onChange={(e) => setNewOrder({...newOrder, descripcion: e.target.value})}
              className="w-full bg-[#141414] border border-[#222] rounded-lg py-3 px-3 text-[11px] text-white font-medium focus:outline-none focus:border-[#FF6B00] resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-gray-500 uppercase">Prioridad</label>
              <select 
                value={newOrder.prioridad}
                onChange={(e) => setNewOrder({...newOrder, prioridad: e.target.value})}
                className="w-full bg-[#141414] border border-[#222] rounded-lg py-3 px-3 text-[11px] text-[#FF6B00] font-bold focus:outline-none focus:border-[#FF6B00] appearance-none"
              >
                <option value="Normal">NORMAL</option>
                <option value="Grave">GRAVE</option>
                <option value="Urgente">URGENTE</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-gray-500 uppercase">Tipo</label>
              <select 
                value={newOrder.tipo}
                onChange={(e) => setNewOrder({...newOrder, tipo: e.target.value})}
                className="w-full bg-[#141414] border border-[#222] rounded-lg py-3 px-3 text-[11px] text-white font-medium focus:outline-none focus:border-[#FF6B00] appearance-none"
              >
                <option value="Preventivo">PREVENTIVO</option>
                <option value="Correctivo">CORRECTIVO</option>
                <option value="Mejora">MEJORA</option>
                <option value="Reparación">REPARACIÓN</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-gray-500 uppercase">Asignado a</label>
            <input 
              type="text" 
              value={newOrder.tecnico_asignado}
              onChange={(e) => setNewOrder({...newOrder, tecnico_asignado: e.target.value})}
              className="w-full bg-[#141414] border border-[#222] rounded-lg py-3 px-3 text-[11px] text-white font-medium focus:outline-none focus:border-[#FF6B00]" 
            />
          </div>
        </div>

        <div className="fixed bottom-0 right-0 w-full md:w-[calc(100%-16rem)] bg-[#111] border-t border-[#222] p-4 flex justify-center z-[110]">
          <div className="w-full max-w-7xl flex gap-3">
            <button onClick={() => setView('list')} className="flex-1 py-3.5 bg-transparent border border-[#333] rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
              CANCELAR
            </button>
            <button onClick={handleSaveOrder} className="flex-1 py-3.5 bg-[#FF6B00] rounded-lg text-[10px] font-bold text-black uppercase tracking-widest text-center shadow-[0_4px_10px_rgba(255,107,0,0.3)]">
              GUARDAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedOrder) {
    const equipo = equipos.find(e => e.id === selectedOrder.equipo_id);

    return (
      <div className="flex flex-col h-full bg-[#0A0A0A] animate-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="p-1">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-[12px] font-black text-white tracking-widest uppercase">DETALLE OT</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
          <div className="industrial-card p-4 bg-[#141414] border-[#222] mb-4">
             <div className="flex justify-between items-start mb-2">
               <div>
                 <h3 className="text-white text-[16px] font-black">{equipo?.nombre || 'Equipo Desconocido'}</h3>
                 <p className="text-gray-400 text-[11px] font-medium mt-0.5">{selectedOrder.titulo}</p>
               </div>
               <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-sm tracking-widest ${
                 selectedOrder.prioridad === 'Urgente' ? 'bg-red-500/20 text-red-500' : 'bg-[#FF6B00]/20 text-[#FF6B00]'
               }`}>
                 {selectedOrder.prioridad}
               </span>
             </div>
             <div className="mt-4 flex flex-col gap-1">
               <div className="flex items-center gap-2">
                 <span className="text-[9px] text-gray-500 font-bold uppercase w-20">Asignado a:</span>
                 <span className="text-[10px] text-white font-medium">{selectedOrder.tecnico_asignado || 'Sin asignar'}</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-[9px] text-gray-500 font-bold uppercase w-20">Estado:</span>
                 <span className={`text-[10px] font-bold ${selectedOrder.estado === 'Abierta' ? 'text-red-500' : 'text-[#00FF88]'}`}>
                   {selectedOrder.estado.toUpperCase()}
                 </span>
               </div>
             </div>
          </div>

          <div className="flex border-b border-[#222] mb-4">
             {['Detalles', 'Historial'].map((tab) => (
               <button 
                 key={tab} 
                 onClick={() => setActiveTabDetail(tab)}
                 className={`flex-1 pb-2 text-[10px] font-bold text-center border-b-2 transition-colors ${activeTabDetail === tab ? 'text-[#FF6B00] border-[#FF6B00]' : 'text-gray-500 border-transparent'}`}
               >
                 {tab}
               </button>
             ))}
          </div>

          <div className="animate-in fade-in duration-200">
             {activeTabDetail === 'Detalles' && (
               <div className="space-y-6">
                 <div className="space-y-4">
                   <div>
                     <h4 className="text-[9px] text-gray-500 font-bold uppercase mb-1">Descripción de la Tarea</h4>
                     <p className="text-[12px] text-white font-medium leading-relaxed bg-[#111] p-4 rounded-xl border border-[#222] shadow-inner">
                       {selectedOrder.descripcion || 'Sin descripción detallada.'}
                     </p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="bg-[#141414] p-3 rounded-lg border border-[#222]">
                       <h4 className="text-[9px] text-gray-500 font-bold uppercase mb-1">Tipo</h4>
                       <span className="text-[11px] text-white uppercase font-bold">{selectedOrder.tipo}</span>
                     </div>
                     <div className="bg-[#141414] p-3 rounded-lg border border-[#222]">
                       <h4 className="text-[9px] text-gray-500 font-bold uppercase mb-1">Fecha Creación</h4>
                       <span className="text-[11px] text-white font-bold">{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                     </div>
                   </div>
                 </div>

                 {/* EVIDENCIA FOTOGRÁFICA (Compacta y funcional) */}
                 <div className="border-t border-[#222] pt-5">
                   <h4 className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                     REGISTRO FOTOGRÁFICO
                   </h4>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                         <label className="text-[8px] text-gray-600 font-bold uppercase">Foto Antes</label>
                         <div 
                           onClick={() => fileInputAntes.current.click()}
                           className="h-20 bg-[#0A0A0A] border-2 border-dashed border-[#222] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6B00] hover:bg-[#111] transition-all overflow-hidden"
                         >
                            {fotoAntes ? (
                               <img src={fotoAntes} className="w-full h-full object-cover" alt="Antes" />
                            ) : (
                               <>
                                 <svg className="w-4 h-4 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                 </svg>
                                 <span className="text-[6.5px] text-gray-600 font-bold mt-1 tracking-tighter">CAPTURAR</span>
                               </>
                            )}
                         </div>
                         <input 
                           type="file" 
                           ref={fileInputAntes} 
                           hidden 
                           accept="image/*" 
                           capture="environment"
                           onChange={(e) => handleCapture(e, setFotoAntes)} 
                         />
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <label className="text-[8px] text-gray-600 font-bold uppercase">Foto Después</label>
                         <div 
                           onClick={() => fileInputDespues.current.click()}
                           className="h-20 bg-[#0A0A0A] border-2 border-dashed border-[#222] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6B00] hover:bg-[#111] transition-all overflow-hidden"
                         >
                            {fotoDespues ? (
                               <img src={fotoDespues} className="w-full h-full object-cover" alt="Después" />
                            ) : (
                               <>
                                 <svg className="w-4 h-4 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                 </svg>
                                 <span className="text-[6.5px] text-gray-600 font-bold mt-1 tracking-tighter">CAPTURAR</span>
                               </>
                            )}
                         </div>
                         <input 
                           type="file" 
                           ref={fileInputDespues} 
                           hidden 
                           accept="image/*" 
                           capture="environment"
                           onChange={(e) => handleCapture(e, setFotoDespues)} 
                         />
                      </div>
                   </div>
                 </div>
               </div>
             )}

             {activeTabDetail === 'Historial' && (
                <div className="text-center py-10 text-gray-600 text-[10px] font-bold uppercase italic">
                  Sin registros disponibles
                </div>
             )}
          </div>
        </div>

        {/* Botones inferiores (Feedback: Checklist fuera) */}
        <div className="fixed bottom-0 right-0 w-full md:w-[calc(100%-16rem)] bg-[#111] border-t border-[#222] p-4 flex justify-center z-[110]">
          <div className="w-full max-w-7xl flex gap-3">
            <button 
              onClick={() => handleUpdateStatus(selectedOrder.id, 'En Proceso')}
              className="flex-1 py-4 bg-transparent border border-[#333] rounded-lg text-gray-400 text-[10px] font-bold uppercase tracking-widest text-center active:bg-[#1A1A1A] transition-colors"
            >
              MARCAR PENDIENTE
            </button>
            <button 
              onClick={() => handleUpdateStatus(selectedOrder.id, 'Finalizada')}
              className="flex-1 py-4 bg-[#FF6B00] rounded-lg text-[10px] font-bold text-black uppercase tracking-widest text-center shadow-[0_4px_10px_rgba(255,107,0,0.3)] active:scale-[0.98] transition-transform"
            >
              CERRAR ORDEN
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista de Lista (List)
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-[12px] font-black uppercase tracking-widest text-white">TAREAS</h2>
         <div className="flex gap-2">
           <button 
             onClick={generatePDF}
             className="bg-[#1A1A1A] border border-[#222] text-[#FF6B00] px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest active:scale-95 transition-transform"
           >
             Reporte PDF
           </button>
           <button onClick={() => setView('new')} className="bg-[#FF6B00] text-black px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest active:scale-95 transition-transform shadow-[0_4px_10px_rgba(255,107,0,0.3)]">
             Nueva OT
           </button>
         </div>
      </div>

      <div className="flex flex-col gap-2">
        {ordenes.length === 0 ? (
          <div className="text-center py-10 text-gray-600 font-bold uppercase text-[10px]">No hay órdenes abiertas</div>
        ) : (
          ordenes.map((ord) => {
            const equipo = equipos.find(e => e.id === ord.equipo_id);
            return (
              <div 
                key={ord.id} 
                onClick={() => { setSelectedOrder(ord); setView('detail'); }}
                className={`industrial-card p-3 flex flex-col gap-1.5 cursor-pointer bg-[#141414] border-[#222] relative overflow-hidden ${ord.tipo === 'Preventivo' ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                 <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <span className="text-[9px] font-bold text-gray-300">#{ord.id.slice(0,8)}</span>
                     {ord.tipo === 'Preventivo' && (
                       <span className="text-[7px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">INSPECCIÓN OFICIAL</span>
                     )}
                   </div>
                   <span className="text-[8px] font-medium text-gray-500">{new Date(ord.created_at).toLocaleDateString()}</span>
                 </div>
                 
                 <p className="text-[11px] text-white font-bold">{equipo?.nombre || 'Equipo'} - {ord.titulo}</p>
                 
                 <div className="flex items-center justify-between mt-1">
                   <div className="flex gap-2">
                     <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-sm tracking-wider ${
                        ord.prioridad === 'Urgente' ? 'bg-red-500/20 text-red-500' :
                        ord.prioridad === 'Grave' ? 'bg-[#FF6B00]/20 text-[#FF6B00]' :
                        'bg-[#00FF88]/20 text-[#00FF88]'
                     }`}>{ord.prioridad}</span>
                     
                     <span className="text-[7px] font-black uppercase px-2 py-0.5 bg-[#222] text-gray-400 rounded-sm tracking-wider">
                       {ord.estado}
                     </span>
                   </div>

                   {ord.fecha_limite && (
                     <div className="flex items-center gap-1.5">
                       <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                       </svg>
                       <span className={`text-[9px] font-black ${new Date(ord.fecha_limite) < new Date() ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                         VENCE: {new Date(ord.fecha_limite).toLocaleDateString()}
                       </span>
                     </div>
                   )}
                 </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WorkOrders;
