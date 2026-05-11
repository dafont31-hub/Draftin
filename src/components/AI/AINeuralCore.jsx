import React from 'react';

const AINeuralCore = ({ state = 'idle', onClick }) => {
  const isThinking = state === 'thinking';
  
  return (
    <div 
      onClick={onClick}
      className="fixed bottom-10 right-10 z-[500] cursor-pointer group"
    >
      {/* Glow layers */}
      <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-1000 ${
        isThinking ? 'bg-purple-500/60 scale-150 animate-pulse' : 'bg-primary/20 group-hover:bg-primary/40'
      }`}></div>
      
      {/* Main Core */}
      <div className={`relative w-16 h-16 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-500 ${
        isThinking ? 'scale-110 border-purple-500/50' : 'hover:scale-110 active:scale-95'
      }`}
      style={{
        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(0,0,0,0.8))'
      }}>
        {/* Inner Pulse */}
        <div className={`w-8 h-8 rounded-full transition-all duration-500 ${
          isThinking ? 'bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.8)]' : 'bg-primary shadow-[0_0_15px_rgba(255,107,0,0.5)]'
        }`}>
          <div className="w-full h-full animate-ping rounded-full bg-white/20"></div>
        </div>

        {/* Orbitals */}
        <div className={`absolute inset-0 border border-white/5 rounded-full animate-[spin_10s_linear_infinite] ${isThinking ? 'opacity-100' : 'opacity-20'}`}></div>
        <div className={`absolute inset-2 border border-white/10 rounded-full animate-[spin_6s_linear_infinite_reverse] ${isThinking ? 'opacity-100' : 'opacity-20'}`}></div>
      </div>

      {/* Tag */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 px-4 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[9px] font-black text-white uppercase tracking-widest whitespace-nowrap">Supervisor IA</span>
      </div>
    </div>
  );
};

export default AINeuralCore;
