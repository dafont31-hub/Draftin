import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Home from './components/Home'
import WorkOrders from './components/WorkOrders'
import Consumos from './components/Consumos'
import RecogidaDatos from './components/RecogidaDatos'
import Analiticas from './components/Analiticas'
import Login from './components/Login'
import Equipos from './components/Equipos'
import GestionUsuarios from './components/GestionUsuarios'
import Configuracion from './components/Configuracion'
import AIChat from './components/AIChat'
import BibliotecaDocs from './components/BibliotecaDocs'
import { fetchCoreData } from './services/dataService'
import { Activity, Layout, Settings, Database, Cpu, FileText, BarChart2, Shield, MessageSquare, AlertTriangle, Droplet, LogOut, LayoutDashboard, ClipboardList, Zap, BarChart3, Users, Sliders, Library, Bot, Package, FileJson, HardDrive, FileEdit } from 'lucide-react'
import { translations } from './translations'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [userName, setUserName] = useState('')
  const [activeTab, setActiveTab] = useState('inicio')
  const [navItems, setNavItems] = useState([])
  const [equipos, setEquipos] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [planMantenimiento, setPlanMantenimiento] = useState([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [appConfigGrupos, setAppConfigGrupos] = useState([])
  const [branding, setBranding] = useState({ 
    empresa_nombre: 'DRAFTIN | THERMAL MASTER', 
    color_primario: '#FF6B00', 
    logo_url: null, 
    idioma: localStorage.getItem('draftin_lang') || 'es' 
  })
  const [uiConfig, setUiConfig] = useState({ border_radius: '1.5rem', glass_opacity: '0.1', card_bg: '#111' })
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const t = (key) => {
    const lang = branding.idioma || localStorage.getItem('draftin_lang') || 'es';
    return translations[lang][key] || key;
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s) fetchUserRole(s)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) fetchUserRole(s)
      else { setUserRole(null); setLoading(false); }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserRole(s) {
    try {
      const { data, error } = await supabase.from('perfiles').select('rol, nombre').eq('email', s.user.email).single()
      if (error) {
        console.warn("No se encontró perfil para este usuario, usando valores por defecto.");
        setUserRole('operario');
        setUserName(s.user.email.split('@')[0]);
        return;
      }
      if (data) { 
        if (data.estado === 'inactivo') {
          alert('SU ACCESO HA SIDO DESACTIVADO POR EL ADMINISTRADOR.');
          await supabase.auth.signOut();
          return;
        }
        setUserRole(data.rol.toLowerCase()); 
        setUserName(data.nombre); 
      }
    } catch (e) { 
      console.error("Error en fetchUserRole:", e);
      setUserRole('operario');
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    if (window.confirm(t('cerrar_sesion'))) {
      await supabase.auth.signOut();
    }
  };

  useEffect(() => {
    if (session) {
      fetchSaaSConfig(); fetchData();
      const channel = supabase.channel('saas_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config_pestanas' }, () => fetchSaaSConfig())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config_branding' }, () => fetchSaaSConfig())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config_grupos' }, () => fetchSaaSConfig())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config_pestanas' }, () => fetchSaaSConfig())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config_branding' }, () => fetchSaaSConfig())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config_grupos' }, () => fetchSaaSConfig())
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [session])

  async function fetchSaaSConfig() {
    try {
      const { data: nav, error: e1 } = await supabase.from('app_config_pestanas').select('*').eq('activo', true).order('orden')
      const { data: brand, error: e2 } = await supabase.from('app_config_branding').select('*').single()
      const { data: groups, error: e3 } = await supabase.from('app_config_grupos').select('*').order('orden')
      
      if (e1) console.error("Error cargando pestañas:", e1);
      if (e2) console.error("Error cargando branding:", e2);
      if (e3) console.error("Error cargando grupos:", e3);

      if (nav && nav.length > 0) {
        setNavItems(nav);
      } else if (nav && nav.length === 0) {
        console.warn("No hay pestañas activas. Restaurando valores por defecto...");
        const defaults = [
          { label: 'DASHBOARD', icon: 'home', tab_id: 'inicio', orden: 1, roles: ['admin', 'operario'], activo: true },
          { label: 'TAREAS', icon: 'tool', tab_id: 'ordenes', orden: 2, roles: ['admin', 'operario'], activo: true },
          { label: 'DATOS', icon: 'edit', tab_id: 'recogida', orden: 3, roles: ['admin', 'operario'], activo: true },
          { label: 'CONFIG', icon: 'configuracion', tab_id: 'configuracion', orden: 10, roles: ['admin'], activo: true }
        ];
        for (const t of defaults) {
          await supabase.from('app_config_pestanas').upsert(t, { onConflict: 'tab_id' });
        }
        const { data: retryNav } = await supabase.from('app_config_pestanas').select('*').eq('activo', true).order('orden');
        if (retryNav) setNavItems(retryNav);
      }
      
      if (groups) setAppConfigGrupos(groups)
      if (brand) {
        setBranding(brand)
        const hex = brand.color_primario || '#FF6B00';
        document.documentElement.style.setProperty('--primary-color', hex)
        
        // Convertir a RGB para transparencias
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        document.documentElement.style.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`);
      }
    } catch (e) {
      console.error("Error crítico en fetchSaaSConfig:", e);
    }
  }

  async function fetchData() {
    try {
      const coreData = await fetchCoreData();
      
      setEquipos(coreData.equipos);
      setOrdenes(coreData.ordenes || []);
      setPlanMantenimiento(coreData.planMantenimiento);
    } catch (e) {
      console.error("Error crítico en fetchData:", e);
    }
  }

  if (!session) return <Login />
  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-[10px] font-black uppercase tracking-widest animate-pulse text-primary font-mono">SYSTEM_SYNCING...</div>

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio': case 'dashboard': return <Home t={t} setActiveTab={setActiveTab} equipos={equipos} ordenes={ordenes} planMantenimiento={planMantenimiento} groups={appConfigGrupos} refreshData={fetchData} />;
      case 'ordenes': case 'tareas': return <WorkOrders t={t} setActiveTab={setActiveTab} equipos={equipos} ordenes={ordenes} planMantenimiento={planMantenimiento} refreshData={fetchData} />;
      case 'recogida': case 'datos': return <RecogidaDatos t={t} refreshData={fetchData} />;
      case 'consumo': case 'consumos': return <Consumos t={t} />;
      case 'analiticas': return <Analiticas t={t} />;
      case 'equipos': return <Equipos t={t} equipos={equipos} categories={appConfigGrupos} />;
      case 'usuarios': return <GestionUsuarios t={t} />;
      case 'configuracion': case 'config': return <Configuracion t={t} setActiveTab={setActiveTab} />;
      case 'ai_chat': case 'ai': case 'cerebro': return <AIChat t={t} />;
      case 'documentacion': case 'docs': return <BibliotecaDocs t={t} />;
      default: return <Home t={t} setActiveTab={setActiveTab} equipos={equipos} ordenes={ordenes} planMantenimiento={planMantenimiento} refreshData={fetchData} />;
    }
  }

  const visibleNavItems = navItems.filter(item => {
    // La configuración siempre se oculta del sidebar para estar en el gear del header
    if (['configuracion', 'config'].includes(item.tab_id?.toLowerCase())) return false;
    
    // Si no tiene roles definidos, la mostramos a todos
    if (!item.roles || (Array.isArray(item.roles) && item.roles.length === 0)) return true;
    
    // Normalizar roles para comparación
    const currentRole = userRole?.toLowerCase() || 'admin';
    const itemRoles = Array.isArray(item.roles) 
      ? item.roles.map(r => r.toLowerCase()) 
      : [item.roles?.toString().toLowerCase()];
      
    return itemRoles.includes(currentRole);
  });

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {/* SIDEBAR */}
      <div className={`fixed inset-0 z-[200] transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute left-0 top-0 w-72 h-full bg-[#050505] border-r border-white/5 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <div className="p-8 border-b border-white/5 flex items-center gap-5">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center font-black text-black shadow-[0_0_25px_rgba(var(--primary-color-rgb),0.4)] text-xl italic">{userName ? userName[0].toUpperCase() : 'D'}</div>
              <div className="flex flex-col"><span className="text-[11px] font-black uppercase tracking-tighter text-white">{userName || 'OPERATOR'}</span><span className="text-[8px] text-primary font-black uppercase tracking-[0.3em]">{userRole}</span></div>
           </div>
           <div className="p-4 flex flex-col gap-5 overflow-y-auto no-scrollbar" style={{ height: 'calc(100vh - 180px)' }}>
              {visibleNavItems.map(item => {
                const isActive = activeTab === item.tab_id;
                return (
                  <button 
                    key={item.tab_id} 
                    onClick={() => { setActiveTab(item.tab_id); setIsMenuOpen(false); }} 
                    className={`flex items-center gap-6 p-2.5 rounded-[24px] transition-all duration-500 group relative ${isActive ? 'bg-white/[0.05] shadow-[0_10px_30px_rgba(0,0,0,0.3)]' : 'hover:bg-white/[0.02]'}`}
                  >
                    {/* INDICADOR ACTIVO PREMIUM */}
                    {isActive && (
                      <div className="absolute -left-4 w-2 h-10 bg-primary rounded-r-full shadow-[0_0_20px_rgba(255,107,0,0.6)] animate-pulse"></div>
                    )}
                    
                    <div className="relative">
                       <Icon name={item.icon} active={isActive} size={22} />
                    </div>

                    <div className="flex flex-col items-start gap-0.5">
                       <span className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-500 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-300'}`}>
                          {t(item.tab_id)}
                       </span>
                       {isActive && <span className="text-[6px] font-bold text-primary uppercase tracking-[0.2em] animate-in fade-in slide-in-from-left-2">{t('modulo_activo')}</span>}
                    </div>
                  </button>
                );
              })}
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 md:h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-10 bg-[#050505]/80 backdrop-blur-md z-50">
          <div className="flex items-center gap-3 md:gap-8">
            <button onClick={() => setIsMenuOpen(true)} className="p-2.5 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95 bg-white/5 rounded-xl border border-white/5"><Layout size={20} /></button>
            <div className="flex items-center gap-2 md:gap-5">
              {branding.logo_url && <img src={branding.logo_url} className="h-6 md:h-8 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" alt="logo" />}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h1 className="relative text-[12px] xs:text-[16px] md:text-[20px] font-black uppercase tracking-[0.1em] xs:tracking-[0.2em] md:tracking-[0.3em] italic text-white flex items-center gap-2 md:gap-3">
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.2)]">DRAFTIN</span>
                  <span className="hidden xs:inline text-gray-400 font-light not-italic">|</span>
                  <span className="hidden sm:inline tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-md">THERMAL MASTER</span>
                </h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
             <div className="flex flex-col items-end mr-1 md:mr-2">
                <span className="text-[9px] md:text-[11px] font-black text-white italic tracking-tighter leading-none">
                   {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="text-[6px] md:text-[7px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                   {currentTime.toLocaleDateString(branding.idioma === 'en' ? 'en-US' : 'es-ES', { day: '2-digit', month: 'short' })}
                   <span className="hidden xs:inline"> {currentTime.getFullYear()}</span>
                </span>
             </div>
             <div className="flex items-center gap-2 bg-white/[0.03] px-3 md:px-5 py-1.5 md:py-2 rounded-full border border-white/5 shadow-inner">
                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shadow-lg ${isOnline ? 'bg-[#00FF88] shadow-[#00FF88]/40 animate-pulse' : 'bg-red-500 shadow-red-500/40 animate-[pulse_0.5s_infinite]'}`}></div>
                <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] ${isOnline ? 'text-gray-500' : 'text-red-500'} hidden xs:inline`}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
             </div>
             <div className="flex items-center gap-1.5 md:gap-2">
                <div 
                  onClick={() => setActiveTab('configuracion')}
                  className="w-10 h-10 md:w-12 md:h-12 bg-[#0A0A0A] border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-gray-500 hover:text-primary cursor-pointer transition-all hover:border-primary/50 group"
                  title="Configuración"
                >
                  <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                </div>
                <div 
                  onClick={handleLogout}
                  className="w-10 h-10 md:w-12 md:h-12 bg-[#0A0A0A] border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-gray-500 hover:text-red-500 cursor-pointer transition-all hover:border-red-500/50 group"
                  title="Cerrar Sesión"
                >
                  <LogOut size={18} />
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar relative bg-[#020202]">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none"></div>
          <div className="max-w-[1600px] mx-auto relative z-10">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

const Icon = ({ name, active, size = 22 }) => {
  const getColors = (name) => {
    switch (name?.toLowerCase()) {
      case 'home': case 'dashboard': return { color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.1)', border: 'rgba(96, 165, 250, 0.2)' };
      case 'tool': case 'tareas': return { color: '#FB923C', bg: 'rgba(251, 146, 60, 0.1)', border: 'rgba(251, 146, 60, 0.2)' };
      case 'edit': case 'datos': return { color: '#34D399', bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.2)' };
      case 'ai': case 'ia': case 'ai_chat': case 'cerebro': return { color: '#F472B6', bg: 'rgba(244, 114, 182, 0.1)', border: 'rgba(244, 114, 182, 0.2)' };
      case 'documentacion': case 'docs': return { color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.2)' };
      case 'analiticas': return { color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.1)', border: 'rgba(34, 211, 238, 0.2)' };
      case 'usuarios': return { color: '#818CF8', bg: 'rgba(129, 140, 248, 0.1)', border: 'rgba(129, 140, 248, 0.2)' };
      case 'droplet': case 'consumos': return { color: '#FACC15', bg: 'rgba(250, 204, 21, 0.1)', border: 'rgba(250, 204, 21, 0.2)' };
      case 'equipos': case 'box': return { color: '#FB7185', bg: 'rgba(251, 113, 133, 0.1)', border: 'rgba(251, 113, 133, 0.2)' };
      default: return { color: '#9CA3AF', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  const c = getColors(name);
  const strokeColor = active ? c.color : '#444';
  const glow = active ? `drop-shadow(0 0 8px ${c.color}66)` : 'none';

  const CustomSVG = ({ children, viewBox = "0 0 24 24" }) => (
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 border relative overflow-hidden ${
      active 
        ? 'shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]' 
        : 'bg-[#050505] border-white/5'
    }`} style={{ backgroundColor: active ? c.bg : '#050505', borderColor: active ? c.border : 'rgba(255,255,255,0.05)' }}>
      {/* REFLEJO DE CRISTAL */}
      <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-white/10 to-transparent opacity-20"></div>
      
      <svg 
        width={size} height={size} viewBox={viewBox} fill="none" 
        stroke={strokeColor} strokeWidth={active ? "2" : "1.5"} strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: glow, transition: 'all 0.5s ease' }}
        className="group-hover:scale-110 group-hover:rotate-[360deg] transition-all duration-700 relative z-10"
      >
        {children}
      </svg>
    </div>
  );

  switch (name?.toLowerCase()) {
    case 'home': case 'dashboard': return (
      <CustomSVG>
        <rect x="2" y="2" width="9" height="9" rx="1" />
        <rect x="13" y="2" width="9" height="5" rx="1" opacity="0.4" />
        <rect x="13" y="9" width="9" height="13" rx="1" />
        <rect x="2" y="13" width="9" height="9" rx="1" opacity="0.4" />
        <path d="M7 7h.01M17 4h.01M17 15h.01M7 17h.01" strokeWidth="3" />
      </CustomSVG>
    );
    case 'tool': case 'tareas': return (
      <CustomSVG>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z" />
        <path d="M12 12l-5 5M9 9l-2 2" opacity="0.4" />
      </CustomSVG>
    );
    case 'edit': case 'datos': return (
      <CustomSVG>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" opacity="0.4" />
      </CustomSVG>
    );
    case 'ai': case 'ia': case 'ai_chat': case 'cerebro': return (
      <CustomSVG>
        <circle cx="12" cy="12" r="10" strokeWidth="1" opacity="0.2" />
        <circle cx="12" cy="12" r="3" strokeWidth="2" />
        <path d="M12 9V7M12 17v-2M15 12h2M9 12H7" strokeWidth="2" />
        <path d="M14.5 9.5l1.5-1.5M9.5 14.5L8 16M14.5 14.5l1.5 1.5M9.5 9.5L8 8" opacity="0.6" />
      </CustomSVG>
    );
    case 'documentacion': case 'docs': return (
      <CustomSVG>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M9 7h6M9 11h6" opacity="0.4" />
      </CustomSVG>
    );
    case 'analiticas': return (
      <CustomSVG>
        <path d="M12 20V10M18 20V4M6 20v-4" strokeWidth="2.5" />
        <path d="M3 20h18" strokeWidth="1" opacity="0.3" />
      </CustomSVG>
    );
    case 'usuarios': return (
      <CustomSVG>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M18 3.13a4 4 0 0 1 0 7.75" opacity="0.4" />
      </CustomSVG>
    );
    case 'droplet': case 'consumos': return (
      <CustomSVG>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="2" />
        <path d="M13 2l-1 8h9" opacity="0.4" />
      </CustomSVG>
    );
    case 'equipos': case 'box': return (
      <CustomSVG>
        <path d="M21 16V8l-9-5-9 5v8l9 5 9-5z" />
        <path d="M3 8l9 5 9-5M12 22v-9" opacity="0.4" />
      </CustomSVG>
    );
    default: return (
      <CustomSVG>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </CustomSVG>
    );
  }
}

export default App
