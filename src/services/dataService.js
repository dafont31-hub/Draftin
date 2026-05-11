import { supabase } from '../supabaseClient';

/**
 * Servicio Centralizado de Datos DRAFTIN
 * Centraliza todas las operaciones de base de datos para evitar repetición de código.
 */

// --- PROCESAMIENTO Y CLASIFICACIÓN ---

const FALLBACK_MAPPINGS = [
  // OPERACIÓN
  { categoria: 'operacion', variable_nombre: 'C1 Presión (bar)', ruta_json: 'calderas.c1.pt' },
  { categoria: 'operacion', variable_nombre: 'C2 Presión (bar)', ruta_json: 'calderas.c2.pt' },
  { categoria: 'operacion', variable_nombre: 'C1 Temp Vapor (°C)', ruta_json: 'calderas.c1.tv' },
  { categoria: 'operacion', variable_nombre: 'C2 Temp Vapor (°C)', ruta_json: 'calderas.c2.tv' },
  
  // ANALÍTICA (QUÍMICA) - CALDERAS
  { categoria: 'analitica', variable_nombre: 'C1 PH', ruta_json: 'quimica.c1.ph' },
  { categoria: 'analitica', variable_nombre: 'C1 Dureza', ruta_json: 'quimica.c1.d' },
  { categoria: 'analitica', variable_nombre: 'C1 Conductividad', ruta_json: 'quimica.c1.c' },
  { categoria: 'analitica', variable_nombre: 'C2 PH', ruta_json: 'quimica.c2.ph' },
  { categoria: 'analitica', variable_nombre: 'C2 Dureza', ruta_json: 'quimica.c2.d' },
  { categoria: 'analitica', variable_nombre: 'C2 Conductividad', ruta_json: 'quimica.c2.c' },
  
  // ANALÍTICA (QUÍMICA) - DESGASIFICADOR Y CONDENSADOS
  { categoria: 'analitica', variable_nombre: 'Desg. PH', ruta_json: 'quimica.desg.ph' },
  { categoria: 'analitica', variable_nombre: 'Desg. Dureza', ruta_json: 'quimica.desg.d' },
  { categoria: 'analitica', variable_nombre: 'Desg. Conductividad', ruta_json: 'quimica.desg.c' },
  { categoria: 'analitica', variable_nombre: 'Condens. PH', ruta_json: 'quimica.cond.ph' },
  { categoria: 'analitica', variable_nombre: 'Condens. Dureza', ruta_json: 'quimica.cond.d' },
  { categoria: 'analitica', variable_nombre: 'Condens. Conductividad', ruta_json: 'quimica.cond.c' },
  
  // ANALÍTICA (QUÍMICA) - DUPLEX
  { categoria: 'analitica', variable_nombre: 'Dup1 PH', ruta_json: 'quimica.dup1.ph' },
  { categoria: 'analitica', variable_nombre: 'Dup1 Dureza', ruta_json: 'quimica.dup1.d' },
  { categoria: 'analitica', variable_nombre: 'Dup1 Conductividad', ruta_json: 'quimica.dup1.c' },
  { categoria: 'analitica', variable_nombre: 'Dup2 PH', ruta_json: 'quimica.dup2.ph' },
  { categoria: 'analitica', variable_nombre: 'Dup2 Dureza', ruta_json: 'quimica.dup2.d' },
  { categoria: 'analitica', variable_nombre: 'Dup2 Conductividad', ruta_json: 'quimica.dup2.c' },
  
  // ANALÍTICA (QUÍMICA) - TRIPLEX
  { categoria: 'analitica', variable_nombre: 'Tri1 PH', ruta_json: 'quimica.tri1.ph' },
  { categoria: 'analitica', variable_nombre: 'Tri1 Dureza', ruta_json: 'quimica.tri1.d' },
  { categoria: 'analitica', variable_nombre: 'Tri1 Conductividad', ruta_json: 'quimica.tri1.c' },
  { categoria: 'analitica', variable_nombre: 'Tri2 PH', ruta_json: 'quimica.tri2.ph' },
  { categoria: 'analitica', variable_nombre: 'Tri2 Dureza', ruta_json: 'quimica.tri2.d' },
  { categoria: 'analitica', variable_nombre: 'Tri2 Conductividad', ruta_json: 'quimica.tri2.c' },
  { categoria: 'analitica', variable_nombre: 'Tri3 PH', ruta_json: 'quimica.tri3.ph' },
  { categoria: 'analitica', variable_nombre: 'Tri3 Dureza', ruta_json: 'quimica.tri3.d' },
  { categoria: 'analitica', variable_nombre: 'Tri3 Conductividad', ruta_json: 'quimica.tri3.c' },
  { categoria: 'analitica', variable_nombre: 'Tri4 PH', ruta_json: 'quimica.tri4.ph' },
  { categoria: 'analitica', variable_nombre: 'Tri4 Dureza', ruta_json: 'quimica.tri4.d' },
  { categoria: 'analitica', variable_nombre: 'Tri4 Conductividad', ruta_json: 'quimica.tri4.c' },
  { categoria: 'analitica', variable_nombre: 'Tri5 PH', ruta_json: 'quimica.tri5.ph' },
  { categoria: 'analitica', variable_nombre: 'Tri5 Dureza', ruta_json: 'quimica.tri5.d' },
  { categoria: 'analitica', variable_nombre: 'Tri5 Conductividad', ruta_json: 'quimica.tri5.c' },
  { categoria: 'analitica', variable_nombre: 'Tri6 PH', ruta_json: 'quimica.tri6.ph' },
  { categoria: 'analitica', variable_nombre: 'Tri6 Dureza', ruta_json: 'quimica.tri6.d' },
  { categoria: 'analitica', variable_nombre: 'Tri6 Conductividad', ruta_json: 'quimica.tri6.c' },
  
  // CONSUMOS
  { categoria: 'consumo', variable_nombre: 'C1 Gas', ruta_json: 'calderas.c1.gd' },
  { categoria: 'consumo', variable_nombre: 'C2 Gas', ruta_json: 'calderas.c2.gd' },
  { categoria: 'consumo', variable_nombre: 'Nodriza %', ruta_json: 'salmuera.nodriza' },
  { categoria: 'consumo', variable_nombre: 'Bote %', ruta_json: 'bote.nivel' }
];

