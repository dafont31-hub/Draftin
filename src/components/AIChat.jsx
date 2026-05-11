import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import knowledgeBase from '../knowledge_base.json';
import { aiService } from '../services/aiService';

const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy Antigravity, tu Supervisor Virtual. Estoy listo para ayudarte con el mantenimiento de Litera Meat. ¿En qué operación trabajamos hoy? ⚙️' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const [liveContext, setLiveContext] = useState({ ots: [], users: [] });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    fetchLiveContext();
  }, []);

  const fetchLiveContext = async () => {
    const { data: ots } = await supabase
      .from('work_orders')
      .select('id, folio, titulo, estado, tecnico:perfiles!work_orders_tecnico_id_fkey(nombre)')
      .limit(30);
    const { data: users } = await supabase.from('perfiles').select('id, nombre, email');
    setLiveContext({ ots: ots || [], users: users || [] });
  };

  const executeAICommand = async (cmd) => {
    try {
      if (cmd.action === 'ASSIGN_OT') {
        const tech = liveContext.users.find(u => u.nombre.toLowerCase().includes(cmd.technician.toLowerCase()));
        if (tech) {
          await supabase.from('work_orders').update({ tecnico_id: tech.id }).eq('folio', cmd.folio);
          window.dispatchEvent(new CustomEvent('ot_updated'));
        }
      }
      if (cmd.action === 'RESCHEDULE_OT') {
        await supabase.from('work_orders').update({ fecha_apertura: cmd.date }).eq('folio', cmd.folio);
        window.dispatchEvent(new CustomEvent('ot_updated'));
      }
    } catch (e) {
      console.error("Command execution error:", e);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const otContext = liveContext.ots.map(ot => `[OT-${ot.folio}] ${ot.titulo}`).join(', ');
      const userContext = liveContext.users.map(u => u.nombre).join(', ');

      const aiResponseRaw = await aiService.chat([...messages, userMsg], {
        ots: otContext,
        users: userContext
      });

      const jsonMatch = aiResponseRaw.match(/\{"action":.*\}/);
      if (jsonMatch) {
        const cmd = JSON.parse(jsonMatch[0]);
        await executeAICommand(cmd);
      }

      const cleanText = aiResponseRaw.replace(/\{"action":.*\}/, '').trim();
      
      // Efecto de escritura natural
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      let currentText = '';
      const words = cleanText.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        currentText += words[i] + ' ';
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = currentText;
          return updated;
        });
        await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
      fetchLiveContext();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-[#0A0A0A] border border-white/5 rounded-[32px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl relative">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-24 bg-purple-500/10 blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-white/[0.02] backdrop-blur-md flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h3 className="text-[13px] font-black text-white uppercase tracking-widest italic">Antigravity Core</h3>
            <p className="text-[8px] text-purple-400 font-black uppercase tracking-tighter">Supervisor Virtual de Litera Meat</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{ role: 'assistant', content: '¿En qué puedo ayudarte ahora? ⚙️' }])}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black text-gray-500 uppercase transition-all"
        >
          Limpiar
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 no-scrollbar scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[80%] p-6 rounded-[24px] text-[12px] leading-relaxed relative ${
              m.role === 'user' 
                ? 'bg-primary text-black font-bold rounded-tr-none shadow-xl shadow-primary/10' 
                : 'bg-white/[0.03] border border-white/5 text-gray-200 rounded-tl-none backdrop-blur-sm'
            }`}>
              <div className="flex items-center gap-2 mb-3 opacity-40">
                <span className="text-[8px] font-black uppercase tracking-widest">
                  {m.role === 'user' ? 'Técnico / Operador' : 'Antigravity'}
                </span>
              </div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[24px] rounded-tl-none flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest ml-3">Pensando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-6 bg-white/[0.02] border-t border-white/5 backdrop-blur-xl relative z-10">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un comando o duda técnica..."
            className="w-full bg-black/40 border border-white/10 text-white text-[12px] p-5 pr-14 rounded-2xl focus:border-purple-500 outline-none transition-all placeholder:text-gray-700 font-bold"
          />
          <button type="submit" className="absolute right-3 p-3 text-purple-500 hover:scale-110 transition-transform bg-purple-500/10 rounded-xl border border-purple-500/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
