import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { processChecklistData } from '../services/dataService';
import { History, ClipboardList, Trash2, Calendar } from 'lucide-react';

const RecogidaDatos = ({ t, refreshData }) => {
  const [activeTab, setActiveTab] = useState('nuevo'); // 'nuevo' o 'historial'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState([]);

  const [formData, setFormData] = useState({
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
    bote: { nivel: '' },
    observaciones: ''
  });

  useEffect(() => {
    if (activeTab === 'historial') fetchHistory();
  }, [activeTab]);

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
      [section]: { ...prev[section], [item]: { ...prev[section][item], [field]: value } }
    }));
  };

  const handleSimpleUpdate = (section, field, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const Field = ({ label, value, onChange, type = "number", full = false }) => (
    <div className={`flex flex-col gap-1.5 mb-4 ${full ? 'w-full' : ''}`}>
      <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">{label}</label>
      <input 
        type={type} step="any" value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111] border border-[#222] text-white text-[15px] p-3.5 rounded-xl focus:border-primary outline-none transition-all placeholder:text-gray-800"
      />
    </div>
  );

  const Header = ({ title, color = "text-primary" }) => (
    <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md py-4 mb-6 border-b border-[#222]">
      <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] ${color}`}>{title}</h3>
    </div>
  );

  const Sub = ({ title }) => (
    <div className="mb-4 mt-2">
      <span className="text-[9px] font-black text-white bg-[#1A1A1A] px-2 py-1 rounded border border-[#333] uppercase">{title}</span>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fecha = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('revisiones_diarias').upsert([{
      datos_calderas: formData.calderas,
      datos_desgasificador: formData.desgasificador,
      datos_intercambiadores: formData.intercambiadores,
      datos_quimica: formData.quimica,
      datos_salmuera: formData.salmuera,
      datos_descalcificadores: formData.descalcificadores,
      datos_bote: formData.bote,
      observaciones: formData.observaciones,
      fecha: fecha
    }], { onConflict: 'fecha' });

    if (!error) {
      await processChecklistData(formData, fecha);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccess(false), 3000);
      if (refreshData) refreshData();
    }
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-40 max-w-2xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[18px] font-black text-white tracking-widest uppercase italic">Centro de Datos</h2>
        <div className="flex bg-[#111] rounded-xl p-1 border border-white/5">
           <button onClick={() => setActiveTab('nuevo')} className={`px-6 py-2 text-[10px] font-black uppercase rounded-lg flex items-center gap-2 ${activeTab === 'nuevo' ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'}`}>
             <ClipboardList size={14} /> NUEVO
           </button>
           <button onClick={() => setActiveTab('historial')} className={`px-6 py-2 text-[10px] font-black uppercase rounded-lg flex items-center gap-2 ${activeTab === 'historial' ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'}`}>
             <History size={14} /> HISTORIAL
           </button>
        </div>
      </div>

      {activeTab === 'nuevo' ? (
        <form onSubmit={handleSubmit} className="animate-in slide-in-from-left-5 duration-300">
           {success && <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#00FF88] text-black text-[11px] font-black px-8 py-3 rounded-2xl shadow-2xl z-50 animate-bounce">SINC_EXITOSA_OK</div>}
           
           <Header title="1. GENERADORES DE VAPOR" />
           {['c1', 'c2'].map((c, i) => (
             <div key={c} className="mb-12 border-l border-[#222] pl-4">
               <Sub title={`CALDERA ${i + 1}`} />
               <div className="grid grid-cols-2 gap-4">
                 <Field label="Nivel Visual" type="text" onChange={v => handleUpdate('calderas', c, 'nv', v)} />
                 <Field label="Nivel %" onChange={v => handleUpdate('calderas', c, 'np', v)} />
                 <Field label="Presión Trabajo (bar)" onChange={v => handleUpdate('calderas', c, 'pt', v)} />
                 <Field label="Temp Vapor (°C)" onChange={v => handleUpdate('calderas', c, 'tv', v)} />
                 <Field label="Quemador %" onChange={v => handleUpdate('calderas', c, 'qp', v)} />
                 <Field label="Llama %" onChange={v => handleUpdate('calderas', c, 'llp', v)} />
                 <Field label="Conductividad" onChange={v => handleUpdate('calderas', c, 'cond', v)} />
                 <Field label="Horas Func." onChange={v => handleUpdate('calderas', c, 'hf', v)} />
                 <Field label="Gas Antes" onChange={v => handleUpdate('calderas', c, 'ga', v)} />
                 <Field label="Gas Después" onChange={v => handleUpdate('calderas', c, 'gd', v)} />
               </div>
             </div>
           ))}

           <Header title="2. DESGASIFICADOR" color="text-[#00A3FF]" />
           <div className="grid grid-cols-3 gap-3">
             <Field label="Nivel %" onChange={v => handleSimpleUpdate('desgasificador', 'nivel', v)} />
             <Field label="Temp °C" onChange={v => handleSimpleUpdate('desgasificador', 'temp', v)} />
             <Field label="Presión bar" onChange={v => handleSimpleUpdate('desgasificador', 'presion', v)} />
           </div>

           <Header title="3. INTERCAMBIADORES" color="text-[#FFB800]" />
           {['a', 'b', 'c', 'e'].map(l => (
             <div key={l} className="mb-8 border-l border-[#222] pl-4">
               <Sub title={`INTERCAMB. ${l.toUpperCase()}`} />
               <div className="grid grid-cols-2 gap-4">
                 <Field label="Presión Serv." onChange={v => handleUpdate('intercambiadores', l, 'ps', v)} />
                 <Field label="Temp Serv." onChange={v => handleUpdate('intercambiadores', l, 'ts', v)} />
                 <Field label="Agua Antes" onChange={v => handleUpdate('intercambiadores', l, 'aa', v)} />
                 <Field label="Agua Después" onChange={v => handleUpdate('intercambiadores', l, 'ad', v)} />
               </div>
             </div>
           ))}

           <Header title="4. CONTROL QUÍMICO" color="text-[#A3FF00]" />
           {Object.keys(formData.quimica).map(p => (
             <div key={p} className="mb-6 border-b border-[#111] pb-4">
               <Sub title={p.toUpperCase()} />
               <div className="grid grid-cols-3 gap-3">
                 <Field label="DUREZA" onChange={v => handleUpdate('quimica', p, 'd', v)} />
                 <Field label="PH" onChange={v => handleUpdate('quimica', p, 'ph', v)} />
                 <Field label="COND." onChange={v => handleUpdate('quimica', p, 'c', v)} />
               </div>
             </div>
           ))}

           <Header title="5. DESCALCIFICADORES" color="text-[#00FF88]" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {Object.keys(formData.descalcificadores).map(id => (
               <div key={id} className="border-l border-[#222] pl-4">
                 <Sub title={id.toUpperCase()} />
                 <div className="grid grid-cols-2 gap-3">
                   <Field label="Agua Antes" onChange={v => handleUpdate('descalcificadores', id, 'aa', v)} />
                   <Field label="Agua Después" onChange={v => handleUpdate('descalcificadores', id, 'ad', v)} />
                 </div>
               </div>
             ))}
           </div>

           <Header title="6. DEPÓSITOS Y BOTE" color="text-[#FF0088]" />
           <div className="grid grid-cols-2 gap-4">
             <Field label="Nodriza %" onChange={v => handleSimpleUpdate('salmuera', 'nodriza', v)} />
             <Field label="Bote %" onChange={v => handleSimpleUpdate('bote', 'nivel', v)} />
           </div>

           <div className="mt-10">
              <label className="text-[9px] font-black text-gray-500 uppercase block mb-2">Observaciones</label>
              <textarea 
                className="w-full bg-[#111] border border-[#222] text-white p-4 rounded-xl min-h-[100px] outline-none focus:border-primary"
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
            history.map(record => (
              <div key={record.fecha} className="industrial-card p-5 bg-[#0D0D0D] border-white/5 flex items-center justify-between group hover:border-primary/40 transition-all">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20"><Calendar size={20} /></div>
                   <div><h4 className="text-white text-[14px] font-black italic">{record.fecha}</h4><p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">SISTEMA DRAFTIN CORE</p></div>
                </div>
                <button onClick={() => handleDeleteRecord(record.fecha)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
              </div>
            ))
           }
        </div>
      )}
    </div>
  );
};

export default RecogidaDatos;
