import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const RecogidaDatos = ({ refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleUpdate = (section, item, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [item]: { ...prev[section][item], [field]: value }
      }
    }));
  };

  const handleSimpleUpdate = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const Field = ({ label, value, onChange, type = "number", full = false }) => (
    <div className={`flex flex-col gap-1.5 mb-4 ${full ? 'w-full' : ''}`}>
      <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">{label}</label>
      <input 
        type={type} step="any" value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111] border border-[#222] text-white text-[15px] p-3.5 rounded-xl focus:border-[#FF6B00] outline-none transition-all placeholder:text-gray-800"
      />
    </div>
  );

  const Header = ({ title, color = "text-[#FF6B00]" }) => (
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
    const { error } = await supabase.from('revisiones_diarias').upsert([{
      datos_calderas: formData.calderas,
      datos_desgasificador: formData.desgasificador,
      datos_intercambiadores: formData.intercambiadores,
      datos_quimica: formData.quimica,
      datos_salmuera: formData.salmuera,
      datos_descalcificadores: formData.descalcificadores,
      datos_bote: formData.bote,
      observaciones: formData.observaciones,
      fecha: new Date().toISOString().split('T')[0]
    }], { onConflict: 'fecha' });

    if (!error) {
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
        <h2 className="text-[18px] font-black text-white tracking-widest uppercase">RECOGIDA DIARIA</h2>
        {success && <div className="bg-[#00FF88] text-black text-[10px] font-black px-4 py-1 rounded-full animate-bounce">OK</div>}
      </div>

      <form onSubmit={handleSubmit}>
        
        <Header title="1. GENERADORES DE VAPOR" />
        {['c1', 'c2'].map((c, i) => (
          <div key={c} className="mb-12 border-l border-[#222] pl-4">
            <Sub title={`CALDERA ${i + 1}`} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nivel Visual" type="text" onChange={v => handleUpdate('calderas', c, 'nv', v)} />
              <Field label="Nivel %" onChange={v => handleUpdate('calderas', c, 'np', v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Presión Trabajo (bar)" onChange={v => handleUpdate('calderas', c, 'pt', v)} />
              <Field label="Temp Vapor (°C)" onChange={v => handleUpdate('calderas', c, 'tv', v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Presión Gas Ent." onChange={v => handleUpdate('calderas', c, 'pge', v)} />
              <Field label="Presión Gas Quem." onChange={v => handleUpdate('calderas', c, 'pgq', v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Quemador %" onChange={v => handleUpdate('calderas', c, 'qp', v)} />
              <Field label="Llama %" onChange={v => handleUpdate('calderas', c, 'llp', v)} />
            </div>
            <Field label="Conductividad (µS/cm)" onChange={v => handleUpdate('calderas', c, 'cond', v)} />
            <Field label="Horas Func." onChange={v => handleUpdate('calderas', c, 'hf', v)} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Purgas ON (seg)" onChange={v => handleUpdate('calderas', c, 'pon', v)} />
              <Field label="Purgas OFF (seg)" onChange={v => handleUpdate('calderas', c, 'poff', v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
        <Sub title="TRATAMIENTO STENCO" />
        {['6000', '3250', '4510'].map(p => (
          <div key={p} className="grid grid-cols-2 gap-4 mb-2">
            <Field label={`S-${p} Dosis`} onChange={v => handleSimpleUpdate('desgasificador', `s${p}_d`, v)} />
            <Field label={`S-${p} Nivel %`} onChange={v => handleSimpleUpdate('desgasificador', `s${p}_n`, v)} />
          </div>
        ))}

        <Header title="3. INTERCAMBIADORES" color="text-[#FFB800]" />
        {['A', 'B', 'C', 'E'].map(l => (
          <div key={l} className="mb-10 border-l border-[#222] pl-4">
            <Sub title={`INTERCAMB. ${l}`} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Presión Serv." onChange={v => handleUpdate('intercambiadores', l.toLowerCase(), 'ps', v)} />
              <Field label="Temp Serv." onChange={v => handleUpdate('intercambiadores', l.toLowerCase(), 'ts', v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Agua Antes" onChange={v => handleUpdate('intercambiadores', l.toLowerCase(), 'aa', v)} />
              <Field label="Agua Después" onChange={v => handleUpdate('intercambiadores', l.toLowerCase(), 'ad', v)} />
            </div>
          </div>
        ))}

        <Header title="4. CONTADORES DESCALCIFICADORES" color="text-[#00FF88]" />
        <div className="space-y-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 border-l border-[#222] pl-4">
            {Object.keys(formData.descalcificadores).map((id) => (
              <div key={id} className="relative pt-2">
                <Sub title={id.includes('int') ? `TRIPLEX INT ${id.replace('int', '')}` : `DUPLEX CAL ${id.replace('cal', '')}`} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Agua Antes" onChange={v => handleUpdate('descalcificadores', id, 'aa', v)} />
                  <Field label="Agua Después" onChange={v => handleUpdate('descalcificadores', id, 'ad', v)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Header title="5. CONTROL QUÍMICO" color="text-[#A3FF00]" />
        {Object.keys(formData.quimica).map(p => {
          const labels = {
            c1: 'CALDERA 1',
            c2: 'CALDERA 2',
            desg: 'DESGASIFICADOR',
            dup1: 'DUPLEX CAL 1',
            dup2: 'DUPLEX CAL 2',
            tri1: 'TRIPLEX INT 1',
            tri2: 'TRIPLEX INT 2',
            tri3: 'TRIPLEX INT 3',
            tri4: 'TRIPLEX INT 4',
            tri5: 'TRIPLEX INT 5',
            tri6: 'TRIPLEX INT 6',
            cond: 'DEPÓSITO CONDENSADOS'
          };
          return (
            <div key={p} className="mb-8 border-b border-[#111] pb-4">
              <span className="text-[8px] font-black text-gray-500 uppercase block mb-3">{labels[p] || p.toUpperCase()}</span>
              <div className="grid grid-cols-3 gap-3">
                <Field label="DUREZA" onChange={v => handleUpdate('quimica', p, 'd', v)} />
                <Field label="PH" onChange={v => handleUpdate('quimica', p, 'ph', v)} />
                <Field label="COND." onChange={v => handleUpdate('quimica', p, 'c', v)} />
              </div>
            </div>
          );
        })}

        <Header title="5. DEPÓSITOS" color="text-[#FF0088]" />
        <div className="space-y-2">
          <Field label="Nodriza %" full onChange={v => handleSimpleUpdate('salmuera', 'nodriza', v)} />
          <Field label="Salmuera 2 %" full onChange={v => handleSimpleUpdate('salmuera', 's2', v)} />
          <Field label="Salmuera 3 %" full onChange={v => handleSimpleUpdate('salmuera', 's3', v)} />
          <div className="border-t border-[#222] my-4 pt-4">
            <Field label="Bote Condensado %" full onChange={v => handleSimpleUpdate('bote', 'nivel', v)} />
            <Field label="Temp. Colector Condensados (°C)" full onChange={v => handleSimpleUpdate('bote', 'temp', v)} />
          </div>
        </div>

        <div className="mt-10">
           <label className="text-[9px] font-black text-gray-500 uppercase block mb-2">Observaciones / Incidencias</label>
           <textarea 
            className="w-full bg-[#111] border border-[#222] text-white p-4 rounded-xl min-h-[120px] outline-none focus:border-[#FF6B00]"
            onChange={(e) => handleSimpleUpdate('observaciones', '', e.target.value)}
           ></textarea>
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full p-5 rounded-2xl bg-[#FF6B00] text-white text-[15px] font-black uppercase tracking-[0.4em] shadow-2xl mt-12 mb-20 active:scale-95 transition-all"
        >
          {loading ? 'Sincronizando...' : 'GUARDAR REVISIÓN'}
        </button>

      </form>
    </div>
  );
};

export default RecogidaDatos;