export const processChecklistData = async (formData, fecha) => {
  try {
    const { data: dbMappings, error: mapError } = await supabase.from('clasificacion_datos').select('*');
    
    if (mapError) {
      console.error('CRITICAL: Error fetching mappings from DB:', mapError.message);
    }
    
    const mappings = (!dbMappings || dbMappings.length === 0) ? FALLBACK_MAPPINGS : dbMappings;
    console.log(`Processing with ${mappings.length} mappings (${dbMappings?.length > 0 ? 'DB' : 'Fallback'})`);

    const getValueByPath = (obj, path) => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const operationalData = mappings.map(map => {
      const valor = getValueByPath(formData, map.ruta_json);
      if (valor === undefined || valor === null || valor === '') return null;

      return {
        tipo: map.categoria,
        variable: map.variable_nombre,
        valor: parseFloat(valor) || 0,
        fecha: fecha,
        metadata: { original_path: map.ruta_json }
      };
    }).filter(d => d !== null);

    if (operationalData.length > 0) {
      // Borrar registros existentes para esta fecha y tipo para evitar duplicados sin depender de restricciones
      const variablesToUpdate = operationalData.map(d => d.variable);
      await supabase
        .from('datos_operativos')
        .delete()
        .eq('fecha', fecha)
        .in('variable', variablesToUpdate);

      const { error: insertError } = await supabase.from('datos_operativos').insert(operationalData);
      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (err) {
    console.error('Error procesando datos operativos:', err);
    return { success: false, error: err };
  }
};

export const getOperationalTrends = async (categoria, limit = 60) => {
  try {
    const { data, error } = await supabase
      .from('datos_operativos')
      .select('*')
      .eq('tipo', categoria)
      .order('fecha', { ascending: true });

    if (error) throw error;

    // Agrupar por fecha
    const grouped = data.reduce((acc, curr) => {
      if (!acc[curr.fecha]) acc[curr.fecha] = { fecha: curr.fecha };
      acc[curr.fecha][curr.variable] = curr.valor;
      return acc;
    }, {});

    return Object.values(grouped);
  } catch (err) {
    console.error('Error obteniendo tendencias:', err);
    return [];
  }
};

export const fetchCoreData = async () => {
  try {
    const [equiposRes, ordenesRes, planRes] = await Promise.all([
      supabase.from('equipos').select('*').order('nombre'),
      supabase.from('ordenes_trabajo').select('*').order('fecha_programada', { ascending: false }),
      supabase.from('plan_mantenimiento').select('*')
    ]);

    return {
      equipos: equiposRes.data || [],
      ordenes: ordenesRes.data || [],
      planMantenimiento: planRes.data || []
    };
  } catch (err) {
    console.error('Error fetching core data:', err);
    return { equipos: [], ordenes: [], planMantenimiento: [] };
  }
};
