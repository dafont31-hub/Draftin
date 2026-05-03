import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';

const Analiticas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeParam, setActiveParam] = useState('dureza');

  const exportToExcel = async () => {
    const { data: revisiones } = await supabase
      .from('revisiones_diarias')
      .select('fecha, datos_quimica')
      .order('fecha', { ascending: false });

    if (!revisiones) return;

    const exportData = revisiones.map(r => ({
      Fecha: r.fecha,
      'C1 Dureza': r.datos_quimica.c1?.d || 0,
      'C1 pH': r.datos_quimica.c1?.ph || 0,
      'C1 Cond': r.datos_quimica.c1?.c || 0,
      'C2 Dureza': r.datos_quimica.c2?.d || 0,
      'C2 pH': r.datos_quimica.c2?.ph || 0,
      'C2 Cond': r.datos_quimica.c2?.c || 0,
      'Desg Dureza': r.datos_quimica.desg?.d || 0,
      'Desg pH': r.datos_quimica.desg?.ph || 0,
      'Desg Cond': r.datos_quimica.desg?.c || 0,
      'Condensados Dureza': r.datos_quimica.cond?.d || 0,
      'Condensados pH': r.datos_quimica.cond?.ph || 0,
      'Condensados Cond': r.datos_quimica.cond?.c || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Analiticas");
    XLSX.writeFile(wb, `Reporte_Analitico_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  useEffect(() => {
    fetchAnaliticas();
  }, []);

  const fetchAnaliticas = async () => {
    const { data: revisiones, error } = await supabase
      .from('revisiones_diarias')
      .select('fecha, datos_quimica')
      .order('fecha', { ascending: true })
      .limit(30);

    if (revisiones) {
      const formattedData = revisiones.map(r => ({
        fecha: new Date(r.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        c1: parseFloat(r.datos_quimica?.c1?.[activeParam]) || 0,
        c2: parseFloat(r.datos_quimica?.c2?.[activeParam]) || 0,
        desg: parseFloat(r.datos_quimica?.desg?.[activeParam]) || 0,
        cond: parseFloat(r.datos_quimica?.cond?.[activeParam]) || 0,
      }));
      setData(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnaliticas();
  }, [activeParam]);

  const getLastValue = (paramKey) => {
    if (data.length === 0) return 0;
    const last = data[data.length - 1];
    return Math.max(last.c1 || 0, last.c2 || 0, last.desg || 0, last.cond || 0);
  };

  const lastDureza = getLastValue('dureza');

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A0A0A] border border-[#222] p-3 shadow-2xl rounded-lg">
          <p className="text-[10px] font-black text-white mb-2 uppercase tracking-widest">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-[9px] text-gray-400 uppercase font-bold">{entry.name}:</span>
              <span className="text-[10px] text-white font-black">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h2 className="text-[14px] font-black text-white tracking-[0.2em] uppercase">Control Analítico</h2>
           <p className="text-[8px] text-gray-500 font-bold uppercase mt-1 tracking-widest">Tendencia histórica de parámetros químicos</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToExcel}
            className="px-4 py-2 bg-[#1A1A1A] border border-[#222] text-[#FF6B00] text-[8px] font-black uppercase rounded-lg hover:bg-[#222] transition-all"
          >
            Descargar Excel
          </button>
          <div className="flex bg-[#111] p-1 rounded-lg border border-[#222]">
             {['dureza', 'ph', 'conductividad'].map(p => (
                <button 
                  key={p}
                  onClick={() => setActiveParam(p)}
                  className={`px-3 py-1.5 text-[8px] font-black uppercase rounded transition-all ${
                    activeParam === p ? 'bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/20' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {p}
                </button>
             ))}
          </div>
        </div>
      </div>

      <div className="industrial-card p-6 bg-[#0D0D0D] border-[#222] h-[400px] mb-6">
        {loading ? (
          <div className="h-full flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis 
                dataKey="fecha" 
                stroke="#444" 
                fontSize={8} 
                tickLine={false} 
                axisLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                stroke="#444" 
                fontSize={8} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '20px', fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase' }} 
              />
              <Line 
                name="Caldera 1" 
                type="monotone" 
                dataKey="c1" 
                stroke="#FF0044" 
                strokeWidth={3} 
                dot={{ r: 3, fill: '#FF0044', strokeWidth: 0 }} 
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Line 
                name="Caldera 2" 
                type="monotone" 
                dataKey="c2" 
                stroke="#00FF88" 
                strokeWidth={3} 
                dot={{ r: 3, fill: '#00FF88', strokeWidth: 0 }} 
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Line 
                name="Desgasificador" 
                type="monotone" 
                dataKey="desg" 
                stroke="#FF6B00" 
                strokeWidth={3} 
                dot={{ r: 3, fill: '#FF6B00', strokeWidth: 0 }} 
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Line 
                name="Condensados" 
                type="monotone" 
                dataKey="cond" 
                stroke="#00A3FF" 
                strokeWidth={3} 
                dot={{ r: 3, fill: '#00A3FF', strokeWidth: 0 }} 
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="industrial-card p-4 bg-[#0A0A0A] border-[#222]">
            <span className="text-[7px] text-gray-500 font-black uppercase tracking-tighter">Última Lectura {activeParam}</span>
            <div className="flex items-end gap-2 mt-1">
               <span className={`text-[20px] font-black leading-none ${activeParam === 'dureza' && lastDureza > 0.5 ? 'text-red-500' : 'text-[#00FF88]'}`}>
                 {data.length > 0 ? getLastValue(activeParam).toFixed(1) : '0'}
               </span>
               <span className="text-[8px] text-gray-600 font-bold mb-1 uppercase">
                 {activeParam === 'dureza' ? '°fH' : activeParam === 'ph' ? 'pH' : 'µS/cm'}
               </span>
            </div>
         </div>
         <div className="industrial-card p-4 bg-[#0A0A0A] border-[#222]">
            <span className="text-[7px] text-gray-500 font-black uppercase tracking-tighter">Estado Tratamiento</span>
            <div className="flex items-center gap-2 mt-1">
               {data.length > 0 ? (
                 <>
                   <div className={`w-2 h-2 rounded-full animate-pulse ${lastDureza > 0.5 ? 'bg-red-500' : 'bg-[#00FF88]'}`}></div>
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">
                     {lastDureza > 0.5 ? 'ALERTA' : 'OPTIMO'}
                   </span>
                 </>
               ) : (
                 <>
                   <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SIN DATOS</span>
                 </>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analiticas;
