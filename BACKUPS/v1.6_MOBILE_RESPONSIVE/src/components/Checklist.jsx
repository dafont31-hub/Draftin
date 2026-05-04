import React from 'react';

const Checklist = ({ setActiveTab }) => {
  const items = [
    { title: 'Nivel de agua en caldera', value: 'Normal', status: 'ok' },
    { title: 'Presión de vapor', value: '4.5 bar', status: 'ok' },
    { title: 'Temperatura gases de combu...', value: 'Adecuada', status: 'ok' },
    { title: 'Estado del quemador', value: 'Normal', status: 'ok' },
    { title: 'Válvula de seguridad', value: 'Fuga detectada', status: 'error' },
    { title: 'Purgas de fondo', value: '', status: 'pending' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab('inicio')} className="p-1">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-[12px] font-black text-white tracking-widest uppercase">CHECKLIST OPERATIVO</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {/* Info Header */}
        <div className="mb-6">
          <h3 className="text-white text-[16px] font-black">Caldera 1 (EQ-001)</h3>
          <p className="text-gray-400 text-[11px] font-medium mt-0.5">Operación Diaria - 10/05/2024</p>
        </div>

        {/* Progreso */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[12px] text-white font-bold">7/12</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">58%</span>
          </div>
          <div className="w-full h-1 bg-[#222] rounded-full overflow-hidden">
            <div className="h-full bg-[#00FF88]" style={{ width: '58%' }}></div>
          </div>
        </div>

        {/* Lista de Items */}
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="industrial-card p-4 flex items-center justify-between cursor-pointer bg-[#141414] border-[#222]">
               <div className="flex items-center gap-4">
                 {/* Icono de Estado */}
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    item.status === 'ok' ? 'border-[#00FF88] text-[#00FF88]' :
                    item.status === 'error' ? 'border-red-500 text-red-500' :
                    'border-[#333] text-transparent'
                 }`}>
                    {item.status === 'ok' && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {item.status === 'error' && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                 </div>
                 
                 {/* Textos */}
                 <div className="flex flex-col">
                    <span className="text-[11px] text-white font-bold">{item.title}</span>
                    {item.value && (
                      <span className={`text-[10px] font-medium mt-0.5 ${item.status === 'error' ? 'text-red-500' : 'text-gray-400'}`}>
                        {item.value}
                      </span>
                    )}
                 </div>
               </div>
               
               {/* Chevron Right */}
               <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
               </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Botones inferiores */}
      <div className="fixed bottom-0 right-0 w-full md:w-[calc(100%-16rem)] bg-[#111] border-t border-[#222] p-4 flex justify-center z-[110]">
        <div className="w-full max-w-7xl flex gap-3">
          <button className="flex-1 py-3.5 bg-transparent border border-[#FF6B00] rounded-lg text-[10px] font-bold text-[#FF6B00] uppercase tracking-widest text-center">
            GUARDAR PARCIAL
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checklist;
