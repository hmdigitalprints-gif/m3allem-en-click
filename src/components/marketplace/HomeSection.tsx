import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  Zap, 
  BrainCircuit, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  Search,
  Clock
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
  const navigate = useNavigate();
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    const history = localStorage.getItem('marketplace_search_history');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {}
    }
  }, []);

  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    const current = [...searchHistory];
    const index = current.indexOf(query.trim());
    if (index !== -1) current.splice(index, 1);
    current.unshift(query.trim());
    const newHistory = current.slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('marketplace_search_history', JSON.stringify(newHistory));
  };
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
      {/* 1. Simplified Search Hero */}
      <section className="relative py-12 md:py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <ShieldCheck size={14} />
              {t('verified_pros_only', 'Elite Professionals Only')}
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] italic uppercase italic">
              {t('home_care_title_1', 'Find the best')} <br />
              <span className="text-[var(--accent)]">{t('home_care_title_2', 'M3allem')}</span>
            </h1>
            <p className="text-[var(--text-muted)] text-lg md:text-xl max-w-2xl mx-auto mb-10 font-bold opacity-80 uppercase tracking-tight">
              {t('hero_subtitle', 'Verified experts for all your home projects and repairs.')}
            </p>

            <div className="relative group max-w-2xl mx-auto">
              <SearchIcon className="absolute start-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder={t('search_placeholder')} 
                className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] py-6 ps-16 pe-6 text-xl focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 transition-all shadow-2xl text-[var(--text)] italic font-black"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveToHistory(searchQuery);
                    onAction('Searching for: ' + searchQuery);
                  }
                }}
              />
              {(isSearchFocused || searchSuggestions.length > 0) && (
                <div className="absolute top-full inset-x-0 mt-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-[24px] overflow-hidden shadow-2xl z-50 text-start">
                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map((s, i) => (
                      <button 
                        key={i}
                        onClick={() => { 
                          setSearchQuery(s); 
                          setSearchSuggestions([]); 
                          saveToHistory(s);
                          onAction('Searching for: ' + s);
                        }}
                        className="w-full px-6 py-4 hover:bg-[var(--accent)]/5 transition-colors text-sm font-bold border-b border-[var(--border)] last:border-0 text-[var(--text)] flex items-center gap-3"
                      >
                        <Search size={16} className="text-[var(--accent)]" />
                        {s}
                      </button>
                    ))
                  ) : (
                    searchHistory.length > 0 && searchQuery.length === 0 && (
                      <div className="py-2">
                        <div className="px-6 py-2 text-[10px] font-black uppercase text-[var(--accent)] tracking-widest opacity-80 flex items-center justify-between">
                          <span>{t('recent_searches', 'Recent Searches')}</span>
                        </div>
                        {searchHistory.map((s, i) => (
                          <button 
                            key={`hist-${i}`}
                            onClick={() => { 
                                setSearchQuery(s); 
                                saveToHistory(s);
                                onAction('Searching for: ' + s);
                            }}
                            className="w-full px-6 py-3 hover:bg-[var(--accent)]/5 transition-colors text-sm font-bold border-b border-[var(--border)] last:border-0 text-[var(--text)] flex items-center gap-3"
                          >
                            <Clock size={16} className="text-[var(--text-muted)]" />
                            {s}
                          </button>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button 
              onClick={handleSmartMatch}
              disabled={matching}
              className="flex items-center gap-3 px-8 py-4 bg-[var(--accent)] text-black rounded-[20px] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[var(--accent)]/30 active:scale-95 disabled:opacity-50"
            >
              <Zap size={18} className={matching ? "animate-pulse" : ""} />
              {matching ? t('smart_match_loading') : t('smart_match_btn')}
            </button>
            <button 
              onClick={() => onAction('Opening AI Problem Solver...')}
              className="flex items-center gap-3 px-8 py-4 bg-black text-[var(--accent)] border border-[var(--accent)]/30 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-[var(--accent)] hover:text-black transition-all active:scale-95"
            >
              <BrainCircuit size={18} />
              {t('ai_problem_solver_btn')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. Personalized Experience (AI) */}
      {recommendedArtisans.length > 0 && (
        <section className="px-6 md:px-12 py-16 bg-[var(--bg)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                <Sparkles size={20} className="text-[var(--accent)]" />
                {t('recommended_for_you_title', 'Recommended for You')}
              </h2>
              <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-1 opacity-60">
                {t('ai_curated', 'AI-Curated based on your history')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedArtisans.slice(0, 4).map(artisan => (
              <ArtisanCard 
                key={artisan.id}
                {...artisan}
                category={t(artisan.category_name, artisan.category_name)}
                price={`${t('starting_from')} ${Number(artisan.starting_price || 100).toFixed(2)} MAD`}
                onAction={(type: string) => type === 'view' ? onSelectArtisan(artisan.id) : onBookArtisan(artisan, type === 'quick-book')}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Category Bento Grid */}
      <section className="px-6 md:px-12 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">
            {t('explore_services', 'What do you need?') }
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => (
            <motion.button 
              key={cat.id}
              whileHover={{ y: -8 }}
              onClick={() => navigate(`/find-pro?category=${encodeURIComponent(cat.name)}`)}
              className="bg-[var(--card-bg)] border border-[var(--border)] p-8 rounded-[32px] flex flex-col items-center gap-4 transition-all hover:border-[var(--accent)] group shadow-xl shadow-black/5"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--bg)] flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform shadow-inner">
                <CategoryIcon name={cat.name} className="w-8 h-8" />
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest text-center">{t(cat.id || cat.name, cat.name)}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* 4. AI Problem Solver (Bento Box) */}
      <section className="px-6 md:px-12 py-16">
        <div className="bg-black text-[var(--accent)] rounded-[48px] p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row gap-12 items-center border border-[var(--accent)]/30">
          <div className="relative z-10 flex-1">
             <div className="flex items-center gap-2 mb-6">
                <BrainCircuit size={24} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('ai_diagnostic', 'AI DIAGNOSTIC SYSTEM')}</span>
             </div>
             <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none mb-8">
               {t('solve_anything', 'Describe your problem, we find the solution.')}
             </h2>
             <p className="text-[var(--accent)]/60 text-lg md:text-xl font-bold uppercase mb-10 max-w-xl">
               {t('ai_solver_desc', 'Not sure what you need? Our AI analyzes your situation and recommends the perfect expert.')}
             </p>
             <button 
               onClick={handleSuggestService}
               className="bg-[var(--accent)] text-black px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-[var(--accent)]/50"
             >
               {t('launch_diagnostic', 'Launch Diagnostic')}
             </button>
          </div>
          <div className="flex-1 w-full max-w-md bg-[var(--accent)]/5 backdrop-blur-3xl border border-[var(--accent)]/20 rounded-[32px] p-2">
            <textarea 
               value={problemDescription}
               onChange={(e) => setProblemDescription(e.target.value)}
               placeholder={t('ai_solver_placeholder')}
               className="w-full bg-transparent border-none rounded-[28px] p-6 text-xl italic font-black text-[var(--accent)] focus:ring-0 h-48 resize-none placeholder:text-[var(--accent)]/30"
            />
          </div>
          
          <Sparkles className="absolute -right-20 -bottom-20 w-96 h-96 text-[var(--accent)] opacity-5 rotate-12" />
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
              price={`${t('starting_from')} ${Number(artisan.starting_price || 150).toFixed(2)} MAD`}
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
