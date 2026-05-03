import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { generateOrderReport, generateBulkReport } from '../services/reportService';
import { Trash2, Edit3, ChevronLeft, Save, Camera } from 'lucide-react';

const WorkOrders = ({ equipos = [], ordenes = [], refreshData }) => {
  const [view, setView] = useState('list'); // 'list', 'new', 'detail'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTabDetail, setActiveTabDetail] = useState('Detalles');
  const [fotoAntes, setFotoAntes] = useState(null);
  const [fotoDespues, setFotoDespues] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editOrder, setEditOrder] = useState(null);

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
    fecha_programada: new Date().toISOString().split('T')[0],
    foto_antes: null
  });

  const getSubEquiposSugeridos = () => {
    const subs = ordenes
      .filter(o => String(o.equipo_id) === String(newOrder.equipo_id) && o.sub_equipo)
      .map(o => o.sub_equipo);
    return [...new Set(subs)];
  };

  const generateSingleOrderPDF = (order) => {
    generateOrderReport(order, equipos);
  };

  const generateBulkPDF = () => {
    generateBulkReport(ordenes, equipos);
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
        fecha_programada: new Date().toISOString().split('T')[0],
        foto_antes: null
      });
      setFotoAntes(null);
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
    if (!id) return;
    
    const { error } = await supabase.from('ordenes_trabajo').delete().eq('id', id);
    
    if (error) {
      console.error("Error de borrado:", error);
      alert(`Error de base de datos: ${error.message}`);
    } else {
      console.log("Orden borrada con éxito");
      await refreshData();
      setView('list');
      setSelectedOrder(null);
      setFotoAntes(null);
      setFotoDespues(null);
    }
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

  // VISTA: NUEVA ORDEN (COMPACTA)
  if (view === 'new') {
    const equipoSeleccionado = equipos.find(e => String(e.id) === String(newOrder.equipo_id));
    const esSatelite = equipoSeleccionado?.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().includes('SATELITE');

    const priorityStyles = {
      'Baja': 'bg-blue-600/10 border-blue-600/20 text-blue-400',
      'Media': 'bg-amber-500/10 border-amber-500/20 text-amber-500',
      'Alta': 'bg-orange-600/10 border-orange-600/20 text-orange-500',
      'Crítica': 'bg-red-600/10 border-red-600/20 text-red-400'
    };

    const activePriorityStyles = {
      'Baja': 'bg-blue-600 border-blue-600 text-white',
      'Media': 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-900/20',
      'Alta': 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-900/20',
      'Crítica': 'bg-red-600 border-red-600 text-white animate-pulse'
    };

    return (
      <div className="flex flex-col h-full bg-[#0A0A0A] animate-in slide-in-from-right-4 duration-300 px-4">
        <div className="flex items-center gap-3 py-4 border-b border-white/5 mb-4">
          <button onClick={() => setView('list')} className="p-1.5 hover:bg-white/5 rounded-full"><ChevronLeft size={20} className="text-gray-400" /></button>
          <h2 className="text-[11px] font-black text-white tracking-widest uppercase italic">Nueva Orden Técnica</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-32 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Equipo Principal</label>
              <select 
                value={newOrder.equipo_id} 
                onChange={(e) => setNewOrder({...newOrder, equipo_id: e.target.value})} 
                className="w-full bg-[#111] border border-[#222] rounded-lg py-2 px-3 text-[11px] font-bold text-white outline-none focus:border-primary"
              >
                {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
              </select>
            </div>

            {esSatelite && (
              <div className="flex flex-col gap-1 animate-in slide-in-from-top-2">
                <label className="text-[8px] font-black text-primary uppercase tracking-widest ml-1 italic">Nº Unidad / Satélite</label>
                <input 
                  type="text" 
                  list="sub-equipos-list"
                  placeholder="ID Satélite..."
                  value={newOrder.sub_equipo} 
                  onChange={(e) => setNewOrder({...newOrder, sub_equipo: e.target.value})} 
                  className="w-full bg-[#1A1A1A] border border-primary/30 rounded-lg py-2 px-3 text-[11px] font-black text-white outline-none focus:border-primary placeholder:text-gray-800" 
                />
                <datalist id="sub-equipos-list">
                  {getSubEquiposSugeridos().map(sub => <option key={sub} value={sub} />)}
                </datalist>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Asunto</label>
            <input 
              type="text" 
              placeholder="Describa el problema..."
              value={newOrder.titulo} 
              onChange={(e) => setNewOrder({...newOrder, titulo: e.target.value})} 
              className="w-full bg-[#111] border border-[#222] rounded-lg py-2 px-3 text-[11px] font-bold text-white outline-none focus:border-primary" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Prioridad</label>
                <div className="grid grid-cols-4 gap-1">
                  {['Baja', 'Media', 'Alta', 'Crítica'].map(p => (
                    <button
                      key={p}
                      onClick={() => setNewOrder({...newOrder, prioridad: p})}
                      className={`py-1.5 rounded-md text-[7px] font-black uppercase border transition-all ${
                        newOrder.prioridad === p ? activePriorityStyles[p] : priorityStyles[p]
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Tipo</label>
                <div className="grid grid-cols-2 gap-1">
                  {['Preventivo', 'Correctivo', 'Predictivo', 'Auditoría'].map(t => (
                    <button
                      key={t}
                      onClick={() => setNewOrder({...newOrder, tipo: t})}
                      className={`py-1.5 rounded-md text-[7px] font-black uppercase border transition-all ${
                        newOrder.tipo === t ? 'bg-white text-black border-white' : 'bg-[#111] border-[#222] text-gray-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] font-black text-primary uppercase tracking-widest ml-1">Evidencia Inicial</label>
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => fileInputAntes.current.click()} 
                  className="w-16 h-16 bg-[#111] border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-primary/40 transition-all shrink-0"
                >
                  {newOrder.foto_antes ? (
                    <img src={newOrder.foto_antes} className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={16} className="text-gray-400 opacity-30 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Tocar para capturar</span>
                  <span className="text-[6px] text-gray-700 font-bold uppercase mt-0.5">La foto se adjuntará a la OT</span>
                </div>
              </div>
              <input type="file" ref={fileInputAntes} hidden capture="environment" onChange={(e) => handleCapture(e, (res) => setNewOrder({...newOrder, foto_antes: res}))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Técnico</label>
              <input 
                type="text" 
                value={newOrder.tecnico_asignado} 
                onChange={(e) => setNewOrder({...newOrder, tecnico_asignado: e.target.value})} 
                className="w-full bg-[#111] border border-[#222] rounded-lg py-2 px-3 text-[11px] font-bold text-white outline-none focus:border-primary" 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Fecha</label>
              <input 
                type="date" 
                value={newOrder.fecha_programada}
                onChange={(e) => setNewOrder({...newOrder, fecha_programada: e.target.value})}
                className="w-full bg-[#111] border border-[#222] rounded-lg py-2 px-3 text-[11px] font-bold text-white outline-none focus:border-primary [color-scheme:dark]" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Detalles</label>
            <textarea 
              rows="2" 
              value={newOrder.descripcion} 
              onChange={(e) => setNewOrder({...newOrder, descripcion: e.target.value})} 
              className="w-full bg-[#111] border border-[#222] rounded-lg py-2 px-3 text-[11px] font-medium text-white outline-none focus:border-primary resize-none"
            ></textarea>
          </div>
        </div>

        <div className="fixed bottom-0 right-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 p-4 flex justify-center z-[110]">
          <button 
            onClick={handleSaveOrder} 
            className="w-full py-3 bg-primary rounded-xl text-[9px] font-black uppercase text-black tracking-[0.2em] shadow-lg shadow-primary/20"
          >
            Emitir Orden Técnica
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
      'Media': 'text-amber-500',
      'Alta': 'text-orange-500',
      'Crítica': 'text-red-500 animate-pulse'
    };

    return (
      <div className="flex flex-col h-full bg-[#0A0A0A] animate-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-center p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button onClick={() => { setView('list'); setIsEditing(false); }} className="p-1.5 hover:bg-white/5 rounded-full transition-colors"><ChevronLeft size={20} className="text-gray-400" /></button>
            <div>
              <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Expediente Técnico</h2>
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">OT #{selectedOrder.id.slice(0,8)}</p>
            </div>
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              <button onClick={() => generateSingleOrderPDF(selectedOrder)} className="px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary text-[8px] font-black uppercase tracking-widest">Acta PDF</button>
              <button onClick={() => { setEditOrder(selectedOrder); setIsEditing(true); }} className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400"><Edit3 size={16} /></button>
              <button onClick={() => handleDeleteOrder(selectedOrder.id)} className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500"><Trash2 size={16} /></button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pb-32 no-scrollbar px-4 pt-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Título</label>
                <input type="text" value={editOrder.titulo} onChange={(e) => setEditOrder({...editOrder, titulo: e.target.value})} className="w-full bg-[#111] border border-[#222] rounded-lg py-2 px-3 text-white font-bold outline-none focus:border-primary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Descripción</label>
                <textarea rows="5" value={editOrder.descripcion} onChange={(e) => setEditOrder({...editOrder, descripcion: e.target.value})} className="w-full bg-[#111] border border-[#222] rounded-lg py-2 px-3 text-white outline-none focus:border-primary resize-none" />
              </div>
              <button onClick={handleUpdateOrder} className="w-full py-3 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-2"><Save size={16} /> Guardar</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="industrial-card p-4 bg-[#111] border-[#222] relative overflow-hidden rounded-2xl">
                <div className="absolute top-0 right-0 p-3">
                  <div className={`px-2 py-0.5 rounded-full border text-[7px] font-black uppercase tracking-widest ${priorityColors[selectedOrder.prioridad] || 'text-gray-400'}`}>
                    {selectedOrder.prioridad}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-white text-[14px] font-black uppercase tracking-tight">{equipo?.nombre || 'Equipo'}</h3>
                  {selectedOrder.sub_equipo && <span className="text-primary text-[9px] font-black uppercase">Unidad: {selectedOrder.sub_equipo}</span>}
                </div>
                <p className="text-gray-400 text-[11px] font-medium mt-1 leading-relaxed">{selectedOrder.titulo}</p>
                
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Estado</span>
                    <span className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                      {selectedOrder.estado}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Técnico</span>
                    <span className="text-[10px] text-white font-black uppercase tracking-widest mt-0.5">
                      {selectedOrder.tecnico_asignado || '---'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex bg-[#111] p-1 rounded-xl border border-white/5">
                {['Detalles', 'Fotos'].map(tab => (
                  <button key={tab} onClick={() => setActiveTabDetail(tab)} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTabDetail === tab ? 'bg-white/10 text-white' : 'text-gray-600'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {activeTabDetail === 'Detalles' ? (
                <div className="bg-[#0A0A0A] p-4 rounded-2xl border border-white/5">
                  <h4 className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-2">Informe</h4>
                  <p className="text-white text-[12px] leading-relaxed font-medium">{selectedOrder.descripcion || 'Sin observaciones.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest text-center">Antes</span>
                    <div onClick={() => fileInputAntes.current.click()} className="aspect-square bg-[#111] rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden">
                      {fotoAntes ? <img src={fotoAntes} className="w-full h-full object-cover" /> : <Camera size={20} className="text-gray-400 opacity-20" />}
                    </div>
                    <input type="file" ref={fileInputAntes} hidden capture="environment" onChange={(e) => handleCapture(e, setFotoAntes)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest text-center">Después</span>
                    <div onClick={() => fileInputDespues.current.click()} className="aspect-square bg-[#111] rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden">
                      {fotoDespues ? <img src={fotoDespues} className="w-full h-full object-cover" /> : <Camera size={20} className="text-gray-400 opacity-20" />}
                    </div>
                    <input type="file" ref={fileInputDespues} hidden capture="environment" onChange={(e) => handleCapture(e, setFotoDespues)} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="fixed bottom-0 right-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 p-4 flex gap-2 z-[110]">
            <button onClick={() => handleUpdateStatus(selectedOrder.id, 'Pendiente')} className="flex-1 py-3 border border-white/10 text-gray-500 text-[9px] font-black uppercase rounded-xl">Abierta</button>
            <button onClick={() => handleUpdateStatus(selectedOrder.id, 'Finalizada')} className="flex-1 py-3 bg-primary text-black text-[9px] font-black uppercase rounded-xl">Cerrar OT</button>
          </div>
        )}
      </div>
    );
  }

  // VISTA: LISTADO GENERAL
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-white">Mantenimiento</h2>
          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Órdenes de Trabajo (OT)</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={generateBulkPDF} className="flex-1 md:flex-none px-4 py-2 bg-white/5 border border-white/10 text-primary text-[9px] font-black uppercase rounded-lg">Reporte Global</button>
          <button onClick={() => setView('new')} className="flex-1 md:flex-none px-4 py-2 bg-primary text-black text-[9px] font-black uppercase rounded-lg shadow-lg shadow-primary/20">Nueva OT</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ordenes.length > 0 ? (
          ordenes.filter(o => 
            o.tipo !== 'Auditoría' && 
            o.tipo !== 'Inspección' && 
            !(o.titulo || '').toLowerCase().includes('inspección')
          ).map(ord => {
            const eq = equipos.find(e => e.id === ord.equipo_id);
            const priorityColors = {
              'Baja': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
              'Media': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
              'Alta': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
              'Crítica': 'text-red-500 bg-red-500/20 border-red-500/30 animate-pulse'
            };

            return (
              <div key={ord.id} onClick={() => { 
                setSelectedOrder(ord); 
                setFotoAntes(ord.foto_antes);
                setFotoDespues(ord.foto_despues);
                setView('detail'); 
              }} className="industrial-card p-4 bg-[#0D0D0D] border-[#222] group hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden rounded-xl">
                <div className="absolute top-0 left-0 w-0.5 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-gray-600 tracking-widest uppercase">#{ord.id.slice(0,8)}</span>
                    <div className="flex items-center gap-1">
                      <h3 className="text-white text-[12px] font-black uppercase tracking-tight mt-0.5">{eq?.nombre || 'Equipo'}</h3>
                      {ord.sub_equipo && <span className="text-primary text-[7px] font-black mt-0.5">({ord.sub_equipo})</span>}
                    </div>
                  </div>
                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border uppercase ${priorityColors[ord.prioridad] || 'text-gray-400 bg-gray-500/10'}`}>
                    {ord.prioridad}
                  </span>
                </div>
                <p className="text-gray-400 text-[10px] font-medium line-clamp-1 leading-relaxed">{ord.titulo}</p>
                <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{new Date(ord.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1 h-1 rounded-full ${ord.estado === 'Finalizada' ? 'bg-green-500' : 'bg-primary'}`}></div>
                    <span className="text-[8px] text-white font-black uppercase tracking-widest">{ord.estado}</span>
                  </div>
                </div>
                
                {/* Botón de borrado rápido */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteOrder(ord.id); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20 hover:bg-red-500 hover:text-white"
                  title="Eliminar OT"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl opacity-20">
             <Camera size={24} className="text-gray-400 mb-2" />
             <p className="text-[8px] font-black uppercase tracking-[0.3em]">Sin órdenes activas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrders;
