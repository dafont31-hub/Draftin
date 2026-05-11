import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Clock, MoreHorizontal } from 'lucide-react';

const WorkOrderCalendar = ({ orders, onSelectOT }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Mes'); // 'Mes', 'Semana', 'Agenda'

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getOrdersForDay = (day) => {
    return orders.filter(ot => {
      const otDate = new Date(ot.fecha_apertura);
      return otDate.getDate() === day && 
             otDate.getMonth() === currentDate.getMonth() && 
             otDate.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D] rounded-[32px] border border-white/5 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      {/* CALENDAR HEADER */}
      <div className="p-6 border-b border-white/5 bg-[#111] flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="flex bg-black rounded-xl p-1 border border-white/5">
            <button onClick={prevMonth} className="p-2 hover:text-primary transition-colors"><ChevronLeft size={18} /></button>
            <button onClick={nextMonth} className="p-2 hover:text-primary transition-colors"><ChevronRight size={18} /></button>
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
            {months[currentDate.getMonth()]} <span className="text-primary">{currentDate.getFullYear()}</span>
          </h2>
        </div>

        <div className="flex bg-black rounded-xl p-1 border border-white/5">
          {['Mes', 'Semana', 'Agenda'].map(mode => (
            <button 
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* MONTH VIEW GRID */}
      {viewMode === 'Mes' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-auto">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 border-b border-white/5">
            {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(d => (
              <div key={d} className="p-3 text-[8px] font-black uppercase tracking-widest text-gray-600 text-center border-r border-white/5">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex-1 grid grid-cols-7 grid-rows-5">
            {[...Array(42)].map((_, i) => {
              const dayNumber = i - firstDayOfMonth + 1;
              const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
              const dayOrders = isCurrentMonth ? getOrdersForDay(dayNumber) : [];
              
              return (
                <div 
                  key={i} 
                  className={`min-h-[100px] border-b border-r border-white/5 p-2 transition-all ${isCurrentMonth ? 'bg-transparent' : 'bg-black/40 opacity-20'}`}
                >
                  {isCurrentMonth && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[10px] font-black ${new Date().getDate() === dayNumber && new Date().getMonth() === currentDate.getMonth() ? 'text-primary' : 'text-gray-500'}`}>
                          {dayNumber}
                        </span>
                        {dayOrders.length > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayOrders.slice(0, 3).map(ot => (
                          <div 
                            key={ot.id}
                            onClick={() => onSelectOT(ot)}
                            className="p-1.5 bg-primary/10 border-l-2 border-primary rounded text-[7px] font-black text-primary uppercase truncate cursor-pointer hover:bg-primary/20 transition-all"
                          >
                            {ot.titulo}
                          </div>
                        ))}
                        {dayOrders.length > 3 && (
                          <div className="text-[7px] font-bold text-gray-700 uppercase pl-1">
                            + {dayOrders.length - 3} Más...
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'Semana' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-auto">
          <div className="grid grid-cols-7 border-b border-white/5">
            {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(d => (
              <div key={d} className="p-3 text-[8px] font-black uppercase tracking-widest text-gray-600 text-center border-r border-white/5">{d}</div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7">
            {[...Array(7)].map((_, i) => {
              // Obtener el lunes de la semana actual
              const d = new Date(currentDate);
              const day = d.getDay();
              const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
              const monday = new Date(d.setDate(diff));
              
              const currentDay = new Date(monday);
              currentDay.setDate(monday.getDate() + i);
              
              const dayOrders = orders.filter(ot => {
                const otDate = new Date(ot.fecha_apertura);
                return otDate.toDateString() === currentDay.toDateString();
              });

              const isToday = currentDay.toDateString() === new Date().toDateString();

              return (
                <div key={i} className={`min-h-[200px] border-r border-white/5 p-4 flex flex-col gap-4 ${isToday ? 'bg-primary/5' : ''}`}>
                  <div className="flex flex-col items-center">
                    <span className={`text-[14px] font-black ${isToday ? 'text-primary' : 'text-gray-500'}`}>{currentDay.getDate()}</span>
                    <span className="text-[7px] text-gray-700 font-bold uppercase tracking-widest">{months[currentDay.getMonth()]}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {dayOrders.map(ot => (
                      <div 
                        key={ot.id}
                        onClick={() => onSelectOT(ot)}
                        className="p-3 bg-black/40 border border-white/5 rounded-xl text-[8px] font-black text-white uppercase leading-tight cursor-pointer hover:border-primary transition-all"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${ot.prioridad === 'Urgente' ? 'bg-red-500' : 'bg-primary'}`}></div>
                          <span className="text-gray-500 truncate">{ot.tipo || 'Correctivo'}</span>
                        </div>
                        {ot.titulo}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA VIEW */}
      {viewMode === 'Agenda' && (
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {orders.filter(o => o.estado !== 'Finalizada').sort((a,b) => new Date(a.fecha_apertura) - new Date(b.fecha_apertura)).slice(0, 20).map(ot => (
            <div 
              key={ot.id}
              onClick={() => onSelectOT(ot)}
              className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-primary transition-all cursor-pointer"
            >
              <div className="flex items-center gap-6">
                <div className="text-center w-12 shrink-0">
                  <p className="text-[14px] font-black text-white">{new Date(ot.fecha_apertura).getDate()}</p>
                  <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{months[new Date(ot.fecha_apertura).getMonth()].substring(0,3)}</p>
                </div>
                <div>
                   <p className="text-[11px] font-black text-white uppercase italic tracking-widest group-hover:text-primary transition-all">{ot.titulo}</p>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{ot.tecnico?.nombre || 'POR ASIGNAR'}</span>
                      <span className="text-gray-800">•</span>
                      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{ot.prioridad}</span>
                   </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-800 group-hover:text-primary transition-all" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkOrderCalendar;
