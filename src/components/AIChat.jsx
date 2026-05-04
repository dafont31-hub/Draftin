import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import knowledgeBase from '../knowledge_base.json';

const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu asistente industrial inteligente. Puedo ayudarte con dudas sobre mantenimiento, normativas de calderas o análisis de datos. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // 1. Obtener la configuración AI de Supabase (la más reciente)
      const { data: aiConfigs, error: configError } = await supabase
        .from('app_config_ai')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(1);

      const aiConfig = aiConfigs?.[0];

      if (configError || !aiConfig?.api_key) {
        throw new Error('Configuración AI no encontrada o API Key ausente. Por favor, configúrala en el panel de CONFIG.');
      }

      // 2. Mapear mensajes al formato Gemini
      const history = newMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      // 3. Preparar el historial completo con instrucciones y conocimiento
      const docsContext = knowledgeBase.map(doc => `DOCUMENTO: ${doc.filename}\nCONTENIDO: ${doc.content}`).join('\n\n');
      
      const systemContext = `Eres el Asistente Técnico experto de DRAFTIN. 
Tus respuestas DEBEN basarse prioritariamente en la siguiente DOCUMENTACIÓN TÉCNICA de la empresa:

${docsContext}

REGLAS DE IDENTIFICACIÓN CRÍTICAS:
- La Caldera 1 (Caldera de vapor nº 1) se identifica por su número de fabricación que termina en 29 (ej: 10529).
- La Caldera 2 (Caldera de vapor nº 2) se identifica por su número de fabricación que termina en 30 (ej: 10530).

INSTRUCCIONES:
1. Responde de forma profesional, concisa y técnica.
2. Si el usuario pregunta algo que está en los documentos, cita el nombre del documento.
3. Si la información no está en los documentos, responde usando tu conocimiento general pero indica que no se ha encontrado en los manuales oficiales.
4. Usa un tono de soporte técnico industrial.`;

      const historyForAPI = [
        { role: 'user', parts: [{ text: `SISTEMA DE CONOCIMIENTO:\n${systemContext}` }] },
        { role: 'model', parts: [{ text: "He cargado la biblioteca técnica de DRAFTIN. Estoy listo para responder consultas basadas en los manuales de calderas, inspecciones y fichas técnicas proporcionadas." }] },
        ...history
      ];

      // 4. Llamada real a la API de Gemini (Usando el nombre exacto de tu lista: gemini-flash-latest)
      const cleanKey = aiConfig.api_key.trim();
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': cleanKey 
        },
        body: JSON.stringify({
          contents: historyForAPI
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Error en la respuesta de la IA');
      }

      const aiText = data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);

    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `⚠️ Error de Conexión: ${err.message}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-[#0A0A0A] border border-[#222] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 border-b border-[#222] bg-[#111] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center border border-purple-500/30">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Asistente Técnico IA</h3>
            <p className="text-[7px] text-[#00FF88] font-bold uppercase animate-pulse">Online • Motor Gemini Pro</p>
          </div>
        </div>
        <button className="text-[8px] font-black text-gray-500 uppercase hover:text-white transition-colors">Limpiar Chat</button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 no-scrollbar"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-[11px] leading-relaxed ${
              m.role === 'user' 
                ? 'bg-primary/10 border border-primary/30 text-white rounded-tr-none' 
                : 'bg-[#111] border border-[#222] text-gray-300 rounded-tl-none'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[7px] font-black uppercase tracking-widest opacity-50">
                  {m.role === 'user' ? 'Operador' : 'Asistente IA'}
                </span>
              </div>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#111] border border-[#222] p-4 rounded-2xl rounded-tl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-[#111] border-t border-[#222]">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta técnica aquí..."
            className="w-full bg-[#0A0A0A] border border-[#222] text-white text-[11px] p-4 pr-12 rounded-xl focus:border-primary outline-none transition-all"
          />
          <button 
            type="submit"
            className="absolute right-2 p-2 text-primary hover:scale-110 transition-transform"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
        <p className="text-[7px] text-gray-600 text-center mt-3 uppercase font-bold tracking-widest">
          SaaS Experimental • Las respuestas de la IA deben ser verificadas por personal cualificado.
        </p>
      </form>
    </div>
  );
};

export default AIChat;
