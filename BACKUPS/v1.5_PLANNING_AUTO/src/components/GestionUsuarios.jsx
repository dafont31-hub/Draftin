import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const GestionUsuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States para edición
  const [editingId, setEditingId] = useState(null);
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');

  // States para nuevo usuario
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', nombre: '', rol: 'operario' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('email', { ascending: true });
    
    if (error) setError(error.message);
    else setUsers(data);
    setLoading(false);
  };

  const updateProfile = async (id, updates) => {
    const { error } = await supabase
      .from('perfiles')
      .update(updates)
      .eq('id', id);
    
    if (error) setError(error.message);
    else {
      setMessage('USUARIO ACTUALIZADO CORRECTAMENTE');
      setEditingId(null);
      fetchUsers();
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const deleteUser = async (id, email) => {
    if (!window.confirm(`¿ESTÁS SEGURO DE ELIMINAR A ${email}? ESTA ACCIÓN NO SE PUEDE DESHACER.`)) return;
    
    // Eliminamos de la tabla perfiles (la de auth requiere panel de control o edge function)
    const { error } = await supabase
      .from('perfiles')
      .delete()
      .eq('id', id);
    
    if (error) setError(error.message);
    else {
      setMessage('USUARIO ELIMINADO DE LA LISTA DE GESTIÓN');
      fetchUsers();
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { data, error: authError } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
    });

    if (authError) {
      setError(authError.message);
    } else {
      const { error: profileError } = await supabase
        .from('perfiles')
        .update({ nombre: newUser.nombre, rol: newUser.rol })
        .eq('id', data.user.id);

      if (profileError) setError(profileError.message);
      else {
        setMessage('USUARIO CREADO Y PERFIL CONFIGURADO');
        setShowAdd(false);
        setNewUser({ email: '', password: '', nombre: '', rol: 'operario' });
        fetchUsers();
      }
    }
    setLoading(false);
  };

  const resetUserPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else {
        setMessage(`ENLACE DE RECUPERACIÓN ENVIADO A: ${email}`);
        setTimeout(() => setMessage(null), 3000);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.nombre?.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.rol === 'admin').length,
    ops: users.filter(u => u.rol === 'operario').length
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-32">
      {/* HEADER Y ESTADISTICAS */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between lg:items-end">
        <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Control de Personal</h2>
            <div className="flex gap-4 mt-2">
                <div className="bg-[#111] px-4 py-2 rounded-xl border border-[#222]">
                    <p className="text-[7px] text-gray-500 font-bold tracking-widest uppercase">Total Personal</p>
                    <p className="text-xl font-black text-white leading-none">{stats.total}</p>
                </div>
                <div className="bg-[#111] px-4 py-2 rounded-xl border border-[#222]">
                    <p className="text-[7px] text-[#FF6B00] font-bold tracking-widest uppercase">Admins</p>
                    <p className="text-xl font-black text-[#FF6B00] leading-none">{stats.admins}</p>
                </div>
                <div className="bg-[#111] px-4 py-2 rounded-xl border border-[#222]">
                    <p className="text-[7px] text-gray-400 font-bold tracking-widest uppercase">Operarios</p>
                    <p className="text-xl font-black text-gray-400 leading-none">{stats.ops}</p>
                </div>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
                <input 
                    type="text"
                    placeholder="BUSCAR POR NOMBRE O EMAIL..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#111] border border-[#222] px-5 py-3 rounded-xl text-[10px] text-white outline-none focus:border-[#FF6B00] w-full sm:w-64 uppercase font-bold tracking-widest italic"
                />
                <svg className="absolute right-4 top-3.5 w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <button 
                onClick={() => setShowAdd(!showAdd)}
                className="px-6 py-3 bg-[#FF6B00] text-black font-black text-[10px] rounded-xl uppercase tracking-widest shadow-[0_10px_30px_rgba(255,107,0,0.2)] hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
                {showAdd ? 'CANCELAR' : 'AÑADIR PERSONAL'}
            </button>
        </div>
      </div>

      {/* FORMULARIO NUEVO USUARIO */}
      {showAdd && (
        <div className="bg-[#0A0A0A] border-2 border-[#FF6B00]/30 p-8 rounded-[2rem] shadow-2xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <h3 className="text-white font-black uppercase text-xs tracking-widest mb-6 italic flex items-center gap-2">
                <span className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse"></span>
                Alta de Nuevo Acceso
            </h3>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">Nombre Real</label>
                    <input 
                        required value={newUser.nombre} onChange={e => setNewUser({...newUser, nombre: e.target.value})}
                        className="w-full bg-[#111] border border-[#222] p-4 rounded-xl text-white outline-none focus:border-[#FF6B00] text-xs uppercase italic"
                        placeholder="NOMBRE COMPLETO"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">Email Corporativo</label>
                    <input 
                        type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                        className="w-full bg-[#111] border border-[#222] p-4 rounded-xl text-white outline-none focus:border-[#FF6B00] text-xs"
                        placeholder="EMAIL@CALDERAS.ES"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">Password Inicial</label>
                    <input 
                        type="password" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                        className="w-full bg-[#111] border border-[#222] p-4 rounded-xl text-white outline-none focus:border-[#FF6B00] text-xs"
                        placeholder="••••••••"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">Rol en Planta</label>
                    <select 
                        value={newUser.rol} onChange={e => setNewUser({...newUser, rol: e.target.value})}
                        className="w-full bg-[#111] border border-[#222] p-4 rounded-xl text-white outline-none focus:border-[#FF6B00] text-xs uppercase"
                    >
                        <option value="operario">Operario de Planta</option>
                        <option value="admin">Administrador Maestro</option>
                    </select>
                </div>
                <div className="md:col-span-2 pt-4">
                    <button type="submit" disabled={loading} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-[0.3em] text-[10px] hover:bg-[#FF6B00] transition-colors shadow-xl italic">
                        {loading ? 'CREANDO CREDENCIALES...' : 'GENERAR ACCESO INDUSTRIAL'}
                    </button>
                </div>
            </form>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-600/10 border-l-4 border-red-600 text-red-500 text-[10px] font-black uppercase tracking-widest rounded shadow-lg italic">
          {error}
        </div>
      )}

      {message && (
        <div className="p-4 bg-green-600/10 border-l-4 border-[#00FF88] text-[#00FF88] text-[10px] font-black uppercase tracking-widest rounded shadow-lg italic">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading && !users.length ? (
          <div className="p-12 text-center text-gray-600 animate-pulse uppercase font-black text-xs tracking-widest border border-[#222] rounded-3xl">Estableciendo conexión con la base de datos...</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-[#0D0D0D] border border-[#1A1A1A] p-6 rounded-3xl flex flex-col gap-6 hover:border-[#333] transition-all group relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-black rounded-2xl border border-[#222] flex items-center justify-center shadow-inner relative group-hover:border-[#FF6B00]/30 transition-colors">
                     <svg className="w-8 h-8 text-gray-700 group-hover:text-[#FF6B00] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                     </svg>
                  </div>
                  <div className="flex-1">
                    {editingId === user.id ? (
                        <div className="flex flex-col gap-2 max-w-xs animate-in zoom-in-95 duration-200">
                            <input 
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="bg-black border border-[#FF6B00] text-white text-sm font-black px-4 py-2 rounded-xl outline-none uppercase italic"
                                placeholder="NOMBRE"
                                autoFocus
                            />
                            <input 
                                value={tempEmail}
                                onChange={(e) => setTempEmail(e.target.value)}
                                className="bg-black border border-[#FF6B00] text-gray-400 text-[10px] font-black px-4 py-2 rounded-xl outline-none"
                                placeholder="EMAIL"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => updateProfile(user.id, { nombre: tempName, email: tempEmail })} className="flex-1 py-2.5 bg-[#FF6B00] text-black text-[10px] font-black rounded-xl uppercase">Guardar</button>
                                <button onClick={() => setEditingId(null)} className="flex-1 py-2.5 bg-[#222] text-white text-[10px] font-black rounded-xl uppercase">Cancelar</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">{user.nombre || 'N/A'}</h3>
                                <button onClick={() => { setEditingId(user.id); setTempName(user.nombre || ''); setTempEmail(user.email || ''); }} className="text-gray-700 hover:text-[#FF6B00] transition-colors p-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.email}</p>
                        </div>
                    )}
                    <span className={`inline-block mt-3 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] ${user.rol === 'admin' ? 'bg-[#FF6B00] text-black shadow-[0_0_15px_rgba(255,107,0,0.4)]' : 'bg-[#1A1A1A] text-gray-500 border border-[#222]'}`}>
                      {user.rol === 'admin' ? 'MAESTRO ADMIN' : 'OPERARIO PLANTA'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                   <div className="flex bg-black rounded-xl p-1.5 border border-[#222] shadow-inner">
                      <button 
                        onClick={() => updateProfile(user.id, { rol: 'operario' })}
                        className={`px-5 py-2.5 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all ${user.rol === 'operario' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-gray-700 hover:text-white'}`}
                      >
                        Operario
                      </button>
                      <button 
                        onClick={() => updateProfile(user.id, { rol: 'admin' })}
                        className={`px-5 py-2.5 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all ${user.rol === 'admin' ? 'bg-[#FF6B00] text-black shadow-lg' : 'text-gray-700 hover:text-white'}`}
                      >
                        Admin
                      </button>
                   </div>

                   <div className="flex items-center gap-2">
                        <button 
                            onClick={() => resetUserPassword(user.email)}
                            title="Resetear Password"
                            className="w-10 h-10 bg-[#111] hover:bg-[#222] text-gray-600 hover:text-[#00FF88] rounded-xl flex items-center justify-center transition-all border border-[#222] hover:border-[#00FF88]/30"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                        </button>
                        <button 
                            onClick={() => deleteUser(user.id, user.email)}
                            title="Eliminar Usuario"
                            className="w-10 h-10 bg-[#111] hover:bg-red-600/10 text-gray-700 hover:text-red-500 rounded-xl flex items-center justify-center transition-all border border-[#222] hover:border-red-600/30"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="p-20 text-center bg-[#111] rounded-[3rem] border border-[#222] border-dashed">
            <svg className="w-16 h-16 text-gray-800 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No se han encontrado usuarios con ese criterio</p>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;
