import { supabase } from '../supabaseClient';

export const aiService = {
  async _getAPIConfig() {
    try {
      const { data: configs, error } = await supabase.from('app_config_ai').select('*').eq('activo', true);
      
      if (error) {
        console.error("AI Config DB Error:", error);
        return null;
      }

      if (!configs || configs.length === 0) {
        console.warn("No active AI configuration found in 'app_config_ai' table.");
        return null;
      }

      // Tomar la configuración más reciente
      const config = configs[configs.length - 1];
      
      if (!config.api_key) {
        console.warn("AI configuration found but API Key is missing.");
        return null;
      }

      const cleanKey = config.api_key.trim();
      return {
        key: cleanKey,
        url: `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-flash-latest'}:generateContent?key=${cleanKey}`
      };
    } catch (err) {
      console.error("Unexpected error in _getAPIConfig:", err);
      return null;
    }
  },

  async generateLOTOProtocol(assetName, assetSystem, workTitle) {
    const config = await this._getAPIConfig();
    if (!config) return null;

    const prompt = `Actúa como un experto en seguridad industrial LOTO (Lockout/Tagout). 
    Genera un checklist de seguridad técnico para intervenir el siguiente equipo:
    - Equipo: ${assetName}
    - Sistema: ${assetSystem}
    - Tarea a realizar: ${workTitle}
    
    Responde ÚNICAMENTE con un array JSON con este formato:
    [{"id": "ai_1", "label": "Título del paso", "reason": "Por qué es necesario"}]
    Incluye entre 2 y 4 pasos específicos y críticos.`;

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return null;

      // Limpiar markdown si existe
      const jsonString = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("AI LOTO Error:", error);
      return null;
    }
  },

  async analyzeRepairHistory(assetId) {
    // Para la "Memoria" de la IA
    const { data: history } = await supabase
      .from('work_orders')
      .select('titulo, descripcion, solucion_tecnica, fecha_cierre')
      .eq('asset_id', assetId)
      .eq('estado', 'Cerrada')
      .order('fecha_cierre', { ascending: false })
      .limit(5);

    if (!history || history.length === 0) return "Sin historial previo.";

    return history.map(h => `- ${new Date(h.fecha_cierre).toLocaleDateString()}: ${h.titulo}. SOLUCIÓN: ${h.solucion_tecnica}`).join('\n');
  },

  async chat(messages, context = {}) {
    const config = await this._getAPIConfig();
    if (!config) return "Lo siento, la IA no está configurada correctamente.";

    const systemPrompt = `Eres Antigravity, el Supervisor Virtual de Litera Meat.
    PERSONALIDAD: Técnico de campo, senior, práctico y directo. Hablas como alguien que está en la planta con las botas puestas.
    REGLAS: Tus consejos deben ser accionables y realistas. Evita consejos de laboratorio o teóricos. Céntrate en lo que un mecánico o electricista haría hoy.
    
    CONTEXTO:
    - OTs Activas: ${context.ots || 'Cargando...'}
    - Equipos: ${context.equipos || 'Cargando...'}`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: "Entendido. Soy Antigravity. Analizando el estado técnico de Litera Meat... ⚙️" }] },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    ];

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, he tenido un problema al procesar tu solicitud.";
    } catch (error) {
      console.error("AI Chat Error:", error);
      return "Error de conexión con el núcleo neuronal.";
    }
  }
};
