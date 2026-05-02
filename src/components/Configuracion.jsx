import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Configuracion = () => {
  const [activeSubTab, setActiveSubTab] = useState('pestanas');
  const [pestanas, setPestanas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [branding, setBranding] = useState({ empresa_nombre: '', color_primario: '#FF6B00' });
  const [aiConfig, setAiConfig] = useState({ provider: 'google', api_key: '', model: 'gemini-1.5-flash', activo: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    const { data: pData } = await supabase.from('app_config_pestanas').select('*').order('orden', { ascending: true });
    const { data: gData } = await supabase.from('app_config_grupos').select('*').order('orden', { ascending: true });
    const { data: bData } = await supabase.from('app_config_branding').select('*').single();
    const { data: aiData } = await supabase.from('app_config_ai').select('*').single();
    
    if (pData) setPestanas(pData);
    if (gData) setGrupos(gData);
    if (bData) setBranding(bData);
    if (aiData) setAiConfig(aiData);
    setLoading(false);
  }

  const IconPreview = ({ name }) => {
    switch (name) {
      case 'home': return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
      case 'tool': return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
      case 'droplet': return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>;
      case 'chart': return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>;
      case 'box': return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>;
      case 'user': return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
      case 'cog': return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
      case 'document': return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
      default: return null;
    }
  };

  const handleUpdatePestana = async (id, field, value) => {
    const { error } = await supabase.from('app_config_pestanas').update({ [field]: value }).eq('id', id);
    if (!error) fetchConfig();
  };

  const handleAddPestana = async () => {
    const newTab = {
      label: 'NUEVA PESTAÑA',
      icon: 'home',
      tab_id: 'nueva_' + Date.now(),
      orden: pestanas.length + 1,
      roles: ['admin']
    };
    const { error } = await supabase.from('app_config_pestanas').insert([newTab]);
    if (!error) fetchConfig();
  };

  const handleUpdateBranding = async (field, value) => {
    try {
      setLoading(true);
      // Intentamos actualizar. Si no hay branding.id, buscamos el primero disponible.
      let targetId = branding?.id;
      if (!targetId) {
        const { data } = await supabase.from('app_config_branding').select('id').single();
        targetId = data?.id;
      }

      const { error } = await supabase.from('app_config_branding').update({ [field]: value }).eq('id', targetId);
      
      if (error) {
        console.error("Error al guardar branding:", error);
        alert("Error al guardar: " + error.message);
      } else {
        // Forzamos actualización global del color en el DOM
        if (field === 'color_primario') {
          document.documentElement.style.setProperty('--primary-color', value);
          // Actualizamos también el RGB para las sombras
          const hex = value.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          document.documentElement.style.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`);
        }
        await fetchConfig();
      }
    } catch (err) {
      alert("Error crítico: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetNavigation = async () => {
    setLoading(true);
    const defaultTabs = [
      { label: 'DASHBOARD', icon: 'home', tab_id: 'inicio', orden: 1, roles: ['admin'] },
      { label: 'TAREAS', icon: 'tool', tab_id: 'ordenes', orden: 2, roles: ['admin', 'operario'] },
      { label: 'DATOS', icon: 'edit', tab_id: 'recogida', orden: 3, roles: ['admin', 'operario'] },
      { label: 'CONFIG', icon: 'configuracion', label: 'CONFIG', roles: ['admin'], tab_id: 'configuracion', orden: 8 }
    ];
    
    for (const tab of defaultTabs) {
      await supabase.from('app_config_pestanas').upsert(tab, { onConflict: 'tab_id' });
    }
    fetchConfig();
    setLoading(false);
    alert("Sistema de navegación restaurado.");
  };

  const installApp = async (app) => {
    const { error } = await supabase.from('app_config_pestanas').insert([{
      label: app.label,
      icon: app.icon,
      tab_id: app.tab_id,
      orden: pestanas.length + 1,
      roles: ['admin', 'operario']
    }]);
    if (!error) {
      alert(`¡App ${app.label} instalada con éxito!`);
      fetchConfig();
    } else {
      alert("Error al instalar: " + error.message);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-[11px] font-black text-white tracking-widest mb-3 uppercase">CONFIGURACIÓN DEL SISTEMA (MODO SaaS)</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveSubTab('marketplace')}
            className={`px-4 py-2 text-[9px] font-bold rounded-lg border transition-all ${activeSubTab === 'marketplace' ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.3)]' : 'bg-[#111] border-[#222] text-gray-500'}`}
          >
            TIENDA DE APPS 🚀
          </button>
          <button 
            onClick={() => setActiveSubTab('pestanas')}
            className={`px-4 py-2 text-[9px] font-bold rounded-lg border transition-all ${activeSubTab === 'pestanas' ? 'bg-primary border-primary text-white' : 'bg-[#111] border-[#222] text-gray-500'}`}
          >
            MENÚ Y ESTRUCTURA
          </button>
          <button 
            onClick={() => setActiveSubTab('documentos')}
            className={`px-4 py-2 text-[9px] font-bold rounded-lg border transition-all ${activeSubTab === 'documentos' ? 'bg-primary border-primary text-white' : 'bg-[#111] border-[#222] text-gray-500'}`}
          >
            BIBLIOTECA DE DOCS
          </button>
          <button 
            onClick={() => setActiveSubTab('conectores')}
            className={`px-4 py-2 text-[9px] font-bold rounded-lg border transition-all ${activeSubTab === 'conectores' ? 'bg-primary border-primary text-white' : 'bg-[#111] border-[#222] text-gray-500'}`}
          >
            CONECTORES DE CAMPO (SCADA)
          </button>
          <button 
            onClick={() => setActiveSubTab('branding')}
            className={`px-4 py-2 text-[9px] font-bold rounded-lg border transition-all ${activeSubTab === 'branding' ? 'bg-primary border-primary text-white' : 'bg-[#111] border-[#222] text-gray-500'}`}
          >
            IDENTIDAD / BRANDING
          </button>
          <button 
            onClick={() => setActiveSubTab('ai')}
            className={`px-4 py-2 text-[9px] font-bold rounded-lg border transition-all ${activeSubTab === 'ai' ? 'bg-purple-600 border-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-[#111] border-[#222] text-gray-500'}`}
          >
            CEREBRO AI 🤖
          </button>
          <button 
            onClick={() => setActiveSubTab('servidor')}
            className={`px-4 py-2 text-[9px] font-bold rounded-lg border transition-all ${activeSubTab === 'servidor' ? 'bg-primary border-primary text-white' : 'bg-[#111] border-[#222] text-gray-500'}`}
          >
            SISTEMA / LICENCIA
          </button>
        </div>
      </div>

      <div className="industrial-card p-6 bg-[#0A0A0A] border-[#222]">

        {activeSubTab === 'ai' && (
          <div className="max-w-2xl mx-auto py-4">
             <div className="flex items-center gap-4 mb-8 border-b border-[#222] pb-6">
                <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/30">
                   <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                   <h3 className="text-[16px] font-black text-white uppercase tracking-tighter leading-none">Motor de Inteligencia Industrial</h3>
                   <p className="text-[9px] text-gray-500 uppercase mt-2 tracking-widest leading-relaxed">Conecta tu SaaS con Gemini o ChatGPT para análisis de datos y soporte técnico en tiempo real</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className={`industrial-card p-5 cursor-pointer border transition-all ${aiConfig.provider === 'google' ? 'bg-purple-500/5 border-purple-500/50' : 'bg-[#111] border-[#222] opacity-50'}`}
                     onClick={() => setAiConfig({...aiConfig, provider: 'google'})}>
                   <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-white uppercase">Google Gemini</span>
                      <div className={`w-3 h-3 rounded-full ${aiConfig.provider === 'google' ? 'bg-purple-500 shadow-[0_0_10px_#A855F7]' : 'bg-gray-800'}`}></div>
                   </div>
                   <p className="text-[8px] text-gray-500 uppercase leading-relaxed">Opción recomendada por su plan gratuito generoso y alta velocidad de respuesta.</p>
                </div>

                <div className={`industrial-card p-5 cursor-pointer border transition-all ${aiConfig.provider === 'openai' ? 'bg-green-500/5 border-green-500/50' : 'bg-[#111] border-[#222] opacity-50'}`}
                     onClick={() => setAiConfig({...aiConfig, provider: 'openai'})}>
                   <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-white uppercase">OpenAI ChatGPT</span>
                      <div className={`w-3 h-3 rounded-full ${aiConfig.provider === 'openai' ? 'bg-green-500 shadow-[0_0_10px_#22C55E]' : 'bg-gray-800'}`}></div>
                   </div>
                   <p className="text-[8px] text-gray-500 uppercase leading-relaxed">Líder en razonamiento complejo. Requiere facturación por uso (tokens).</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="industrial-card p-6 bg-[#111] border-[#222]">
                   <label className="text-[8px] text-gray-500 font-bold uppercase mb-2 block tracking-widest">Tu API Key Personal</label>
                   <div className="relative">
                      <input 
                        type="password" 
                        value={aiConfig.api_key}
                        placeholder="Pega aquí tu clave (AIza... o sk-...)"
                        onChange={(e) => setAiConfig({...aiConfig, api_key: e.target.value})}
                        className="w-full bg-[#0A0A0A] border border-[#222] text-white text-[11px] p-4 rounded-xl focus:border-purple-500 outline-none font-mono"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                         <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                      </div>
                   </div>
                   <div className="mt-3 flex justify-between items-center">
                      <a href={aiConfig.provider === 'google' ? "https://aistudio.google.com" : "https://platform.openai.com"} 
                         target="_blank" rel="noreferrer"
                         className="text-[8px] text-purple-400 font-bold uppercase hover:underline">
                         ¿No tienes tu llave? Consíguela aquí gratis →
                      </a>
                   </div>
                </div>

                <div className="industrial-card p-6 bg-[#111] border-[#222]">
                   <label className="text-[8px] text-gray-500 font-bold uppercase mb-4 block tracking-widest">Selección de Modelo</label>
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setAiConfig({...aiConfig, model: aiConfig.provider === 'google' ? 'gemini-1.5-flash' : 'gpt-4o-mini'})}
                        className={`p-3 rounded-lg border text-[9px] font-black uppercase transition-all ${aiConfig.model.includes('flash') || aiConfig.model.includes('mini') ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-[#222] bg-[#0A0A0A] text-gray-600'}`}
                      >
                         Velocidad (Flash/Mini)
                      </button>
                      <button 
                        onClick={() => setAiConfig({...aiConfig, model: aiConfig.provider === 'google' ? 'gemini-1.5-pro' : 'gpt-4o'})}
                        className={`p-3 rounded-lg border text-[9px] font-black uppercase transition-all ${aiConfig.model === 'gemini-1.5-pro' || aiConfig.model === 'gpt-4o' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-[#222] bg-[#0A0A0A] text-gray-600'}`}
                      >
                         Inteligencia (Pro/GPT-4)
                      </button>
                   </div>
                </div>

                <button 
                  onClick={async () => {
                    setLoading(true);
                    const { error } = await supabase.from('app_config_ai').upsert(aiConfig);
                    setLoading(false);
                    if (!error) alert("¡Cerebro AI configurado y listo!");
                    else alert("Error al guardar: " + error.message);
                  }}
                  className="w-full py-4 bg-purple-600 text-white text-[11px] font-black rounded-xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20 uppercase tracking-[0.2em]"
                >
                  {loading ? 'Sincronizando...' : 'Guardar y Activar Cerebro AI'}
                </button>
             </div>
          </div>
        )}
        
        {activeSubTab === 'conectores' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-[#222] pb-4">
              <div>
                <h3 className="text-[12px] font-bold text-white uppercase tracking-wider">Centro de Conectividad Industrial</h3>
                <p className="text-[8px] text-gray-500 uppercase mt-1">Vincula datos de SCADAs, PLCs o APIs externas sin riesgo</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-[#1A1A1A] text-white text-[9px] px-3 py-2 rounded border border-[#333] font-bold hover:bg-[#222]">Escanear Red</button>
                <button className="bg-[#FF6B00] text-white text-[9px] px-3 py-2 rounded font-black">+ Nuevo Conector</button>
              </div>
            </div>

            {/* NOTA DE SEGURIDAD PARA EL CLIENTE */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 flex gap-3 items-start">
               <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
               <div>
                  <h5 className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Protocolo de Seguridad No Invasivo</h5>
                  <p className="text-[8px] text-gray-500 mt-1 uppercase leading-relaxed">
                     Esta aplicación utiliza conexiones de **solo lectura**. No requiere privilegios de Administrador ni apertura de puertos entrantes, garantizando la integridad total de la red industrial del cliente.
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ejemplo de Conector SQL/SCADA */}
              <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center border border-blue-500/20">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 1.105 4.477 2 10 2s10-.895 10-2V7M4 7c0 1.105 4.477 2 10 2s10-.895 10-2M4 7c0-1.105 4.477-2 10-2s10 .895 10 2m-10 5c4.477 0 8.268-.787 9.47-1.872M9.53 10.128C10.732 11.213 14.523 12 19 12" /></svg>
                       </div>
                       <div>
                          <h4 className="text-[11px] font-black text-white uppercase">SCADA_BOILER_ROOM</h4>
                          <span className="text-[7px] font-bold text-[#00FF88] uppercase tracking-widest flex items-center gap-1">
                             <span className="w-1.5 h-1.5 bg-[#00FF88] rounded-full animate-pulse"></span> CONECTADO
                          </span>
                       </div>
                    </div>
                    <button className="text-[8px] font-bold text-gray-500 hover:text-white uppercase tracking-tighter">Configurar</button>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] bg-[#0A0A0A] p-2 rounded border border-[#222]">
                       <span className="text-gray-500 font-bold uppercase">Tag: PR_CALDERA_1</span>
                       <span className="text-[#FF6B00] font-mono">10.2 Bar</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] bg-[#0A0A0A] p-2 rounded border border-[#222]">
                       <span className="text-gray-500 font-bold uppercase">Tag: TEMP_SALIDA</span>
                       <span className="text-[#FF6B00] font-mono">185.4 ºC</span>
                    </div>
                 </div>
              </div>

              {/* Ejemplo de Conector API/Cloud */}
              <div className="bg-[#111] border border-[#222] rounded-xl p-5 opacity-60">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center border border-purple-500/20">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                       </div>
                       <div>
                          <h4 className="text-[11px] font-black text-white uppercase">SISTEMA_ERP_SAP</h4>
                          <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                             DESCONECTADO
                          </span>
                       </div>
                    </div>
                    <button className="text-[8px] font-bold text-[#FF6B00] hover:underline uppercase tracking-tighter">Reintentar</button>
                 </div>
                 <p className="text-[8px] text-gray-600 italic">No hay datos activos para este conector.</p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'marketplace' && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-end border-b border-[#222] pb-6">
              <div>
                <h3 className="text-[14px] font-black text-white uppercase tracking-tighter">Marketplace de Aplicaciones Industriales</h3>
                <p className="text-[9px] text-gray-500 uppercase mt-1 tracking-widest">Añade nuevas funcionalidades a tu plataforma con un solo clic</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                <span className="text-[8px] font-black text-primary uppercase">Créditos: ∞ (SaaS Beta)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* App: AI ASSISTANT */}
              <div className="industrial-card p-5 bg-[#111] border-[#222] hover:border-primary/40 transition-all group">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   </div>
                   <span className="text-[7px] font-black bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 uppercase">Premium</span>
                </div>
                <h4 className="text-[12px] font-black text-white uppercase mb-2">Asistente IA (Gemini/GPT)</h4>
                <p className="text-[9px] text-gray-500 uppercase leading-relaxed mb-6">Consultor técnico integrado para resolver dudas sobre averías y normativas en tiempo real.</p>
                <button 
                  onClick={() => installApp({ label: 'ASISTENTE AI', icon: 'chart', tab_id: 'ai_chat' })}
                  className="w-full py-3 bg-[#0A0A0A] border border-[#222] text-white text-[9px] font-black rounded-xl hover:bg-primary hover:border-primary transition-all uppercase tracking-widest"
                >
                  Instalar Módulo
                </button>
              </div>

              {/* App: PDF READER */}
              <div className="industrial-card p-5 bg-[#111] border-[#222] hover:border-primary/40 transition-all group">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   </div>
                </div>
                <h4 className="text-[12px] font-black text-white uppercase mb-2">Visor de Documentación</h4>
                <p className="text-[9px] text-gray-500 uppercase leading-relaxed mb-6">Lector de PDFs inteligente para planos, manuales y certificados técnicos de los activos.</p>
                <button 
                  onClick={() => installApp({ label: 'DOCS', icon: 'document', tab_id: 'documentacion' })}
                  className="w-full py-3 bg-[#0A0A0A] border border-[#222] text-white text-[9px] font-black rounded-xl hover:bg-primary hover:border-primary transition-all uppercase tracking-widest"
                >
                  Instalar Módulo
                </button>
              </div>

              {/* App: ZIP / FILE MANAGER */}
              <div className="industrial-card p-5 bg-[#111] border-[#222] hover:border-primary/40 transition-all group opacity-60">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 bg-yellow-500/20 text-yellow-400 rounded-2xl flex items-center justify-center border border-yellow-500/30">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                   </div>
                   <span className="text-[7px] font-black bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20 uppercase">Próximamente</span>
                </div>
                <h4 className="text-[12px] font-black text-white uppercase mb-2">Gestor de Archivos (ZIP)</h4>
                <p className="text-[9px] text-gray-500 uppercase leading-relaxed mb-6">Compresión y descompresión de informes de auditoría y backups del sistema.</p>
                <button disabled className="w-full py-3 bg-[#0A0A0A] border border-[#222] text-gray-600 text-[9px] font-black rounded-xl uppercase tracking-widest cursor-not-allowed">
                  Bloqueado
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'pestanas' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-[#222] pb-4">
              <div>
                <h3 className="text-[12px] font-bold text-white uppercase tracking-wider">Diseñador de Navegación y Estructura</h3>
                <p className="text-[8px] text-gray-500 uppercase mt-1">Define qué secciones tendrá tu SaaS y quién puede verlas</p>
              </div>
              <div className="flex gap-2">
                <button onClick={resetNavigation} className="bg-[#111] text-red-500 text-[8px] px-3 py-2 rounded border border-red-500/30 font-black hover:bg-red-500/10">REPARAR NAVEGACIÓN</button>
                <button onClick={handleAddPestana} className="bg-primary text-white text-[9px] px-4 py-2 rounded-lg font-black hover:bg-primary/80 transition-all shadow-lg shadow-primary/20">+ Nueva Sección</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pestanas.map(p => (
                <div key={p.id} className="industrial-card p-4 bg-[#111] border border-[#222] hover:border-[#333] transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1A1A1A] rounded flex items-center justify-center border border-[#333] text-[#FF6B00]">
                         <IconPreview name={p.icon} />
                      </div>
                      <div>
                        <input 
                          className="bg-transparent border-none text-[11px] font-black text-white focus:ring-0 p-0 w-full uppercase"
                          defaultValue={p.label}
                          onBlur={(e) => handleUpdatePestana(p.id, 'label', e.target.value)}
                        />
                        <p className="text-[7px] text-gray-600 font-bold tracking-widest mt-1">ID: {p.tab_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="text-gray-700 hover:text-red-500 transition-colors">
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-[7px] text-gray-500 font-bold uppercase mb-1 block">Icono Visual</label>
                      <select 
                        className="w-full bg-[#0A0A0A] border border-[#222] text-[9px] text-gray-400 p-2 rounded outline-none focus:border-[#FF6B00]"
                        defaultValue={p.icon}
                        onChange={(e) => handleUpdatePestana(p.id, 'icon', e.target.value)}
                      >
                        <option value="home">Dashboard / Inicio</option>
                        <option value="tool">Herramientas / Tareas</option>
                        <option value="droplet">Fluidos / Consumos</option>
                        <option value="chart">Estadísticas / Analítica</option>
                        <option value="box">Inventario / Equipos</option>
                        <option value="user">Personal / Usuarios</option>
                        <option value="cog">Ajustes / Sistema</option>
                        <option value="document">Archivos / Planos</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[7px] text-gray-500 font-bold uppercase mb-1 block">Orden de Aparición</label>
                      <input 
                        type="number"
                        className="w-full bg-[#0A0A0A] border border-[#222] text-[9px] text-white p-2 rounded outline-none focus:border-[#FF6B00]"
                        defaultValue={p.orden}
                        onBlur={(e) => handleUpdatePestana(p.id, 'orden', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#222]">
                    <div className="flex gap-1">
                      {['admin', 'operario'].map(role => (
                        <button 
                          key={role}
                          onClick={() => {
                            const newRoles = p.roles.includes(role) 
                              ? p.roles.filter(r => r !== role)
                              : [...p.roles, role];
                            handleUpdatePestana(p.id, 'roles', newRoles);
                          }}
                          className={`text-[7px] font-black px-2 py-0.5 rounded-sm border ${p.roles.includes(role) ? 'bg-[#FF6B00]/10 border-[#FF6B00]/30 text-[#FF6B00]' : 'bg-[#0A0A0A] border-[#222] text-gray-600'}`}
                        >
                          {role.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[7px] text-gray-600 font-bold uppercase">Estado</span>
                      <button 
                        onClick={() => handleUpdatePestana(p.id, 'activo', !p.activo)}
                        className={`w-8 h-4 rounded-full relative transition-colors ${p.activo ? 'bg-[#00FF88]' : 'bg-gray-800'}`}
                      >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${p.activo ? 'left-4.5' : 'left-0.5'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'grupos' && (
          <div className="flex flex-col gap-6">
             <div className="flex justify-between items-end border-b border-[#222] pb-4">
              <div>
                <h3 className="text-[12px] font-bold text-white uppercase tracking-wider">Categorías y Familias de Activos</h3>
                <p className="text-[8px] text-gray-500 uppercase mt-1">Crea grupos para organizar los equipos en el Dashboard</p>
              </div>
              <button className="bg-[#FF6B00] text-white text-[9px] px-4 py-2 rounded-lg font-black hover:bg-[#FF8533] transition-all shadow-lg shadow-[#FF6B00]/20">+ Nueva Categoría</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {grupos.map(g => (
                 <div key={g.id} className="industrial-card p-4 bg-[#111] border border-[#222] flex flex-col items-center gap-3">
                    <div className="w-16 h-16 relative">
                       <img src={`/${g.imagen}`} className="w-full h-full object-contain mix-blend-lighten" alt="" />
                    </div>
                    <input 
                      className="bg-transparent border-none text-[10px] font-black text-center text-white focus:ring-0 p-0 w-full uppercase"
                      defaultValue={g.nombre}
                    />
                    <div className="text-[7px] text-gray-600 font-bold uppercase bg-[#0A0A0A] px-2 py-1 rounded border border-[#222]">
                       Slug: {g.grupo_id}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeSubTab === 'branding' && (
          <div className="max-w-md mx-auto py-8">
            <h3 className="text-[12px] font-bold text-white uppercase tracking-wider mb-6 text-center">Identidad Visual de la App</h3>
            <div className="flex flex-col gap-6">
              <div className="industrial-card p-6 bg-[#111] border-[#222]">
                <label className="text-[8px] text-gray-500 font-bold uppercase mb-2 block">Nombre de la Empresa / App</label>
                <input 
                  type="text" 
                  value={branding.empresa_nombre}
                  onChange={(e) => setBranding({...branding, empresa_nombre: e.target.value})}
                  onBlur={(e) => handleUpdateBranding('empresa_nombre', e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#222] text-white text-[12px] p-3 rounded focus:border-primary outline-none"
                />
              </div>

              <div className="industrial-card p-6 bg-[#111] border-[#222]">
                <label className="text-[8px] text-gray-500 font-bold uppercase mb-2 block">Color Primario de la Marca (Accent)</label>
                <div className="flex gap-4 items-center">
                   <input 
                    type="color" 
                    value={branding.color_primario}
                    onChange={(e) => handleUpdateBranding('color_primario', e.target.value)}
                    className="w-12 h-12 bg-transparent border-none cursor-pointer"
                  />
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={branding.color_primario}
                      onChange={(e) => handleUpdateBranding('color_primario', e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#222] text-white text-[12px] p-3 rounded focus:border-primary outline-none font-mono"
                    />
                  </div>
                </div>
                <p className="text-[7px] text-gray-600 mt-2 uppercase">Este color afectará a botones, indicadores y estados operativos.</p>
              </div>

              <div className="industrial-card p-6 bg-[#111] border-[#222] opacity-50">
                <label className="text-[8px] text-gray-500 font-bold uppercase mb-2 block">Logo de la Aplicación (URL)</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  className="w-full bg-[#0A0A0A] border border-[#222] text-white text-[12px] p-3 rounded focus:border-primary outline-none"
                  disabled
                />
                <p className="text-[7px] text-gray-600 mt-2 uppercase">Carga de archivos habilitada en versión Pro.</p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'servidor' && (
          <div className="max-w-md mx-auto py-8">
            <h3 className="text-[12px] font-bold text-white uppercase tracking-wider mb-6 text-center">Configuración de Independencia</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[8px] text-gray-500 font-bold uppercase mb-2 block">URL de Supabase (Endpoint)</label>
                <input 
                  type="text" 
                  placeholder="https://xxxx.supabase.co"
                  className="w-full bg-[#111] border border-[#222] text-white text-[11px] p-3 rounded focus:border-[#FF6B00] outline-none"
                />
              </div>
              <div>
                <label className="text-[8px] text-gray-500 font-bold uppercase mb-2 block">API KEY (Service Role / Anon)</label>
                <input 
                  type="password" 
                  placeholder="eyJhbG..."
                  className="w-full bg-[#111] border border-[#222] text-white text-[11px] p-3 rounded focus:border-[#FF6B00] outline-none"
                />
              </div>
              <button className="bg-gray-800 text-white text-[10px] font-black p-3 rounded mt-4 opacity-50 cursor-not-allowed">
                PROBAR CONEXIÓN (MÓDULO EN DESARROLLO)
              </button>
              <p className="text-[7px] text-gray-600 italic text-center mt-2">
                * Esto permitirá que la app sea 100% independiente de cualquier servidor fijo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuracion;
