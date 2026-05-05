import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const ControlQuimico = ({ setActiveTab }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuimico();
  }, []);

  async function fetchQuimico() {
    setLoading(true);
    const { data: lecturas } = await supabase
      .from('checklist_diario')
      .select('fecha, chem_c1_dureza, chem_c1_ph, chem_c1_cond, chem_c2_dureza, chem_c2_ph, chem_c2_cond, chem_des_ph, chem_des_cond')
      .order('fecha', { ascending: false });
    
    if (lecturas) setData(lecturas);
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto pb-40 px-4 animate-in fade-in duration-1000">
      <header className="mb-8 flex flex-col items-start gap-2">
        <button onClick={() => setActiveTab('inicio')} className="text-industrial-title font-black text-[10px] uppercase hover:text-white transition-all flex items-center gap-2 border-b border-white/5 pb-1 italic">
          <span className="text-neon-orange">←</span> DASHBOARD
        </button>
        <div className="flex items-center gap-4 mt-2">
           <div className="w-1.5 h-8 bg-neon-orange rounded-full"></div>
           <div>
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Control de <span className="text-neon-orange">Analíticas</span></h2>
              <p className="text-industrial-title text-[8px] font-bold uppercase tracking-[0.4em] opacity-40 mt-1">Histórico de Parámetros Químicos</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-20 text-center text-industrial-title italic text-[10px] tracking-widest animate-pulse uppercase">Sincronizando...</div>
        ) : data.map((entry, idx) => (
          <div key={idx} className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-xl shadow-lg relative overflow-hidden group hover:brightness-110 transition-all border-l-4 border-l-neon-orange/20 hover:border-l-neon-orange">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-3">
              <span className="text-[10px] font-black text-neon-orange uppercase tracking-widest italic">{new Date(entry.fecha).toLocaleDateString()}</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-pulse"></div>
            </div>
            
            <div className="space-y-4">
               {[
                 { title: 'Generador 01', key: 'c1', fields: [{l:'Dureza', v:entry.chem_c1_dureza}, {l:'pH', v:entry.chem_c1_ph}, {l:'Cond', v:entry.chem_c1_cond, accent: true}] },
                 { title: 'Generador 02', key: 'c2', fields: [{l:'Dureza', v:entry.chem_c2_dureza}, {l:'pH', v:entry.chem_c2_ph}, {l:'Cond', v:entry.chem_c2_cond, accent: true}] },
                 { title: 'Desgasificador', key: 'des', fields: [{l:'pH', v:entry.chem_des_ph}, {l:'Cond', v:entry.chem_des_cond, accent: true}] }
               ].map(section => (
                 <div key={section.key} className="bg-black/30 p-3 rounded-lg border border-white/5">
                    <div className="text-[8px] font-black text-industrial-title uppercase tracking-widest mb-3 border-l-2 border-neon-orange pl-2 italic">{section.title}</div>
                    <div className="grid grid-cols-3 gap-3">
                       {section.fields.map((f, fi) => (
                         <div key={fi} className="flex flex-col">
                            <span className="text-[6px] font-black text-white/20 uppercase mb-1 tracking-widest italic">{f.l}</span>
                            <span className={`${f.accent ? 'text-neon-orange' : 'text-white'} font-black text-[11px] tabular-nums leading-none italic`}>{f.v || '0.00'}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlQuimico;
