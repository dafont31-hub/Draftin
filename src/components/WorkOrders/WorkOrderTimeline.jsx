import React from 'react';
import { 
  PlusCircle, 
  PlayCircle, 
  PauseCircle, 
  CheckCircle, 
  MessageSquare,
  Camera,
  History
} from 'lucide-react';

const WorkOrderTimeline = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="py-10 text-center border border-dashed border-white/5 rounded-[32px]">
        <History className="text-gray-800 mx-auto mb-4 opacity-20" size={32} />
        <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest italic">Aún no hay actividad registrada</p>
      </div>
    );
  }

  const getIcon = (estado) => {
    switch (estado) {
      case 'Abierta': return <PlusCircle size={14} />;
      case 'En_Proceso': return <PlayCircle size={14} />;
      case 'Pausada': return <PauseCircle size={14} />;
      case 'Pendiente_Validacion': return <CheckCircle size={14} />;
      case 'Cerrada': return <CheckCircle size={14} />;
      default: return <MessageSquare size={14} />;
    }
  };

  const getColor = (estado) => {
    switch (estado) {
      case 'Abierta': return 'text-blue-500 bg-blue-500/20';
      case 'En_Proceso': return 'text-orange-500 bg-orange-500/20';
      case 'Pausada': return 'text-red-500 bg-red-500/20';
      case 'Pendiente_Validacion': return 'text-yellow-500 bg-yellow-500/20';
      case 'Cerrada': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  return (
    <div className="relative pt-4 pb-10">
      <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/50 via-white/5 to-transparent"></div>
      <div className="space-y-12">
        {logs.map((log, index) => (
          <div key={log.id} className="relative pl-12 group animate-in slide-in-from-left duration-500" style={{ animationDelay: `${index * 100}ms` }}>
            <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-black flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${getColor(log.estado_nuevo)}`}>
              {getIcon(log.estado_nuevo)}
              {index === 0 && <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-20"></div>}
            </div>
            <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-5 shadow-2xl hover:border-white/10 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getColor(log.estado_nuevo)}`}>
                  {(log.estado_nuevo || 'INFO').replace('_', ' ')}
                </span>
                <span className="text-[8px] font-bold text-gray-600 uppercase">{new Date(log.created_at).toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-gray-300 font-medium leading-relaxed mb-4">{log.comentario}</p>
              {log.foto_url && (
                <div className="mt-4 rounded-xl overflow-hidden border border-white/10 group-hover:border-primary/30 transition-all">
                  <img src={log.foto_url} alt="Evidencia" className="w-full aspect-video object-cover" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkOrderTimeline;
