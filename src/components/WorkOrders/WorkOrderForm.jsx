import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  X, 
  Save, 
  MapPin, 
  Mic, 
  Camera, 
  ChevronDown, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import LOTOChecklist from './LOTOChecklist';

const WorkOrderForm = ({ onClose, onSave, assets }) => {
  const [loading, setLoading] = useState(false);
  const [showLOTO, setShowLOTO] = useState(false);
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]); // [plantaId, salaId, equipoId]

  useEffect(() => {
    fetchTecnicos();
  }, []);

  const fetchTecnicos = async () => {
    const { data } = await supabase.from('perfiles').select('id, nombre').order('nombre');
    if (data) setTecnicos(data);
  };
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'Media',
    asset_id: '',
    tipo: 'Correctivo',
    categoria_coste: 'Mecánico',
    coste_estimado: 0,
    loto_gas: false,
    loto_elec: false,
    loto_presion: false,
    duracion_estimada: 1.0,
    loto_validado: false
  });

  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.asset_id) return alert('Debes seleccionar un equipo');
    
    setLoading(true);
    // Ahora que la DB está actualizada, enviamos todo el formData (menos loto_validado que es solo UI)
    const { loto_validado, ...dbData } = formData;
    
    const { data, error } = await supabase
      .from('work_orders')
      .insert([dbData])
      .select();
    
    if (error) {
      console.error('Error creating OT:', error);
      alert('Error al crear OT: ' + error.message);
      setLoading(false);
      return;
    }

    if (data && data[0]) {
      await supabase.from('ot_logs').insert([{
        ot_id: data[0].id,
        estado_nuevo: 'Abierta',
        comentario: 'Orden de Trabajo creada correctamente.'
      }]);
      onSave(data[0]);
    }
    setLoading(false);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Simulación de Voice-to-Text
    if (!isRecording) {
      setTimeout(() => {
        setFormData(prev => ({ 
          ...prev, 
          descripcion: prev.descripcion + " [Nota de voz: Revisar válvula de seguridad bloqueada]" 
        }));
        setIsRecording(false);
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black p-4 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto no-scrollbar pb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onClose} className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl text-gray-400 hover:text-white transition-all border border-white/5 font-black uppercase text-[10px] tracking-widest">
          <X size={18} /> VOLVER
        </button>
        <h2 className="text-white text-[12px] font-black uppercase tracking-[0.3em] italic">Nueva Orden de Trabajo (OT)</h2>
        <div className="w-20" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-lg mx-auto w-full">
        {/* SELECTOR JERÁRQUICO MOCK (Basado en assets pasados) */}
        <div className="space-y-2">
          <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={10} className="text-primary" /> Localización del Activo
          </label>
          <div className="grid grid-cols-1 gap-2">
             <select 
               className="w-full bg-[#111] border border-white/5 text-white p-4 rounded-2xl text-[12px] outline-none focus:border-primary font-bold uppercase tracking-widest appearance-none"
               onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
             >
               <option value="">Seleccionar Equipo...</option>
               {(assets || []).map(a => (
                 <option key={a.id} value={a.id}>{a.nombre} ({a.id_tecnico})</option>
               ))}
             </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Título de la Avería</label>
          <input 
            type="text"
            required
            placeholder="EJ: FUGA EN COLECTOR PRINCIPAL"
            className="w-full bg-[#111] border border-white/5 text-white p-5 rounded-2xl text-[14px] outline-none focus:border-primary font-black uppercase tracking-wider"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          />
        </div>

        <div className="space-y-2 relative">
          <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Descripción Técnica</label>
          <textarea 
            rows={4}
            className="w-full bg-[#111] border border-white/5 text-white p-5 rounded-2xl text-[13px] outline-none focus:border-primary placeholder:text-gray-800"
            placeholder="DESCRIBE LOS SÍNTOMAS O HALLAZGOS..."
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          />
          <button 
            type="button"
            onClick={toggleRecording}
            className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-white/5 text-gray-400'}`}
          >
            <Mic size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Asignar Técnico</label>
            <select 
              className="w-full bg-[#111] border border-white/5 text-white p-4 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-primary"
              value={formData.tecnico_id || ''}
              onChange={(e) => setFormData({ ...formData, tecnico_id: e.target.value })}
            >
              <option value="">SIN ASIGNAR</option>
              {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Prioridad</label>
            <select 
              className="w-full bg-[#111] border border-white/5 text-white p-4 rounded-xl text-[10px] outline-none focus:border-primary font-bold uppercase"
              value={formData.prioridad}
              onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Tipo de OT</label>
            <select 
              className="w-full bg-[#111] border border-white/5 text-white p-4 rounded-xl text-[10px] outline-none focus:border-primary font-bold uppercase"
              value={formData.tipo || 'Correctivo'}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            >
              <option value="Correctivo">Mantenimiento Correctivo</option>
              <option value="Preventivo">Mantenimiento Preventivo</option>
              <option value="Predictivo">Mantenimiento Predictivo</option>
              <option value="Mejora">Mejora / Proyecto</option>
              <option value="Legal">Inspección Legal</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Tiempo Estimado (Horas)</label>
          <div className="flex items-center gap-4 bg-[#111] p-4 rounded-2xl border border-white/5">
             <input 
               type="range" 
               min="0.5" 
               max="12" 
               step="0.5"
               className="flex-1 accent-primary"
               value={formData.duracion_estimada}
               onChange={(e) => setFormData({...formData, duracion_estimada: parseFloat(e.target.value)})}
             />
             <span className="text-white text-[14px] font-black w-16 text-right">{formData.duracion_estimada}h</span>
          </div>
        </div>

        {/* ACCIÓN LOTO */}
        <div 
          onClick={() => setShowLOTO(true)}
          className="p-5 bg-orange-600/10 border border-orange-500/20 rounded-2xl flex items-center justify-between cursor-pointer group hover:bg-orange-600/20 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-white text-[10px] font-black uppercase italic tracking-widest">Protocolo LOTO</p>
              <p className="text-orange-500 text-[8px] font-bold uppercase tracking-widest">Seguridad Industrial Obligatoria</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[7px] font-black uppercase ${formData.loto_validado ? 'bg-green-600 text-white' : 'bg-red-600 text-white animate-pulse'}`}>
            {formData.loto_validado ? 'VALIDADO' : 'PENDIENTE'}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !formData.loto_validado}
          className="w-full p-6 bg-primary text-black font-black uppercase tracking-[0.5em] rounded-3xl shadow-2xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale"
        >
          {loading ? 'CREANDO...' : 'LANZAR ORDEN DE TRABAJO'}
        </button>
      </form>

      {/* MODAL LOTO */}
      {showLOTO && (
        <LOTOChecklist 
          data={formData}
          assetSystem={assets.find(a => a.id === formData.asset_id)?.sistema || 'Generación'}
          onComplete={(lotoData) => {
            setFormData({ ...formData, ...lotoData, loto_validado: true });
            setShowLOTO(false);
          }}
          onClose={() => setShowLOTO(false)}
        />
      )}
    </div>
  );
};

export default WorkOrderForm;
