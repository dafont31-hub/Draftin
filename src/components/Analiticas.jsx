import React, { useEffect, useState } from 'react';
import { getOperationalTrends, processChecklistData } from '../services/dataService';
import { supabase } from '../supabaseClient';
import { 
  AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import * as XLSX from 'xlsx';
import { Download, Table as TableIcon, Activity, RotateCw } from 'lucide-react';

const EQUIPMENT_STRUCTURE = {
  'C1': ['C1 PH', 'C1 Dureza', 'C1 Conductividad'],
  'C2': ['C2 PH', 'C2 Dureza', 'C2 Conductividad'],
  'DESG.': ['Desg. PH', 'Desg. Dureza', 'Desg. Conductividad'],
  'CONDENS.': ['Condens. PH', 'Condens. Dureza', 'Condens. Conductividad'],
  'DESCALCIFICADORES': {
    'DUP 1': ['Dup1 PH', 'Dup1 Dureza', 'Dup1 Conductividad'],
    'DUP 2': ['Dup2 PH', 'Dup2 Dureza', 'Dup2 Conductividad'],
    'TRI 1': ['Tri1 PH', 'Tri1 Dureza', 'Tri1 Conductividad'],
    'TRI 2': ['Tri2 PH', 'Tri2 Dureza', 'Tri2 Conductividad'],
    'TRI 3': ['Tri3 PH', 'Tri3 Dureza', 'Tri3 Conductividad'],
    'TRI 4': ['Tri4 PH', 'Tri4 Dureza', 'Tri4 Conductividad'],
    'TRI 5': ['Tri5 PH', 'Tri5 Dureza', 'Tri5 Conductividad'],
    'TRI 6': ['Tri6 PH', 'Tri6 Dureza', 'Tri6 Conductividad']
  }
};

const Analiticas = () => {
  const [absoluteData, setAbsoluteData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeEquipment, setActiveEquipment] = useState('C1');
  const [activeSubEquipment, setActiveSubEquipment] = useState('DUP 1');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const trends = await getOperationalTrends('analitica');
      setAbsoluteData(Array.isArray(trends) ? trends : []);
    } catch (err) {
      console.error(err);
      setAbsoluteData([]);
    } finally {
      setLoading(false);
    }
  };

  const reprocessHistory = async () => {
    if (!window.confirm('\u00BFDeseas sincronizar todo el historial?')) return;
    setLoading(true);
    try {
      const { data: records } = await supabase.from('revisiones_diarias').select('*');
      for (const record of records) {
        const rawDatos = record.datos;
        const processData = typeof rawDatos === 'string' ? JSON.parse(rawDatos) : (rawDatos || {});
        processData.fecha = record.fecha;
        await processChecklistData(processData, record.fecha);
      }
      alert('Sincronizaci\u00F3n completada.');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error en la sincronizaci\u00F3n.');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (absoluteData.length === 0) return;
    const reportData = absoluteData.map(row => {
      const newRow = { 'FECHA': row.fecha };
      Object.keys(EQUIPMENT_STRUCTURE).forEach(eq => {
        const vars = Array.isArray(EQUIPMENT_STRUCTURE[eq]) ? EQUIPMENT_STRUCTURE[eq] : Object.values(EQUIPMENT_STRUCTURE[eq]).flat();
        vars.forEach(v => {
          newRow[v.toUpperCase()] = row[v] !== undefined ? row[v] : '---';
        });
      });
      return newRow;
    });
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wscols = [{ wch: 15 }, ...Object.keys(reportData[0] || {}).map(() => ({ wch: 20 }))];
    ws['!cols'] = wscols;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "REGISTRO");
    XLSX.writeFile(wb, `Reporte_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const colors = ['#FF6B00', '#00E0FF', '#7000FF', '#FF005C', '#00FF94', '#FFB800'];

  let activeVars = [];
  try {
    if (activeEquipment === 'DESCALCIFICADORES') {
      activeVars = (EQUIPMENT_STRUCTURE['DESCALCIFICADORES'] && EQUIPMENT_STRUCTURE['DESCALCIFICADORES'][activeSubEquipment]) || [];
    } else {
      activeVars = EQUIPMENT_STRUCTURE[activeEquipment] || [];
    }
  } catch (err) {
    activeVars = [];
  }

  const tableData = Array.isArray(absoluteData) ? [...absoluteData].reverse() : [];

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h2 className="text-[16px] font-black text-white tracking-[0.3em] uppercase italic">Libro de Registro Digital</h2>
           <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Control de Par\u00E1metros Auditado</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={reprocessHistory}
            className="px-5 py-3 bg-black border border-white/10 text-gray-400 text-[9px] font-black uppercase rounded-2xl hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
            Sincronizar Historial
          </button>
          <button 
            onClick={exportToExcel}
            className="px-6 py-3 bg-primary text-black text-[10px] font-black uppercase rounded-2xl hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(255,107,0,0.3)]"
          >
            <Download size={16} /> EXPORTAR EXCEL
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 bg-white/[0.02] p-2 rounded-[24px] border border-white/5">
        {Object.keys(EQUIPMENT_STRUCTURE).map(eq => (
          <button
            key={eq}
            onClick={() => {
              setActiveEquipment(eq);
              if (eq === 'DESCALCIFICADORES') setActiveSubEquipment('DUP 1');
            }}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
              activeEquipment === eq ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {eq}
          </button>
        ))}
      </div>

      {activeEquipment === 'DESCALCIFICADORES' && (
        <div className="flex flex-wrap gap-2 mb-8 bg-black/40 p-1.5 rounded-[18px] border border-white/5">
          {Object.keys(EQUIPMENT_STRUCTURE['DESCALCIFICADORES']).map(sub => (
            <button
              key={sub}
              onClick={() => setActiveSubEquipment(sub)}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${
                activeSubEquipment === sub ? 'bg-primary text-black shadow-lg' : 'text-gray-600 hover:text-gray-300'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-8 mt-6">
        <div className="bg-[#080808] border border-white/5 rounded-[32px] p-8 h-[320px] relative overflow-hidden group">
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/10 transition-all"></div>
           <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-primary" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  Tendencia: {activeEquipment} {activeEquipment === 'DESCALCIFICADORES' ? `(${activeSubEquipment})` : ''}
                </span>
              </div>
              <div className="flex gap-4">
                {activeVars.map((v, idx) => (
                  <div key={v} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                    <span className="text-[7px] font-black text-gray-500 uppercase">{v.split(' ').slice(1).join(' ')}</span>
                  </div>
                ))}
              </div>
           </div>
           <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={absoluteData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                <XAxis dataKey="fecha" hide={true} />
                <YAxis yAxisId="left" stroke="#333" fontSize={8} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#333" fontSize={8} tickLine={false} axisLine={false} hide={!activeVars.some(v => v.toLowerCase().includes('cond'))} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '12px', fontSize: '10px' }} />
                {activeVars.map((v, i) => (
                  <Area 
                    key={v}
                    yAxisId={v.toLowerCase().includes('cond') ? 'right' : 'left'}
                    type="monotone" 
                    dataKey={v} 
                    stroke={colors[i % colors.length]} 
                    fill={colors[i % colors.length]} 
                    fillOpacity={0.05}
                    strokeWidth={2}
                    dot={{ r: 3, fill: colors[i % colors.length], strokeWidth: 0 }}
                    name={v.split(' ').slice(1).join(' ')}
                  />
                ))}
              </AreaChart>
           </ResponsiveContainer>
        </div>

        <div className="bg-[#080808] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TableIcon size={16} className="text-primary" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Listado de Mediciones Sincronizado</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="p-8 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Fecha</th>
                  {activeVars.map(v => (
                    <th key={v} className="p-8 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                      {v.split(' ').slice(1).join(' ') || v}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? tableData.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-all border-b border-white/5 last:border-0">
                    <td className="p-8 text-[13px] font-black text-white italic">{row.fecha}</td>
                    {activeVars.map(v => (
                      <td key={v} className="p-8 text-[15px] font-bold text-gray-300">
                        {row[v] !== undefined ? row[v] : <span className="text-gray-800">---</span>}
                      </td>
                    ))}
                  </tr>
                )) : (
                  <tr><td colSpan={activeVars.length + 1} className="p-20 text-center text-gray-600 text-[10px] font-black uppercase">No hay registros</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analiticas;
