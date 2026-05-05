import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import GestionUsuarios from './GestionUsuarios';
import BibliotecaDocs from './BibliotecaDocs';
import { Settings, Shield, FileText, Cpu, Layout, MessageSquare, Database, Zap } from 'lucide-react';

const Configuracion = ({ t, setActiveTab, equipos }) => {
  const [activeSubTab, setActiveSubTab] = useState('labels'); 
  const [aiConfig, setAiConfig] = useState({ provider: 'google', api_key: '', model: 'gemini-1.5-flash', activo: true });
  const [saveStatus, setSaveStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
    { id: 'ai', label: 'AI_CEREBRO', icon: MessageSquare, color: 'text-pink-500' },
    { id: 'branding', label: 'PERSONALIZACIÓN', icon: Layout, color: 'text-orange-500' },
    { id: 'labels', label: 'ETIQUETAS QR', icon: Zap, color: 'text-yellow-500' },
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
    // Guardar en localStorage como fallback inmediato
    if (brandingConfig.idioma) {
      localStorage.setItem('draftin_lang', brandingConfig.idioma);
    }
    const { error } = await supabase.from('app_config_branding').upsert(brandingConfig);
    setLoading(false);
    if (!error) {
      notifySave();
      setTimeout(() => window.location.reload(), 1000); 
    }
  };

  const handlePrintSingle = (id) => {
    // Añadimos una clase al body para identificar qué estamos imprimiendo
    const cards = document.querySelectorAll('.qr-card-print');
    cards.forEach(card => {
      if (card.id === `qr-${id}`) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
    
    window.print();
    
    // Limpiamos después de imprimir (volvemos a dejar que el CSS controle)
    cards.forEach(card => {
      card.style.display = '';
    });
  };

  return (
    <div className="animate-in fade-in duration-500 relative">
      {saveStatus && (
        <div className="fixed top-24 right-10 z-[300] bg-primary text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl animate-bounce">
          {t('sistema_sincronizado')}
        </div>
      )}

      {/* HEADER PREMIUM SAAS */}
      <div className="flex items-center justify-between mb-8 bg-[#050505] p-6 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-[14px] font-black text-white tracking-widest uppercase italic">{t('panel_control')}</h2>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">{t('gestion_centralizada')}</p>
          </div>
        </div>
        <button onClick={() => setActiveTab('inicio')} className="flex items-center gap-3 px-6 py-3 bg-[#111] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-gray-400 hover:text-white">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t('volver_dashboard')}
        </button>
      </div>

      {/* MENÚ DE MÓDULOS SAAS */}
      <div className="flex gap-2 mb-10 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar">
        {menuItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveSubTab(item.id)}
            className={`flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-t-2xl ${
              activeSubTab === item.id ? 'bg-white/5 text-white border-b-2 border-primary' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <item.icon size={16} className={activeSubTab === item.id ? item.color : 'text-gray-600'} />
            {t(item.label) || item.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO DINÁMICO */}
      <div className="industrial-card p-8 bg-[#0D0D0D] border-white/5 shadow-inner">
        
        {activeSubTab === 'branding' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500">
            <div className="p-8 bg-[#111] rounded-3xl border border-white/5 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                  <Layout size={20} />
                </div>
                <h3 className="text-[14px] font-black text-white uppercase italic">{t('identidad_visual')}</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Nombre de la Empresa</label>
                  <input 
                    type="text" 
                    value={brandingConfig.empresa_nombre} 
                    onChange={(e) => setBrandingConfig({...brandingConfig, empresa_nombre: e.target.value})} 
                    className="w-full bg-black border border-white/10 text-white text-[11px] p-4 rounded-xl outline-none focus:border-orange-500 uppercase font-black" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">URL del Logo (Transparente)</label>
                  <input 
                    type="text" 
                    value={brandingConfig.logo_url} 
                    onChange={(e) => setBrandingConfig({...brandingConfig, logo_url: e.target.value})} 
                    className="w-full bg-black border border-white/10 text-white text-[11px] p-4 rounded-xl outline-none focus:border-orange-500" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">{t('idioma')}</label>
                  <select 
                    value={brandingConfig.idioma || 'es'} 
                    onChange={(e) => setBrandingConfig({...brandingConfig, idioma: e.target.value})} 
                    className="w-full bg-black border border-white/10 text-white text-[11px] p-4 rounded-xl outline-none focus:border-primary uppercase font-black"
                  >
                    <option value="es">Español (ES)</option>
                    <option value="en">English (EN)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Color Primario (Hex)</label>
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
                      className="flex-1 bg-black border border-white/10 text-white text-[11px] p-4 rounded-xl outline-none focus:border-orange-500 uppercase font-mono" 
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveBranding}
                  className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase text-[11px] tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20"
                >
                  {loading ? t('sincronizando') : t('guardar_cambios')}
                </button>
              </div>
            </div>
          </div>
        )}
        
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

        {activeSubTab === 'labels' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
            {/* ETIQUETA MAESTRA PARA SATÉLITES */}
            <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl mb-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest rounded-bl-2xl">Recomendado para Satélites</div>
              <div className="bg-white p-4 rounded-2xl shadow-2xl">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/?tab=scan&eq_id=master-sat')}`} 
                  alt="QR MAESTRO"
                  className="w-32 h-32"
                />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-white text-[16px] font-black uppercase italic tracking-widest">Etiqueta Maestra de Satélites</h3>
                <p className="text-gray-400 text-[11px] leading-relaxed uppercase font-bold">
                  Imprime 60 copias de esta etiqueta. Al escanearla, la App pedirá al operario que seleccione el número de satélite. <br/>
                  <span className="text-primary/70">Ideal cuando no conoces los códigos exactos de cada equipo.</span>
                </p>
                <button 
                  onClick={() => handlePrintSingle('master-sat')}
                  className="px-8 py-3 bg-primary text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                  Imprimir Etiqueta Maestra
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
              <div className="flex-1 w-full">
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-3">Buscador de Equipos ({equipos?.length || 0})</p>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="BUSCAR EQUIPO O SATÉLITE..." 
                    className="w-full bg-black border border-white/10 text-white text-[11px] p-4 pl-12 rounded-2xl outline-none focus:border-primary font-black tracking-widest"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <Database size={18} />
                  </div>
                </div>
              </div>
              <button 
                onClick={() => window.print()}
                className="w-full md:w-auto px-10 py-5 bg-primary text-black rounded-2xl font-black uppercase text-[11px] tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20"
              >
                Imprimir Selección
              </button>
            </div>

            {!equipos || equipos.length === 0 ? (
              <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">No se han encontrado equipos configurados</p>
              </div>
            ) : (
              <div id="printable-area" className="qr-print-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {equipos
                  .filter(eq => eq.sistema !== 'Limpieza') // Ocultamos los satélites individuales
                  .filter(eq => eq.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || eq.sistema.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(eq => {
                // Mapeo de categorías a secciones del formulario
                const sectionMap = {
                  'Calderas': 'calderas',
                  'Descalcificadores': 'descalcificadores',
                  'Desgasificador': 'desgasificador',
                  'Intercambiadores': 'intercambiadores',
                  'Química': 'control-quimico'
                };
                const section = sectionMap[eq.categoria] || 'calderas';
                
                return (
                  <div key={eq.id} id={`qr-${eq.id}`} className="qr-card-print bg-black/40 border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-4 group hover:border-primary/50 transition-all">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 text-lg">
                      {eq.categoria === 'Calderas' ? '♨️' : 
                       eq.categoria === 'Intercambiadores' ? '🔄' : 
                       eq.categoria === 'Satélites' ? '🛰️' : 
                       eq.categoria === 'Tratamiento de agua' ? '💧' : '⚙️'}
                    </div>
                    <div className="text-center">
                      <p className="text-[12px] font-black text-white uppercase mb-1">{eq.nombre}</p>
                      <p className="text-[7px] text-white/40 font-bold uppercase tracking-tighter">{eq.categoria}</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/?tab=scan&eq_id=' + eq.id)}`} 
                        alt="QR"
                        className="w-28 h-28"
                      />
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePrintSingle(eq.id); }}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-[8px] font-black text-white uppercase rounded-lg transition-all border border-white/5 print:hidden"
                    >
                      Imprimir Etiqueta
                    </button>
                    <div className="text-[8px] font-black text-gray-500 uppercase mt-1 tracking-widest hidden print:block">LITERA MEAT - {eq.nombre}</div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Configuracion;
