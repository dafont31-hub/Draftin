import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import GestionUsuarios from './GestionUsuarios';
import BibliotecaDocs from './BibliotecaDocs';
import { Settings, Shield, FileText, Cpu, Layout, MessageSquare, Database, Zap, User, Palette, QrCode, Bot, Clock } from 'lucide-react';

const Configuracion = ({ t, setActiveTab, equipos, groups = [] }) => {
  const [activeSubTab, setActiveSubTab] = useState('usuarios'); 
  const [aiConfig, setAiConfig] = useState({ provider: 'google', api_key: '', model: 'gemini-1.5-flash', activo: true });
  const [appConfigGrupos, setAppConfigGrupos] = useState(groups);
  const [saveStatus, setSaveStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAIConfig();
    fetchFrecuencias();
  }, []);

  const [frecuencias, setFrecuencias] = useState([]);

  async function fetchFrecuencias() {
    const { data } = await supabase.from('mantenimiento_frecuencias').select('*').order('nombre');
    if (data) setFrecuencias(data);
  }

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
    { id: 'usuarios', label: 'Gestión de Personal', icon: User, color: 'text-blue-500' },
    { id: 'activos', label: 'Sectores y Unidades', icon: Layout, color: 'text-emerald-500' },
    { id: 'categorias', label: 'Frecuencias y OT', icon: Clock, color: 'text-purple-500' },
    { id: 'branding', label: 'Identidad Corporativa', icon: Palette, color: 'text-orange-500' },
    { id: 'ai', label: 'Supervisor Virtual IA', icon: Bot, color: 'text-pink-500' },
    { id: 'labels', label: 'Etiquetado QR', icon: QrCode, color: 'text-yellow-500' },
  ];

  const [brandingConfig, setBrandingConfig] = useState({ empresa_nombre: '', logo_url: '', color_primario: '#FF6B00' });

  useEffect(() => {
    fetchBranding();
  }, []);

  async function fetchBranding() {
    const { data } = await supabase.from('app_config_branding').select('*').single();
    if (data) setBrandingConfig(data);
  }

  const handleSaveBranding = async () => {
    setLoading(true);
    // Asegurarse de guardar el idioma en local para cambio inmediato
    if (brandingConfig.idioma) localStorage.setItem('draftin_lang', brandingConfig.idioma);
    
    // Upsert usando el ID si existe
    const { error } = await supabase
      .from('app_config_branding')
      .upsert(brandingConfig);

    setLoading(false);
    if (!error) {
      notifySave();
      // Pequeño delay para que el usuario vea el mensaje de éxito antes de recargar
      setTimeout(() => window.location.reload(), 1500); 
    } else {
      console.error("Error saving branding:", error);
      alert("Error al guardar: " + error.message);
    }
  };

  const handlePrintSingle = (id) => {
    const cards = document.querySelectorAll('.qr-card-print');
    cards.forEach(card => card.style.display = card.id === `qr-${id}` ? 'block' : 'none');
    window.print();
    cards.forEach(card => card.style.display = '');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 min-h-[80vh] animate-in fade-in duration-700">
      {saveStatus && (
        <div className="fixed top-24 right-10 z-[300] bg-primary text-black px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl animate-bounce">
          {saveStatus}
        </div>
      )}

      {/* CONFIG SIDEBAR */}
      <aside className="w-full lg:w-72 flex flex-col gap-2">
        <div className="mb-8 pl-4">
           <h2 className="text-[14px] font-black uppercase italic tracking-tighter text-white">Configuración</h2>
           <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Ajustes del Sistema Industrial</p>
        </div>
        
        {menuItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveSubTab(item.id)}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all border ${
              activeSubTab === item.id 
                ? 'bg-primary/5 border-primary/20 text-primary shadow-[0_0_20px_rgba(var(--primary-color-rgb),0.1)]' 
                : 'bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={18} className={activeSubTab === item.id ? 'text-primary' : 'text-gray-600'} />
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </aside>

      {/* CONFIG CONTENT AREA */}
      <div className="flex-1 industrial-card bg-[#050505] p-10 shadow-2xl border-white/5 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
        
        {activeSubTab === 'usuarios' && (
          <div className="animate-in slide-in-from-right-4 duration-500">
             <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                   <User size={20} />
                </div>
                <div>
                   <h3 className="text-[14px] font-black text-white uppercase italic tracking-widest">Gestión de Personal</h3>
                   <p className="text-[9px] text-gray-600 font-bold uppercase">Control de accesos y roles de operarios</p>
                </div>
             </div>
             <GestionUsuarios t={t} />
          </div>
        )}
        
        {activeSubTab === 'branding' && (
          <div className="max-w-2xl animate-in slide-in-from-right-4 duration-500 space-y-10">
             <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 border border-orange-500/20">
                   <Palette size={20} />
                </div>
                <div>
                   <h3 className="text-[14px] font-black text-white uppercase italic tracking-widest">Identidad Corporativa</h3>
                   <p className="text-[9px] text-gray-600 font-bold uppercase">Personalización visual y branding del sistema</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block pl-1">Nombre Comercial</label>
                  <input 
                    type="text" 
                    value={brandingConfig.empresa_nombre} 
                    onChange={(e) => setBrandingConfig({...brandingConfig, empresa_nombre: e.target.value})} 
                    className="w-full bg-black border border-white/10 text-white text-[11px] p-4 rounded-xl focus:border-primary outline-none font-black uppercase italic" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block pl-1">Logo URL (PNG/SVG)</label>
                  <input 
                    type="text" 
                    value={brandingConfig.logo_url} 
                    onChange={(e) => setBrandingConfig({...brandingConfig, logo_url: e.target.value})} 
                    className="w-full bg-black border border-white/10 text-white text-[11px] p-4 rounded-xl focus:border-primary outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block pl-1">Idioma del Sistema</label>
                  <select 
                    value={brandingConfig.idioma || 'es'} 
                    onChange={(e) => setBrandingConfig({...brandingConfig, idioma: e.target.value})} 
                    className="w-full bg-black border border-white/10 text-white text-[11px] p-4 rounded-xl focus:border-primary outline-none uppercase font-black"
                  >
                    <option value="es">Español (ES)</option>
                    <option value="en">English (EN)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block pl-1">Color Principal</label>
                  <div className="flex gap-4">
                    <input 
                      type="color" 
                      value={brandingConfig.color_primario} 
                      onChange={(e) => setBrandingConfig({...brandingConfig, color_primario: e.target.value})} 
                      className="w-12 h-12 bg-black border border-white/10 rounded-xl cursor-pointer" 
                    />
                    <input 
                      type="text" 
                      value={brandingConfig.color_primario} 
                      onChange={(e) => setBrandingConfig({...brandingConfig, color_primario: e.target.value})} 
                      className="flex-1 bg-black border border-white/10 text-white text-[11px] p-4 rounded-xl focus:border-primary outline-none font-mono" 
                    />
                  </div>
                </div>
             </div>

             <button 
              onClick={handleSaveBranding}
              className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-primary/10 hover:brightness-110 transition-all"
             >
              {loading ? 'SINCRONIZANDO...' : 'GUARDAR CONFIGURACIÓN VISUAL'}
             </button>
          </div>
        )}
        
        {activeSubTab === 'activos' && (
          <div className="animate-in slide-in-from-right-4 duration-500 space-y-10">
             <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                   <Layout size={20} />
                </div>
                <div>
                   <h3 className="text-[14px] font-black text-white uppercase italic tracking-widest">Sectores y Unidades</h3>
                   <p className="text-[9px] text-gray-600 font-bold uppercase">Gestión de áreas de planta y grupos de equipos</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appConfigGrupos.map(grupo => (
                   <div key={grupo.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-6 group hover:border-emerald-500/30 transition-all">
                      <div className="w-16 h-16 bg-black rounded-xl border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                         <img src={`/${grupo.imagen || 'boiler_3d.png'}`} className="w-12 h-12 object-contain mix-blend-screen brightness-125" alt="" />
                      </div>
                      <div className="flex-1">
                         <input 
                            type="text" 
                            value={grupo.nombre} 
                            onChange={(e) => {
                               const next = [...appConfigGrupos];
                               const idx = next.findIndex(g => g.id === grupo.id);
                               next[idx].nombre = e.target.value;
                               setAppConfigGrupos(next);
                            }}
                            className="bg-transparent border-none text-white text-[12px] font-black uppercase italic outline-none focus:text-emerald-400 w-full"
                         />
                         <div className="flex items-center gap-2 mt-2">
                            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">ID: {grupo.grupo_id}</span>
                            <span className="text-gray-800">•</span>
                            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Equipos: {equipos.filter(eq => eq.sistema === grupo.grupo_id || eq.sistema === grupo.nombre).length}</span>
                         </div>
                      </div>
                      <button 
                        onClick={async () => {
                           setLoading(true);
                           const { error } = await supabase.from('app_config_grupos').update({ nombre: grupo.nombre }).eq('id', grupo.id);
                           setLoading(false);
                           if (!error) notifySave();
                        }}
                        className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                         <Settings size={14} />
                      </button>
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeSubTab === 'categorias' && (
          <div className="animate-in slide-in-from-right-4 duration-500 space-y-10">
             <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 border border-purple-500/20">
                   <Clock size={20} />
                </div>
                <div>
                   <h3 className="text-[14px] font-black text-white uppercase italic tracking-widest">Frecuencias y OT</h3>
                   <p className="text-[9px] text-gray-600 font-bold uppercase">Definición de ciclos preventivos y tipos de trabajo</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-white uppercase tracking-widest pl-2">Configuración de Ciclos</h4>
                   <div className="space-y-3">
                      {frecuencias.map(f => (
                         <div key={f.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-purple-500/30 transition-all">
                            <div>
                               <p className="text-[11px] font-black text-white uppercase italic">{f.nombre}</p>
                               <p className="text-[8px] text-gray-600 font-bold uppercase mt-1">
                                 Frecuencia: Cada {f.intervalo_valor} {f.intervalo_unidad === 'months' ? 'Meses' : f.intervalo_unidad === 'years' ? 'Años' : 'Días'}
                               </p>
                            </div>
                            <div className="flex items-center gap-2">
                               <input 
                                 type="number" 
                                 value={f.intervalo_valor} 
                                 onChange={(e) => {
                                   const next = [...frecuencias];
                                   const idx = next.findIndex(item => item.id === f.id);
                                   next[idx].intervalo_valor = parseInt(e.target.value);
                                   setFrecuencias(next);
                                 }}
                                 className="w-12 bg-black border border-white/10 rounded-lg p-2 text-center text-white text-[10px] font-black" 
                               />
                               <button 
                                 onClick={async () => {
                                   setLoading(true);
                                   const { error } = await supabase.from('mantenimiento_frecuencias').update({ intervalo_valor: f.intervalo_valor }).eq('id', f.id);
                                   setLoading(false);
                                   if (!error) notifySave();
                                 }}
                                 className="p-2 bg-purple-500/10 text-purple-500 rounded-lg hover:bg-purple-500 hover:text-white transition-all"
                                 title="Guardar Cambio"
                               >
                                  <Settings size={12} />
                                </button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="p-8 bg-purple-600/5 border border-purple-500/10 rounded-[32px] flex flex-col items-center justify-center text-center">
                   <Zap className="text-purple-500 mb-4" size={32} />
                   <h4 className="text-[12px] font-black text-white uppercase italic tracking-widest">Generador Automático</h4>
                   <p className="text-[9px] text-gray-500 font-bold uppercase mt-2 leading-relaxed">
                      El sistema utilizará estas frecuencias para crear OTs automáticamente cuando el contador llegue a cero.
                   </p>
                   <button className="mt-6 px-8 py-4 bg-purple-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] shadow-xl shadow-purple-900/20 hover:scale-105 transition-all">
                      Ejecutar Sincronización Manual
                   </button>
                </div>
             </div>
          </div>
        )}

        {activeSubTab === 'ai' && (
          <div className="max-w-2xl animate-in slide-in-from-right-4 duration-500 space-y-10">
             <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-500 border border-pink-500/20">
                   <Bot size={20} />
                </div>
                <div>
                   <h3 className="text-[14px] font-black text-white uppercase italic tracking-widest">Supervisor Virtual IA</h3>
                   <p className="text-[9px] text-gray-600 font-bold uppercase">Configuración de motor neuronal y Gemini API</p>
                </div>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block pl-1">Google Gemini API Key</label>
                  <input 
                    type="password" 
                    placeholder="••••••••••••••••••••••••"
                    value={aiConfig.api_key} 
                    onChange={(e) => setAiConfig({...aiConfig, api_key: e.target.value})} 
                    className="w-full bg-black border border-white/10 text-white text-[11px] p-4 rounded-xl focus:border-pink-500 font-mono outline-none" 
                  />
                </div>
                <div className="p-5 bg-pink-500/5 rounded-2xl border border-pink-500/10">
                   <p className="text-[10px] text-pink-500/70 font-bold uppercase tracking-tight leading-relaxed">
                     Esta llave permite que el sistema analice documentos técnicos, gestione las OTs vía chat y proporcione diagnósticos predictivos.
                   </p>
                </div>
                <button 
                  onClick={handleSaveAI}
                  className="w-full py-5 bg-pink-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-pink-900/20 hover:bg-pink-500 transition-all"
                >
                  {loading ? 'CONECTANDO...' : 'VINCULAR MOTOR NEURONAL'}
                </button>
             </div>
          </div>
        )}

        {activeSubTab === 'labels' && (
          <div className="animate-in slide-in-from-right-4 duration-500 space-y-10">
             <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                   <QrCode size={20} />
                </div>
                <div>
                   <h3 className="text-[14px] font-black text-white uppercase italic tracking-widest">Etiquetado QR Industrial</h3>
                   <p className="text-[9px] text-gray-600 font-bold uppercase">Generación de códigos para identificación de activos</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {equipos?.map(eq => (
                  <div key={eq.id} className="industrial-card bg-[#0A0A0A] p-6 flex flex-col items-center gap-4 group">
                    <div className="bg-white p-2 rounded-xl">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/?tab=scan&eq_id=' + eq.id)}`} 
                        alt="QR" className="w-24 h-24"
                      />
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black text-white uppercase truncate w-32">{eq.nombre}</p>
                       <p className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter mt-1">{eq.categoria}</p>
                    </div>
                    <button 
                      onClick={() => handlePrintSingle(eq.id)}
                      className="w-full py-2 bg-white/5 text-[8px] font-black text-white uppercase rounded-lg hover:bg-white/10 transition-all"
                    >
                      Imprimir
                    </button>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuracion;
