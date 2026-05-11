import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { processChecklistData } from '../services/dataService';
import { History, ClipboardList, Trash2, Calendar, FileText } from 'lucide-react';
import { generateChecklistReport } from '../services/reportService';

const Field = ({ label, value, onChange, type = "number", full = false, min, max }) => {
  const isOutOfRange = (min !== undefined && parseFloat(value) < min) || (max !== undefined && parseFloat(value) > max);
  
  return (
    <div className={`flex flex-col gap-1.5 mb-4 ${full ? 'w-full' : ''}`}>
      <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider flex justify-between">
        {label}
        {isOutOfRange && <span className="text-red-500 animate-pulse">¡VALOR CRÍTICO!</span>}
      </label>
      <input 
        type={type} 
        step="any" 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-[#111] border text-white text-[15px] p-3.5 rounded-xl outline-none transition-all placeholder:text-gray-800 ${
          isOutOfRange 
          ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
          : 'border-[#222] focus:border-primary'
        }`}
      />
    </div>
  );
};

const Header = ({ title, color = "text-primary", id }) => (
  <div id={id} className="sticky top-0 z-10 bg-black/90 backdrop-blur-md py-4 mb-6 border-b border-[#222]">
    <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] ${color}`}>{title}</h3>
  </div>
);

const Sub = ({ title }) => (
  <div className="mb-4 mt-2">
    <span className="text-[9px] font-black text-white bg-[#1A1A1A] px-2 py-1 rounded border border-[#333] uppercase">{title}</span>
  </div>
);

