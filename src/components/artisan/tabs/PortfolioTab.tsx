import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Loader2, 
  Trash2 
} from 'lucide-react';

interface PortfolioTabProps {
  portfolio: any[];
  portfolioLoading: boolean;
  setShowAddPortfolio: (show: boolean) => void;
  handleDeletePortfolio: (id: string) => Promise<void>;
}

export function PortfolioTab({
  portfolio,
  portfolioLoading,
  setShowAddPortfolio,
  handleDeletePortfolio
}: PortfolioTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-black text-[var(--text)] italic uppercase tracking-tight">My Portfolio</h3>
        <button 
          onClick={() => setShowAddPortfolio(true)}
          className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
        >
          <Plus size={18} /> Add Work
        </button>
      </div>

      {portfolioLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[var(--accent)]" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] glass">
              <div className="w-64 h-64 mb-8 relative mx-auto">
                <img src="/input_file_4.png" alt="No portfolio" className="w-full h-full object-contain opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent" />
              </div>
              <h4 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight mb-4">Showcase Your Work</h4>
              <p className="text-[var(--text-muted)] font-medium mb-10 max-w-md mx-auto text-center">Upload photos of your completed projects to build trust with potential clients.</p>
              <button 
                onClick={() => setShowAddPortfolio(true)}
                className="mx-auto px-10 py-5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/30 flex items-center gap-3"
              >
                <Plus size={20} />
                Add Project Photo
              </button>
            </div>
          ) : (
            portfolio.map((item) => (
              <div key={item.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl overflow-hidden group relative text-left">
                <div className="h-48 overflow-hidden relative">
                  {item.video_url ? (
                    <video src={item.video_url} className="w-full h-full object-cover" controls muted />
                  ) : (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <button 
                    onClick={() => handleDeletePortfolio(item.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-[var(--text)] mb-1">{item.title}</h4>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
