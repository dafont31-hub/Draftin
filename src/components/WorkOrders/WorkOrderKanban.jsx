import React from 'react';
import { MoreVertical, User, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

const STAGES = [
  { id: 'Abierta', label: 'POR HACER', color: 'border-blue-500/30' },
  { id: 'Pausada', label: 'ESPERANDO MATERIAL', color: 'border-orange-500/30' },
  { id: 'En_Proceso', label: 'EN PROGRESO', color: 'border-emerald-500/30' },
  { id: 'Pendiente_Validacion', label: 'EN VALIDACIÓN', color: 'border-yellow-500/30' },
  { id: 'Cerrada', label: 'FINALIZADO', color: 'border-gray-500/30' }
];

const WorkOrderKanban = ({ orders, onSelectOT }) => {
  const getOrdersByStage = (stageId) => orders.filter(ot => ot.estado === stageId);

  return (
    <div className="h-full flex gap-6 overflow-x-auto pb-6 no-scrollbar">
      {STAGES.map((stage) => {
        const stageOrders = getOrdersByStage(stage.id);
        
        return (
          <div key={stage.id} className="flex-shrink-0 w-[280px] flex flex-col gap-4">
            {/* COLUMN HEADER */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-6 rounded-full ${stage.color.replace('border-', 'bg-').split('/')[0]}`}></div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white/90">{stage.label}</h3>
              </div>
              <span className="bg-white/5 px-2 py-0.5 rounded text-[9px] font-bold text-gray-500">{stageOrders.length}</span>
            </div>

            {/* CARDS CONTAINER */}
            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-10 px-1">
              {stageOrders.map((ot) => (
                <div 
                  key={ot.id}
                  onClick={() => onSelectOT(ot)}
                  className={`group relative bg-[#0D0D0D] border-l-4 ${stage.color} p-4 rounded-2xl border-y border-r border-white/5 hover:border-white/10 transition-all cursor-pointer active:scale-95 shadow-xl`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">#OT-{ot.folio?.toString().padStart(4, '0') || '----'}</span>
                    <div className="flex items-center gap-1">
                        {ot.prioridad === 'Crítica' && <AlertTriangle size={12} className="text-red-500 animate-pulse" />}
                        <MoreVertical size={12} className="text-gray-700" />
                    </div>
                  </div>

                  <h4 className="text-[12px] font-black text-white uppercase leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {ot.titulo}
                  </h4>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                      <User size={10} />
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 truncate">{ot.tecnico?.nombre || 'Sin Asignar'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={10} />
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        {new Date(ot.fecha_apertura).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Detalles <ChevronRight size={10} />
                    </div>
                  </div>
                </div>
              ))}

              {stageOrders.length === 0 && (
                <div className="h-20 border border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                  <p className="text-[8px] font-black text-gray-800 uppercase tracking-widest">Vacio</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkOrderKanban;
