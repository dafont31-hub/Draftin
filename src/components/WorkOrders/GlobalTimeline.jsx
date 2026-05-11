import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { History, Clock, Hammer, ShieldCheck, CheckCircle2, X } from 'lucide-react';

const GlobalTimeline = ({ onSelectOT, onRefresh }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalLogs();
  }, []);

  const fetchGlobalLogs = async () => {
    const { data, error } = await supabase
      .from('ot_logs')
      .select('*, work_orders(id, folio, titulo, estado)')
      .order('created_at', { ascending: false })
      .limit(50);
    
    // Filtrar solo los que tienen OT (que existen)
    if (!error) {
      setLogs(data.filter(log => log.work_orders));
    }
    setLoading(false);
  };

  const handleValidate = async (otId) => {
    const { error } = await supabase
      .from('work_orders')
      .update({ estado: 'Cerrada' })
      .eq('id', otId);
    
    if (!error) {
      // Registrar el cierre
      await supabase.from('ot_logs').insert({
        ot_id: otId,
        estado_anterior: 'Pendiente_Validacion',
        estado_nuevo: 'Cerrada',
        comentario: 'Orden de trabajo validada y cerrada desde Monitorización Global.'
      });
      fetchGlobalLogs();
    }
  };

  const handleDeleteLog = async (logId) => {
    if (window.confirm('¿Eliminar esta entrada del historial?')) {
      const { error } = await supabase.from('ot_logs').delete().eq('id', logId);
      if (!error) fetchGlobalLogs();
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'En_Proceso': return <Clock size={14} className="text-orange-500" />;
      case 'Pendiente_Validacion': return <ShieldCheck size={14} className="text-yellow-500" />;
      case 'Cerrada': return <CheckCircle2 size={14} className="text-green-500" />;
      default: return <Hammer size={14} className="text-blue-500" />;
    }
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-gray-500 text-[10px] font-black uppercase">Cargando Actividad Global...</div>;

  return (
    <div className="space-y-6">
      {logs.map((log) => (
        <div key={log.id} className="relative pl-8 border-l border-white/5">
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-black border-2 border-primary flex items-center justify-center">
             <div className="w-1 h-1 rounded-full bg-primary animate-ping"></div>
          </div>
          
          <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-2xl shadow-xl group">
            <div className="flex justify-between items-start mb-2">
              <div 
                onClick={() => onSelectOT(log.work_orders)}
                className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-all"
              >
                <span className="text-primary text-[8px] font-black uppercase">OT #{log.work_orders?.folio.toString().padStart(4, '0')}</span>
                <span className="text-gray-600 text-[12px]">•</span>
                <span className="text-white text-[10px] font-bold truncate max-w-[150px]">{log.work_orders?.titulo}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 text-[8px] font-medium">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <button 
                  onClick={() => handleDeleteLog(log.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-800 hover:text-red-500 transition-all"
                >
                   <X size={12} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
               {getStatusIcon(log.estado_nuevo)}
               <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest">{log.estado_nuevo?.replace('_', ' ')}</span>
            </div>

            <p className="text-gray-500 text-[11px] font-medium leading-tight mb-4">{log.comentario}</p>
            
            {log.estado_nuevo === 'Pendiente_Validacion' && (
               <button 
                onClick={() => handleValidate(log.ot_id)}
                className="w-full py-3 bg-yellow-500 text-black text-[9px] font-black uppercase rounded-xl hover:bg-yellow-400 transition-all mb-4 shadow-lg shadow-yellow-500/10"
               >
                  Validar y Cerrar OT
               </button>
            )}

            {log.foto_url && (
               <div className="mt-3 rounded-xl overflow-hidden border border-white/5">
                  <img src={log.foto_url} alt="Evidencia" className="w-full h-32 object-cover opacity-80" />
               </div>
            )}
          </div>
        </div>
      ))}
      {logs.length === 0 && (
         <div className="text-center py-20 text-gray-700 text-[10px] font-black uppercase">Sin actividad reciente en el sistema.</div>
      )}
    </div>
  );
};

export default GlobalTimeline;
