import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Hammer, 
  Wrench, 
  Car, 
  Monitor, 
  Code, 
  Palette, 
  TrendingUp, 
  GraduationCap, 
  Heart, 
  Briefcase, 
  Truck, 
  Home, 
  Calendar, 
  Camera, 
  Sparkles, 
  Dog, 
  Scissors, 
  DollarSign, 
  Scale, 
  BookOpen,
  Search,
  ArrowRight,
  ShieldCheck,
  X,
  ChevronDown,
  Globe,
  MapPin,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PublicLayout from '../components/layout/PublicLayout';
import { SymmetricalIcon } from '../components/common/SymmetricalIcon';
import { CATEGORIES_DATA, CategoryData } from '../data/categoriesData';

const IconComponent = ({ name, size = 24, className = "" }: { name: string, size?: number, className?: string }) => {
  switch (name) {
    case 'Hammer': return <Hammer size={size} className={className} />;
    case 'Wrench': return <Wrench size={size} className={className} />;
    case 'Car': return <Car size={size} className={className} />;
    case 'Monitor': return <Monitor size={size} className={className} />;
    case 'Code': return <Code size={size} className={className} />;
    case 'Palette': return <Palette size={size} className={className} />;
    case 'TrendingUp': return <TrendingUp size={size} className={className} />;
    case 'GraduationCap': return <GraduationCap size={size} className={className} />;
    case 'Heart': return <Heart size={size} className={className} />;
    case 'Briefcase': return <Briefcase size={size} className={className} />;
    case 'Truck': return <Truck size={size} className={className} />;
    case 'Home': return <Home size={size} className={className} />;
    case 'Calendar': return <Calendar size={size} className={className} />;
    case 'Camera': return <Camera size={size} className={className} />;
    case 'Sparkles': return <Sparkles size={size} className={className} />;
    case 'Dog': return <Dog size={size} className={className} />;
    case 'Scissors': return <Scissors size={size} className={className} />;
    case 'DollarSign': return <DollarSign size={size} className={className} />;
    case 'Scale': return <Scale size={size} className={className} />;
    case 'BookOpen': return <BookOpen size={size} className={className} />;
    default: return <Sparkles size={size} className={className} />;
  }
};

