import React from 'react';
import { ClipboardList, Wrench, History, ArrowLeft, Info } from 'lucide-react';

const ScanLanding = ({ t, setActiveTab, eqId, equipos, setScanContext }) => {
  const equipo = equipos?.find(e => e.id === eqId);

  if (!equipo && eqId !== 'master-sat') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
          <Info size={40} />
        </div>
        <h2 className="text-white text-xl font-black uppercase italic mb-2">Equipo no encontrado</h2>
        <p className="text-gray-500 text-sm mb-8">El código escaneado no coincide con ningún activo registrado.</p>
        <button onClick={() => setActiveTab('inicio')} className="px-8 py-4 bg-white/5 text-white rounded-2xl font-black uppercase text-[10px]">Volver al Inicio</button>
      </div>
    );
  }

  const nombreEquipo = eqId === 'master-sat' ? 'SATÉLITE DE LIMPIEZA' : equipo?.nombre;
  const sistema = eqId === 'master-sat' ? 'Limpieza' : equipo?.sistema;

  return (
    <div className="animate-in fade-in zoom-in duration-500 min-h-[80vh] flex flex-col items-center justify-center p-4">
      {/* CARD DE IDENTIFICACIÓN */}
      <div className="w-full max-w-sm bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20 text-3xl shadow-inner">
            {sistema === 'Limpieza' ? '🛰️' : sistema === 'Generación' ? '♨️' : '⚙️'}
          </div>
          <div>
            <h2 className="text-white text-[22px] font-black uppercase italic tracking-tighter">{nombreEquipo}</h2>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mt-1">{sistema}</p>
          </div>
        </div>

        {/* ACCIONES PRINCIPALES */}
        <div className="mt-10 space-y-4">
          <button 
            onClick={() => {
              if (eqId === 'master-sat') {
                window.location.href = '/?tab=recogida&section=limpieza&mode=select';
              } else {
                window.location.href = `/?tab=recogida&section=${sistema.toLowerCase()}&eq_id=${eqId}`;
              }
            }}
            className="w-full group flex items-center gap-4 p-6 bg-white/[0.03] border border-white/5 rounded-[24px] hover:border-primary/50 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
              <ClipboardList size={24} />
            </div>
            <div className="text-left">
              <p className="text-white text-[12px] font-black uppercase">REVISIÓN DIARIA</p>
              <p className="text-gray-500 text-[8px] font-bold uppercase">Registrar estado y parámetros</p>
            </div>
          </button>

          <button 
            onClick={() => {
              // Redirigir a órdenes de trabajo con el equipo pre-seleccionado
              window.location.href = `/?tab=ordenes&new=true&eq_id=${eqId}`;
            }}
            className="w-full group flex items-center gap-4 p-6 bg-white/[0.03] border border-white/5 rounded-[24px] hover:border-orange-500/50 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-black transition-colors">
              <Wrench size={24} />
            </div>
            <div className="text-left">
              <p className="text-white text-[12px] font-black uppercase">REPORTAR AVERÍA</p>
              <p className="text-gray-500 text-[8px] font-bold uppercase">Crear Orden de Trabajo</p>
            </div>
          </button>
        </div>

        <button 
          onClick={() => setActiveTab('inicio')}
          className="mt-8 w-full py-4 text-gray-600 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={12} /> CANCELAR Y VOLVER
        </button>
      </div>

      <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.5em]">Draftin Industrial OS • Litera Meat</p>
    </div>
  );
};

export default ScanLanding;
