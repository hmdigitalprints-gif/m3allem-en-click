import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Settings, 
  Trash2 
} from 'lucide-react';

interface ServicesTabProps {
  artisanServices: any[];
  servicesLoading: boolean;
  setShowAddService: (show: boolean) => void;
  onAction: (msg: string) => void;
  handleDeleteService: (id: string) => Promise<void>;
}

export function ServicesTab({
  artisanServices,
  servicesLoading,
  setShowAddService,
  onAction,
  handleDeleteService
}: ServicesTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-10 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left">
          <h3 className="text-3xl font-black text-[var(--text)] italic uppercase tracking-tight">{t('service_catalog', 'Service Catalog')}</h3>
          <p className="text-[var(--text-muted)] mt-1 font-medium">{t('service_catalog_desc', 'Manage the services you offer to clients.')}</p>
        </div>
        <button 
          onClick={() => setShowAddService(true)}
          className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/30"
        >
          <Plus size={20} /> {t('add_new_service', 'Add New Service')}
        </button>
      </div>
      
      {servicesLoading ? (
        <div className="flex justify-center py-24">
          <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {artisanServices.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] glass">
              <div className="w-64 h-64 mb-8 relative mx-auto">
                <img src="/input_file_3.png" alt={t('no_services')} className="w-full h-full object-contain opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent" />
              </div>
              <h4 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight mb-4">{t('catalog_empty', 'Your Catalog is Empty')}</h4>
              <p className="text-[var(--text-muted)] font-medium mb-10 max-w-md mx-auto text-center">{t('catalog_empty_desc', 'Add your first service to start receiving requests from clients in your area.')}</p>
              <button 
                onClick={() => setShowAddService(true)}
                className="mx-auto px-10 py-5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/30 flex items-center gap-3"
              >
                <Plus size={20} />
                {t('create_first_service', 'Create First Service')}
              </button>
            </div>
          ) : (
            artisanServices.map(service => (
              <motion.div 
                key={service.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] overflow-hidden glass group hover:shadow-2xl transition-all"
              >
                <div className="h-48 relative overflow-hidden">
                  <img src={service.image_url} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-[10px] font-black text-white uppercase tracking-widest">
                    {service.category_name}
                  </div>
                </div>
                <div className="p-8 text-left">
                  <h4 className="text-xl font-black text-[var(--text)] mb-2 tracking-tight group-hover:text-[var(--accent)] transition-colors">{service.title}</h4>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-6 font-medium leading-relaxed">{service.description}</p>
                  <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">{t('starting_price', 'Starting Price')}</span>
                      <span className="text-2xl font-black text-[var(--accent)] tracking-tighter">{(Number(service.price) || 0).toFixed(2)} <span className="text-xs font-bold">MAD</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onAction?.(`Editing service ${service.title}...`)}
                        className="w-10 h-10 flex items-center justify-center bg-[var(--text)]/5 hover:bg-[var(--accent)] hover:text-white rounded-xl transition-all active:scale-90"
                      >
                        <Settings size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteService(service.id)}
                        className="w-10 h-10 flex items-center justify-center bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl transition-all text-red-500 active:scale-90"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