const RecogidaDatos = ({ t, refreshData, userName, userRole, branding, equipos }) => {
  const [activeTab, setActiveTab] = useState('nuevo'); // 'nuevo' o 'historial'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState([]);

  const [satelliteSelector, setSatelliteSelector] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    operario: userName || '',
    calderas: {
      c1: { nv: '', np: '', pt: '', tv: '', pge: '', pgq: '', qp: '', llp: '', cond: '', hf: '', pon: '', poff: '', ga: '', gd: '', aa: 'N' },
      c2: { nv: '', np: '', pt: '', tv: '', pge: '', pgq: '', qp: '', llp: '', cond: '', hf: '', pon: '', poff: '', ga: '', gd: '', aa: 'N' }
    },
    desgasificador: {
      nivel: '', temp: '', presion: '', 
      s6000_d: '', s6000_n: '', s3250_d: '', s3250_n: '', s4510_d: '', s4510_n: ''
    },
    intercambiadores: {
      a: { ps: '', ts: '', tc: '', aa: '', ad: '', h: '', l: 'N' },
      b: { ps: '', ts: '', tc: '', aa: '', ad: '', h: '', l: 'N' },
      c: { ps: '', ts: '', tc: '', aa: '', ad: '', h: '', l: 'N' },
      e: { ps: '', ts: '', tc: '', aa: '', ad: '', h: '', l: 'N' }
    },
    quimica: {
      c1: { d: '', ph: '', c: '' }, c2: { d: '', ph: '', c: '' }, desg: { d: '', ph: '', c: '' },
      dup1: { d: '', ph: '', c: '' }, dup2: { d: '', ph: '', c: '' },
      tri1: { d: '', ph: '', c: '' }, tri2: { d: '', ph: '', c: '' }, tri3: { d: '', ph: '', c: '' },
      tri4: { d: '', ph: '', c: '' }, tri5: { d: '', ph: '', c: '' }, tri6: { d: '', ph: '', c: '' },
      cond: { d: '', ph: '', c: '' }
    },
    salmuera: { nodriza: '', s2: '', s3: '' },
    descalcificadores: {
      int1: { aa: '', ad: '' }, int2: { aa: '', ad: '' }, int3: { aa: '', ad: '' },
      int4: { aa: '', ad: '' }, int5: { aa: '', ad: '' }, int6: { aa: '', ad: '' },
      cal1: { aa: '', ad: '' }, cal2: { aa: '', ad: '' }
    },
    satelites: {}, 
    bote: { nivel: '' },
    observaciones: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'select' && params.get('section') === 'limpieza') {
      setSatelliteSelector(true);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'historial') fetchHistory();
  }, [activeTab]);

  useEffect(() => {
    if (userName) {
      setFormData(prev => ({ ...prev, operario: userName }));
    }
  }, [userName]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data } = await supabase.from('revisiones_diarias').select('*').order('fecha', { ascending: false }).limit(30);
    if (data) setHistory(data);
    setLoading(false);
  };

  const handleDeleteRecord = async (fecha) => {
    if (!window.confirm(`¿Borrar registro del ${fecha}?`)) return;
    setLoading(true);
    await supabase.from('revisiones_diarias').delete().eq('fecha', fecha);
    await supabase.from('datos_operativos').delete().eq('fecha', fecha);
    fetchHistory();
    setLoading(false);
  };

  const handleUpdate = (section, item, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [item]: {
          ...prev[section][item],
          [field]: value
        }
      }
    }));
  };

  const handleSimpleUpdate = (section, field, value) => {
    if (!field) {
      setFormData(prev => ({ ...prev, [section]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    }
  };

  const [pendingSync, setPendingSync] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    if (section && activeTab === 'nuevo') {
      setTimeout(() => {
        const element = document.getElementById(`section-${section}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [activeTab]);
  useEffect(() => {
    const handleSync = () => {
      if (navigator.onLine) {
        const pending = localStorage.getItem('draftin_pending_revision');
        if (pending) {
          console.log("Sincronizando revisión pendiente...");
          handleSubmit(null, JSON.parse(pending));
        }
      }
    };

    window.addEventListener('online', handleSync);
    // Verificar al montar si hay algo pendiente y estamos online
    if (navigator.onLine) handleSync();
    
    return () => window.removeEventListener('online', handleSync);
  }, [refreshData]);

  const handleSubmit = async (e, syncPayload = null) => {
    if (e) e.preventDefault();
    setLoading(true);

    const dataToSave = syncPayload || formData;

    // Mapeo detallado para coincidir con el esquema de la DB
    const payload = syncPayload ? syncPayload : { 
      fecha: dataToSave.fecha, 
      operario: dataToSave.operario || userName || 'OPERARIO', 
      datos_calderas: dataToSave.calderas,
      datos_desgasificador: dataToSave.desgasificador,
      datos_intercambiadores: dataToSave.intercambiadores,
      datos_quimica: dataToSave.quimica,
      datos_salmuera: dataToSave.salmuera,
      datos_descalcificadores: dataToSave.descalcificadores,
      datos_bote: dataToSave.bote,
      datos_satelites: dataToSave.satelites,
      observaciones: dataToSave.observaciones,
      datos: dataToSave // Guardamos copia completa por seguridad
    };

    if (!navigator.onLine) {
      localStorage.setItem('draftin_pending_revision', JSON.stringify(payload));
      setPendingSync(true);
      alert('MODO OFFLINE: Los datos se han guardado localmente y se subirán automáticamente al recuperar la conexión.');
      setLoading(false);
      return;
    }

    try {
      // 1. Guardar registro principal
      const { error } = await supabase.from('revisiones_diarias').upsert([payload], { onConflict: 'fecha' });
      if (error) throw error;
      
      // 2. Procesar datos para analíticas automáticamente
      const processData = syncPayload ? syncPayload : formData;
      await processChecklistData(processData, payload.fecha);
      
      localStorage.removeItem('draftin_pending_revision');
      setPendingSync(false);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // No reseteamos success inmediatamente para que el usuario pueda descargar el informe
      setTimeout(() => setSuccess(false), 8000);
      
      if (refreshData) refreshData();
    } catch (error) {
      console.error('Error detallado Supabase:', error);
      const errorMsg = error.message || error.details || 'Error desconocido';
      const errorCode = error.code || 'SIN_CODIGO';
      alert(`ERROR AL GUARDAR (${errorCode}): ${errorMsg}\n\nSi el error es "42703", significa que faltan columnas en tu tabla. Ejecuta el SQL que te pasé.`);
      localStorage.setItem('draftin_pending_revision', JSON.stringify(payload));
      setPendingSync(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-40 max-w-2xl mx-auto px-4">
      {/* SELECTOR DE SATÉLITES (MODAL FULLSCREEN) */}
      {satelliteSelector && (
        <div className="fixed inset-0 z-[500] bg-black p-6 overflow-y-auto animate-in fade-in zoom-in duration-300">
          <div className="max-w-xl mx-auto space-y-8 mt-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-[18px] font-black uppercase italic tracking-widest">Identificar Satélite</h2>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Selecciona el equipo para continuar</p>
              </div>
              <button 
                onClick={() => setSatelliteSelector(false)}
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <input 
                type="text" 
                autoFocus
                placeholder="ESCRIBE NÚMERO O CÓDIGO..." 
                className="w-full bg-[#111] border border-white/10 text-white text-[14px] p-6 rounded-2xl outline-none focus:border-primary font-black uppercase tracking-widest"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pb-20">
              {(equipos || [])
                .filter(eq => eq.sistema === 'Limpieza' && eq.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(eq => (
                  <button 
                    key={eq.id}
                    onClick={() => {
                      setSatelliteSelector(false);
                      setFormData(prev => ({
                        ...prev,
                        satelites: { 
                          ...prev.satelites, 
                          [eq.id]: { 
                            ok: true, 
                            obs: '',
                            p_agua: '',
                            p_aire: '',
                            quimico: '',
                            manguera_ok: true,
                            v_retencion: true,
                            filtro: true,
                            inyector: true,
                            acoplamientos: true,
                            selectores: true
                          } 
                        }
                      }));
                      setTimeout(() => {
                        document.getElementById('section-limpieza')?.scrollIntoView({ behavior: 'smooth' });
                      }, 500);
                    }}
                    className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl text-left hover:border-primary/50 transition-all group"
                  >
                    <p className="text-white text-[12px] font-black uppercase mb-1 group-hover:text-primary">{eq.nombre}</p>
                    <p className="text-gray-600 text-[8px] font-bold uppercase tracking-widest">{eq.id_tecnico}</p>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[18px] font-black text-white tracking-widest uppercase italic">Centro de Datos</h2>
        {userRole?.toLowerCase() === 'admin' && (
          <div className="flex bg-[#111] rounded-xl p-1 border border-white/5">
            <button onClick={() => setActiveTab('nuevo')} className={`px-6 py-2 text-[10px] font-black uppercase rounded-lg flex items-center gap-2 ${activeTab === 'nuevo' ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'}`}>
              <ClipboardList size={14} /> NUEVO
            </button>
            <button onClick={() => setActiveTab('historial')} className={`px-6 py-2 text-[10px] font-black uppercase rounded-lg flex items-center gap-2 ${activeTab === 'historial' ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'}`}>
              <History size={14} /> HISTORIAL
            </button>
          </div>
        )}
      </div>

      {activeTab === 'nuevo' ? (
        <form onSubmit={handleSubmit} className="animate-in slide-in-from-left-5 duration-300">
           {pendingSync && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <div>
              <p className="text-red-500 text-[10px] font-black uppercase italic tracking-widest">Revisión pendiente de sincronizar</p>
              <p className="text-red-400/60 text-[9px] uppercase font-bold tracking-widest">Se subirá automáticamente al recuperar internet</p>
            </div>
          </div>
          <button 
            onClick={() => handleSubmit()}
            className="bg-red-500 text-white text-[9px] font-black px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors uppercase tracking-widest"
          >
            Sincronizar ahora
          </button>
        </div>
      )}
           {success && (
             <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#00843D] text-white p-4 rounded-2xl shadow-2xl z-50 animate-bounce flex flex-col items-center gap-2 border border-white/20 backdrop-blur-md">
               <span className="text-[11px] font-black uppercase tracking-widest">SINC_EXITOSA_OK</span>
               <button 
                 onClick={() => generateChecklistReport({ ...formData, datos: formData }, branding)}
                 className="bg-white text-black text-[9px] font-black px-4 py-2 rounded-xl hover:bg-primary transition-all flex items-center gap-2"
               >
                 <FileText size={14} /> DESCARGAR INFORME PDF
               </button>
             </div>
           )}
           
           <Header title="0. INFORMACIÓN GENERAL" color="text-white" />
           <div className="grid grid-cols-2 gap-4 mb-10">
              <Field label="FECHA DE REGISTRO" type="date" value={formData.fecha} onChange={v => handleSimpleUpdate('fecha', '', v)} full />
              <Field label="NOMBRE DEL OPERARIO" type="text" value={formData.operario} onChange={v => handleSimpleUpdate('operario', '', v)} full />
           </div>

           <Header title="1. GENERADORES DE VAPOR" id="section-calderas" />
           {['c1', 'c2'].map((c, i) => (
             <div key={c} className="mb-12 border-l border-[#222] pl-4">
               <Sub title={`CALDERA ${i + 1}`} />
               <div className="grid grid-cols-2 gap-4">
                 <Field label="Nivel Visual" type="text" value={formData.calderas[c].nv} onChange={v => handleUpdate('calderas', c, 'nv', v)} />
                 <Field label="Nivel %" value={formData.calderas[c].np} onChange={v => handleUpdate('calderas', c, 'np', v)} />
                 <Field label="Presión Trabajo (bar)" value={formData.calderas[c].pt} onChange={v => handleUpdate('calderas', c, 'pt', v)} max={11} />
                 <Field label="Temp Vapor (°C)" value={formData.calderas[c].tv} onChange={v => handleUpdate('calderas', c, 'tv', v)} max={195} />
                 <Field label="Quemador %" value={formData.calderas[c].qp} onChange={v => handleUpdate('calderas', c, 'qp', v)} />
                 <Field label="Llama %" value={formData.calderas[c].llp} onChange={v => handleUpdate('calderas', c, 'llp', v)} />
                 <Field label="Conductividad (µS/cm)" value={formData.calderas[c].cond} onChange={v => handleUpdate('calderas', c, 'cond', v)} max={5000} />
                 <Field label="Horas Func." value={formData.calderas[c].hf} onChange={v => handleUpdate('calderas', c, 'hf', v)} />
                 <Field label="Gas Antes" value={formData.calderas[c].ga} onChange={v => handleUpdate('calderas', c, 'ga', v)} />
                 <Field label="Gas Después" value={formData.calderas[c].gd} onChange={v => handleUpdate('calderas', c, 'gd', v)} />
               </div>
             </div>
           ))}

           <Header title="2. DESGASIFICADOR" color="text-[#00A3FF]" id="section-desgasificador" />
            <div className="grid grid-cols-3 gap-3">
              <Field label="Nivel %" value={formData.desgasificador.nivel} onChange={v => handleSimpleUpdate('desgasificador', 'nivel', v)} />
              <Field label="Temp (°C)" value={formData.desgasificador.temp} onChange={v => handleSimpleUpdate('desgasificador', 'temp', v)} />
              <Field label="Presión (bar)" value={formData.desgasificador.presion} onChange={v => handleSimpleUpdate('desgasificador', 'presion', v)} />
            </div>

           <Header title="3. INTERCAMBIADORES" color="text-[#FFB800]" id="section-intercambiadores" />
           {['a', 'b', 'c', 'e'].map(l => (
             <div key={l} className="mb-8 border-l border-[#222] pl-4">
               <Sub title={`INTERCAMB. ${l.toUpperCase()}`} />
               <div className="grid grid-cols-2 gap-4">
                 <Field label="Presión Serv. (bar)" value={formData.intercambiadores[l].ps} onChange={v => handleUpdate('intercambiadores', l, 'ps', v)} />
                 <Field label="Temp Serv. (°C)" value={formData.intercambiadores[l].ts} onChange={v => handleUpdate('intercambiadores', l, 'ts', v)} />
                 <Field label="Agua Antes" value={formData.intercambiadores[l].aa} onChange={v => handleUpdate('intercambiadores', l, 'aa', v)} />
                 <Field label="Agua Después" value={formData.intercambiadores[l].ad} onChange={v => handleUpdate('intercambiadores', l, 'ad', v)} />
               </div>
             </div>
           ))}

           <Header title="4. CONTROL QUÍMICO" color="text-[#A3FF00]" />
           {Object.keys(formData.quimica).map(p => (
             <div key={p} className="mb-6 border-b border-[#111] pb-4">
               <Sub title={p.toUpperCase()} />
               <div className="grid grid-cols-3 gap-3">
                 <Field label="DUREZA (°fH)" value={formData.quimica[p].d} onChange={v => handleUpdate('quimica', p, 'd', v)} max={0} />
                 <Field label="PH" value={formData.quimica[p].ph} onChange={v => handleUpdate('quimica', p, 'ph', v)} min={7} max={12} />
                 <Field label="COND. (µS/cm)" value={formData.quimica[p].c} onChange={v => handleUpdate('quimica', p, 'c', v)} max={6000} />
               </div>
             </div>
           ))}

           <Header title="5. DESCALCIFICADORES" color="text-[#00843D]" id="section-descalcificadores" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {Object.keys(formData.descalcificadores).map(id => (
               <div key={id} className="border-l border-[#222] pl-4">
                 <Sub title={id.toUpperCase()} />
                 <div className="grid grid-cols-2 gap-3">
                   <Field label="Agua Antes" value={formData.descalcificadores[id].aa} onChange={v => handleUpdate('descalcificadores', id, 'aa', v)} />
                   <Field label="Agua Después" value={formData.descalcificadores[id].ad} onChange={v => handleUpdate('descalcificadores', id, 'ad', v)} />
                 </div>
               </div>
             ))}
           </div>

           <Header title="6. DEPÓSITOS Y BOTE" color="text-[#FF0088]" />
           <div className="grid grid-cols-2 gap-4 mb-10">
             <Field label="Nodriza %" value={formData.salmuera.nodriza} onChange={v => handleSimpleUpdate('salmuera', 'nodriza', v)} />
             <Field label="Bote %" value={formData.bote.nivel} onChange={v => handleSimpleUpdate('bote', 'nivel', v)} />
           </div>

           <Header title="7. SISTEMAS DE LIMPIEZA" color="text-[#00E0FF]" id="section-limpieza" />
           <div className="space-y-4 mb-10">
             {Object.keys(formData.satelites).length > 0 && (
                Object.keys(formData.satelites).map(id => {
                  const eq = (equipos || []).find(e => e.id === id);
                  return (
                     <div key={id} className="p-6 bg-[#0D0D0D] border border-white/5 rounded-3xl flex flex-col gap-6 animate-in slide-in-from-right-3 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-3 bg-primary/10 text-primary text-[7px] font-black uppercase tracking-widest rounded-bl-xl">ELPRESS AC 35-B-S</div>
                       
                       <div className="flex items-center justify-between border-b border-white/5 pb-4">
                         <div>
                           <h4 className="text-white text-[12px] font-black uppercase tracking-widest">{eq?.nombre || 'Satélite'}</h4>
                           <p className="text-gray-500 text-[8px] font-bold uppercase mt-1">{eq?.id_tecnico}</p>
                         </div>
                         <div className="flex bg-black rounded-xl p-1 border border-white/5">
                           <button 
                             type="button"
                             onClick={() => setFormData(prev => ({ ...prev, satelites: { ...prev.satelites, [id]: { ...prev.satelites[id], ok: true } } }))}
                             className={`px-4 py-2 text-[8px] font-black uppercase rounded-lg ${formData.satelites[id].ok ? 'bg-[#00843D] text-white' : 'text-gray-500'}`}
                           >
                             CORRECTO
                           </button>
                           <button 
                             type="button"
                             onClick={() => {
                               if (window.confirm('Has marcado ERROR en este satélite. ¿Deseas abrir una Orden de Trabajo para repararlo?')) {
                                 window.location.href = `/?tab=ordenes&new=true&eq_id=${id}&title=ERROR EN REVISIÓN: ${eq?.nombre}`;
                               }
                               setFormData(prev => ({ ...prev, satelites: { ...prev.satelites, [id]: { ...prev.satelites[id], ok: false } } }));
                             }}
                             className={`px-4 py-2 text-[8px] font-black uppercase rounded-lg ${!formData.satelites[id].ok ? 'bg-red-600 text-white' : 'text-gray-500'}`}
                           >
                             ERROR
                           </button>
                         </div>
                       </div>

                       <div className="grid grid-cols-3 gap-3">
                         <div className="flex flex-col gap-1.5">
                           <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Presión Agua (Bar)</label>
                           <input 
                             type="number" 
                             step="0.1"
                             value={formData.satelites[id].p_agua || ''} 
                             onChange={(e) => setFormData(prev => ({ ...prev, satelites: { ...prev.satelites, [id]: { ...prev.satelites[id], p_agua: e.target.value } } }))}
                             placeholder="20-25"
                             className="w-full bg-black border border-[#222] text-white p-3 rounded-xl text-[12px] outline-none focus:border-primary"
                           />
                         </div>
                         <div className="flex flex-col gap-1.5">
                           <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Presión Aire (Bar)</label>
                           <input 
                             type="number" 
                             step="0.1"
                             value={formData.satelites[id].p_aire || ''} 
                             onChange={(e) => setFormData(prev => ({ ...prev, satelites: { ...prev.satelites, [id]: { ...prev.satelites[id], p_aire: e.target.value } } }))}
                             placeholder="4-6"
                             className="w-full bg-black border border-[#222] text-white p-3 rounded-xl text-[12px] outline-none focus:border-primary"
                           />
                         </div>
                         <div className="flex flex-col gap-1.5">
                           <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Químico (%)</label>
                           <input 
                             type="number" 
                             step="0.1"
                             value={formData.satelites[id].quimico || ''} 
                             onChange={(e) => setFormData(prev => ({ ...prev, satelites: { ...prev.satelites, [id]: { ...prev.satelites[id], quimico: e.target.value } } }))}
                             placeholder="1-5"
                             className="w-full bg-black border border-[#222] text-white p-3 rounded-xl text-[12px] outline-none focus:border-primary"
                           />
                         </div>
                       </div>

                       <div className="flex flex-col gap-1.5">
                         <label className="text-[8px] font-black text-primary uppercase tracking-widest italic">Checklist Puntos Críticos (Manual AC 35-B-S)</label>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                           {[
                             { id: 'v_retencion', label: 'Válv. Retención' },
                             { id: 'filtro', label: 'Filtro Agua' },
                             { id: 'inyector', label: 'Inyector' },
                             { id: 'acoplamientos', label: 'Acoplamientos' },
                             { id: 'selectores', label: 'Selectores' }
                           ].map(item => (
                             <button
                               key={item.id}
                               type="button"
                               onClick={() => setFormData(prev => ({ 
                                 ...prev, 
                                 satelites: { 
                                   ...prev.satelites, 
                                   [id]: { 
                                     ...prev.satelites[id], 
                                     [item.id]: !prev.satelites[id][item.id] 
                                   } 
                                 } 
                               }))}
                               className={`py-2 px-1 rounded-lg border text-[7px] font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
                                 formData.satelites[id][item.id] 
                                 ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,224,255,0.1)]' 
                                 : 'bg-black border-white/5 text-gray-700'
                               }`}
                             >
                               <div className={`w-1.5 h-1.5 rounded-full ${formData.satelites[id][item.id] ? 'bg-primary animate-pulse' : 'bg-gray-800'}`}></div>
                               {item.label}
                             </button>
                           ))}
                         </div>
                       </div>

                       <div className="flex items-center gap-4">
                         <div className="flex-1 flex flex-col gap-1.5">
                           <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Estado Manguera/Boquilla</label>
                           <div className="flex gap-2">
                             <button 
                               type="button"
                               onClick={() => setFormData(prev => ({ ...prev, satelites: { ...prev.satelites, [id]: { ...prev.satelites[id], manguera_ok: true } } }))}
                               className={`flex-1 py-2 text-[8px] font-black uppercase rounded-lg border ${formData.satelites[id].manguera_ok ? 'bg-primary/20 border-primary text-primary' : 'bg-black border-[#222] text-gray-600'}`}
                             >
                               BUEN ESTADO
                             </button>
                             <button 
                               type="button"
                               onClick={() => setFormData(prev => ({ ...prev, satelites: { ...prev.satelites, [id]: { ...prev.satelites[id], manguera_ok: false } } }))}
                               className={`flex-1 py-2 text-[8px] font-black uppercase rounded-lg border ${formData.satelites[id].manguera_ok === false ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-black border-[#222] text-gray-600'}`}
                             >
                               DAÑADA
                             </button>
                           </div>
                         </div>
                       </div>

                       <textarea 
                         placeholder="OBSERVACIONES TÉCNICAS (FUGAS, BLOQUEOS...)"
                         className="w-full bg-black border border-white/5 text-white p-3 rounded-xl text-[10px] outline-none focus:border-primary min-h-[60px]"
                         value={formData.satelites[id].obs}
                         onChange={(e) => setFormData(prev => ({ ...prev, satelites: { ...prev.satelites, [id]: { ...prev.satelites[id], obs: e.target.value } } }))}
                       />
                     </div>
                  );
                })
             )}
           </div>

           <div className="mt-10">
              <label className="text-[9px] font-black text-gray-500 uppercase block mb-2">Observaciones</label>
              <textarea 
                className="w-full bg-[#111] border border-[#222] text-white p-4 rounded-xl min-h-[100px] outline-none focus:border-primary"
                value={formData.observaciones}
                onChange={(e) => handleSimpleUpdate('observaciones', '', e.target.value)}
              ></textarea>
           </div>

           <button type="submit" disabled={loading} className="w-full p-5 rounded-2xl bg-primary text-black text-[15px] font-black uppercase tracking-[0.4em] shadow-2xl mt-12 mb-20 active:scale-95 transition-all">
             {loading ? 'GUARDANDO...' : 'GUARDAR REVISIÓN COMPLETA'}
           </button>
        </form>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-right-5 duration-300">
           {loading ? <div className="py-20 text-center text-gray-500 animate-pulse font-black uppercase text-[10px]">Cargando...</div> :
            history.map(record => {
              const rawDatos = record.datos;
              const statusData = typeof rawDatos === 'string' ? JSON.parse(rawDatos) : (rawDatos || {});
              const satData = statusData.satelites || {};
              const satIds = Object.keys(satData);
              const hasErrors = satIds.some(id => !satData[id].ok);

              return (
                <div key={record.fecha} className="industrial-card p-5 bg-[#0D0D0D] border-white/5 flex items-center justify-between group hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20"><Calendar size={20} /></div>
                    <div>
                      <h4 className="text-white text-[14px] font-black italic">{record.fecha}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[9px] text-primary font-black uppercase tracking-widest">{record.operario || 'SISTEMA'}</p>
                        <span className="text-[9px] text-white/20">•</span>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">DRAFTIN CORE</p>
                        {satIds.length > 0 && (
                          <div className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter ${hasErrors ? 'bg-red-500 text-white animate-pulse' : 'bg-[#00843D]/20 text-[#00843D]'}`}>
                            {satIds.length} SATÉLITES {hasErrors ? '• AVERÍA' : '• OK'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => generateChecklistReport(record, branding)}
                      className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-black transition-all"
                      title="Descargar PDF"
                    >
                      <FileText size={18} />
                    </button>
                    {userRole?.toLowerCase() === 'admin' && (
                      <button 
                        onClick={() => handleDeleteRecord(record.fecha)} 
                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Eliminar Registro"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                 </div>
              </div>
            ); })}
         </div>
      )}
    </div>
  );
};

export default RecogidaDatos;
