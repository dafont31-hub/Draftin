import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  X, 
  Play, 
  Pause, 
  CheckCircle, 
  MessageSquare,
  Package,
  History,
  TrendingDown,
  Timer,
  Camera,
  ShieldAlert,
  Activity
} from 'lucide-react';
import WorkOrderTimeline from './WorkOrderTimeline';
import LOTOChecklist from './LOTOChecklist';

const WorkOrderDetails = ({ ot, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, materiales
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLOTO, setShowLOTO] = useState(false);
  const [photoBefore, setPhotoBefore] = useState(ot.foto_antes || null);
  const [photoAfter, setPhotoAfter] = useState(ot.foto_despues || null);
  const [uploading, setUploading] = useState(false);
  const [tecnicos, setTecnicos] = useState([]);

  useEffect(() => {
    fetchLogs();
    fetchTecnicos();
  }, [ot.id]);

  const fetchTecnicos = async () => {
    const { data } = await supabase.from('perfiles').select('id, nombre').order('nombre');
    if (data) setTecnicos(data);
  };

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('ot_logs')
      .select('*')
      .eq('ot_id', ot.id)
      .order('created_at', { ascending: false });
    if (data) setLogs(data);
  };

  const handleStatusChange = async (nuevoEstado, lotoData = null) => {
    setLoading(true);
    const updates = { estado: nuevoEstado };
    
    if (nuevoEstado === 'En_Proceso') {
      updates.fecha_inicio_trabajo = new Date();
      updates.foto_antes = photoBefore;
      if (lotoData) {
        updates.loto_gas = lotoData.loto_gas || false;
        updates.loto_elec = lotoData.loto_elec || false;
        updates.loto_presion = lotoData.loto_presion || false;
        updates.loto_agua = lotoData.loto_agua || false;
        updates.loto_aire = lotoData.loto_aire || false;
        updates.loto_quimico = lotoData.loto_quimico || false;
        updates.loto_valvulas = lotoData.loto_valvulas || false;
      }
    }
    if (nuevoEstado === 'Pendiente_Validacion') {
      updates.foto_despues = photoAfter;
    }
    if (nuevoEstado === 'Cerrada') updates.fecha_cierre = new Date();

    const { error: updateError } = await supabase
      .from('work_orders')
      .update(updates)
      .eq('id', ot.id);

    if (updateError) {
      console.error('CRITICAL: Error updating work order:', updateError);
      alert('Error al guardar: ' + (updateError.message || 'Error de base de datos'));
      setLoading(false);
      return;
    }

    // Log the change
    await supabase.from('ot_logs').insert([{
      ot_id: ot.id,
      estado_anterior: ot.estado,
      estado_nuevo: nuevoEstado,
      comentario: `Cambio de estado a ${nuevoEstado}`,
      foto_url: nuevoEstado === 'En_Proceso' ? photoBefore : (nuevoEstado === 'Pendiente_Validacion' ? photoAfter : null)
    }]);

    onUpdate();
    setLoading(false);
  };

  const handlePhotoCapture = (type) => {
    // Simulación de captura y subida
    setUploading(true);
    setTimeout(() => {
      const mockUrl = type === 'antes' 
        ? 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80' 
        : 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80';
      
      if (type === 'antes') setPhotoBefore(mockUrl);
      else setPhotoAfter(mockUrl);
      setUploading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black p-4 flex flex-col animate-in fade-in zoom-in-95 duration-300 overflow-y-auto no-scrollbar pb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onClose} className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl text-gray-400 hover:text-white transition-all border border-white/5 font-black uppercase text-[10px] tracking-widest">
          <X size={18} /> VOLVER
        </button>
        <div className="flex flex-col items-center">
          <span className="text-primary text-[8px] font-black uppercase tracking-[0.4em]">Detalle Técnico</span>
          <h2 className="text-white text-[14px] font-black uppercase tracking-widest italic">OT #{ot.folio?.toString().padStart(4, '0') || '----'}</h2>
        </div>
        <div className="w-20" />
      </div>

      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* CABECERA RESUMEN */}
        <div className="p-6 bg-gradient-to-br from-[#111] to-black border border-white/5 rounded-[32px] relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-white text-[24px] font-black uppercase italic leading-tight mb-2">{ot.titulo}</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,107,0,0.5)]"></span>
              {ot.assets?.nombre || 'Equipo Principal'}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex flex-col gap-2">
                <label className="text-[7px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                  <User size={10} /> Asignación Técnico
                </label>
                <select 
                  className="bg-black border border-white/10 text-white p-2 rounded-lg text-[10px] font-bold uppercase outline-none focus:border-primary"
                  value={ot.tecnico_id || ''}
                  onChange={async (e) => {
                    const newId = e.target.value;
                    const { error } = await supabase.from('work_orders').update({ tecnico_id: newId }).eq('id', ot.id);
                    if (!error) onUpdate();
                  }}
                >
                  <option value="">SIN ASIGNAR</option>
                  {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>
              <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex flex-col gap-2">
                <label className="text-[7px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={10} /> Prioridad
                </label>
                <select 
                  className="bg-black border border-white/10 text-white p-2 rounded-lg text-[10px] font-bold uppercase outline-none focus:border-primary"
                  value={ot.prioridad || 'Media'}
                  onChange={async (e) => {
                    const newP = e.target.value;
                    const { error } = await supabase.from('work_orders').update({ prioridad: newP }).eq('id', ot.id);
                    if (!error) onUpdate();
                  }}
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  ot.fecha_inicio_trabajo && (
                    (new Date(ot.fecha_cierre || new Date()) - new Date(ot.fecha_inicio_trabajo)) / 3600000 > (ot.duracion_estimada || 1)
                    ? 'bg-red-600/10 text-red-500' 
                    : 'bg-blue-600/10 text-blue-500'
                  ) || 'bg-white/5 text-gray-500'
                }`}>
                  <Timer size={20} />
                </div>
                <div>
                   <p className="text-gray-600 text-[7px] font-black uppercase">Tiempo Real vs Est.</p>
                   <p className={`text-[14px] font-black tracking-tighter ${
                     ot.fecha_inicio_trabajo && (
                       (new Date(ot.fecha_cierre || new Date()) - new Date(ot.fecha_inicio_trabajo)) / 3600000 > (ot.duracion_estimada || 1)
                       ? 'text-red-500 animate-pulse' 
                       : 'text-white'
                     ) || 'text-gray-500'
                   }`}>
                     {ot.fecha_inicio_trabajo ? (
                       (() => {
                         const diff = new Date(ot.fecha_cierre || new Date()) - new Date(ot.fecha_inicio_trabajo);
                         const h = Math.floor(diff / 3600000);
                         const m = Math.floor((diff % 3600000) / 60000);
                         return `${h}h ${m}m / ${ot.duracion_estimada || 1}h`;
                       })()
                     ) : 'Sin Iniciar'}
                   </p>
                </div>
              </div>
              <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-600/10 rounded-xl flex items-center justify-center text-orange-500">
                  <TrendingDown size={20} />
                </div>
                <div>
                   <p className="text-gray-600 text-[7px] font-black uppercase">Downtime Equipo</p>
                   <p className="text-white text-[14px] font-black tracking-tighter">{ot.downtime_total || '0h'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLES DE ESTADO Y EVIDENCIA */}
        <div className="space-y-4">
          {/* SECCIÓN DE FOTOS OBLIGATORIAS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Evidencia Antes</label>
              <button 
                onClick={() => handlePhotoCapture('antes')}
                disabled={ot.estado !== 'Abierta' && ot.estado !== 'Borrador'}
                className={`w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${photoBefore ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-black'}`}
              >
                {photoBefore ? (
                  <img src={photoBefore} className="w-full h-full object-cover rounded-xl" alt="Antes" />
                ) : (
                  <>
                    <Camera size={24} className="text-gray-600" />
                    <span className="text-[7px] font-black text-gray-600 uppercase">Capturar Antes</span>
                  </>
                )}
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Evidencia Después</label>
              <button 
                onClick={() => handlePhotoCapture('despues')}
                disabled={ot.estado !== 'En_Proceso'}
                className={`w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${photoAfter ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-black'}`}
              >
                {photoAfter ? (
                  <img src={photoAfter} className="w-full h-full object-cover rounded-xl" alt="Después" />
                ) : (
                  <>
                    <Camera size={24} className="text-gray-600" />
                    <span className="text-[7px] font-black text-gray-600 uppercase">Capturar Después</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            {ot.estado === 'Abierta' && (
              <button 
                onClick={() => setShowLOTO(true)}
                className="flex-1 p-5 bg-orange-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all"
              >
                <ShieldAlert size={18} /> Validar LOTO e Iniciar
              </button>
            )}
            {ot.estado === 'En_Proceso' && (
              <>
                <button 
                  onClick={() => handleStatusChange('Pausada')}
                  className="flex-1 p-5 bg-[#111] text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  <Pause size={18} fill="currentColor" /> Pausar
                </button>
                <button 
                  onClick={() => handleStatusChange('Pendiente_Validacion')}
                  className="flex-1 p-5 bg-green-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl transition-all"
                >
                  <CheckCircle size={18} /> Finalizar
                </button>
              </>
            )}
          </div>
        </div>

        {/* MODAL LOTO DINÁMICO */}
        {showLOTO && (
          <LOTOChecklist 
            data={ot}
            assetSystem={ot.assets?.sistema || 'Generación'}
            onComplete={(lotoData) => {
              handleStatusChange('En_Proceso', lotoData);
              setShowLOTO(false);
            }}
            onClose={() => setShowLOTO(false)}
          />
        )}

        {/* TABS NAVEGACIÓN */}
         <div className="flex bg-[#0D0D0D] p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'timeline' ? 'bg-white/5 text-white shadow-inner' : 'text-gray-500'}`}
            >
              <History size={14} /> Timeline
            </button>
            <button 
              onClick={() => setActiveTab('memoria')}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'memoria' ? 'bg-white/5 text-white shadow-inner' : 'text-gray-500'}`}
            >
              <Activity size={14} /> Memoria
            </button>
            <button 
              onClick={() => setActiveTab('materiales')}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'materiales' ? 'bg-white/5 text-white shadow-inner' : 'text-gray-500'}`}
            >
              <Package size={14} /> Repuestos
            </button>
         </div>

        {/* CONTENIDO DINÁMICO */}
        <div className="pb-10">
           {activeTab === 'timeline' ? (
              <WorkOrderTimeline logs={logs} />
           ) : activeTab === 'materiales' ? (
              <div className="py-20 text-center border border-dashed border-white/5 rounded-[32px]">
                 <Package className="text-gray-800 mx-auto mb-4" size={40} />
                 <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Módulo de Repuestos En Desarrollo</p>
                 <button className="mt-6 px-6 py-3 bg-white/5 rounded-xl text-white text-[8px] font-black uppercase tracking-widest border border-white/10 hover:border-primary transition-all">
                    Añadir Material
                 </button>
              </div>
           ) : (
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <History size={14} /> Memoria del Activo (Historial)
                 </h4>
                 {/* Aquí se cargarían las OTs anteriores del mismo activo */}
                 <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[9px] text-gray-500 font-bold uppercase mb-2">Última Intervención Similar</p>
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-white text-[11px] font-black uppercase">Cambio de Válvula de Seguridad</p>
                          <p className="text-gray-600 text-[8px] font-bold uppercase mt-1">Solución: Sustitución de junta y muelle. Material: Kit V-34.</p>
                       </div>
                       <span className="text-green-500 text-[8px] font-black">EXITOSO</span>
                    </div>
                 </div>
                 <p className="text-[8px] text-gray-600 italic text-center py-4">
                    La IA está analizando patrones históricos para este equipo...
                 </p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default WorkOrderDetails;
