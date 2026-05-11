import React from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, Clock, X } from 'lucide-react';

const NotificationsDropdown = ({ notifications, onClose, onClear }) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-[#0A0A0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[500] animate-in slide-in-from-top-4 duration-300">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic">Alertas del Sistema</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
        {notifications.length > 0 ? (
          notifications.map((n, i) => (
            <div key={i} className="p-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer group">
              <div className="flex gap-3">
                <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  n.type === 'critical' ? 'bg-red-500/10 text-red-500' : 
                  n.type === 'warning' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {n.type === 'critical' ? <AlertTriangle size={16} /> : <Clock size={16} />}
                </div>
                <div>
                  <p className="text-[11px] font-black text-white uppercase leading-tight group-hover:text-primary transition-colors">{n.title}</p>
                  <p className="text-[9px] text-gray-500 mt-1 font-bold leading-relaxed">{n.message}</p>
                  <p className="text-[7px] text-gray-700 mt-2 font-black uppercase tracking-widest">{n.time}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <CheckCircle className="mx-auto text-gray-800 mb-3" size={32} />
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sin alertas pendientes</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <button 
          onClick={onClear}
          className="w-full p-3 text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] hover:bg-white/5 hover:text-white transition-all border-t border-white/5"
        >
          Limpiar Todo
        </button>
      )}
    </div>
  );
};

export default NotificationsDropdown;
