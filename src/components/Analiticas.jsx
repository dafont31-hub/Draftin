import React, { useEffect, useState } from 'react';
import { getOperationalTrends } from '../services/dataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';

const Analiticas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('analitica');
  const [variables, setVariables] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeCategory]);

  const fetchData = async () => {
    setLoading(true);
    const trends = await getOperationalTrends(activeCategory);
    setData(trends);
    
    // Extraer nombres de variables únicas presentes en los datos
    if (trends.length > 0) {
      const keys = new Set();
      trends.forEach(item => {
        Object.keys(item).forEach(key => {
          if (key !== 'fecha') keys.add(key);
        });
      });
      setVariables(Array.from(keys));
    } else {
      setVariables([]);
    }
    setLoading(false);
  };

  const exportToExcel = () => {
    if (data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tendencias");
    XLSX.writeFile(wb, `Reporte_${activeCategory}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const colors = ['#FF6B00', '#00FF88', '#00A3FF', '#FF0044', '#A3FF00', '#FFB800'];

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h2 className="text-[14px] font-black text-white tracking-[0.2em] uppercase">Inteligencia de Datos</h2>
           <p className="text-[8px] text-gray-500 font-bold uppercase mt-1 tracking-widest">Visualización dinámica de datos clasificados automáticamente</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToExcel}
            className="px-4 py-2 bg-[#1A1A1A] border border-[#222] text-[#FF6B00] text-[8px] font-black uppercase rounded-lg hover:bg-[#222] transition-all"
          >
            Exportar Dataset
          </button>
          <div className="flex bg-[#111] p-1 rounded-lg border border-[#222]">
             {[
               { id: 'analitica', label: '🧪 Química' },
               { id: 'consumo', label: '⚡ Consumos' },
               { id: 'operacion', label: '⚙️ Operación' },
               { id: 'estado', label: '📊 Estado' }
             ].map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 text-[8px] font-black uppercase rounded transition-all ${
                    activeCategory === cat.id ? 'bg-[#FF6B00] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
             ))}
          </div>
        </div>
      </div>

      <div className="industrial-card p-6 bg-[#0D0D0D] border-[#222] h-[450px] mb-6">
        {loading ? (
          <div className="h-full flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="fecha" stroke="#444" fontSize={8} tickLine={false} axisLine={false} />
              <YAxis stroke="#444" fontSize={8} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '30px', fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              {variables.map((v, i) => (
                <Line 
                  key={v}
                  name={v}
                  type="monotone"
                  dataKey={v}
                  stroke={colors[i % colors.length]}
                  strokeWidth={3}
                  dot={{ r: 3, fill: colors[i % colors.length], strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4">
             <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 02 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
             <p className="text-[10px] font-black uppercase tracking-widest">No hay datos clasificados en esta categoría</p>
          </div>
        )}
      </div>

      {/* Tarjetas de Resumen Dinámicas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {variables.slice(0, 4).map((v, i) => (
            <div key={v} className="industrial-card p-5 bg-[#0D0D0D] border-[#222]">
               <span className="text-[7px] text-gray-500 font-black uppercase tracking-tighter block mb-2">{v}</span>
               <div className="flex items-end gap-2">
                  <span className="text-[22px] font-black leading-none text-white">
                    {data[data.length-1]?.[v] || 0}
                  </span>
                  <div className="w-2 h-2 rounded-full mb-1.5" style={{ backgroundColor: colors[i % colors.length] }}></div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default Analiticas;
