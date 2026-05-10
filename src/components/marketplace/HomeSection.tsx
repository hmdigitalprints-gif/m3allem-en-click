import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search as SearchIcon, 
  Zap, 
  BrainCircuit, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { Artisan, Category } from '../../services/marketplaceService';
import ArtisanCard from '../common/ArtisanCard';
import CategoryIcon from '../common/CategoryIcon';

import { useTranslation } from 'react-i18next';

interface HomeSectionProps {
  onAction: (msg: string) => void;
  onSelectArtisan: (id: string) => void;
  onBookArtisan: (artisan: any, isQuick?: boolean) => void;
  categories: Category[];
  featuredArtisans: Artisan[];
  recommendedArtisans: Artisan[];
}

export default function HomeSection({ 
  onAction, 
  onSelectArtisan, 
  onBookArtisan, 
  categories, 
  featuredArtisans, 
  recommendedArtisans 
}: HomeSectionProps) {
  const { t } = useTranslation();
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [matching, setMatching] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<{ categoryId: string, categoryName: string, suggestedServiceName: string } | null>(null);
  const [isDeepThinking, setIsDeepThinking] = useState(false);
  const [deepThinkResult, setDeepThinkResult] = useState('');

  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (val.length > 2) {
      const suggestions = await aiService.getSuggestions(val);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleSmartMatch = async () => {
    setMatching(true);
    try {
      const lat = 33.5731;
      const lng = -7.5898;
      const bestArtisans = await aiService.getSmartMatch(lat, lng);
      if (bestArtisans.length > 0) {
        onSelectArtisan(bestArtisans[0].id);
        onAction(`Smart Match found: ${bestArtisans[0].name} is the best professional for you!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatching(false);
    }
  };

  const handleSuggestService = async () => {
    if (!problemDescription) return;
    setSuggesting(true);
    setDeepThinkResult('');
    setAiSuggestion(null);
    try {
      if (isDeepThinking) {
        const res = await aiService.deepThink(problemDescription);
        setDeepThinkResult(res);
      } else {
        const res = await aiService.suggestServiceFromProblem(problemDescription);
        setAiSuggestion(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:h-[70vh] flex items-center px-6 md:px-12 overflow-hidden py-20 md:py-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/80 to-transparent z-10" />
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-40"
            poster="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1920"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-carpenter-working-with-a-drill-4667-large.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="relative z-20 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-6"
          >
            <ShieldCheck size={14} />
            {t('verified_pros_only')}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 md:mb-8 text-[var(--text)] leading-[1.1] md:leading-[0.9]"
          >
            {t('home_care_title_1')} <br />
            <span className="text-[var(--accent)]">{t('home_care_title_2')}</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group max-w-lg"
          >
            <SearchIcon className="absolute start-4 md:start-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('search_placeholder')} 
              className="w-full bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl md:rounded-3xl py-3.5 md:py-6 ps-12 md:ps-16 pe-6 text-base md:text-xl focus:outline-none focus:border-[var(--accent)]/50 transition-all shadow-xl md:shadow-2xl text-[var(--text)]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onAction('Searching for: ' + searchQuery);
                }
              }}
            />
            {searchSuggestions.length > 0 && (
              <div className="absolute top-full inset-x-0 mt-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl z-50">
                {searchSuggestions?.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => { 
                      setSearchQuery(s); 
                      setSearchSuggestions([]); 
                      onAction('Selected suggestion: ' + s); 
                    }}
                    className="w-full text-start px-6 py-3 hover:bg-[var(--accent)]/5 transition-colors text-sm border-b border-[var(--border)] last:border-0 text-[var(--text)] flex items-center gap-2"
                  >
                    <Search size={14} className="text-[var(--accent)]" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <button 
              onClick={handleSmartMatch}
              disabled={matching}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-[var(--accent)]/20 active:scale-95 disabled:opacity-50"
            >
              <Zap size={18} className={matching ? "animate-pulse" : ""} />
              {matching ? t('smart_match_loading') : t('smart_match_btn')}
            </button>
            <button 
              onClick={() => onAction('Opening AI Problem Solver...')}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--card-bg)] text-[var(--text)] border border-[var(--border)] rounded-full font-bold text-sm hover:bg-[var(--accent)]/5 transition-all active:scale-95"
            >
              <BrainCircuit size={18} />
              {t('ai_problem_solver_btn')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* AI Problem Solver Modal/Section */}
      <section className="px-6 md:px-12 py-10 bg-[var(--accent)]/5 border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto bg-[var(--card-bg)] border border-[var(--accent)]/30 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 end-0 p-8 opacity-10 pointer-events-none">
            <BrainCircuit size={120} className="text-[var(--accent)]" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-[var(--accent)] font-bold text-xs uppercase tracking-widest mb-6">
              <Sparkles size={20} />
              {t('ai_problem_solver_label', 'AI Problem Solver')}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-[var(--text)]">{t('ai_solver_title')}</h2>
            <p className="text-[var(--text-muted)] mb-8 max-w-xl text-lg">{t('ai_solver_desc')}</p>
            
            <div className="space-y-4">
              <textarea 
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder={t('ai_solver_placeholder')}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-3xl py-6 px-8 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-lg h-32 resize-none text-[var(--text)]"
              />
              <div className="flex justify-end items-center gap-4">
                <button 
                  onClick={() => setIsDeepThinking(!isDeepThinking)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${isDeepThinking ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--bg)]/10 text-[var(--text-muted)] hover:bg-[var(--bg)]/20'}`}
                >
                  <BrainCircuit size={14} /> {isDeepThinking ? "Deep Reasoning ON" : "Deep Reasoning OFF"}
                </button>
                <button 
                  onClick={handleSuggestService}
                  disabled={suggesting || !problemDescription}
                  className="px-8 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 rtl:flex-row-reverse"
                >
                  {suggesting ? (isDeepThinking ? t('ai_solver_analyzing') : t('ai_solver_analyzing')) : t('ai_solver_analyze_btn')}
                  <ChevronRight size={20} className="rtl:rotate-180" />
                </button>
              </div>
            </div>

            {deepThinkResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-8 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-3xl text-start"
              >
                <div className="flex items-center gap-3 mb-4 text-[var(--accent)]">
                  <BrainCircuit size={20} />
                  <span className="font-bold uppercase tracking-widest text-xs">{t('ai_recommendation', 'AI Deep Reasoning Analysis')}</span>
                </div>
                <div className="prose prose-invert max-w-none text-sm leading-relaxed text-[var(--text-muted)]">
                  {deepThinkResult.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
              </motion.div>
            )}

            {aiSuggestion && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-8 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-3xl"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest mb-2">{t('ai_recommendation', 'AI Recommendation')}</p>
                    <h3 className="text-2xl font-bold text-[var(--text)]">{t('suggested_category', 'You need a')} <span className="text-[var(--accent)]">{aiSuggestion.categoryName}</span></h3>
                    <p className="text-[var(--text-muted)] mt-1">{t('recommended_service', 'Suggested Service:')} <span className="font-bold text-[var(--text)]">{aiSuggestion.suggestedServiceName}</span></p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => onAction(`Finding ${aiSuggestion.categoryName} experts...`)}
                      className="px-6 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl font-bold text-sm active:scale-95"
                    >
                      {t('ai_book_best_pro')}
                    </button>
                    <button 
                      onClick={() => setAiSuggestion(null)}
                      className="px-6 py-4 bg-[var(--card-bg)]/50 text-[var(--text)] rounded-xl font-bold text-sm hover:bg-[var(--card-bg)]/80 transition-all"
                    >
                      {t('close')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Recommended for You (AI) */}
      {recommendedArtisans.length > 0 && (
        <section className="px-6 md:px-12 py-20 md:py-32 bg-[var(--accent)]/5 border-b border-[var(--accent)]/10">
          <div className="mb-12">
            <p className="micro-label mb-4">{t('personalized_selection', 'Personalized Selection')}</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-[var(--text)]">
              {t('recommended_for_you_title')} <span className="gold-text italic-serif">{t('recommended_for_you_accent')}</span>
            </h2>
            <p className="text-[var(--text-muted)] mt-3 text-base md:text-xl">{t('recommended_desc', 'AI-powered suggestions based on your preferences.')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {recommendedArtisans?.map(artisan => (
              <ArtisanCard 
                key={artisan.id}
                name={artisan.name} 
                category={t(artisan.category_name, artisan.category_name)} 
                rating={artisan.rating} 
                reviews={artisan.review_count} 
                price={`${t('starting_from')} ${artisan.starting_price || 100} MAD`}
                image={artisan.avatar_url}
                isOnline={!!artisan.is_online}
                onAction={(type: string) => type === 'view' ? onSelectArtisan(artisan.id) : onBookArtisan(artisan, type === 'quick-book')}
              />
            ))}
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section className="px-6 md:px-12 py-20 md:py-32" id="categories">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 md:mb-16 gap-6">
          <div>
            <p className="micro-label mb-4">{t('specialized_expertise', 'Specialized Expertise')}</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-[var(--text)]">
              {t('expert_categories_title')} <span className="gold-text italic-serif">{t('expert_categories_accent')}</span>
            </h2>
            <p className="text-[var(--text-muted)] mt-3 text-base md:text-lg">{t('categories_desc', 'Select a service to see available professionals near you.')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-8">
          {categories?.map((cat, idx) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -10, backgroundColor: 'var(--accent-muted)', borderColor: 'var(--accent)' }}
              onClick={() => onAction('Selected category: ' + cat.name)}
              className="card-luxury p-4 md:p-10 flex flex-col items-center justify-center gap-3 md:gap-6 cursor-pointer transition-all group active:scale-95"
            >
              <div className={`p-3 md:p-6 rounded-[20px] md:rounded-[32px] bg-[var(--bg)] group-hover:bg-[var(--accent)]/10 transition-colors text-[var(--accent)]`}>
                <CategoryIcon name={cat.name} className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <span className="font-bold text-sm md:text-lg tracking-tight text-[var(--text)]">{t(cat.id || cat.name, cat.name)}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Artisans */}
      <section className="px-6 md:px-12 py-20 md:py-32 bg-[var(--card-bg)]/50 border-y border-[var(--border)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 md:mb-16 gap-6">
          <div>
            <p className="micro-label mb-4">{t('elite_professionals', 'Elite Professionals')}</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-[var(--text)]">
              {t('top_rated_nearby_title')} <span className="gold-text italic-serif">{t('top_rated_nearby_accent')}</span>
            </h2>
            <p className="text-[var(--text-muted)] mt-3 text-base md:text-lg">{t('top_rated_desc', 'Highly recommended professionals in your area.')}</p>
          </div>
          <button 
            onClick={() => onAction('Viewing all professionals...')}
            className="text-[var(--accent)] font-bold text-base md:text-lg hover:underline flex items-center gap-2 active:scale-95 w-fit"
          >
            {t('view_all')} <ChevronRight size={20} className="rtl:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {featuredArtisans?.map(artisan => (
            <ArtisanCard 
              key={artisan.id}
              name={artisan.name} 
              category={t(artisan.category_name, artisan.category_name)} 
              rating={artisan.rating} 
              reviews={artisan.review_count} 
              price={`${t('starting_from')} ${artisan.starting_price || 150} MAD`}
              image={artisan.avatar_url}
              isOnline={!!artisan.is_online}
              onAction={(type: string) => type === 'view' ? onSelectArtisan(artisan.id) : onBookArtisan(artisan, type === 'quick-book')}
            />
          ))}
        </div>
      </section>
    </>
  );
}
