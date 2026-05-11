import React, { useState, useEffect, useRef } from 'react'
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
import ScanLanding from './components/ScanLanding'
import NotificationsDropdown from './components/NotificationsDropdown'
import AINeuralCore from './components/AI/AINeuralCore'
import { fetchCoreData } from './services/dataService'
import {
  LayoutDashboard, ClipboardList, Database, Droplet, BarChart3,
  Package, Library, Bot, Settings, LogOut, Bell, ChevronDown,
  Zap, Flame, Wifi, WifiOff, User, X
} from 'lucide-react'
import { translations } from './translations'

/* ── Tab icon map ── */
const TAB_ICONS = {
  inicio: LayoutDashboard, dashboard: LayoutDashboard,
  tareas: ClipboardList, ordenes: ClipboardList,
  recogida: Database, datos: Database,
  consumo: Droplet, consumos: Droplet,
  analiticas: BarChart3,
  equipos: Package,
  docs: Library, documentacion: Library,
  ai_chat: Bot, ai: Bot, cerebro: Bot,
  configuracion: Settings, config: Settings,
}

const getTabIcon = (tabId) => TAB_ICONS[tabId?.toLowerCase()] || LayoutDashboard

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
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [appConfigGrupos, setAppConfigGrupos] = useState([])
  const [branding, setBranding] = useState({
    empresa_nombre: 'DRAFTIN',
    color_primario: '#FF6B00',
    color_secundario: '#00843D',
    logo_url: null,
    idioma: localStorage.getItem('draftin_lang') || 'es'
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const userMenuRef = useRef(null)
  const notificationsRef = useRef(null)

  // Generar notificaciones basadas en datos reales
  useEffect(() => {
    const alerts = [];
    // 1. OTs sin asignar
    const unassigned = ordenes.filter(o => !o.tecnico_id && o.estado !== 'Cerrada');
    if (unassigned.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'OTs por asignar',
        message: `Hay ${unassigned.length} Órdenes de Trabajo esperando técnico responsable.`,
        time: 'AHORA'
      });
    }
    // 2. Mantenimientos legales próximos
    const criticalLegal = planMantenimiento.filter(p => {
      const days = Math.ceil((new Date(p.proxima_fecha) - new Date()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 15;
    });
    criticalLegal.forEach(p => {
      alerts.push({
        type: 'critical',
        title: 'Inspección Legal Próxima',
        message: `${p.tarea} para el equipo ${p.equipo_id}. Plazo crítico.`,
        time: 'PRÓXIMAMENTE'
      });
    });

    setNotifications(alerts);
  }, [ordenes, planMantenimiento]);

  /* ── Clock ── */
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  /* ── Online status ── */
  useEffect(() => {
    const handler = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', handler)
    window.addEventListener('offline', handler)
    return () => { window.removeEventListener('online', handler); window.removeEventListener('offline', handler) }
  }, [])

  /* ── Click outside user menu & notifications ── */
  useEffect(() => {
    const handler = (e) => { 
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false)
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) setShowNotifications(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ── i18n ── */
  const t = (key) => {
    const lang = branding.idioma || localStorage.getItem('draftin_lang') || 'es'
    return translations[lang]?.[key] || key
  }

  /* ── Auth ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s) fetchUserRole(s)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) fetchUserRole(s)
      else { setUserRole(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserRole(s) {
    try {
      const { data, error } = await supabase.from('perfiles').select('rol, nombre').eq('email', s.user.email).single()
      if (!error && data) {
        setUserRole(data.rol.toLowerCase())
        setUserName(data.nombre)
        if (data.rol.toLowerCase() === 'operario') setActiveTab('recogida')
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => {
    if (session) { fetchSaaSConfig(); fetchData() }
  }, [session])

  async function fetchSaaSConfig() {
    const [navRes, brandRes, groupRes] = await Promise.all([
      supabase.from('app_config_pestanas').select('*').eq('activo', true).order('orden'),
      supabase.from('app_config_branding').select('*').maybeSingle(),
      supabase.from('app_config_grupos').select('*').order('orden')
    ])
    if (navRes.data) setNavItems(navRes.data)
    if (brandRes.data) {
      setBranding(brandRes.data)
      document.documentElement.style.setProperty('--primary', brandRes.data.color_primario)
      document.documentElement.style.setProperty('--primary-color', brandRes.data.color_primario)
    }
    if (groupRes.data) setAppConfigGrupos(groupRes.data)
  }

  async function fetchData() {
    const coreData = await fetchCoreData()
    setEquipos(coreData.equipos)
    setOrdenes(coreData.ordenes || [])
    setPlanMantenimiento(coreData.planMantenimiento)
  }

  const handleLogout = async () => {
    if (window.confirm('¿Cerrar sesión?')) await supabase.auth.signOut()
  }

  const visibleNavItems = navItems.filter(item => {
    if (['configuracion', 'config', 'usuarios'].includes(item.tab_id?.toLowerCase())) return false
    const currentRole = userRole?.toLowerCase() || 'admin'
    const itemRoles = Array.isArray(item.roles) ? item.roles.map(r => r.toLowerCase()) : []
    return itemRoles.length === 0 || itemRoles.includes(currentRole)
  })

  /* ── Render guards ── */
  if (!session) return <Login />
  if (loading) return (
    <div style={{ height: '100vh', background: '#07070F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 36px rgba(99,102,241,0.45)' }}>
        <Flame size={22} color="#fff" />
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>
        Conectando...
      </p>
    </div>
  )

  const topBarH = 60
  const subBarH = 48

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-void, #020205)', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* ═══════════════════════════════════════
          TOP HEADER  — branding + user controls
      ═══════════════════════════════════════ */}
      <header style={{
        height: topBarH,
        background: 'rgba(5,5,12,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        zIndex: 300,
        position: 'relative',
      }}>

        {/* LEFT: Logo + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            flexShrink: 0,
          }}>
            <img src="/boiler_3d.png" alt="logo"
              style={{ width: 22, height: 22, objectFit: 'contain', mixBlendMode: 'screen', filter: 'brightness(2.5) saturate(0)' }}
              onError={e => { e.target.style.display = 'none'; const f = document.createElement('span'); f.textContent = '⚙'; f.style.color = '#fff'; f.style.fontSize = '16px'; e.target.parentNode.appendChild(f); }}
            />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {branding.empresa_nombre || 'DRAFTIN'}
            </p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>
              Industrial OS
            </p>
          </div>
        </div>

        {/* RIGHT: Status + Clock + Actions + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

          {/* Online status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: isOnline ? '#10B981' : '#EF4444',
              boxShadow: isOnline ? '0 0 10px rgba(16,185,129,0.6)' : '0 0 10px rgba(239,68,68,0.6)',
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {isOnline ? 'En línea' : 'Offline'}
            </span>
          </div>

          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />

          {/* Clock */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
              {currentTime.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>

          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />

          {/* Bell */}
          <div ref={notificationsRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                width: 34, height: 34,
                background: showNotifications ? 'rgba(255,107,0,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${showNotifications ? 'rgba(255,107,0,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: showNotifications ? 'var(--primary, #FF6B00)' : 'rgba(255,255,255,0.4)',
                position: 'relative', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if(!showNotifications) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' } }}
              onMouseLeave={e => { if(!showNotifications) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' } }}
            >
              <Bell size={15} />
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background: '#EF4444', border: '1.5px solid #020205' }} />
              )}
            </button>

            {showNotifications && (
              <NotificationsDropdown 
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
                onClear={() => setNotifications([])}
              />
            )}
          </div>



          {/* User menu */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 10px 5px 6px',
                background: showUserMenu ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { if (!showUserMenu) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            >
              <div style={{
                width: 26, height: 26,
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '1px solid rgba(99,102,241,0.35)',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: 'var(--primary, #6366F1)',
              }}>
                {userName ? userName[0].toUpperCase() : 'U'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1, whiteSpace: 'nowrap' }}>{userName || 'Usuario'}</p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{userRole}</p>
              </div>
              <ChevronDown size={12} color="rgba(255,255,255,0.3)" style={{ transition: 'transform 0.2s', transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                width: 200,
                background: 'rgba(10,10,18,0.98)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 12,
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                overflow: 'hidden',
                zIndex: 400,
                backdropFilter: 'blur(20px)',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{userName}</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2, textTransform: 'capitalize' }}>{userRole}</p>
                </div>
                <div style={{ padding: 8 }}>
                  <button
                    onClick={() => { setActiveTab('configuracion'); setShowUserMenu(false) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 8, border: 'none',
                      background: 'transparent', color: 'rgba(255,255,255,0.6)',
                      cursor: 'pointer', fontSize: 13, fontWeight: 500,
                      textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                  >
                    <Settings size={14} /> Configuración
                  </button>
                  <button
                    onClick={() => { handleLogout(); setShowUserMenu(false) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 8, border: 'none',
                      background: 'transparent', color: 'rgba(239,68,68,0.7)',
                      cursor: 'pointer', fontSize: 13, fontWeight: 500,
                      textAlign: 'left', transition: 'all 0.15s', marginTop: 2,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#EF4444' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(239,68,68,0.7)' }}
                  >
                    <LogOut size={14} /> Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          NAVIGATION BAR  — horizontal tabs
      ═══════════════════════════════════════ */}
      <nav style={{
        height: subBarH,
        background: 'rgba(8,8,16,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'stretch',
        padding: '0 24px',
        flexShrink: 0,
        overflowX: 'auto',
        zIndex: 200,
        gap: 2,
      }} className="no-scrollbar">
        {visibleNavItems.map((item) => {
          const Icon = getTabIcon(item.tab_id)
          const isActive = activeTab === item.tab_id
          return (
            <button
              key={item.tab_id}
              id={`nav-${item.tab_id}`}
              onClick={() => setActiveTab(item.tab_id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '0 16px',
                borderRadius: 0,
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary, #FF6B00)' : '2px solid transparent',
                background: 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.36)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.01em',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'rgba(255,255,255,0.36)'; e.currentTarget.style.background = 'transparent' } }}
            >
              <Icon size={15} style={{ filter: isActive ? 'drop-shadow(0 0 5px rgba(99,102,241,0.7))' : 'none', color: isActive ? 'var(--primary, #6366F1)' : 'inherit' }} />
              {t(item.tab_id) || item.nombre || item.tab_id}
            </button>
          )
        })}
      </nav>

      {/* ═══════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════ */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        background: 'var(--bg-void, #020205)',
        position: 'relative',
      }} className="no-scrollbar">
        {/* Ambient glow */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 300,
          background: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(255,107,0,0.05), transparent)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '32px 28px 48px', position: 'relative', zIndex: 1 }}>
          {activeTab === 'inicio' || activeTab === 'dashboard' ? (
            <Home t={t} setActiveTab={setActiveTab} equipos={equipos} ordenes={ordenes} planMantenimiento={planMantenimiento} groups={appConfigGrupos} refreshData={fetchData} />
          ) : activeTab === 'ordenes' || activeTab === 'tareas' ? (
            <WorkOrders t={t} branding={branding} />
          ) : activeTab === 'recogida' || activeTab === 'datos' ? (
            <RecogidaDatos t={t} refreshData={fetchData} userName={userName} userRole={userRole} branding={branding} equipos={equipos} />
          ) : activeTab === 'scan' ? (
            <ScanLanding t={t} setActiveTab={setActiveTab} eqId={new URLSearchParams(window.location.search).get('eq_id')} equipos={equipos} />
          ) : activeTab === 'consumo' || activeTab === 'consumos' ? (
            <Consumos t={t} />
          ) : activeTab === 'analiticas' ? (
            <Analiticas t={t} />
          ) : activeTab === 'equipos' ? (
            <Equipos t={t} equipos={equipos} categories={appConfigGrupos} />
          ) : activeTab === 'configuracion' || activeTab === 'config' ? (
            <Configuracion t={t} setActiveTab={setActiveTab} equipos={equipos} groups={appConfigGrupos} />
          ) : activeTab === 'ai_chat' || activeTab === 'ai' || activeTab === 'cerebro' ? (
            <AIChat t={t} />
          ) : activeTab === 'documentacion' || activeTab === 'docs' ? (
            <BibliotecaDocs t={t} userRole={userRole} />
          ) : (
            <Home t={t} setActiveTab={setActiveTab} equipos={equipos} ordenes={ordenes} planMantenimiento={planMantenimiento} refreshData={fetchData} />
          )}
        </div>
      </main>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer style={{
        height: 32,
        background: 'rgba(5,5,12,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {branding.empresa_nombre || 'DRAFTIN'} • v1.5.2 PRO
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.1)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Industrial OS • 2026
        </span>
      </footer>

      {/* Global AI Assistant */}
      <AINeuralCore 
        state={activeTab === 'ai' ? 'thinking' : 'idle'} 
        onClick={() => setActiveTab('ai')} 
      />
    </div>
  )
}

export default App