export default function Services() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'local' | 'digital'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [subQuery, setSubQuery] = useState('');

  const handleSelectCategory = (cat: CategoryData | null) => {
    setSelectedCategory(cat);
    setSubQuery('');
  };

  const filteredSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    if (!subQuery.trim()) return selectedCategory.subcategories;
    const query = subQuery.toLowerCase();
    return selectedCategory.subcategories.filter(sub => 
      sub.name.toLowerCase().includes(query) || 
      sub.description.toLowerCase().includes(query) ||
      sub.popularServices.some(s => s.toLowerCase().includes(query))
    );
  }, [selectedCategory, subQuery]);

  // Filter Categories
  const filteredCategories = useMemo(() => {
    return CATEGORIES_DATA.filter(cat => {
      // Filter by type
      if (activeFilter === 'local' && cat.isDigital) return false;
      if (activeFilter === 'digital' && !cat.isDigital) return false;
      
      // Filter by search query (checks category name, description, and subcategories)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesCategory = 
          cat.frenchName.toLowerCase().includes(query) || 
          cat.description.toLowerCase().includes(query);
        
        const matchesSubcategory = cat.subcategories.some(sub => 
          sub.name.toLowerCase().includes(query) || 
          sub.description.toLowerCase().includes(query) ||
          sub.popularServices.some(s => s.toLowerCase().includes(query))
        );
        
        return matchesCategory || matchesSubcategory;
      }
      
      return true;
    });
  }, [searchQuery, activeFilter]);

  const handleQuickSearch = (serviceName: string) => {
    setSelectedCategory(null);
    navigate(`/find-pro?search=${encodeURIComponent(serviceName)}`);
  };

  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header Banner */}
          <div className="mb-16 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-full text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-8"
            >
              <ShieldCheck size={14} />
              Prestations vérifiées & artisans certifiés
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter mb-8 text-[var(--text)] uppercase"
            >
              Annuaire des <span className="text-[var(--accent)]">Services</span>
            </motion.h1>
            
            <p className="text-xl text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed mb-12">
              Explorez nos 20 catégories métiers couvrant l'artisanat local et les services digitaux. Trouvez instantanément le professionnel certifié dont vous avez besoin.
            </p>

            {/* Interactive Search & Mode Filters */}
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="relative">
                <Search className="absolute start-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50" size={24} />
                <input 
                  type="text" 
                  placeholder="Rechercher un métier, un service (ex: plombier, logo, vtc)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--card-bg)]/80 border border-[var(--border)] rounded-[40px] py-6 ps-16 pe-8 text-xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all shadow-md placeholder-[var(--text-muted)]/60"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute end-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full text-[var(--text-muted)]"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Segmented filtering controls */}
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-6 py-3 rounded-full font-bold text-sm transition-all border ${activeFilter === 'all' ? 'bg-[var(--text)] text-[var(--bg)] border-transparent' : 'bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text)]/20'}`}
                >
                  Tous les domaines ({CATEGORIES_DATA.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('local')}
                  className={`px-6 py-3 rounded-full font-bold text-sm transition-all border flex items-center gap-2 ${activeFilter === 'local' ? 'bg-[var(--text)] text-[var(--bg)] border-transparent' : 'bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text)]/20'}`}
                >
                  <MapPin size={16} /> Physiques & Locaux
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('digital')}
                  className={`px-6 py-3 rounded-full font-bold text-sm transition-all border flex items-center gap-2 ${activeFilter === 'digital' ? 'bg-[var(--text)] text-[var(--bg)] border-transparent' : 'bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text)]/20'}`}
                >
                  <Globe size={16} /> En Ligne & Digitaux
                </button>
              </div>
            </div>
          </div>

          {/* Grid Layout of Categories */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-20 bg-[var(--card-bg)] rounded-[40px] border border-[var(--border)] p-12">
              <Layers size={48} className="mx-auto text-[var(--text-muted)] mb-4 stroke-[1.5]" />
              <h3 className="text-2xl font-bold mb-2">Aucune catégorie trouvée</h3>
              <p className="text-[var(--text-muted)]">Essayez d'ajuster vos filtres ou d'élargir votre terme de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCategories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleSelectCategory(cat)}
                  className="bg-[var(--card-bg)] border border-[var(--border)] p-8 rounded-[40px] hover:bg-black/5 dark:hover:bg-white/5 transition-all group shadow-sm hover:shadow-xl cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[320px]"
                >
                  {/* Subtle decorative background gradient based on category color flag */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${cat.color} blur-3xl opacity-60 rounded-full`} />

                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComponent name={cat.icon} size={28} />
                      </div>
                      <span className={`text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-full border ${cat.isDigital ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {cat.isDigital ? 'Digital' : 'Physique'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-[var(--text)] mb-3 group-hover:text-[var(--accent)] transition-colors">
                      {cat.frenchName}
                    </h3>

                    <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6">
                      {cat.description}
                    </p>
                  </div>

                  <div className="border-t border-[var(--border)] pt-4 mt-auto flex items-center justify-between text-xs font-bold text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">
                    <span>Voir les {cat.subcategories.length} sous-catégories</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Detailed Bottom Sheet / Modal Drawer on selected Category */}
          <AnimatePresence>
            {selectedCategory && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => handleSelectCategory(null)}
                  className="fixed inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Content Panel */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-5xl bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto outline-none flex flex-col"
                >
                  {/* Modal Header */}
                  <div className="p-8 pb-4 border-b border-[var(--border)] flex justify-between items-start sticky top-0 bg-[var(--card-bg)] z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl flex items-center justify-center">
                        <IconComponent name={selectedCategory.icon} size={24} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-display font-bold">{selectedCategory.frenchName}</h2>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                          <span>{selectedCategory.name}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
                          <span className={selectedCategory.isDigital ? 'text-indigo-400' : 'text-amber-400'}>
                            {selectedCategory.isDigital ? 'Service digital à distance' : 'Service physique de proximité'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSelectCategory(null)}
                      className="p-3 hover:bg-[var(--border)] transition-colors rounded-full text-[var(--text-muted)] hover:text-[var(--text)] active:scale-90"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                    <div>
                      <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                        {selectedCategory.description}
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Interactive Search inside the modal */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg)]/60 border border-[var(--border)] p-4 rounded-3xl">
                        <div className="relative flex-1">
                          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50" size={18} />
                          <input
                            type="text"
                            placeholder="Rechercher une sous-catégorie ou un service..."
                            value={subQuery}
                            onChange={(e) => setSubQuery(e.target.value)}
                            className="w-full bg-transparent py-2 ps-12 pe-8 text-sm text-[var(--text)] focus:outline-none placeholder-[var(--text-muted)]/60"
                          />
                          {subQuery && (
                            <button
                              onClick={() => setSubQuery('')}
                              className="absolute end-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-[var(--text-muted)]"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] font-black uppercase tracking-wider px-3 py-1 shrink-0">
                          {filteredSubcategories.length} sous-catégorie{filteredSubcategories.length !== 1 ? 's' : ''} disponible{filteredSubcategories.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {filteredSubcategories.length === 0 ? (
                        <div className="text-center py-12 bg-[var(--bg)]/35 rounded-3xl border border-dashed border-[var(--border)]">
                          <Layers size={32} className="mx-auto text-[var(--text-muted)]/40 mb-2 stroke-[1.5]" />
                          <p className="text-sm text-[var(--text-muted)]">Aucune sous-catégorie ne correspond à votre recherche.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                          {filteredSubcategories.map((sub, sIdx) => (
                            <motion.div 
                              key={sIdx} 
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(sIdx * 0.02, 0.4) }}
                              className="bg-[var(--bg)] border border-[var(--border)] p-6 rounded-[2rem] flex flex-col justify-between gap-5 hover:border-[var(--accent)]/40 hover:shadow-lg dark:hover:shadow-black/20 group/card transition-all duration-300"
                            >
                              <div className="space-y-3 text-start">
                                <h5 className="text-lg font-bold text-[var(--text)] group-hover/card:text-[var(--accent)] transition-colors flex items-center gap-2">
                                  <span className="w-1.5 h-6 bg-[var(--accent)] rounded-full shrink-0" />
                                  {sub.name}
                                </h5>
                                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{sub.description}</p>
                                
                                {/* Popular services pill tags */}
                                <div className="space-y-2 pt-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]/60 block">Exemples de prestations :</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {sub.popularServices.map((srv, srvIdx) => (
                                      <button
                                        key={srvIdx}
                                        onClick={() => handleQuickSearch(srv)}
                                        className="text-[11px] font-semibold bg-[var(--card-bg)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] text-[var(--text-muted)] px-3 py-1.5 rounded-xl border border-[var(--border)] group-hover/card:border-[var(--text-muted)]/20 transition-all flex items-center gap-1 hover:scale-105 active:scale-95"
                                      >
                                        <span>{srv}</span>
                                        <ArrowUpRight size={10} className="opacity-65" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-end border-t border-[var(--border)]/60 pt-4 mt-auto">
                                <button
                                  onClick={() => {
                                    handleSelectCategory(null);
                                    navigate(`/find-pro?category=${encodeURIComponent(selectedCategory.name)}&search=${encodeURIComponent(sub.name)}`);
                                  }}
                                  className="w-full sm:w-auto bg-[var(--card-bg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-transparent text-[var(--text)] font-semibold text-xs py-3 px-5 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                                >
                                  <span>Rechercher des spécialistes</span>
                                  <ArrowRight size={14} className="group-hover/card:translate-x-1 transition-transform" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-8 border-t border-[var(--border)] flex justify-end gap-3 sticky bottom-0 bg-[var(--card-bg)] z-10">
                    <button
                      onClick={() => handleSelectCategory(null)}
                      className="px-6 py-3 rounded-xl border border-[var(--border)] text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
                    >
                      Fermer
                    </button>
                    <Link
                      to={`/find-pro?category=${encodeURIComponent(selectedCategory.name)}`}
                      className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      <span>Tous les prestataires de la catégorie</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Call to action section for onboarding as artisan */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 bg-gradient-to-br from-[var(--text)] to-[var(--text-muted)]/80 rounded-[48px] p-12 md:p-20 text-[var(--bg)] text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 end-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">Vous offrez un service professionnel ?</h2>
              <p className="text-lg md:text-xl font-medium mb-10 opacity-80 max-w-2xl mx-auto">
                Inscrivez-vous sur notre plateforme, rejoignez des milliers de prestataires de confiance, et développez votre activité locale ou numérique.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/?register=true"
                  className="bg-[var(--bg)] text-[var(--text)] px-10 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform active:scale-95 shadow-xl border border-[var(--border)]"
                >
                  S'inscrire comme prestataire
                </Link>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </PublicLayout>
  );
}
