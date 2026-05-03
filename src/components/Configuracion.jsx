import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import GestionUsuarios from './GestionUsuarios';
import BibliotecaDocs from './BibliotecaDocs';
import { Settings, Shield, FileText, Cpu, Layout, MessageSquare, Database } from 'lucide-react';

const Configuracion = ({ setActiveTab }) => {
  const [activeSubTab, setActiveSubTab] = useState('docs'); 
  const [aiConfig, setAiConfig] = useState({ provider: 'google', api_key: '', model: 'gemini-1.5-flash', activo: true });
  const [saveStatus, setSaveStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAIConfig();
  }, []);

  async function fetchAIConfig() {
    const { data } = await supabase.from('app_config_ai').select('*').single();
    if (data) setAiConfig(data);
  }

  const handleSaveAI = async () => {
    setLoading(true);
    const { error } = await supabase.from('app_config_ai').upsert(aiConfig);
    setLoading(false);
    if (!error) notifySave();
  };

  const notifySave = () => {
    setSaveStatus('SISTEMA SINCRONIZADO');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const menuItems = [
    { id: 'docs', label: 'DOCS', icon: FileText, color: 'text-blue-500' },
    { id: 'usuarios', label: 'EQUIPO', icon: Shield, color: 'text-purple-500' },
    { id: 'ai', label: 'AI', icon: MessageSquare, color: 'text-pink-500' },
  ];

  return (
    <div className="animate-in fade-in duration-500 relative">
      {saveStatus && (
        <div className="fixed top-24 right-10 z-[300] bg-[#FF6B00] text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl animate-bounce">
          {saveStatus}
        </div>
      )}

      {/* HEADER PREMIUM SAAS */}
      <div className="flex items-center justify-between mb-8 bg-[#050505] p-6 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 text-orange-500">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-[14px] font-black text-white tracking-widest uppercase italic">PANEL DE CONTROL SAAS</h2>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Gestión centralizada del ecosistema DRAFTIN</p>
          </div>
        </div>
        <button onClick={() => setActiveTab('inicio')} className="flex items-center gap-3 px-6 py-3 bg-[#111] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-gray-400 hover:text-white">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          VOLVER AL DASHBOARD
        </button>
      </div>

      {/* MENÚ DE MÓDULOS SAAS */}
      <div className="flex gap-2 mb-10 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar">
        {menuItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveSubTab(item.id)}
            className={`flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-t-2xl ${
              activeSubTab === item.id ? 'bg-white/5 text-white border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <item.icon size={16} className={activeSubTab === item.id ? item.color : 'text-gray-600'} />
            {item.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO DINÁMICO */}
      <div className="industrial-card p-8 bg-[#0D0D0D] border-white/5 shadow-inner">
        
        {activeSubTab === 'docs' && <BibliotecaDocs />}
        
        {activeSubTab === 'usuarios' && <GestionUsuarios />}
        
        {activeSubTab === 'ai' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500">
             <div className="p-8 bg-[#111] rounded-3xl border border-white/5 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-500 border border-pink-500/20">
                      <MessageSquare size={20} />
                   </div>
                   <h3 className="text-[14px] font-black text-white uppercase italic">Configuración de Inteligencia</h3>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Google Gemini API Key</label>
                      <input 
                        type="password" 
                        placeholder="••••••••••••••••••••••••"
                        value={aiConfig.api_key} 
                        onChange={(e) => setAiConfig({...aiConfig, api_key: e.target.value})} 
                        className="w-full bg-black border border-white/10 text-white text-[11px] p-4 rounded-xl outline-none focus:border-pink-500 font-mono" 
                      />
                   </div>
                   
                   <div className="p-4 bg-pink-500/5 rounded-2xl border border-pink-500/10">
                      <p className="text-[10px] text-pink-500/70 font-bold uppercase tracking-tight leading-relaxed">
                        Esta llave permitirá que la IA analice tus documentos técnicos, clasifique datos de inspección y genere reportes automáticos de eficiencia.
                      </p>
                   </div>
                   
                   <button 
                    onClick={handleSaveAI}
                    className="w-full py-5 bg-pink-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-pink-500 transition-all shadow-xl shadow-pink-900/20"
                   >
                     {loading ? 'SINCRONIZANDO...' : 'CONECTAR CEREBRO IA'}
                   </button>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Configuracion;
