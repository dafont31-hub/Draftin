import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('login');
  const [branding, setBranding] = useState({ empresa_nombre: 'DRAFTIN', logo_url: '/boiler_3d.png', color_primario: '#FF6B00' });

  React.useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    const { data } = await supabase.from('app_config_branding').select('*').single();
    if (data) setBranding(data);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setError('REGISTRO_SOLICITADO: REVISA TU EMAIL PARA VALIDAR CREDENCIALES.');
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) return setError('Introduce tu email para recuperar la contraseña.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setError('ENLACE ENVIADO: REVISA TU BANDEJA DE ENTRADA.');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 selection:bg-primary selection:text-black font-sans overflow-y-auto relative"
      style={{ 
        backgroundImage: branding.bg_login_url ? `url(${branding.bg_login_url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0A0A0A'
      }}
    >
      {/* Overlay para legibilidad si hay fondo */}
      {branding.bg_login_url && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>}
      
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-1000 relative z-10">
        
        {/* Brand Identity */}
        <div className="text-center mb-6 md:mb-10">
          <div className="inline-block border-2 border-primary/30 p-2 md:p-4 rounded-[1.5rem] md:rounded-[2rem] mb-3 md:mb-6 shadow-[0_0_60px_rgba(255,107,0,0.2)] bg-black/40 relative group">
            <div className="absolute inset-0 bg-primary/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img src={branding.logo_url} alt="Logo" className="w-10 h-10 md:w-20 md:h-20 object-contain mix-blend-screen brightness-125 relative z-10" />
          </div>
          <h1 className="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none mb-1 drop-shadow-[0_10px_30px_rgba(0,0,0,1)]">{branding.empresa_nombre}</h1>
          <p className="text-[6px] md:text-[9px] text-primary font-black uppercase tracking-[0.3em] md:tracking-[0.8em] mb-4 md:mb-8 drop-shadow-[0_0_10px_rgba(255,107,0,0.5)] opacity-80">
            {branding.welcome_msg || 'Industrial Asset Intelligence'}
          </p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-[0_40px_80px_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Subtle Industrial Texture */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none opacity-20"></div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-600/10 border-l-4 border-neon-orange text-white text-[9px] font-black uppercase tracking-widest rounded shadow-lg relative z-10 italic">
              {error}
            </div>
          )}

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5 md:space-y-8 relative z-10">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-industrial-title uppercase tracking-[0.4em] ml-2 block opacity-40 italic">Terminal_ID</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#050505] border border-white/5 p-3 md:p-5 rounded-xl text-white outline-none focus:border-neon-orange transition-all font-black text-xs md:text-base placeholder:text-white/5 shadow-inner italic"
                  placeholder="user@calderas.local"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[9px] font-black text-industrial-title uppercase tracking-[0.4em] block opacity-40 italic">Master_Key</label>
                  <button type="button" onClick={handleResetPassword} className="text-[8px] text-neon-orange font-black uppercase tracking-widest opacity-60 hover:opacity-100">¿Olvido?</button>
                </div>
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#050505] border border-white/5 p-3 md:p-5 rounded-xl text-white outline-none focus:border-neon-orange transition-all font-black text-xs md:text-base placeholder:text-white/5 shadow-inner"
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit" disabled={loading}
                style={{ backgroundColor: branding.color_primario }}
                className="w-full hover:brightness-125 text-black font-black py-4 md:py-6 rounded-xl shadow-[0_20px_40px_rgba(255,107,0,0.3)] transform active:scale-[0.98] transition-all text-[9px] md:text-xs tracking-[0.4em] md:tracking-[0.6em] uppercase border-t-2 md:border-t-4 border-white/40 italic"
              >
                {loading ? 'AUTENTICANDO...' : 'INICIAR ACCESO MAESTRO'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-5 md:space-y-8 relative z-10">
              <h3 className="text-white font-black text-center mb-6 uppercase tracking-[0.5em] text-[10px] italic">Alta de Nueva Terminal</h3>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-industrial-title uppercase tracking-[0.4em] ml-2 block opacity-40 italic">Email Corporativo</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#050505] border border-white/5 p-3 md:p-5 rounded-xl text-white outline-none focus:border-neon-orange font-black text-xs md:text-base shadow-inner italic uppercase"
                  placeholder="NEW@CALDERAS.LOCAL"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-industrial-title uppercase tracking-[0.4em] ml-2 block opacity-40 italic">Password_Master</label>
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#050505] border border-white/5 p-3 md:p-5 rounded-xl text-white outline-none focus:border-neon-orange font-black text-xs md:text-base shadow-inner"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-white text-black font-black py-4 md:py-6 rounded-xl uppercase tracking-[0.4em] md:tracking-[0.6em] text-[9px] md:text-xs border-t-2 md:border-t-4 border-black/10 shadow-2xl hover:bg-neon-orange transition-all italic">
                CREAR CREDENCIALES
              </button>
              <button type="button" onClick={() => setView('login')} className="w-full text-[9px] font-black text-industrial-title uppercase tracking-[0.4em] opacity-40 italic hover:text-white transition-colors">← Volver al Terminal Principal</button>
            </form>
          )}
        </div>
        
        <div className="mt-12 md:mt-20 flex justify-center items-center gap-8 opacity-10">
           <div className="h-[1px] flex-1 bg-white"></div>
           <p className="text-[7px] md:text-[9px] font-black text-white uppercase tracking-[1em] whitespace-nowrap italic">SECURE_DRAFTIN_SYS_3.1</p>
           <div className="h-[1px] flex-1 bg-white"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
