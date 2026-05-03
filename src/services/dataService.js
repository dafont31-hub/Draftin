import { supabase } from '../supabaseClient';

/**
 * Servicio Centralizado de Datos DRAFTIN
 * Centraliza todas las operaciones de base de datos para evitar repetición de código.
 */

// --- PROCESAMIENTO Y CLASIFICACIÓN ---

export const processChecklistData = async (formData, fecha) => {
  try {
    const { data: mappings, error: mapError } = await supabase.from('clasificacion_datos').select('*');
    if (mapError) throw mapError;
    if (!mappings || mappings.length === 0) return;

    const getValueByPath = (obj, path) => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const operationalData = mappings.map(map => {
      const valor = getValueByPath(formData, map.ruta_json);
      if (valor === undefined || valor === null || valor === '') return null;

      return {
        tipo: map.categoria,
        variable: map.variable_nombre || map.subcategoria,
        valor: parseFloat(valor) || 0,
        fecha: fecha,
        metadata: { pregunta_id: map.pregunta_id, subcategoria: map.subcategoria, ruta_origen: map.ruta_json }
      };
    }).filter(d => d !== null);

    if (operationalData.length > 0) {
      const { error } = await supabase.from('datos_operativos').insert(operationalData);
      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.error('Error en processChecklistData:', err);
    return false;
  }
};

// --- CONSULTAS DE ANALÍTICAS Y TENDENCIAS ---

export const getOperationalTrends = async (categoria, limit = 30) => {
  try {
    const { data, error } = await supabase
      .from('datos_operativos')
      .select('*')
      .eq('tipo', categoria)
      .order('fecha', { ascending: true });

    if (error) throw error;

    // Agrupamos por fecha para que Recharts pueda consumirlo fácilmente
    const groupedByDate = data.reduce((acc, curr) => {
      if (!acc[curr.fecha]) acc[curr.fecha] = { fecha: new Date(curr.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) };
      acc[curr.fecha][curr.variable] = curr.valor;
      return acc;
    }, {});

    return Object.values(groupedByDate);
  } catch (err) {
    console.error('Error en getOperationalTrends:', err);
    return [];
  }
};

// --- GESTIÓN DE ENTIDADES CORE ---

export const fetchCoreData = async () => {
  try {
    const [equipos, ordenes, plan] = await Promise.all([
      supabase.from('equipos').select('*').order('nombre'),
      supabase.from('ordenes_trabajo').select('*').order('created_at', { ascending: false }),
      supabase.from('plan_mantenimiento').select('*, equipos(nombre)')
    ]);

    return {
      equipos: equipos.data || [],
      ordenes: ordenes.data || [],
      planMantenimiento: plan.data || []
    };
  } catch (err) {
    console.error('Error en fetchCoreData:', err);
    return { equipos: [], ordenes: [], planMantenimiento: [] };
  }
};
