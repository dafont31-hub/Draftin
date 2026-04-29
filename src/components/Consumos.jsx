import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';

const Consumos = () => {
  const [consumos, setConsumos] = useState([]);
  const [loading, setLoading] = useState(true);

  const exportToExcel = async () => {
    const { data: revisiones } = await supabase
      .from('revisiones_diarias')
      .select('fecha, datos_calderas, datos_descalcificadores, datos_intercambiadores')
      .order('fecha', { ascending: true });
 
    if (!revisiones || revisiones.length < 2) {
      alert("No hay suficientes datos para calcular consumos (se necesitan al menos 2 días)");
      return;
    }
 
    const exportData = revisiones.map((r, index) => {
      if (index === 0) return null;
      const prev = revisiones[index - 1];
      
      // Calculos netos
      const c1 = Math.max(0, parseFloat(r.datos_calderas?.c1?.gd || 0) - parseFloat(prev.datos_calderas?.c1?.gd || 0));
      const c2 = Math.max(0, parseFloat(r.datos_calderas?.c2?.gd || 0) - parseFloat(prev.datos_calderas?.c2?.gd || 0));
      
      const tri_hoy = (
        parseFloat(r.datos_descalcificadores?.int1?.ad || 0) + parseFloat(r.datos_descalcificadores?.int2?.ad || 0) +
        parseFloat(r.datos_descalcificadores?.int3?.ad || 0) + parseFloat(r.datos_descalcificadores?.int4?.ad || 0) +
        parseFloat(r.datos_descalcificadores?.int5?.ad || 0) + parseFloat(r.datos_descalcificadores?.int6?.ad || 0) +
        parseFloat(r.datos_descalcificadores?.cal1?.ad || 0) + parseFloat(r.datos_descalcificadores?.cal2?.ad || 0)
      );
      const tri_ayer = (
        parseFloat(prev.datos_descalcificadores?.int1?.ad || 0) + parseFloat(prev.datos_descalcificadores?.int2?.ad || 0) +
        parseFloat(prev.datos_descalcificadores?.int3?.ad || 0) + parseFloat(prev.datos_descalcificadores?.int4?.ad || 0) +
        parseFloat(prev.datos_descalcificadores?.int5?.ad || 0) + parseFloat(prev.datos_descalcificadores?.int6?.ad || 0) +
        parseFloat(prev.datos_descalcificadores?.cal1?.ad || 0) + parseFloat(prev.datos_descalcificadores?.cal2?.ad || 0)
      );

      const int_hoy = (
        parseFloat(r.datos_intercambiadores?.a?.ad || 0) + parseFloat(r.datos_intercambiadores?.b?.ad || 0) +
        parseFloat(r.datos_intercambiadores?.c?.ad || 0) + parseFloat(r.datos_intercambiadores?.e?.ad || 0)
      );
      const int_ayer = (
        parseFloat(prev.datos_intercambiadores?.a?.ad || 0) + parseFloat(prev.datos_intercambiadores?.b?.ad || 0) +
        parseFloat(prev.datos_intercambiadores?.c?.ad || 0) + parseFloat(prev.datos_intercambiadores?.e?.ad || 0)
      );

      return {
        Fecha: r.fecha,
        'Gas C1 (Sm³)': c1,
        'Gas C2 (Sm³)': c2,
        'Gas Total (Sm³)': c1 + c2,
        'Agua Triplex Total (m³)': Math.max(0, tri_hoy - tri_ayer),
        'Agua Intercambiadores Total (m³)': Math.max(0, int_hoy - int_ayer),
        'Agua Planta Total (m³)': Math.max(0, tri_hoy - tri_ayer) + Math.max(0, int_hoy - int_ayer)
      };
    }).filter(d => d !== null);
 
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial Consumos");
    XLSX.writeFile(wb, `Historial_Consumos_Completo_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  useEffect(() => {
    fetchConsumos();
  }, []);

  const fetchConsumos = async () => {
    const { data: revisiones } = await supabase
      .from('revisiones_diarias')
      .select('fecha, datos_calderas, datos_descalcificadores, datos_intercambiadores')
      .order('fecha', { ascending: true });

    if (revisiones && revisiones.length > 0) {
      const formatted = revisiones.map((r, index) => {
        // --- GAS ---
        const c1_hoy = parseFloat(r.datos_calderas?.c1?.gd || 0);
        const c2_hoy = parseFloat(r.datos_calderas?.c2?.gd || 0);

        // --- AGUA DESCALCIFICADORES (Suma de los 8) ---
        const d = r.datos_descalcificadores || {};
        const tri_hoy = (
          parseFloat(d.int1?.ad || 0) + parseFloat(d.int2?.ad || 0) + parseFloat(d.int3?.ad || 0) +
          parseFloat(d.int4?.ad || 0) + parseFloat(d.int5?.ad || 0) + parseFloat(d.int6?.ad || 0) +
          parseFloat(d.cal1?.ad || 0) + parseFloat(d.cal2?.ad || 0)
        );

        // --- AGUA INTERCAMBIADORES (Suma de los 4) ---
        const int_hoy = (
          parseFloat(r.datos_intercambiadores?.a?.ad || 0) +
          parseFloat(r.datos_intercambiadores?.b?.ad || 0) +
          parseFloat(r.datos_intercambiadores?.c?.ad || 0) +
          parseFloat(r.datos_intercambiadores?.e?.ad || 0)
        );

        if (index === 0) {
          return {
            fecha: new Date(r.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
            gas: 0, triplex: 0, intercambiadores: 0
          };
        }

        const prev = revisiones[index - 1];
        
        // Prev Gas
        const c1_ayer = parseFloat(prev.datos_calderas?.c1?.gd || 0);
        const c2_ayer = parseFloat(prev.datos_calderas?.c2?.gd || 0);
        
        // Prev Descalcificadores
        const dp = prev.datos_descalcificadores || {};
        const tri_ayer = (
          parseFloat(dp.int1?.ad || 0) + parseFloat(dp.int2?.ad || 0) + parseFloat(dp.int3?.ad || 0) +
          parseFloat(dp.int4?.ad || 0) + parseFloat(dp.int5?.ad || 0) + parseFloat(dp.int6?.ad || 0) +
          parseFloat(dp.cal1?.ad || 0) + parseFloat(dp.cal2?.ad || 0)
        );
        
        // Prev Intercambiadores
        const int_ayer = (
          parseFloat(prev.datos_intercambiadores?.a?.ad || 0) +
          parseFloat(prev.datos_intercambiadores?.b?.ad || 0) +
          parseFloat(prev.datos_intercambiadores?.c?.ad || 0) +
          parseFloat(prev.datos_intercambiadores?.e?.ad || 0)
        );

        return {
          fecha: new Date(r.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          c1: Math.max(0, c1_hoy - c1_ayer),
          c2: Math.max(0, c2_hoy - c2_ayer),
          triplex: Math.max(0, tri_hoy - tri_ayer),
          intercambiadores: Math.max(0, int_hoy - int_ayer)
        };
      });

      setConsumos(formatted.slice(1).slice(-15));
    }
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 px-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h2 className="text-[14px] font-black text-white tracking-[0.2em] uppercase">Control de Consumos</h2>
           <p className="text-[8px] text-gray-500 font-bold uppercase mt-1 tracking-widest">Balances diarios de energía y fluidos</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="px-4 py-2 bg-[#1A1A1A] border border-[#222] text-[#FF6B00] text-[8px] font-black uppercase rounded-lg hover:bg-[#222] transition-all"
        >
          Descargar Excel
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="industrial-card p-6 bg-[#0D0D0D] border-[#222]">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Consumo Gas (Sm³)</h3>
              <span className="text-[#FF6B00] text-[10px] font-black">Últimos 15 días</span>
           </div>
           
           <div className="h-[200px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consumos}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                   <XAxis dataKey="fecha" stroke="#444" fontSize={8} tickLine={false} axisLine={false} />
                   <YAxis stroke="#444" fontSize={8} tickLine={false} axisLine={false} />
                   <Tooltip 
                      cursor={{fill: '#1A1A1A'}}
                      contentStyle={{backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: '8px', fontSize: '10px'}}
                   />
                   <Legend iconType="circle" wrapperStyle={{fontSize: '8px', paddingTop: '10px'}} />
                   <Bar dataKey="c1" name="Caldera 1" fill="#FF6B00" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="c2" name="Caldera 2" fill="#FFB800" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="industrial-card p-6 bg-[#0D0D0D] border-[#222]">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Agua Triplex (m³)</h3>
                <span className="text-[#00FF88] text-[10px] font-black">Neto Diario</span>
             </div>
             <div className="h-[180px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consumos}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                     <XAxis dataKey="fecha" stroke="#444" fontSize={8} tickLine={false} axisLine={false} />
                     <YAxis stroke="#444" fontSize={8} tickLine={false} axisLine={false} />
                     <Tooltip 
                        cursor={{fill: '#1A1A1A'}}
                        contentStyle={{backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: '8px', fontSize: '10px'}}
                     />
                     <Bar dataKey="triplex" fill="#00FF88" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="industrial-card p-6 bg-[#0D0D0D] border-[#222]">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Agua Intercambiadores (m³)</h3>
                <span className="text-[#00A3FF] text-[10px] font-black">Suma Total</span>
             </div>
             <div className="h-[180px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consumos}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                     <XAxis dataKey="fecha" stroke="#444" fontSize={8} tickLine={false} axisLine={false} />
                     <YAxis stroke="#444" fontSize={8} tickLine={false} axisLine={false} />
                     <Tooltip 
                        cursor={{fill: '#1A1A1A'}}
                        contentStyle={{backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: '8px', fontSize: '10px'}}
                     />
                     <Bar dataKey="intercambiadores" fill="#00A3FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        <div className="mt-8 mb-4">
           <h3 className="text-[10px] font-black text-white uppercase tracking-widest px-1">Historial de Registros</h3>
        </div>

        <div className="industrial-card bg-[#0D0D0D] border-[#222] overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-[#111] border-b border-[#222]">
                       <th className="p-3 text-[7px] font-black text-gray-500 uppercase tracking-widest">Fecha</th>
                       <th className="p-3 text-[7px] font-black text-[#FF6B00] uppercase tracking-widest">Gas C1 (Sm³)</th>
                       <th className="p-3 text-[7px] font-black text-[#FFB800] uppercase tracking-widest">Gas C2 (Sm³)</th>
                       <th className="p-3 text-[7px] font-black text-[#00FF88] uppercase tracking-widest">Agua Tri (m³)</th>
                       <th className="p-3 text-[7px] font-black text-[#00A3FF] uppercase tracking-widest">Agua Int (m³)</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-[#1A1A1A]">
                    {[...consumos].reverse().map((c, i) => (
                       <tr key={i} className="hover:bg-[#111] transition-colors">
                          <td className="p-3 text-[9px] font-bold text-white">{c.fecha}</td>
                          <td className="p-3 text-[10px] font-black text-white">{c.c1.toFixed(1)}</td>
                          <td className="p-3 text-[10px] font-black text-white">{c.c2.toFixed(1)}</td>
                          <td className="p-3 text-[10px] font-black text-[#00FF88]">{c.triplex.toFixed(2)}</td>
                          <td className="p-3 text-[10px] font-black text-[#00A3FF]">{c.intercambiadores.toFixed(2)}</td>
                       </tr>
                    ))}
                    {consumos.length === 0 && (
                       <tr>
                          <td colSpan="5" className="p-10 text-center text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                             Esperando datos de la primera revisión...
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Consumos;
