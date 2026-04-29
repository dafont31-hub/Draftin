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

function App() {
  const [equipos, setEquipos] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [consumos, setConsumos] = useState([])
  const [planMantenimiento, setPlanMantenimiento] = useState([])
  const [activeTab, setActiveTab] = useState('inicio')
  const [session, setSession] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userName, setUserName] = useState('')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Redirección de seguridad según rol
  useEffect(() => {
    if (userRole === 'operario' && (activeTab === 'inicio' || activeTab === 'consumo' || activeTab === 'analiticas' || activeTab === 'equipos' || activeTab === 'usuarios')) {
      setActiveTab('ordenes');
    }
  }, [userRole, activeTab]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession)
      if (initialSession) {
        fetchUserRole(initialSession).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })
 
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      if (currentSession) {
        setLoading(true)
        fetchUserRole(currentSession).finally(() => setLoading(false))
      } else {
        setUserRole(null)
        setUserName('')
        setLoading(false)
      }
    })
 
    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (currentSession) => {
    const userEmail = currentSession?.user?.email?.toLowerCase();
    if (!userEmail) return;
    
    try {
      const { data: perfiles } = await supabase
        .from('perfiles')
        .select('rol, nombre')
        .ilike('email', userEmail)
      
      if (perfiles && perfiles.length > 0) {
        const perfilAdmin = perfiles.find(p => p.rol === 'admin');
        const perfilFinal = perfilAdmin || perfiles[0];
        setUserRole(perfilFinal.rol);
        setUserName(perfilFinal.nombre || '');
      } else {
        setUserRole('operario');
      }
    } catch (err) {
      setUserRole('operario');
    }
  }

  useEffect(() => {
    if (session) {
      fetchData()
      
      // Escuchamos cambios en TODAS las tablas relevantes para el Dashboard
      const channel = supabase.channel('dashboard_updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'equipos' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ordenes_trabajo' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'consumos' }, () => fetchData())
        .subscribe()

      return () => supabase.removeChannel(channel)
    }
  }, [session])

  async function fetchData() {
    try {
      const { data: dataEquipos } = await supabase.from('equipos').select('*').order('sistema', { ascending: true })
      const { data: dataOrdenes } = await supabase.from('ordenes_trabajo').select('*').order('created_at', { ascending: false })
      const { data: dataConsumos } = await supabase.from('consumos').select('*').order('fecha', { ascending: false })
      const { data: dataPlan } = await supabase.from('plan_mantenimiento').select('*, equipos(nombre)').order('proxima_fecha', { ascending: true })
      
      if (dataEquipos) setEquipos(dataEquipos)
      if (dataOrdenes) setOrdenes(dataOrdenes)
      if (dataConsumos) setConsumos(dataConsumos)
      if (dataPlan) setPlanMantenimiento(dataPlan)
    } catch (e) {
      console.error("Error cargando datos:", e)
    }
  }

  if (!session) return <Login />

  if (userRole === null) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Sincronizando Sistema...</p>
        <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-2">{session.user.email}</p>
      </div>
    );
  }

  const allNavItems = [
    { id: 'inicio', icon: 'home', label: 'DASHBOARD', roles: ['admin'] },
    { id: 'ordenes', icon: 'tool', label: 'TAREAS', roles: ['admin', 'operario'] },
    { id: 'recogida', icon: 'edit', label: 'RECOGIDA', roles: ['admin', 'operario'] },
    { id: 'consumo', icon: 'droplet', label: 'CONSUMOS', roles: ['admin'] },
    { id: 'analiticas', icon: 'chart', label: 'ANALÍTICAS', roles: ['admin'] },
    { id: 'equipos', icon: 'box', label: 'EQUIPOS', roles: ['admin'] },
    { id: 'usuarios', icon: 'user', label: 'USUARIO', roles: ['admin'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
        
        {/* SIDE MENU (DRAWER) */}
        <div className={`fixed inset-0 z-[200] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          <div className={`absolute top-0 left-0 w-72 h-full bg-[#0A0A0A] border-r border-[#222] transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
             <div className="p-8 border-b border-[#222] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF6B00] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.4)]">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2zM9 17h6v-2H9v2zm0-4h6v-2H9v2zm0-4h6V7H9v2z"/></svg>
                  </div>
                  <div>
                    <h2 className="text-[14px] font-black tracking-tighter uppercase">
                      {userName || (userRole === 'admin' ? 'ADMINISTRADOR' : 'OPERARIO')}
                    </h2>
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{session.user.email}</p>
                  </div>
                </div>
             </div>
             <div className="flex flex-col px-4 gap-2">
                {navItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      activeTab === item.id ? 'bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00]' : 'text-gray-400 hover:bg-[#111]'
                    }`}
                  >
                    <div className={activeTab === item.id ? 'text-[#FF6B00]' : 'text-gray-600'}>
                       <Icon name={item.icon} />
                    </div>
                    <span className="text-[11px] font-black tracking-[0.2em]">{item.label}</span>
                  </button>
                ))}
             </div>
             
             <div className="absolute bottom-0 left-0 w-full p-6 border-t border-[#222]">
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Cerrar Sesión</span>
                </button>
             </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 border-b border-[#222] bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-between px-6 z-50">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.3)]">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2zM9 17h6v-2H9v2zm0-4h6v-2H9v2zm0-4h6V7H9v2z"/></svg>
                </div>
                <h1 className="text-[14px] font-black tracking-tighter text-white uppercase flex flex-col leading-none">
                  SALA TÉRMICA
                  <span className="text-[8px] text-gray-500 font-bold tracking-widest mt-0.5">
                    {userRole ? userRole.toUpperCase() : 'VALIDANDO...'}
                  </span>
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111] rounded-full border border-[#222]">
               <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#00FF88]' : 'bg-red-500'}`}></div>
               <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-black">
            <div className="max-w-7xl mx-auto w-full">
              {(activeTab === 'inicio' && userRole === 'admin') && <Home setActiveTab={setActiveTab} equipos={equipos} ordenes={ordenes} planMantenimiento={planMantenimiento} refreshData={fetchData} />}
              {activeTab === 'ordenes' && <WorkOrders setActiveTab={setActiveTab} equipos={equipos} ordenes={ordenes} refreshData={fetchData} />}
              {activeTab === 'recogida' && <RecogidaDatos refreshData={fetchData} />}
              {(activeTab === 'consumo' && userRole === 'admin') && <Consumos />}
              {(activeTab === 'analiticas' && userRole === 'admin') && <Analiticas />}
              {(activeTab === 'equipos' && userRole === 'admin') && <Equipos equipos={equipos} />}
              {(activeTab === 'usuarios' && userRole === 'admin') && <GestionUsuarios />}
            </div>
          </main>
        </div>
    </div>
  );
}

const Icon = ({ name }) => {
  switch (name) {
    case 'home': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
    case 'tool': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
    case 'edit': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>;
    case 'droplet': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>;
    case 'chart': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>;
    case 'box': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>;
    case 'user': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
    default: return null;
  }
}

export default App;
