import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORIES_DATA } from '../../data/categoriesData';
import CategoryIcon from '../common/CategoryIcon';
import { SymmetricalIcon } from '../common/SymmetricalIcon';

interface CategorySidebarMenuProps {
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onAction?: (msg: string) => void;
  className?: string;
}

export default function CategorySidebarMenu({
  activeCategoryId,
  onSelectCategory,
  onAction,
  className = ""
}: CategorySidebarMenuProps) {
  const { t } = useTranslation();

  const handleSelect = (id: string, name: string) => {
    if (onAction) {
      onAction(id ? `Switching category to: ${name}` : 'Resetting category filter to: All Services');
    }
    onSelectCategory(id);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-2">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2">
          <LayoutGrid size={16} className="text-[var(--accent)]" />
          {t('marketplace_categories_nav', 'Quick Navigation')}
        </h3>
        {activeCategoryId && (
          <button
            onClick={() => handleSelect('', 'All')}
            className="text-xs font-bold text-[var(--accent)] hover:opacity-80 transition-opacity"
          >
            {t('clear_filters', 'Reset')}
          </button>
        )}
      </div>

      <nav className="space-y-1 md:space-y-1.5 scrollbar-thin scrollbar-thumb-[var(--border)] max-h-[500px] overflow-y-auto pr-1">
        {/* All Services Option */}
        <motion.button
          onClick={() => handleSelect('', 'All')}
          id="cat-sidebar-all"
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-start transition-colors ${
            activeCategoryId === ''
              ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-black shadow-lg shadow-[var(--accent)]/10'
              : 'hover:bg-[var(--card-bg)] hover:text-[var(--text)] text-[var(--text-muted)] hover:border-[var(--border)] border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-colors ${activeCategoryId === '' ? 'bg-white/20' : 'bg-[var(--bg)] border border-[var(--border)]'}`}>
              <LayoutGrid size={16} />
            </div>
            <span className="text-sm font-bold tracking-tight">
              {t('filter_all_services', 'All Services')}
            </span>
          </div>
          <SymmetricalIcon icon={ChevronRight} size={14} className={activeCategoryId === '' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
        </motion.button>

        {CATEGORIES_DATA.map((cat) => {
          const isSelected = activeCategoryId === cat.id;
          const translationKey = `cat_${cat.id.replace('web_mobile_dev', 'web_mobile_development')}`;
          const displayName = t(translationKey, cat.frenchName || cat.name);

          return (
            <motion.button
              key={cat.id}
              id={`cat-sidebar-${cat.id}`}
              onClick={() => handleSelect(cat.id, cat.name)}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-start transition-colors group ${
                isSelected
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-black shadow-lg shadow-[var(--accent)]/15'
                  : 'hover:bg-[var(--card-bg)] hover:text-[var(--text)] text-[var(--text-muted)] hover:border-[var(--border)] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-white/20' : 'bg-[var(--bg)] border border-[var(--border)] group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent)]/5'}`}>
                  <CategoryIcon name={cat.name} size={16} className={isSelected ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--accent)]'} />
                </div>
                <span className="text-sm font-bold tracking-tight">
                  {displayName}
                </span>
              </div>
              <SymmetricalIcon icon={ChevronRight} size={14} className={`transition-all ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
