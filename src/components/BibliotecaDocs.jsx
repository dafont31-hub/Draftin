import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const BibliotecaDocs = () => {
  // Versión 2.1 - Bypass de caché forzado
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const DOCUMENTOS_RESPALDO = [
    { id: 1, titulo: 'Manual de Uso Caldera 2671', filename: '2671_Manuale d\'uso.pdf', categoria: 'Manual Técnico' },
    { id: 2, titulo: 'Manual General Generador Cap A (ESP)', filename: 'CAP A - rev_2.0 p - GENERALE (SPA).pdf', categoria: 'Manual Técnico' },
    { id: 3, titulo: 'Registro Inspección Caldera G1', filename: 'INSPECCION C G1.pdf', categoria: 'Inspección' },
    { id: 4, titulo: 'Registro Inspección Caldera G2', filename: 'INSPECCION C G2.pdf', categoria: 'Inspección' },
    { id: 5, titulo: 'Fichas Técnicas Recambios Intercambiadores', filename: 'INTERCAMBIADORES PIEZAS DE RECAMBIOS FICHAS TECNICAS.pdf', categoria: 'Ficha Técnica' },
    { id: 6, titulo: 'Manual Satélites Limpieza AC 35-B-S', filename: 'Manual AC 35-B-S (18706735-83801030) SATELITES DE LIMPIZA.pdf', categoria: 'Manual Técnico' },
    { id: 7, titulo: 'Guía Rápida Grupo Presión ZPR45', filename: 'Manual Guia Rpida ZPR45 GRUPO PRESION SATELITES DE LIMPIEZA.pdf', categoria: 'Manual Técnico' },
    { id: 8, titulo: 'Manual Satélites Lavadero Camiones SU 0127', filename: 'SU 0127 Ultra Next Baseline SATELITES LAVADERO DE CAMIONES.pdf', categoria: 'Manual Técnico' },
    { id: 9, titulo: 'Inspección B - Generador de Vapor 1', filename: 'generador de vapor 1 inspeccion B.pdf', categoria: 'Inspección' },
    { id: 10, titulo: 'Inspección B - Generador de Vapor 2', filename: 'generador de vapor 2 inspeccion B.pdf', categoria: 'Inspección' }
  ];

  async function fetchDocumentos() {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const { data, error } = await supabase.from('manuales').select('*').order('created_at', { ascending: false });
      
      if (!error && data) {
        setDocumentos(data.length > 0 ? data : DOCUMENTOS_RESPALDO);
      } else {
        setDocumentos(DOCUMENTOS_RESPALDO);
      }
    } catch (err) {
      setDocumentos(DOCUMENTOS_RESPALDO);
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      // 1. Subir a Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('manuales')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Insertar en Tabla
      const { error: insertError } = await supabase
        .from('manuales')
        .insert([{
          titulo: file.name.replace(`.${fileExt}`, ''),
          filename: file.name,
          categoria: 'Manual Técnico',
          url: filePath
        }]);

      if (insertError) throw insertError;

      alert('Documento subido con éxito');
      fetchDocumentos();
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Error al subir el archivo. Asegúrate de que el bucket "manuales" existe en Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const categorias = ['Todos', ...new Set(documentos.map(doc => doc.categoria))];

  const docsFiltrados = filtro === 'Todos' 
    ? documentos 
    : documentos.filter(doc => doc.categoria === filtro);

  const getIcon = (categoria) => {
    switch (categoria) {
      case 'Manual Técnico':
        return (
          <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'Inspección':
        return (
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Ficha Técnica':
        return (
          <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest mt-4 text-gray-500">Cargando Biblioteca...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header Sección */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-[#222] pb-8">
        <div>
          <h2 className="text-[24px] font-black text-white uppercase tracking-tighter leading-none mb-2">Biblioteca Técnica</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Manuales de uso, certificados de inspección y fichas de recambios</p>
        </div>

        {/* Filtros y Sincronización */}
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="file" 
            id="doc-upload" 
            className="hidden" 
            onChange={handleUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
          />
          <label 
            htmlFor="doc-upload"
            className="px-5 py-3 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--primary-color-rgb),0.3)] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            Subir Documento
          </label>

          <div className="flex bg-[#111] p-1 rounded-xl border border-[#222]">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltro(cat)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filtro === cat ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:text-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDocumentos}
            className="p-3 bg-[#111] border border-[#222] text-primary rounded-xl hover:bg-primary/10 transition-all group"
            title="Sincronizar con Base de Datos"
          >
            <svg className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mensaje de Error si existe */}
      {errorMsg && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[10px] font-black text-red-200 uppercase tracking-widest">{errorMsg}</p>
        </div>
      )}

      {/* Grid de Documentos */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-6 text-primary animate-pulse">Sincronizando Archivos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docsFiltrados.map(doc => (
            <div key={doc.id} className="industrial-card group bg-[#0A0A0A] border-[#222] hover:border-primary/50 transition-all p-0 overflow-hidden flex flex-col relative">
              <div className="p-6 flex items-start gap-5">
                <div className="p-3 bg-[#111] rounded-2xl border border-[#222] group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                  {getIcon(doc.categoria)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] font-black text-primary uppercase tracking-widest block mb-1">{doc.categoria}</span>
                  <h3 className="text-[13px] font-bold text-white uppercase tracking-tight leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {doc.titulo}
                  </h3>
                </div>
              </div>

              <div className="mt-auto border-t border-[#222] bg-[#111]/50 p-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[7px] text-gray-600 uppercase font-bold tracking-widest">Archivo</span>
                  <span className="text-[9px] text-gray-400 font-mono truncate max-w-[150px]">{doc.filename}</span>
                </div>
                
                <button 
                  onClick={() => {
                    const encodedFilename = encodeURI(doc.filename);
                    const url = `${window.location.origin}/documentos/${encodedFilename}`;
                    window.open(url, '_blank');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-[#333] text-white text-[9px] font-black uppercase rounded-lg hover:bg-primary hover:text-black transition-all"
                >
                  Ver Doc
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {docsFiltrados.length === 0 && (
        <div className="text-center py-20 bg-[#0A0A0A] border border-dashed border-[#333] rounded-3xl">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">No se han encontrado documentos en esta categoría</p>
        </div>
      )}
    </div>
  );
};

export default BibliotecaDocs;
