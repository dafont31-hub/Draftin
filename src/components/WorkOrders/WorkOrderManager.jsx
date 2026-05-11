import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Table as TableIcon,
  Search,
  Filter,
  Plus,
  ArrowRight,
  MoreVertical,
  User,
  Clock,
  AlertTriangle,
  History
} from 'lucide-react';
import WorkOrderKanban from './WorkOrderKanban';
import WorkOrderCalendar from './WorkOrderCalendar';
import WorkOrderTable from './WorkOrderTable';

const WorkOrderManager = ({ t, onNewOT, onSelectOT }) => {
  const [activeView, setActiveView] = useState('kanban'); // kanban, calendar, table
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ estado: 'Todas', prioridad: 'Todas', tipo: 'Todas' });
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    fetchOrders();
    
    // Suscripción en tiempo real
    const channel = supabase
      .channel('work_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*, assets(nombre, sistema), tecnico:perfiles!work_orders_tecnico_id_fkey(nombre)')
      .order('fecha_apertura', { ascending: false });

    if (!error) setOrders(data);
    setLoading(false);
  };

  const filteredOrders = orders.filter(ot => {
    const matchesSearch = ot.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ot.folio?.toString().includes(searchTerm) ||
                         ot.assets?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filters.estado === 'Todas' || ot.estado === filters.estado;
    const matchesPrioridad = filters.prioridad === 'Todas' || ot.prioridad === filters.prioridad;
    const matchesTipo = filters.tipo === 'Todas' || ot.tipo === filters.tipo;

    return matchesSearch && matchesEstado && matchesPrioridad && matchesTipo;
  });

  return (
    <div className="flex flex-col h-full bg-transparent text-white animate-in fade-in duration-700">
      {/* HEADER ESTRATÉGICO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-[20px] font-black uppercase italic tracking-tighter leading-none">Centro de Control CMMS</h1>
          <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-color-rgb),0.5)]"></span>
            {orders.length} Órdenes Activas
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* TABS DE VISTA PROFESIONAL */}
          <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-white/5">
            {[
              { id: 'kanban', icon: <LayoutDashboard size={14} />, label: 'Kanban' },
              { id: 'calendar', icon: <CalendarIcon size={14} />, label: 'Calendario' },
              { id: 'table', icon: <TableIcon size={14} />, label: 'Tabla' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${
                  activeView === tab.id 
                  ? 'bg-primary text-black' 
                  : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('view_timeline'))}
            className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 hover:text-primary transition-all border border-white/5"
            title="Ver Línea de Tiempo Global"
          >
            <History size={18} />
          </button>

          <button 
            onClick={onNewOT}
            className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black shadow-[0_5px_15px_rgba(255,107,0,0.3)] active:scale-90 transition-all ml-1"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* BARRA DE FILTROS INTELIGENTE */}
      <div className="flex flex-wrap gap-4 mb-8 bg-[#0D0D0D] p-3 rounded-3xl border border-white/5 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
          <input 
            type="text"
            placeholder="BUSCAR POR FOLIO, TÍTULO O ACTIVO..."
            className="w-full bg-black border border-white/5 rounded-2xl p-3 pl-12 text-[10px] font-bold uppercase tracking-widest focus:border-primary outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 bg-black border border-white/5 rounded-2xl px-4 py-2">
          <Clock size={14} className="text-gray-600" />
          <input type="date" className="bg-transparent text-[10px] font-bold uppercase outline-none" />
          <ArrowRight size={12} className="text-gray-800" />
          <input type="date" className="bg-transparent text-[10px] font-bold uppercase outline-none" />
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-2xl transition-all border ${showFilters ? 'bg-primary text-black border-primary' : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'}`}
          >
            <Filter size={18} />
          </button>

          {showFilters && (
            <div className="absolute right-0 top-full mt-4 w-72 bg-[#111] border border-white/5 rounded-3xl p-6 shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-300">
               <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Filtros Avanzados</h4>
                  <button onClick={() => setFilters({ estado: 'Todas', prioridad: 'Todas', tipo: 'Todas' })} className="text-[8px] text-primary font-black uppercase">Limpiar</button>
               </div>

               <div className="space-y-6">
                  <div>
                     <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest block mb-2">Estado</label>
                     <select 
                       value={filters.estado}
                       onChange={(e) => setFilters({...filters, estado: e.target.value})}
                       className="w-full bg-black border border-white/5 rounded-xl p-3 text-[9px] font-bold text-white uppercase outline-none"
                     >
                        <option value="Todas">Todos los Estados</option>
                        <option value="Abierta">Abierta</option>
                        <option value="En_Proceso">En Proceso</option>
                        <option value="Pendiente_Validacion">Pendiente Validación</option>
                        <option value="Finalizada">Finalizada</option>
                     </select>
                  </div>

                  <div>
                     <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest block mb-2">Prioridad</label>
                     <select 
                       value={filters.prioridad}
                       onChange={(e) => setFilters({...filters, prioridad: e.target.value})}
                       className="w-full bg-black border border-white/5 rounded-xl p-3 text-[9px] font-bold text-white uppercase outline-none"
                     >
                        <option value="Todas">Todas las Prioridades</option>
                        <option value="Baja">Baja</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                        <option value="Urgente">Urgente</option>
                     </select>
                  </div>

                  <div>
                     <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest block mb-2">Tipo de OT</label>
                     <select 
                       value={filters.tipo}
                       onChange={(e) => setFilters({...filters, tipo: e.target.value})}
                       className="w-full bg-black border border-white/5 rounded-xl p-3 text-[9px] font-bold text-white uppercase outline-none"
                     >
                        <option value="Todas">Todos los Tipos</option>
                        <option value="Correctivo">Correctivo</option>
                        <option value="Preventivo">Preventivo</option>
                        <option value="Mejora">Mejora</option>
                        <option value="Legal">Legal</option>
                     </select>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* RENDERIZADO DINÁMICO DE VISTAS */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center flex-col gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 animate-pulse">Sincronizando Sistema...</p>
          </div>
        ) : (
          <>
            {activeView === 'kanban' && <WorkOrderKanban orders={filteredOrders} onSelectOT={onSelectOT} />}
            {activeView === 'calendar' && <WorkOrderCalendar orders={filteredOrders} onSelectOT={onSelectOT} />}
            {activeView === 'table' && <WorkOrderTable orders={filteredOrders} onSelectOT={onSelectOT} onRefresh={fetchOrders} />}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkOrderManager;
