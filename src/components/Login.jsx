import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, ArrowRight, Loader2, RefreshCw, Eye, EyeOff, ChevronLeft, Zap, BarChart3, Shield } from 'lucide-react';

/* ─── Animated counter ─── */
const useCounter = (target, duration = 1800) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let v = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      v += step;
      if (v >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(v));
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return val;
};

const StatItem = ({ label, value, suffix, icon: Icon }) => {
  const count = useCounter(value);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
        <Icon size={13} color="rgba(99,102,241,0.8)" />
        <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', fontFamily: 'monospace' }}>
          {count.toLocaleString()}{suffix}
        </span>
      </div>
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </p>
    </div>
  );
};

/* ─── Main component ─── */
export default function Login() {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);
  const [view, setView]             = useState('login');
  const [mounted, setMounted]       = useState(false);
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 768);
  const [branding, setBranding]     = useState({ empresa_nombre: 'DRAFTIN' });

  useEffect(() => {
    setTimeout(() => setMounted(true), 40);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    supabase.from('app_config_branding').select('*').single().then(({ data }) => {
      if (data) setBranding(data);
    });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const switchView = (v) => { setView(v); setError(null); setSuccess(null); };

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message === 'Invalid login credentials'
      ? 'Credenciales incorrectas. Verifica tu email y contraseña.'
      : error.message);
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault(); setLoading(true); setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else { setSuccess('Registro enviado. Confirma tu email para continuar.'); switchView('login'); }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) return setError('Introduce tu email.');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setSuccess('Enlace de recuperación enviado a tu email.');
    setLoading(false);
  };

  /* ─── Shared input style ─── */
  const inp = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '13px 16px 13px 44px',
    color: '#fff', fontSize: 14, fontWeight: 400,
    fontFamily: 'inherit', outline: 'none',
    transition: 'border-color .25s, box-shadow .25s, background .25s',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter',sans-serif}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blobDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(25px,-18px)}}
        @keyframes pulse{0%,100%{opacity:.8}50%{opacity:.35}}
        .l-input:focus{
          border-color:rgba(99,102,241,.6)!important;
          box-shadow:0 0 0 3px rgba(99,102,241,.12)!important;
          background:rgba(255,255,255,.07)!important;
        }
        .l-input::placeholder{color:rgba(255,255,255,.25)}
        .l-btn-primary{transition:all .2s ease!important}
        .l-btn-primary:hover:not(:disabled){
          transform:translateY(-1px);
          box-shadow:0 16px 40px rgba(99,102,241,.4)!important;
          filter:brightness(1.08);
        }
        .l-btn-primary:active:not(:disabled){transform:translateY(0)}
        .l-link{background:none;border:none;cursor:pointer;font-family:inherit;transition:color .2s}
        .l-sec-btn{transition:all .2s!important}
        .l-sec-btn:hover{
          background:rgba(255,255,255,.07)!important;
          color:#fff!important;
          border-color:rgba(255,255,255,.18)!important;
        }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        fontFamily: "'Inter', sans-serif",
        background: '#07070F', overflow: 'hidden', position: 'relative',
      }}>

        {/* ── BG image ── */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: 'url(/steam_pipes_dramatic_bg_1777803902573.png)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: isMobile ? 0.12 : 0.14,
        }} />

        {/* ── Blobs ── */}
        {[
          { w:700, h:700, top:'-200px', left:'-200px', delay:'0s' },
          { w:500, h:500, bottom:'-150px', right: isMobile ? '-50px' : '380px', delay:'4s' },
        ].map((b,i) => (
          <div key={i} style={{
            position:'fixed', borderRadius:'50%', zIndex:0, pointerEvents:'none',
            width:b.w, height:b.h, top:b.top, left:b.left, bottom:b.bottom, right:b.right,
            background:'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
            animation:`blobDrift ${18+i*6}s ease infinite ${b.delay}`,
          }} />
        ))}

        {/* ══════════════════════════════════════
            LEFT PANEL  (hidden on mobile)
        ══════════════════════════════════════ */}
        {!isMobile && (
          <div style={{
            flex:1, display:'flex', flexDirection:'column',
            justifyContent:'space-between', padding:'48px 56px',
            position:'relative', zIndex:1,
            opacity: mounted ? 1 : 0,
            animation: mounted ? 'fadeUp .8s ease forwards' : 'none',
          }}>

            {/* Logo */}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{
                width:42, height:42, borderRadius:13,
                background:'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 0 28px rgba(99,102,241,0.4)',
              }}>
                <img src="/boiler_3d.png" alt="logo"
                  style={{ width:28, height:28, objectFit:'contain', mixBlendMode:'screen', filter:'brightness(2.5) saturate(0)' }}
                  onError={e => e.target.style.display='none'}
                />
              </div>
              <div>
                <p style={{ fontSize:18, fontWeight:900, color:'#fff', letterSpacing:'-0.04em', lineHeight:1 }}>
                  {branding.empresa_nombre || 'DRAFTIN'}
                </p>
                <p style={{ fontSize:9, color:'rgba(255,255,255,0.25)', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', marginTop:2 }}>
                  Industrial OS
                </p>
              </div>
            </div>

            {/* Hero */}
            <div style={{ maxWidth:520 }}>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'5px 14px', borderRadius:999, marginBottom:28,
                background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)',
              }}>
                <div style={{
                  width:6, height:6, borderRadius:'50%',
                  background:'#6366F1', boxShadow:'0 0 8px rgba(99,102,241,0.9)',
                  animation:'pulse 2s ease infinite',
                }} />
                <span style={{ fontSize:11, fontWeight:600, color:'rgba(99,102,241,0.9)', letterSpacing:'0.08em', textTransform:'uppercase' }}>
                  Sistema activo • v1.5.2 PRO
                </span>
              </div>

              <h1 style={{
                fontSize:54, fontWeight:900, lineHeight:1.05,
                color:'#fff', letterSpacing:'-0.04em', marginBottom:20,
              }}>
                Gestión industrial<br />
                <span style={{
                  background:'linear-gradient(90deg, #6366F1, #818CF8 50%, #A5B4FC)',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                }}>
                  sin límites.
                </span>
              </h1>

              <p style={{
                fontSize:16, color:'rgba(255,255,255,0.38)', lineHeight:1.7,
                fontWeight:400, maxWidth:420, marginBottom:40,
              }}>
                Plataforma SaaS de mantenimiento industrial. Control total de activos, órdenes de trabajo y telemetría en tiempo real.
              </p>

              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { text:'Órdenes de trabajo con trazabilidad completa', icon:'⚙️' },
                  { text:'Telemetría de consumos en tiempo real',         icon:'📊' },
                  { text:'IA para análisis predictivo de fallos',         icon:'🤖' },
                ].map((f,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{
                      width:36, height:36, borderRadius:10, flexShrink:0,
                      background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
                    }}>{f.icon}</div>
                    <span style={{ fontSize:13, color:'rgba(255,255,255,0.48)', fontWeight:500 }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{
              display:'flex',
              background:'rgba(255,255,255,0.025)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:16, overflow:'hidden',
            }}>
              {[
                { label:'Equipos monitorizados', value:340,   suffix:'+',   icon:Zap },
                { label:'Órdenes gestionadas',   value:12800, suffix:'+',   icon:BarChart3 },
                { label:'Tiempo activo',          value:99,   suffix:'.9%', icon:Shield },
              ].map((s,i) => (
                <div key={i} style={{
                  flex:1, padding:'20px 16px',
                  borderRight: i<2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}>
                  <StatItem {...s} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            RIGHT PANEL — form
        ══════════════════════════════════════ */}
        <div style={{
          width: isMobile ? '100%' : 460,
          minHeight: isMobile ? '100vh' : undefined,
          flexShrink: 0,
          display:'flex', alignItems:'center', justifyContent:'center',
          padding: isMobile ? '40px 24px' : '32px 44px',
          background: isMobile ? 'rgba(7,7,15,0.97)' : 'rgba(8,8,16,0.93)',
          borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.06)',
          backdropFilter:'blur(28px)',
          position:'relative', zIndex:2,
          opacity: mounted ? 1 : 0,
          animation: mounted ? 'fadeUp .6s ease .1s forwards' : 'none',
        }}>

          {/* Top accent line */}
          <div style={{
            position:'absolute', top:0, left:'8%', right:'8%', height:1,
            background:'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
          }} />

          <div style={{ width:'100%', maxWidth: isMobile ? 400 : 360 }}>

            {/* Mobile logo */}
            {isMobile && (
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:40 }}>
                <div style={{
                  width:38, height:38, borderRadius:11,
                  background:'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 0 24px rgba(99,102,241,0.4)',
                }}>
                  <img src="/boiler_3d.png" alt="logo"
                    style={{ width:24, height:24, objectFit:'contain', mixBlendMode:'screen', filter:'brightness(2.5) saturate(0)' }}
                    onError={e => e.target.style.display='none'}
                  />
                </div>
                <div>
                  <p style={{ fontSize:17, fontWeight:900, color:'#fff', letterSpacing:'-0.04em', lineHeight:1 }}>
                    {branding.empresa_nombre || 'DRAFTIN'}
                  </p>
                  <p style={{ fontSize:9, color:'rgba(255,255,255,0.25)', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', marginTop:2 }}>
                    Industrial OS
                  </p>
                </div>
              </div>
            )}

            {/* Header */}
            <div style={{ marginBottom:32 }}>
              {view !== 'login' && (
                <button className="l-link"
                  onClick={() => switchView('login')}
                  style={{ display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.3)', fontSize:13, fontWeight:500, marginBottom:20 }}
                  onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,.7)'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.3)'}
                >
                  <ChevronLeft size={15} /> Volver
                </button>
              )}
              <h2 style={{ fontSize:26, fontWeight:800, color:'#fff', letterSpacing:'-0.035em', marginBottom:8 }}>
                {view === 'login' ? 'Bienvenido de nuevo'
                  : view === 'signup' ? 'Crear cuenta'
                  : 'Recuperar acceso'}
              </h2>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.33)', lineHeight:1.5 }}>
                {view === 'login'   ? 'Accede a tu plataforma de mantenimiento'
                  : view === 'signup' ? 'Crea tus credenciales de acceso corporativo'
                  : 'Te enviaremos un enlace seguro de recuperación'}
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div style={{
                marginBottom:20, padding:'12px 16px', borderRadius:12,
                background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)',
                fontSize:13, color:'#F87171', fontWeight:500, lineHeight:1.5,
              }}>{error}</div>
            )}
            {success && (
              <div style={{
                marginBottom:20, padding:'12px 16px', borderRadius:12,
                background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)',
                fontSize:13, color:'#34D399', fontWeight:500, lineHeight:1.5,
              }}>{success}</div>
            )}

            {/* ── LOGIN FORM ── */}
            {view === 'login' && (
              <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:18 }}>

                <Field label="Email corporativo" icon={<Mail size={15}/>}>
                  <input id="login-email" type="email" required className="l-input"
                    value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="tu@empresa.com" style={inp}
                  />
                </Field>

                <Field
                  label="Contraseña" icon={<Lock size={15}/>}
                  right={
                    <button type="button" className="l-link"
                      onClick={()=>switchView('reset')}
                      style={{ fontSize:12, color:'rgba(99,102,241,0.7)', fontWeight:500 }}
                      onMouseEnter={e=>e.currentTarget.style.color='#818CF8'}
                      onMouseLeave={e=>e.currentTarget.style.color='rgba(99,102,241,0.7)'}
                    >¿Olvidaste la contraseña?</button>
                  }
                >
                  <div style={{ position:'relative' }}>
                    <input id="login-password" type={showPwd?'text':'password'} required className="l-input"
                      value={password} onChange={e=>setPassword(e.target.value)}
                      placeholder="••••••••••" style={{ ...inp, paddingRight:48 }}
                    />
                    <button type="button"
                      onClick={()=>setShowPwd(p=>!p)}
                      style={{
                        position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                        background:'none', border:'none', cursor:'pointer',
                        color:'rgba(255,255,255,0.25)', padding:0, display:'flex', alignItems:'center',
                        transition:'color .2s',
                      }}
                      onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.6)'}
                      onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.25)'}
                    >
                      {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </Field>

                <Btn loading={loading} id="login-submit">
                  Acceder <ArrowRight size={16}/>
                </Btn>

                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>o</span>
                  <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
                </div>

                <button type="button" className="l-sec-btn" onClick={()=>switchView('signup')}
                  style={{
                    width:'100%', padding:'13px', borderRadius:12,
                    border:'1px solid rgba(255,255,255,0.1)',
                    background:'rgba(255,255,255,0.03)',
                    color:'rgba(255,255,255,0.55)', fontSize:14, fontWeight:600,
                    cursor:'pointer',
                  }}
                >
                  Crear cuenta nueva
                </button>
              </form>
            )}

            {/* ── SIGNUP FORM ── */}
            {view === 'signup' && (
              <form onSubmit={handleSignUp} style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <Field label="Email corporativo" icon={<Mail size={15}/>}>
                  <input type="email" required className="l-input"
                    value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="tu@empresa.com" style={inp}
                  />
                </Field>
                <Field label="Contraseña" icon={<Lock size={15}/>}>
                  <input type="password" required className="l-input"
                    value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres" style={inp}
                  />
                </Field>
                <Btn loading={loading}>Crear cuenta</Btn>
              </form>
            )}

            {/* ── RESET FORM ── */}
            {view === 'reset' && (
              <form onSubmit={handleReset} style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', lineHeight:1.6 }}>
                  Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
                </p>
                <Field label="Email" icon={<Mail size={15}/>}>
                  <input type="email" required className="l-input"
                    value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="tu@email.com" style={inp}
                  />
                </Field>
                <Btn loading={loading}>
                  <RefreshCw size={15}/> Enviar enlace
                </Btn>
              </form>
            )}

            <p style={{
              textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.12)',
              fontWeight:500, marginTop:32, letterSpacing:'0.04em',
            }}>
              © 2026 {branding.empresa_nombre || 'DRAFTIN'} · Plataforma Industrial SaaS
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Helpers ── */

function Field({ label, icon, right, children }) {
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <label style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.42)', letterSpacing:'0.02em' }}>
          {label}
        </label>
        {right}
      </div>
      <div style={{ position:'relative' }}>
        <span style={{
          position:'absolute', left:14, top:'50%', transform:'translateY(-50%)',
          color:'rgba(255,255,255,0.22)', pointerEvents:'none', display:'flex',
        }}>{icon}</span>
        {children}
      </div>
    </div>
  );
}

function Btn({ children, loading, id }) {
  return (
    <button id={id||'submit-btn'} type="submit" disabled={loading} className="l-btn-primary"
      style={{
        width:'100%', padding:'14px',
        background: loading
          ? 'rgba(99,102,241,0.5)'
          : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
        color:'#fff', fontWeight:700, fontSize:14,
        borderRadius:12, border:'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        boxShadow:'0 8px 28px rgba(99,102,241,0.28)',
        letterSpacing:'-0.01em',
      }}
    >
      {loading
        ? <Loader2 size={18} style={{ animation:'spin 1s linear infinite' }}/>
        : children}
    </button>
  );
}
