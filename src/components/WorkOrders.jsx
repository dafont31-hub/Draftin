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

  const fileInputAntes = useRef(null);
  const fileInputDespues = useRef(null);

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
      setNewOrder({ equipo_id: equipos[0]?.id || '', titulo: '', descripcion: '', prioridad: 'Normal', tipo: 'Correctivo', tecnico_asignado: '' });
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('ordenes_trabajo').update({ estado: newStatus, foto_antes: fotoAntes, foto_despues: fotoDespues }).eq('id', id);
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
      tecnico_asignado: editOrder.tecnico_asignado
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

  const [newOrder, setNewOrder] = useState({ equipo_id: equipos[0]?.id || '', titulo: '', descripcion: '', prioridad: 'Normal', tipo: 'Correctivo', tecnico_asignado: '' });

  if (view === 'new') {
    return (
      <div className="flex flex-col h-full bg-[#0A0A0A] animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('list')} className="p-1"><ChevronLeft size={20} className="text-gray-400" /></button>
          <h2 className="text-[12px] font-black text-white tracking-widest uppercase">NUEVA ORDEN DE TRABAJO</h2>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 pb-20 no-scrollbar">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-gray-500 uppercase">Equipo *</label>
            <select value={newOrder.equipo_id} onChange={(e) => setNewOrder({...newOrder, equipo_id: e.target.value})} className="w-full bg-[#141414] border border-[#222] rounded-lg py-3 px-3 text-[11px] text-white outline-none focus:border-primary">
              {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-gray-500 uppercase">Título *</label>
            <input type="text" value={newOrder.titulo} onChange={(e) => setNewOrder({...newOrder, titulo: e.target.value})} className="w-full bg-[#141414] border border-[#222] rounded-lg py-3 px-3 text-[11px] text-white outline-none focus:border-primary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-gray-500 uppercase">Descripción</label>
            <textarea rows="3" value={newOrder.descripcion} onChange={(e) => setNewOrder({...newOrder, descripcion: e.target.value})} className="w-full bg-[#141414] border border-[#222] rounded-lg py-3 px-3 text-[11px] text-white outline-none focus:border-primary resize-none"></textarea>
          </div>
        </div>
        <div className="fixed bottom-0 right-0 w-full bg-[#111] border-t border-[#222] p-4 flex justify-center z-[110]">
          <button onClick={handleSaveOrder} className="w-full py-4 bg-[#FF6B00] rounded-xl text-[10px] font-black uppercase text-black tracking-widest">GUARDAR ORDEN</button>
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
            <button onClick={() => { setView('list'); setIsEditing(false); }} className="p-1"><ChevronLeft size={20} className="text-gray-400" /></button>
            <h2 className="text-[12px] font-black text-white uppercase tracking-widest">{isEditing ? 'EDITAR ORDEN' : 'DETALLE OT'}</h2>
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              <button onClick={() => { setEditOrder(selectedOrder); setIsEditing(true); }} className="p-2 bg-white/5 border border-white/10 rounded-lg text-primary"><Edit3 size={16} /></button>
              <button onClick={() => handleDeleteOrder(selectedOrder.id)} className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500"><Trash2 size={16} /></button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
          {isEditing ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase">Título</label>
                <input type="text" value={editOrder.titulo} onChange={(e) => setEditOrder({...editOrder, titulo: e.target.value})} className="w-full bg-[#141414] border border-[#222] rounded-xl py-4 px-4 text-white outline-none focus:border-primary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase">Descripción</label>
                <textarea rows="5" value={editOrder.descripcion} onChange={(e) => setEditOrder({...editOrder, descripcion: e.target.value})} className="w-full bg-[#141414] border border-[#222] rounded-xl py-4 px-4 text-white outline-none focus:border-primary resize-none"></textarea>
              </div>
              <button onClick={handleUpdateOrder} className="w-full py-5 bg-primary text-black font-black uppercase text-[11px] tracking-widest rounded-2xl flex items-center justify-center gap-3"><Save size={18} /> GUARDAR CAMBIOS</button>
            </div>
          ) : (
            <>
              <div className="industrial-card p-4 bg-[#141414] border-[#222] mb-6">
                <h3 className="text-white text-[16px] font-black">{equipo?.nombre || 'Equipo'}</h3>
                <p className="text-gray-400 text-[11px] font-medium mt-1">{selectedOrder.titulo}</p>
                <div className="mt-4 flex gap-4">
                  <div className="flex flex-col"><span className="text-[8px] text-gray-500 font-black uppercase">ESTADO</span><span className="text-[10px] text-primary font-black uppercase">{selectedOrder.estado}</span></div>
                  <div className="flex flex-col"><span className="text-[8px] text-gray-500 font-black uppercase">PRIORIDAD</span><span className="text-[10px] text-red-500 font-black uppercase">{selectedOrder.prioridad}</span></div>
                </div>
              </div>
              <div className="flex border-b border-white/5 mb-6">
                {['Detalles', 'Fotos'].map(tab => (
                  <button key={tab} onClick={() => setActiveTabDetail(tab)} className={`flex-1 pb-4 text-[10px] font-black uppercase tracking-widest ${activeTabDetail === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}>{tab}</button>
                ))}
              </div>
              {activeTabDetail === 'Detalles' ? (
                <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-white/5">
                  <h4 className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-3">Descripción Técnica</h4>
                  <p className="text-white text-[13px] leading-relaxed italic">{selectedOrder.descripcion || 'Sin descripción.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[8px] text-gray-500 font-black uppercase">ANTES</span>
                    <div onClick={() => fileInputAntes.current.click()} className="h-40 bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                      {fotoAntes ? <img src={fotoAntes} className="w-full h-full object-cover" /> : <span className="text-[8px] text-gray-600 font-black">CAPTURAR</span>}
                    </div>
                    <input type="file" ref={fileInputAntes} hidden capture="environment" onChange={(e) => handleCapture(e, setFotoAntes)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[8px] text-gray-500 font-black uppercase">DESPUÉS</span>
                    <div onClick={() => fileInputDespues.current.click()} className="h-40 bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                      {fotoDespues ? <img src={fotoDespues} className="w-full h-full object-cover" /> : <span className="text-[8px] text-gray-600 font-black">CAPTURAR</span>}
                    </div>
                    <input type="file" ref={fileInputDespues} hidden capture="environment" onChange={(e) => handleCapture(e, setFotoDespues)} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {!isEditing && (
          <div className="fixed bottom-0 right-0 w-full bg-[#111] border-t border-[#222] p-4 flex gap-3 z-[110]">
            <button onClick={() => handleUpdateStatus(selectedOrder.id, 'En Proceso')} className="flex-1 py-4 border border-white/10 text-gray-500 text-[10px] font-black uppercase rounded-xl">PENDIENTE</button>
            <button onClick={() => handleUpdateStatus(selectedOrder.id, 'Finalizada')} className="flex-1 py-4 bg-primary text-black text-[10px] font-black uppercase rounded-xl shadow-lg shadow-primary/20">CERRAR OT</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[14px] font-black uppercase tracking-[0.4em] text-white italic">Órdenes de Trabajo</h2>
        <div className="flex gap-3">
          <button onClick={generatePDF} className="px-5 py-2.5 bg-white/5 border border-white/10 text-primary text-[9px] font-black uppercase rounded-xl">Reporte PDF</button>
          <button onClick={() => setView('new')} className="px-5 py-2.5 bg-primary text-black text-[9px] font-black uppercase rounded-xl shadow-lg shadow-primary/20">Nueva OT</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ordenes.map(ord => {
          const eq = equipos.find(e => e.id === ord.equipo_id);
          return (
            <div key={ord.id} onClick={() => { setSelectedOrder(ord); setView('detail'); }} className="industrial-card p-5 bg-[#0D0D0D] border-white/5 group hover:border-primary/40 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[9px] font-black text-gray-600">#{ord.id.slice(0,8)}</span>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${ord.prioridad === 'Urgente' ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'}`}>{ord.prioridad}</span>
              </div>
              <h3 className="text-white text-[13px] font-black uppercase tracking-tight">{eq?.nombre || 'Equipo'}</h3>
              <p className="text-gray-500 text-[11px] mt-1 font-medium line-clamp-1">{ord.titulo}</p>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[9px] text-gray-400 font-bold">{new Date(ord.created_at).toLocaleDateString()}</span>
                <span className="text-[9px] text-primary font-black uppercase tracking-widest">{ord.estado}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkOrders;
