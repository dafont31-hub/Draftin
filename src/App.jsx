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
import { Activity, Layout, Settings, Database, Cpu, FileText, BarChart2, Shield, MessageSquare, AlertTriangle, Droplet } from 'lucide-react'

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
  const [appConfigGrupos, setAppConfigGrupos] = useState([])
  const [branding, setBranding] = useState({ empresa_nombre: 'DRAFTIN INDUSTRIAL', color_primario: '#FF6B00', logo_url: null })

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
      const { data } = await supabase.from('perfiles').select('rol, nombre').eq('email', s.user.email).single()
      if (data) { 
        setUserRole(data.rol.toLowerCase()); 
        setUserName(data.nombre); 
      } else setUserRole('admin')
    } catch (e) { setUserRole('admin') }
    setLoading(false)
  }

  useEffect(() => {
    if (session) {
      fetchSaaSConfig(); fetchData();
      const channel = supabase.channel('saas_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config_pestanas' }, () => fetchSaaSConfig())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config_branding' }, () => fetchSaaSConfig())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config_grupos' }, () => fetchSaaSConfig())
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [session])

  async function fetchSaaSConfig() {
    try {
      const { data: nav } = await supabase.from('app_config_pestanas').select('*').eq('activo', true).order('orden')
      const { data: brand } = await supabase.from('app_config_branding').select('*').single()
      const { data: groups } = await supabase.from('app_config_grupos').select('*').order('orden')
      if (nav) setNavItems(nav)
      if (groups) setAppConfigGrupos(groups)
      if (brand) {
        setBranding(brand)
        document.documentElement.style.setProperty('--primary-color', brand.color_primario)
      }
    } catch (e) {}
  }

  async function fetchData() {
    try {
      const { data: e } = await supabase.from('equipos').select('*').order('sistema')
      const { data: o } = await supabase.from('ordenes_trabajo').select('*').order('created_at', { ascending: false })
      const { data: p } = await supabase.from('plan_mantenimiento').select('*, equipos(nombre)')
      if (e) setEquipos(e)
      if (o) setOrdenes(o)
      if (p) setPlanMantenimiento(p)
    } catch (e) {}
  }

  if (!session) return <Login />
  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-[10px] font-black uppercase tracking-widest animate-pulse text-primary font-mono">SYSTEM_SYNCING...</div>

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio': case 'dashboard': return <Home setActiveTab={setActiveTab} equipos={equipos} ordenes={ordenes} planMantenimiento={planMantenimiento} groups={appConfigGrupos} refreshData={fetchData} />;
      case 'ordenes': case 'tareas': return <WorkOrders setActiveTab={setActiveTab} equipos={equipos} ordenes={ordenes} refreshData={fetchData} />;
      case 'recogida': case 'datos': return <RecogidaDatos refreshData={fetchData} />;
      case 'consumo': case 'consumos': return <Consumos />;
      case 'analiticas': return <Analiticas />;
      case 'equipos': return <Equipos equipos={equipos} categories={appConfigGrupos} />;
      case 'usuarios': return <GestionUsuarios />;
      case 'configuracion': case 'config': return <Configuracion />;
      case 'ai_chat': case 'ai': case 'cerebro': return <AIChat />;
      case 'documentacion': case 'docs': return <BibliotecaDocs />;
      default: return <Home setActiveTab={setActiveTab} equipos={equipos} ordenes={ordenes} planMantenimiento={planMantenimiento} refreshData={fetchData} />;
    }
  }

  const visibleNavItems = navItems.filter(item => {
    if (!item.roles || !userRole) return true;
    const itemRoles = Array.isArray(item.roles) ? item.roles.map(r => r.toLowerCase()) : [];
    return itemRoles.includes(userRole);
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
           <div className="p-4 flex flex-col gap-2 overflow-y-auto no-scrollbar" style={{ height: 'calc(100vh - 180px)' }}>
              {visibleNavItems.map(item => (
                <button key={item.tab_id} onClick={() => { setActiveTab(item.tab_id); setIsMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeTab === item.tab_id ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-color-rgb),0.1)]' : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'}`}>
                  <Icon name={item.icon} active={activeTab === item.tab_id} size={20} />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] group-hover:tracking-[0.4em] transition-all">{item.label}</span>
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#050505]/80 backdrop-blur-md z-50">
          <div className="flex items-center gap-8">
            <button onClick={() => setIsMenuOpen(true)} className="p-3 -ml-3 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95 bg-white/5 rounded-xl border border-white/5"><Layout size={22} /></button>
            <div className="flex items-center gap-5">
              {branding.logo_url && <img src={branding.logo_url} className="h-8 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" alt="logo" />}
              <h1 className="text-[14px] font-black uppercase tracking-[0.6em] text-white italic">{branding.empresa_nombre}</h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-3 bg-white/[0.03] px-5 py-2 rounded-full border border-white/5 shadow-inner">
                <div className="w-2 h-2 bg-[#00FF88] rounded-full shadow-[0_0_12px_#00FF88] animate-pulse"></div>
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-[0.3em]">SaaS_Core_Active</span>
             </div>
             <div className="w-12 h-12 bg-[#0A0A0A] border border-white/10 rounded-2xl flex items-center justify-center text-gray-500 hover:text-primary cursor-pointer transition-all hover:border-primary/50 group"><Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" /></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 no-scrollbar relative bg-[#020202]">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none"></div>
          <div className="max-w-[1600px] mx-auto relative z-10">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

const Icon = ({ name, active, size = 18 }) => {
  const c = `transition-all duration-500 ${active ? 'text-primary drop-shadow-[0_0_15px_var(--primary-color)]' : 'text-gray-600 group-hover:text-white'}`;
  switch (name?.toLowerCase()) {
    case 'home': case 'dashboard': return <Layout className={c} size={size} />;
    case 'tool': case 'tareas': return <Settings className={c} size={size} />;
    case 'edit': case 'datos': return <Database className={c} size={size} />;
    case 'configuracion': case 'config': return <Cpu className={c} size={size} />;
    case 'ai': case 'ia': case 'ai_chat': case 'cerebro': return <MessageSquare className={c} size={size} />;
    case 'documentacion': case 'docs': return <FileText className={c} size={size} />;
    case 'analiticas': return <BarChart2 className={c} size={size} />;
    case 'usuarios': return <Shield className={c} size={size} />;
    case 'droplet': case 'consumos': return <Droplet className={c} size={size} />;
    default: return <Activity className={c} size={size} />;
  }
}

export default App
