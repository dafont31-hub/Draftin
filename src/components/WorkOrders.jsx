import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import WorkOrderManager from './WorkOrders/WorkOrderManager';
import WorkOrderForm from './WorkOrders/WorkOrderForm';
import WorkOrderDetails from './WorkOrders/WorkOrderDetails';
import GlobalTimeline from './WorkOrders/GlobalTimeline';
import { X, History } from 'lucide-react';

const WorkOrders = ({ t, branding }) => {
  const [view, setView] = useState('dashboard'); // dashboard, new, details, global-timeline
  const [selectedOT, setSelectedOT] = useState(null);
  const [assets, setAssets] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchAssets();
    
    // Escuchar actualizaciones de la IA
    const handleAIUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };

    const handleViewTimeline = () => {
      setView('global-timeline');
    };

    window.addEventListener('ot_updated', handleAIUpdate);
    window.addEventListener('view_timeline', handleViewTimeline);

    return () => {
      window.removeEventListener('ot_updated', handleAIUpdate);
      window.removeEventListener('view_timeline', handleViewTimeline);
    };
  }, []);

  const fetchAssets = async () => {
    const { data } = await supabase.from('assets').select('*').order('nombre');
    if (data && data.length > 0) {
      setAssets(data);
    } else {
      const { data: eq } = await supabase.from('equipos').select('*');
      if (eq) setAssets(eq);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {view === 'dashboard' && (
        <WorkOrderManager 
          key={refreshKey}
          t={t} 
          onNewOT={() => setView('new')}
          onSelectOT={(ot) => {
            setSelectedOT(ot);
            setView('details');
          }}
        />
      )}

      {view === 'global-timeline' && (
        <div className="animate-in slide-in-from-right duration-500 p-4 pb-40">
           <div className="flex items-center justify-between mb-8 pt-4">
              <button 
                onClick={() => setView('dashboard')} 
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-500"
              >
                <X size={20} />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-primary text-[8px] font-black uppercase tracking-[0.4em]">Monitorización</span>
                <h2 className="text-white text-[14px] font-black uppercase tracking-widest italic">Línea de Tiempo Global</h2>
              </div>
              <div className="w-10" />
           </div>
           
           <div className="max-w-xl mx-auto">
              <GlobalTimeline 
                onSelectOT={(ot) => {
                  setSelectedOT(ot);
                  setView('details');
                }}
                onRefresh={() => setRefreshKey(prev => prev + 1)}
              />
           </div>
        </div>
      )}

      {view === 'new' && (
        <WorkOrderForm 
          assets={assets}
          onClose={() => setView('dashboard')}
          onSave={() => setView('dashboard')}
        />
      )}

      {view === 'details' && selectedOT && (
        <WorkOrderDetails 
          ot={selectedOT}
          onClose={() => setView('dashboard')}
          onUpdate={() => setView('dashboard')}
        />
      )}
    </div>
  );
};

export default WorkOrders;
