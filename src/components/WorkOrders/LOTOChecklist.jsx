import React, { useState, useEffect } from 'react';
import { ShieldCheck, Flame, Zap, Gauge, AlertCircle, Droplet, Beaker, Bot, Sparkles, CheckCircle } from 'lucide-react';
import { aiService } from '../../services/aiService';

const LOTOChecklist = ({ data, onComplete, onClose, assetSystem = 'Generación' }) => {
  const [checks, setChecks] = useState({});
  const [aiSteps, setAiSteps] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const allItems = [
    { id: 'loto_gas', label: 'Corte de Gas / Combustible', icon: <Flame size={18} />, color: 'text-orange-500', keywords: ['CALDERA', 'QUEMADOR', 'TÉRMICO', 'COMBUSTIBLE'] },
    { id: 'loto_elec', label: 'Bloqueo Eléctrico (Candado)', icon: <Zap size={18} />, color: 'text-yellow-500', keywords: ['*'] }, // Siempre
    { id: 'loto_presion', label: 'Corte de Vapor / Despresurización', icon: <Gauge size={18} />, color: 'text-blue-500', keywords: ['CALDERA', 'VAPOR', 'DESGASIFICADOR', 'TÉRMICO', 'PRESIÓN'] },
    { id: 'loto_agua', label: 'Corte de Suministro de Agua', icon: <Droplet size={18} />, color: 'text-cyan-500', keywords: ['DESCALCIFICADOR', 'AGUA', 'CALDERA', 'ÓSMOSIS', 'PURGA'] },
    { id: 'loto_quimico', label: 'Bloqueo de Inyección Química', icon: <Beaker size={18} />, color: 'text-purple-500', keywords: ['TRATAMIENTO', 'DESCALCIFICADOR', 'QUÍMICO', 'DOSIFICACIÓN'] },
    { id: 'loto_valvulas', label: 'Cierre de Válvulas de Seguridad', icon: <ShieldCheck size={18} />, color: 'text-green-500', keywords: ['CALDERA', 'DESGASIFICADOR', 'TÉRMICO', 'VAPOR'] }
  ];

  const items = allItems.filter(item => {
    if (item.keywords.includes('*')) return true;
    const searchString = `${assetSystem || ''} ${data?.assets?.nombre || ''} ${data?.titulo || ''}`.toUpperCase();
    return item.keywords.some(kw => searchString.includes(kw));
  });
  
  // Inicializar checks
  useEffect(() => {
    const initial = {};
    items.forEach(item => {
      initial[item.id] = (data && data[item.id]) || false;
    });
    setChecks(initial);
  }, [assetSystem, data?.id, items.length]);

  const handleAIProbe = async () => {
    setLoadingAI(true);
    try {
      const steps = await aiService.generateLOTOProtocol(
        data.assets?.nombre,
        assetSystem,
        data.titulo
      );

      if (steps) {
        setAiSteps(steps);
        const newChecks = { ...checks };
        steps.forEach(s => newChecks[s.id] = false);
        setChecks(newChecks);
      }
    } catch (error) {
      console.error("LOTO AI Error:", error);
    }
    setLoadingAI(false);
  };

  const handleToggle = (id) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allChecked = items.length > 0 && 
                     items.every(item => checks[item.id] === true) &&
                     aiSteps.every(s => checks[s.id] === true);

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in duration-300">
      <div className="max-w-sm w-full bg-[#0A0A0A] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600"></div>
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-500 mb-4 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-white text-[16px] font-black uppercase italic tracking-widest">Protocolo LOTO</h2>
          <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-2">Bloqueo y Etiquetado de Seguridad</p>
        </div>

        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleToggle(item.id)}
              className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                checks[item.id] 
                ? 'bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(255,107,0,0.1)]' 
                : 'bg-black border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`${item.color}`}>{item.icon}</div>
                <span className="text-white text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </div>
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${checks[item.id] ? 'bg-primary border-primary text-black' : 'border-white/10'}`}>
                {checks[item.id] && <ShieldCheck size={14} strokeWidth={4} />}
              </div>
            </button>
          ))}

          {/* AI SUGGESTED STEPS */}
          {aiSteps.map((step) => (
             <button
              key={step.id}
              type="button"
              onClick={() => handleToggle(step.id)}
              className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                checks[step.id] 
                ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                : 'bg-black border-purple-500/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-purple-400"><Sparkles size={18} /></div>
                <div className="text-left">
                   <span className="text-white text-[10px] font-black uppercase tracking-widest block">{step.label}</span>
                   <span className="text-[7px] text-purple-400 font-bold uppercase">{step.reason}</span>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${checks[step.id] ? 'bg-purple-500 border-purple-500 text-white' : 'border-white/10'}`}>
                {checks[step.id] && <CheckCircle size={14} strokeWidth={4} />}
              </div>
            </button>
          ))}

          {aiSteps.length === 0 && (
             <button 
              onClick={handleAIProbe}
              disabled={loadingAI}
              className={`w-full p-6 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 transition-all group relative overflow-hidden ${
                loadingAI ? 'border-purple-500/50 bg-purple-500/5' : 'border-purple-500/20 hover:bg-purple-500/5'
              }`}
             >
                {loadingAI && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-[2px] bg-purple-500/50 animate-[scan_2s_linear_infinite] shadow-[0_0_15px_rgba(168,85,247,0.8)]"></div>
                  </div>
                )}
                
                {loadingAI ? (
                   <div className="flex flex-col items-center gap-2">
                      <Bot size={24} className="text-purple-500 animate-pulse" />
                      <span className="text-[9px] font-black text-purple-400 uppercase tracking-[0.2em] animate-pulse">Analizando Riesgos...</span>
                   </div>
                ) : (
                   <>
                      <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform border border-purple-500/20">
                        <Bot size={24} />
                      </div>
                      <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Consultar Cerebro IA</span>
                   </>
                )}
             </button>
          )}
        </div>

        <div className="mt-10 p-4 bg-red-600/5 rounded-2xl border border-red-600/10 flex items-start gap-3">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-red-500 text-[8px] font-bold uppercase leading-relaxed tracking-widest">
            Al validar este protocolo, certificas bajo tu responsabilidad que el equipo está en condiciones seguras para intervención humana.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-10">
          <button 
            onClick={onClose}
            className="p-4 rounded-2xl text-gray-500 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            disabled={!allChecked}
            onClick={() => onComplete(checks)}
            className="p-4 bg-primary text-black rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-20 disabled:grayscale transition-all active:scale-95"
          >
            Validar LOTO
          </button>
        </div>
      </div>
    </div>
  );
};

export default LOTOChecklist;
