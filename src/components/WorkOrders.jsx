import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Trash2, Edit3, ChevronLeft, Save } from 'lucide-react';

const WorkOrders = ({ equipos = [], ordenes = [], refreshData }) => {
  const [view, setView] = useState('list'); // 'list', 'new', 'detail'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTabDetail, setActiveTabDetail] = useState('Detalles');
  const [fotoAntes, setFotoAntes] = useState(null);
  const [fotoDespues, setFotoDespues] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);

  const fileInputAntes = useRef(null);
  const fileInputDespues = useRef(null);

  const [newOrder, setNewOrder] = useState({ 
    equipo_id: equipos[0]?.id || '', 
    titulo: '', 
    descripcion: '', 
    prioridad: 'Media', 
    tipo: 'Correctivo', 
    tecnico_asignado: '',
    sub_equipo: '',
    fecha_programada: new Date().toISOString().split('T')[0]
  });

  const getSubEquiposSugeridos = () => {
    const subs = ordenes
      .filter(o => o.equipo_id === newOrder.equipo_id && o.sub_equipo)
      .map(o => o.sub_equipo);
    return [...new Set(subs)];
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const completedOrders = ordenes.filter(o => o.estado === 'Finalizada');
    if (completedOrders.length === 0) {
      alert('No hay órdenes finalizadas para reportar.');
      return;
    }
    doc.setFontSize(20);
    doc.text("DRAFTIN - REPORTE TÉCNICO", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Informe de Auditoría de Mantenimiento - Generado el ${new Date().toLocaleDateString()}`, 14, 30);
    const tableData = completedOrders.map(o => {
      const eq = equipos.find(e => e.id === o.equipo_id);
      return [o.id.slice(0, 8), eq?.nombre || 'Desconocido', o.titulo, o.tipo, new Date(o.updated_at || o.created_at).toLocaleDateString(), o.tecnico_asignado || 'N/A'];
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

  const handleSaveOrder = async () => {
    if (!newOrder.titulo || !newOrder.equipo_id) return alert('Título y Equipo son obligatorios');
    const { error } = await supabase.from('ordenes_trabajo').insert([newOrder]);
    if (error) alert('Error al guardar la orden');
    else {
      refreshData();
      setView('list');
      setNewOrder({ 
        equipo_id: equipos[0]?.id || '', 
        titulo: '', 
        descripcion: '', 
        prioridad: 'Media', 
        tipo: 'Correctivo', 
        tecnico_asignado: '',
        sub_equipo: '',
        fecha_programada: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('ordenes_trabajo').update({ 
      estado: newStatus, 
      foto_antes: fotoAntes, 
      foto_despues: fotoDespues 
    }).eq('id', id);
    if (!error) {
      refreshData();
      setView('list');
      setFotoAntes(null);
      setFotoDespues(null);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta orden?')) return;
    const { error } = await supabase.from('ordenes_trabajo').delete().eq('id', id);
    if (!error) { refreshData(); setView('list'); }
  };

  const handleUpdateOrder = async () => {
    const { error } = await supabase.from('ordenes_trabajo').update({
      titulo: editOrder.titulo,
      descripcion: editOrder.descripcion,
      prioridad: editOrder.prioridad,
      tipo: editOrder.tipo,
      tecnico_asignado: editOrder.tecnico_asignado,
      sub_equipo: editOrder.sub_equipo
    }).eq('id', editOrder.id);
    if (!error) { refreshData(); setIsEditing(false); setSelectedOrder(editOrder); }
  };

  const handleCapture = (e, setFoto) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // VISTA: NUEVA ORDEN
  if (view === 'new') {
    const equipoSeleccionado = equipos.find(e => String(e.id) === String(newOrder.equipo_id));
    // Detección más flexible (con o sin tildes)
    const esSatelite = equipoSeleccionado?.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().includes('SATELITE');

    const priorityStyles = {
      'Baja': 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]',
      'Media': 'bg-primary border-primary text-black shadow-[0_0_15px_rgba(255,107,0,0.3)]',
      'Alta': 'bg-orange-600 border-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)]',
      'Crítica': 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse'
    };

    return (
      <div className="flex flex-col h-full bg-[#0A0A0A] animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-3 mb-6 p-4 border-b border-white/5">
          <button onClick={() => setView('list')} className="p-2 hover:bg-white/5 rounded-full transition-colors"><ChevronLeft size={24} className="text-gray-400" /></button>
          <div>
            <h2 className="text-[14px] font-black text-white tracking-widest uppercase">Nueva Orden</h2>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Mantenimiento de Activos</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-8 pb-32 no-scrollbar px-4">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-3 bg-primary"></div> Equipo Principal
              </label>
              <select 
                value={newOrder.equipo_id} 
                onChange={(e) => setNewOrder({...newOrder, equipo_id: e.target.value})} 
                className="w-full bg-[#141414] border border-[#222] rounded-xl py-4 px-4 text-[12px] font-bold text-white outline-none focus:border-primary appearance-none cursor-pointer"
              >
                {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
              </select>
            </div>

            {/* CAMPO DINÁMICO PARA SATÉLITES - MEJORADO */}
            {esSatelite && (
              <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-[#FF6B00]"></div> IDENTIFICADOR DE SATÉLITE
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    list="sub-equipos-list"
                    placeholder="Escriba nº de satélite..."
                    value={newOrder.sub_equipo} 
                    onChange={(e) => setNewOrder({...newOrder, sub_equipo: e.target.value})} 
                    className="w-full bg-[#1A1A1A] border-2 border-[#FF6B00]/50 rounded-2xl py-5 px-5 text-[16px] font-black text-white outline-none focus:border-[#FF6B00] placeholder:text-gray-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]" 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#FF6B00]/40 tracking-widest">UNIDAD</div>
                </div>
                <datalist id="sub-equipos-list">
                  {getSubEquiposSugeridos().map(sub => <option key={sub} value={sub} />)}
                </datalist>
                <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tight ml-2 italic">Registro persistente: se guardará automáticamente en el historial.</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-3 bg-primary"></div> Título de la Intervención
              </label>
              <input 
                type="text" 
                placeholder="Ej: Revisión mensual de válvulas..."
                value={newOrder.titulo} 
                onChange={(e) => setNewOrder({...newOrder, titulo: e.target.value})} 
                className="w-full bg-[#141414] border border-[#222] rounded-xl py-4 px-4 text-[12px] font-bold text-white outline-none focus:border-primary placeholder:text-gray-700" 
              />
            </div>
          </div>

          {/* PRIORIDAD - COLORES DINÁMICOS */}
          <div className="space-y-3">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Prioridad del Trabajo</label>
            <div className="grid grid-cols-4 gap-2">
              {['Baja', 'Media', 'Alta', 'Crítica'].map(p => (
                <button
                  key={p}
                  onClick={() => setNewOrder({...newOrder, prioridad: p})}
                  className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all duration-300 ${
                    newOrder.prioridad === p 
                    ? priorityStyles[p]
                    : 'bg-[#141414] border-[#222] text-gray-600 hover:border-gray-500 hover:text-gray-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Tipo de Intervención</label>
            <div className="grid grid-cols-2 gap-2">
              {['Preventivo', 'Correctivo', 'Predictivo', 'Auditoría'].map(t => (
                <button
                  key={t}
                  onClick={() => setNewOrder({...newOrder, tipo: t})}
                  className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                    newOrder.tipo === t 
                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                    : 'bg-[#141414] border-[#222] text-gray-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Técnico Asignado</label>
              <input 
                type="text" 
                value={newOrder.tecnico_asignado} 
                onChange={(e) => setNewOrder({...newOrder, tecnico_asignado: e.target.value})} 
                className="w-full bg-[#141414] border border-[#222] rounded-xl py-4 px-4 text-[12px] font-bold text-white outline-none focus:border-primary" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Fecha Inicio</label>
              <input 
                type="date" 
                value={newOrder.fecha_programada}
                onChange={(e) => setNewOrder({...newOrder, fecha_programada: e.target.value})}
                className="w-full bg-[#141414] border border-[#222] rounded-xl py-4 px-4 text-[12px] font-bold text-white outline-none focus:border-primary [color-scheme:dark]" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Instrucciones / Notas Técnicas</label>
            <textarea 
              rows="4" 
              placeholder="Describa los pasos a seguir o materiales necesarios..."
              value={newOrder.descripcion} 
              onChange={(e) => setNewOrder({...newOrder, descripcion: e.target.value})} 
              className="w-full bg-[#141414] border border-[#222] rounded-xl py-4 px-4 text-[12px] font-medium text-white outline-none focus:border-primary resize-none placeholder:text-gray-800"
            ></textarea>
          </div>
        </div>

        <div className="fixed bottom-0 right-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 p-6 flex justify-center z-[110]">
          <button 
            onClick={handleSaveOrder} 
            className="w-full py-5 bg-[#FF6B00] rounded-2xl text-[11px] font-black uppercase text-black tracking-[0.3em] shadow-[0_10px_30px_rgba(255,107,0,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Emitir Orden de Trabajo
          </button>
        </div>
      </div>
    );
  }

  // VISTA: DETALLE DE ORDEN
  if (view === 'detail' && selectedOrder) {
    const equipo = equipos.find(e => e.id === selectedOrder.equipo_id);
    const priorityColors = {
      'Baja': 'text-blue-400',
      'Media': 'text-primary',
      'Alta': 'text-orange-500',
      'Crítica': 'text-red-500 animate-pulse'
    };

    return (
      <div className="flex flex-col h-full bg-[#0A0A0A] animate-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-center mb-6 p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button onClick={() => { setView('list'); setIsEditing(false); }} className="p-2 hover:bg-white/5 rounded-full transition-colors"><ChevronLeft size={24} className="text-gray-400" /></button>
            <div>
              <h2 className="text-[12px] font-black text-white uppercase tracking-widest">{isEditing ? 'Editando Registro' : 'Expediente Técnico'}</h2>
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">OT #{selectedOrder.id.slice(0,8)}</p>
            </div>
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              <button onClick={() => { setEditOrder(selectedOrder); setIsEditing(true); }} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-primary hover:bg-white/10 transition-all"><Edit3 size={18} /></button>
              <button onClick={() => handleDeleteOrder(selectedOrder.id)} className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500/20 transition-all"><Trash2 size={18} /></button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pb-32 no-scrollbar px-4">
          {isEditing ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Título del Trabajo</label>
                <input type="text" value={editOrder.titulo} onChange={(e) => setEditOrder({...editOrder, titulo: e.target.value})} className="w-full bg-[#141414] border border-[#222] rounded-xl py-4 px-4 text-white font-bold outline-none focus:border-primary" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Descripción Técnica Detallada</label>
                <textarea rows="6" value={editOrder.descripcion} onChange={(e) => setEditOrder({...editOrder, descripcion: e.target.value})} className="w-full bg-[#141414] border border-[#222] rounded-xl py-4 px-4 text-white outline-none focus:border-primary resize-none leading-relaxed" />
              </div>
              <button onClick={handleUpdateOrder} className="w-full py-5 bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20"><Save size={18} /> Sincronizar Cambios</button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* HEADER CARD */}
              <div className="industrial-card p-6 bg-[#111] border-[#222] relative overflow-hidden rounded-3xl">
                <div className="absolute top-0 right-0 p-4">
                  <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${priorityColors[selectedOrder.prioridad] || 'text-gray-400'}`}>
                    Prioridad {selectedOrder.prioridad}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-white text-[18px] font-black uppercase tracking-tight">{equipo?.nombre || 'Equipo'}</h3>
                  {selectedOrder.sub_equipo && <span className="text-primary text-[10px] font-black uppercase">Unidad: {selectedOrder.sub_equipo}</span>}
                </div>
                <p className="text-gray-400 text-[12px] font-medium mt-1 leading-relaxed">{selectedOrder.titulo}</p>
                
                <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/5 pt-6">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em]">Estado Operativo</span>
                    <span className="text-[11px] text-primary font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                      {selectedOrder.estado}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em]">Técnico Responsable</span>
                    <span className="text-[11px] text-white font-black uppercase tracking-widest mt-1">
                      {selectedOrder.tecnico_asignado || 'Sin Asignar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* TABS NAVEGACIÓN */}
              <div className="flex bg-[#111] p-1 rounded-2xl border border-white/5">
                {['Detalles', 'Fotos'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTabDetail(tab)} 
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${activeTabDetail === tab ? 'bg-white/10 text-white shadow-inner' : 'text-gray-600 hover:text-gray-400'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* CONTENIDO TABS */}
              {activeTabDetail === 'Detalles' ? (
                <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3 bg-primary"></div>
                    <h4 className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Informe de Actuación</h4>
                  </div>
                  <p className="text-white text-[13px] leading-relaxed font-medium">
                    {selectedOrder.descripcion || 'No se han registrado observaciones técnicas para esta intervención.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                  <div className="flex flex-col gap-3">
                    <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest text-center">Estado Inicial</span>
                    <div onClick={() => fileInputAntes.current.click()} className="aspect-square bg-white/[0.03] rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden group hover:border-primary/40 transition-all">
                      {fotoAntes ? (
                        <img src={fotoAntes} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                           <Save size={24} className="text-gray-400" />
                           <span className="text-[7px] font-black tracking-widest">SUBIR FOTO</span>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={fileInputAntes} hidden capture="environment" onChange={(e) => handleCapture(e, setFotoAntes)} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest text-center">Estado Final</span>
                    <div onClick={() => fileInputDespues.current.click()} className="aspect-square bg-white/[0.03] rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden group hover:border-primary/40 transition-all">
                      {fotoDespues ? (
                        <img src={fotoDespues} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                           <Save size={24} className="text-gray-400" />
                           <span className="text-[7px] font-black tracking-widest">SUBIR FOTO</span>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={fileInputDespues} hidden capture="environment" onChange={(e) => handleCapture(e, setFotoDespues)} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="fixed bottom-0 right-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 p-6 flex gap-4 z-[110]">
            <button 
              onClick={() => handleUpdateStatus(selectedOrder.id, 'Pendiente')} 
              className="flex-1 py-4 border border-white/10 text-gray-500 text-[10px] font-black uppercase rounded-2xl hover:bg-white/5 transition-all"
            >
              Mantener Abierta
            </button>
            <button 
              onClick={() => handleUpdateStatus(selectedOrder.id, 'Finalizada')} 
              className="flex-1 py-4 bg-primary text-black text-[10px] font-black uppercase rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Cerrar Orden Técnica
            </button>
          </div>
        )}
      </div>
    );
  }

  // VISTA: LISTADO GENERAL
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-[16px] font-black uppercase tracking-[0.3em] text-white">Gestión de Mantenimiento</h2>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Control de Órdenes de Trabajo (OT)</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={generatePDF} className="flex-1 md:flex-none px-6 py-3 bg-white/5 border border-white/10 text-primary text-[10px] font-black uppercase rounded-xl hover:bg-white/10 transition-all">Reporte Auditoría</button>
          <button onClick={() => setView('new')} className="flex-1 md:flex-none px-6 py-3 bg-primary text-black text-[10px] font-black uppercase rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">Nueva OT</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ordenes.length > 0 ? (
          ordenes.map(ord => {
            const eq = equipos.find(e => e.id === ord.equipo_id);
            const priorityColors = {
              'Baja': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
              'Media': 'text-primary bg-primary/10 border-primary/20',
              'Alta': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
              'Crítica': 'text-red-500 bg-red-500/20 border-red-500/30 animate-pulse'
            };

            return (
              <div 
                key={ord.id} 
                onClick={() => { setSelectedOrder(ord); setView('detail'); }} 
                className="industrial-card p-5 bg-[#0D0D0D] border-[#222] group hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-600 tracking-widest uppercase">OT #{ord.id.slice(0,8)}</span>
                    <div className="flex items-center gap-1">
                      <h3 className="text-white text-[14px] font-black uppercase tracking-tight mt-1">{eq?.nombre || 'Equipo'}</h3>
                      {ord.sub_equipo && <span className="text-primary text-[8px] font-black mt-1">({ord.sub_equipo})</span>}
                    </div>
                  </div>
                  <span className={`text-[8px] font-black px-2.5 py-1 rounded-md border uppercase ${priorityColors[ord.prioridad] || 'text-gray-400 bg-gray-500/10'}`}>
                    {ord.prioridad}
                  </span>
                </div>

                <p className="text-gray-400 text-[11px] font-medium line-clamp-2 min-h-[32px] leading-relaxed">{ord.titulo}</p>
                
                <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Fecha Emisión</span>
                    <span className="text-[9px] text-gray-400 font-bold mt-0.5">{new Date(ord.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Estado Actual</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${ord.estado === 'Finalizada' ? 'bg-green-500' : 'bg-primary animate-pulse'}`}></div>
                      <span className="text-[9px] text-white font-black uppercase tracking-widest">{ord.estado}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl opacity-20">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Edit3 size={24} className="text-gray-400" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">No hay órdenes activas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrders;
