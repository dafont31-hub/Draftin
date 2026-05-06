import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Shield, Key, Mail, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('login'); // 'login', 'signup', 'reset'
  const [branding, setBranding] = useState({ 
    empresa_nombre: 'DRAFTIN', 
    logo_url: '/boiler_3d.png', 
    color_primario: '#FF6B00',
    welcome_msg: 'Industrial Asset Intelligence'
  });

  useEffect(() => {
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
    if (error) setError(error.message === 'Invalid login credentials' ? 'CREDENCIALES NO VÁLIDAS' : error.message);
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setError('REGISTRO ENVIADO: CONFIRMA TU EMAIL.');
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) return setError('INTRODUCE TU EMAIL');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setError('ENLACE ENVIADO A TU EMAIL');
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 selection:bg-primary selection:text-black font-sans relative overflow-hidden"
      style={{
        backgroundImage: 'url("/bg_login.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px]"></div>
      
      <div className="w-full max-w-[280px] z-10 animate-in fade-in zoom-in-95 duration-700">
        
        <div className="bg-[#0D0D0D]/95 border border-white/10 rounded-[2.5rem] p-6 shadow-[0_30px_100px_rgba(0,0,0,1)] relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          
          {/* Header Compacto */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-black/50 border border-white/5 rounded-[2rem] shadow-2xl mb-3 group transition-all hover:border-primary/50">
               <img 
                 src="/master_logo.png" 
                 alt="Logo" 
                 className="w-14 h-14 object-contain brightness-125"
                 onError={(e) => e.target.src = "/boiler_3d.png"}
               />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black uppercase tracking-[0.2em] italic text-white flex flex-col items-center">
                <span className="text-primary drop-shadow-[0_0_15px_rgba(255,107,0,0.5)]">DRAFTIN</span>
                <span className="text-[10px] tracking-[0.5em] text-gray-500 not-italic font-light border-t border-white/10 pt-1 mt-1">THERMAL MASTER</span>
              </h1>
            </div>
            <p className="text-[5px] font-black text-primary uppercase tracking-[0.5em] mt-1 opacity-60 italic">Core_Access_v4</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-xl text-center">
              {error}
            </div>
          )}

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[7px] font-black text-gray-500 uppercase tracking-widest ml-1 block opacity-40">User_ID</label>
                <div className="relative group">
                  <Mail size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-black border border-white/5 p-3 pl-10 rounded-xl text-white outline-none focus:border-primary transition-all font-bold text-[12px]"
                    placeholder="email@draftin.local"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[7px] font-black text-gray-500 uppercase tracking-widest block opacity-40">Access_Key</label>
                  <button type="button" onClick={() => setView('reset')} className="text-[7px] text-primary/50 font-black uppercase hover:text-primary transition-colors">¿Olvido?</button>
                </div>
                <div className="relative group">
                  <Key size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full bg-black border border-white/5 p-3 pl-10 rounded-xl text-white outline-none focus:border-primary transition-all font-bold text-[12px]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full py-4 bg-primary text-black font-black rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all text-[9px] tracking-[0.4em] uppercase flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : 'CONECTAR'}
                {!loading && <ArrowRight size={14} />}
              </button>

              <div className="pt-2 text-center">
                <button type="button" onClick={() => setView('signup')} className="text-[7px] font-black text-gray-700 uppercase tracking-widest hover:text-white transition-colors">Crear Nueva Terminal</button>
              </div>
            </form>
          ) : view === 'signup' ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <h3 className="text-white font-black text-center mb-4 uppercase tracking-[0.4em] text-[8px] italic">Nuevo Registro</h3>
              <div className="space-y-3">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-white/5 p-3 rounded-xl text-white outline-none focus:border-primary font-bold text-[12px]" placeholder="EMAIL CORPORATIVO" />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black border border-white/5 p-3 rounded-xl text-white outline-none focus:border-primary font-bold text-[12px]" placeholder="PASSWORD" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-[0.4em] text-[9px] shadow-2xl hover:bg-primary transition-all italic">
                REGISTRAR
              </button>
              <button type="button" onClick={() => setView('login')} className="w-full text-[7px] font-black text-gray-600 uppercase tracking-widest italic hover:text-white transition-colors">← Volver</button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <h3 className="text-white font-black text-center mb-4 uppercase tracking-[0.4em] text-[8px] italic">Recuperar Acceso</h3>
              <p className="text-[8px] text-gray-500 text-center uppercase font-bold px-4 mb-4">Introduce tu email para recibir un enlace de restauración.</p>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-white/5 p-3 rounded-xl text-white outline-none focus:border-primary font-bold text-[12px]" placeholder="EMAIL@DRAFTIN.LOCAL" />
              <button type="submit" disabled={loading} className="w-full bg-primary text-black font-black py-4 rounded-xl uppercase tracking-[0.4em] text-[9px] flex items-center justify-center gap-2">
                 <RefreshCw size={14} /> ENVIAR ENLACE
              </button>
              <button type="button" onClick={() => setView('login')} className="w-full text-[7px] font-black text-gray-600 uppercase tracking-widest italic hover:text-white transition-colors">← Volver</button>
            </form>
          )}
        </div>
        
        <p className="mt-8 text-center text-[5px] font-black text-white/10 uppercase tracking-[1em] italic">
          Draftin_Security_Terminal_v4.2
        </p>
      </div>
    </div>
  );
};

export default Login;
