import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  CheckCircle, 
  Trash2, 
  UserPlus, 
  Calendar, 
  ChevronDown, 
  MoreHorizontal,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

const WorkOrderTable = ({ orders, onSelectOT, onRefresh }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [modalType, setModalType] = useState(null); // 'reagendar', 'asignar', 'cancelar'
  const [bulkValue, setBulkValue] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('perfiles').select('*');
    if (data) setUsers(data);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) setSelectedIds([]);
    else setSelectedIds(orders.map(o => o.id));
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) return;

    let updates = {};
    if (modalType === 'reagendar') {
      updates = { fecha_apertura: bulkValue }; // Usamos fecha_apertura como "fecha programada" para simplificar
    } else if (modalType === 'asignar') {
      updates = { tecnico_id: bulkValue };
    } else if (modalType === 'cancelar') {
      // Lógica de cancelación
      const { error } = await supabase
        .from('work_orders')
        .update({ estado: 'Cerrada' }) // O eliminar si el usuario prefiere
        .in('id', selectedIds);
      
      if (!error) onRefresh();
      setModalType(null);
      setSelectedIds([]);
      return;
    }

    const { error } = await supabase
      .from('work_orders')
      .update(updates)
      .in('id', selectedIds);

    if (!error) {
      // Registrar en logs masivamente
      const logs = selectedIds.map(id => ({
        ot_id: id,
        estado_nuevo: 'Abierta',
        comentario: `Actualización masiva: ${modalType} -> ${bulkValue}`
      }));
      await supabase.from('ot_logs').insert(logs);
      
      onRefresh();
      setModalType(null);
      setSelectedIds([]);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      {/* BARRA DE ACCIONES MASIVAS */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-primary p-4 rounded-2xl mb-4 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
              {selectedIds.length} Seleccionadas
            </div>
            <div className="h-4 w-px bg-black/20"></div>
            <div className="flex gap-2">
              <button onClick={() => setModalType('reagendar')} className="flex items-center gap-1 text-black text-[9px] font-black uppercase hover:opacity-70 transition-all">
                <Calendar size={14} /> Reagendar
              </button>
              <button onClick={() => setModalType('asignar')} className="flex items-center gap-1 text-black text-[9px] font-black uppercase hover:opacity-70 transition-all">
                <UserPlus size={14} /> Asignar
              </button>
              <button onClick={() => setModalType('cancelar')} className="flex items-center gap-1 text-black text-[9px] font-black uppercase hover:opacity-70 transition-all">
                <Trash2 size={14} /> Cancelar
              </button>
            </div>
          </div>
          <button onClick={() => setSelectedIds([])} className="text-black"><X size={18} /></button>
        </div>
      )}

      {/* TABLA INDUSTRIAL */}
      <div className="flex-1 overflow-auto rounded-3xl border border-white/5 bg-[#0D0D0D] no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 bg-[#111] z-10 border-b border-white/5">
            <tr>
              <th className="p-5 w-16">
                <div 
                  onClick={toggleSelectAll}
                  className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedIds.length === orders.length ? 'bg-primary border-primary text-black' : 'border-white/10'}`}
                >
                  {selectedIds.length === orders.length && <Check size={14} strokeWidth={4} />}
                </div>
              </th>
              <th className="p-5 text-[8px] font-black text-gray-500 uppercase tracking-widest">Folio</th>
              <th className="p-5 text-[8px] font-black text-gray-500 uppercase tracking-widest">Título / Avería</th>
              <th className="p-5 text-[8px] font-black text-gray-500 uppercase tracking-widest">Activo</th>
              <th className="p-5 text-[8px] font-black text-gray-500 uppercase tracking-widest">Responsable</th>
              <th className="p-5 text-[8px] font-black text-gray-500 uppercase tracking-widest">Estado</th>
              <th className="p-5 text-[8px] font-black text-gray-500 uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((ot) => (
              <tr key={ot.id} className={`hover:bg-white/5 transition-colors group ${selectedIds.includes(ot.id) ? 'bg-primary/5' : ''}`}>
                <td className="p-5">
                  <div 
                    onClick={() => toggleSelect(ot.id)}
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedIds.includes(ot.id) ? 'bg-primary border-primary text-black' : 'border-white/10 group-hover:border-primary/30'}`}
                  >
                    {selectedIds.includes(ot.id) && <Check size={14} strokeWidth={4} />}
                  </div>
                </td>
                <td className="p-5 text-[10px] font-black text-white">#{ot.folio?.toString().padStart(4, '0') || '----'}</td>
                <td className="p-5">
                  <div>
                    <p className="text-[11px] font-black text-white uppercase mb-1">{ot.titulo}</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase truncate max-w-[200px]">{ot.descripcion}</p>
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{ot.assets?.nombre || 'General'}</span>
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                      <UserPlus size={10} />
                    </div>
                    <span className="text-[9px] font-bold text-white uppercase">{ot.tecnico?.nombre || 'POR ASIGNAR'}</span>
                  </div>
                </td>
                <td className="p-5">
                  <span className={`px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest bg-white/5 text-gray-500 border border-white/5`}>
                    {ot.estado.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-5">
                  <button onClick={() => onSelectOT(ot)} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition-all">
                    <ChevronDown size={14} className="-rotate-90" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE ACCIÓN MASIVA */}
      {modalType && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="max-w-sm w-full bg-[#0D0D0D] border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            
            <h3 className="text-white text-[14px] font-black uppercase tracking-widest mb-6 italic">
              {modalType === 'reagendar' && 'Reagendar OTs'}
              {modalType === 'asignar' && 'Asignar Responsable'}
              {modalType === 'cancelar' && 'Confirmar Cancelación'}
            </h3>

            {modalType === 'reagendar' && (
              <input 
                type="date" 
                className="w-full bg-black border border-white/5 p-4 rounded-xl text-white text-[12px] font-bold outline-none focus:border-primary mb-8"
                onChange={(e) => setBulkValue(e.target.value)}
              />
            )}

            {modalType === 'asignar' && (
              <select 
                className="w-full bg-black border border-white/5 p-4 rounded-xl text-white text-[12px] font-bold outline-none focus:border-primary mb-8 uppercase"
                onChange={(e) => setBulkValue(e.target.value)}
              >
                <option value="">Seleccionar Responsable...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>
                ))}
              </select>
            )}

            {modalType === 'cancelar' && (
              <div className="space-y-4 mb-8">
                <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="text-red-500 shrink-0" size={16} />
                  <p className="text-red-500 text-[9px] font-bold uppercase leading-relaxed">
                    Estás a punto de cancelar {selectedIds.length} órdenes. Esta acción quedará registrada en el historial.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                   <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
                      <input type="radio" name="cancel-logic" defaultChecked className="accent-primary" />
                      <span className="text-[10px] font-black text-white uppercase">Solo cancelar la OT</span>
                   </label>
                   <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
                      <input type="radio" name="cancel-logic" className="accent-primary" />
                      <span className="text-[10px] font-black text-white uppercase">Eliminar OT y Actividades</span>
                   </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setModalType(null)}
                className="p-4 bg-white/5 text-gray-500 rounded-2xl text-[9px] font-black uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button 
                onClick={handleBulkUpdate}
                className="p-4 bg-primary text-black rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderTable;
