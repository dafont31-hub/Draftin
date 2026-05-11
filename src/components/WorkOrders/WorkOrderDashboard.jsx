import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Search, 
  Filter,
  Hammer,
  ShieldCheck,
  ChevronRight,
  History
} from 'lucide-react';

const WorkOrderDashboard = ({ t, onNewOT, onSelectOT, onViewTimeline }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todas');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from('work_orders')
      .select('*, assets(nombre, nivel, sistema)')
      .order('fecha_apertura', { ascending: false });

    if (filter !== 'Todas') {
      query = query.eq('estado', filter);
    }

    const { data, error } = await query;
    if (!error) setOrders(data);
    setLoading(false);
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'Crítica': return 'from-red-600 to-red-900 border-red-500/50 text-white';
      case 'Alta': return 'from-orange-500 to-orange-800 border-orange-400/50 text-white';
      case 'Media': return 'from-blue-500 to-blue-800 border-blue-400/50 text-white';
      default: return 'from-gray-700 to-gray-900 border-gray-600/50 text-gray-300';
    }
  };

  const getStatusIcon = (s) => {
    switch (s) {
      case 'En_Proceso': return <Clock className="animate-pulse text-yellow-400" size={14} />;
      case 'Cerrada': return <CheckCircle2 className="text-green-400" size={14} />;
      case 'Pendiente_Validacion': return <ShieldCheck className="text-purple-400" size={14} />;
      default: return <Hammer className="text-gray-400" size={14} />;
    }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-40 px-4">
      <div className="flex items-center justify-between mb-8 pt-4">
        <div>
          <h2 className="text-[20px] font-black text-white tracking-widest uppercase italic">Centro de Mando: OTs</h2>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Ecosistema CMMS - Control de Activos Críticos</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onViewTimeline}
            className="w-12 h-12 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            <History size={20} />
          </button>
          <button 
            onClick={onNewOT}
            className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-black shadow-[0_10px_20px_rgba(255,107,0,0.3)] active:scale-90 transition-all"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* FILTROS RÁPIDOS */}
      <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
        {['Todas', 'Abierta', 'En_Proceso', 'Pendiente_Validacion', 'Cerrada'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
              filter === f 
              ? 'bg-white text-black border-white' 
              : 'bg-[#111] text-gray-500 border-white/5 hover:border-white/20'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* LISTADO DE TARJETAS */}
      <div className="grid gap-4">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-gray-600 font-black uppercase text-[10px] tracking-widest">Sincronizando con Sala de Máquinas...</div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center gap-4">
            <Search className="text-gray-800" size={40} />
            <p className="text-gray-600 font-black uppercase text-[10px] tracking-widest">Sin órdenes activas</p>
          </div>
        ) : (
          orders.map((ot) => {
            const isOverdue = ot.estado === 'En_Proceso' && ot.fecha_inicio_trabajo && 
              ((new Date() - new Date(ot.fecha_inicio_trabajo)) / 3600000 > (ot.duracion_estimada || 1));
            
            return (
              <div 
                key={ot.id}
                onClick={() => onSelectOT(ot)}
                className={`relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all`}
              >
                <div className={`p-5 rounded-3xl bg-gradient-to-br border ${getPriorityColor(ot.prioridad)} shadow-xl flex flex-col gap-4 ${isOverdue ? 'ring-4 ring-red-600 animate-pulse' : ''}`}>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        {getStatusIcon(ot.estado)}
                        <span className="text-[8px] font-black uppercase tracking-tighter">OT #{ot.folio.toString().padStart(4, '0')}</span>
                      </div>
                      <div className="bg-white/10 px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-tighter border border-white/5">
                        {ot.tipo || 'Correctivo'}
                      </div>
                    </div>
                    {isOverdue && (
                      <div className="bg-red-600 text-white text-[8px] font-black px-3 py-1 rounded-full flex items-center gap-1 animate-bounce">
                        <AlertTriangle size={12} /> ALARMA DE TIEMPO
                      </div>
                    )}
                    {!isOverdue && ot.prioridad === 'Crítica' && <AlertTriangle className="text-white animate-bounce" size={20} />}
                  </div>

                  <div>
                    <h3 className="text-white text-[16px] font-black uppercase leading-tight tracking-tight mb-1 group-hover:translate-x-1 transition-transform">{ot.titulo}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
                        {ot.assets?.nombre || 'Activo No Especificado'}
                      </p>
                      {ot.estado === 'En_Proceso' && (
                        <span className={`text-[10px] font-black ${isOverdue ? 'text-white' : 'text-white/80'}`}>
                          {(() => {
                            const diff = new Date() - new Date(ot.fecha_inicio_trabajo);
                            const h = Math.floor(diff / 3600000);
                            const m = Math.floor((diff % 3600000) / 60000);
                            return `${h}h ${m}m / ${ot.duracion_estimada || 1}h`;
                          })()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-white/40 text-[7px] font-black uppercase">Apertura</span>
                        <span className="text-white text-[10px] font-black">{new Date(ot.fecha_apertura).toLocaleDateString()}</span>
                      </div>
                      {ot.mttr_seconds > 0 && (
                        <div className="flex flex-col">
                          <span className="text-white/40 text-[7px] font-black uppercase">MTTR</span>
                          <span className="text-white text-[10px] font-black">{(ot.mttr_seconds / 3600).toFixed(1)}h</span>
                        </div>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
                
                {/* Efecto de Vidrio en el fondo */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700"></div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WorkOrderDashboard;
