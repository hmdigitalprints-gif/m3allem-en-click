import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Star 
} from 'lucide-react';

interface ReviewsTabProps {
  stats: any;
  reviews: any[];
}

export function ReviewsTab({
  stats,
  reviews
}: ReviewsTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left">
          <h3 className="text-3xl font-black text-[var(--text)] italic uppercase tracking-tight">{t('client_reviews')}</h3>
          <p className="text-[var(--text-muted)] mt-1 font-medium">{t('client_reviews_desc', 'What people say about your professional service.')}</p>
        </div>
        <div className="flex items-center gap-6 bg-[var(--card-bg)] border border-[var(--border)] p-6 rounded-[32px] glass shadow-xl">
          <div className="text-center">
            <div className="flex items-center gap-2 text-4xl font-black text-[var(--text)] mb-1">
              <Star size={32} fill="var(--accent)" className="text-[var(--accent)]" />
              {stats.rating}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">{t('average_rating', 'Average Rating')}</p>
          </div>
          <div className="w-px h-12 bg-[var(--border)]" />
          <div className="text-center">
            <div className="text-4xl font-black text-[var(--text)] mb-1">{reviews.length}</div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">{t('total_reviews', 'Total Reviews')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reviews.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] glass">
            <div className="w-64 h-64 mb-8 relative mx-auto">
              <img src="/input_file_5.png" alt={t('no_reviews')} className="w-full h-full object-contain opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent" />
            </div>
            <h4 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight mb-4">{t('no_reviews_yet')}</h4>
            <p className="text-[var(--text-muted)] font-medium max-w-md mx-auto text-center">{t('no_reviews_desc_empty', 'Complete jobs to start receiving feedback from your clients.')}</p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div 
              key={review.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 glass hover:shadow-2xl transition-all group relative overflow-hidden text-left"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Star size={80} fill="var(--accent)" className="text-[var(--accent)]" />
              </div>
              <div className="flex items-center gap-5 mb-6 relative z-10">
                <img src={review.client_avatar || `https://ui-avatars.com/api/?name=${review.client_name}&background=random`} alt={review.client_name} className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
                <div>
                  <h4 className="font-black text-lg text-[var(--text)] tracking-tight">{review.client_name}</h4>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.stars ? "var(--accent)" : "none"} className={i < review.stars ? "text-[var(--accent)]" : "text-[var(--text-muted)] opacity-30"} />
                    ))}
                  </div>
                </div>
                <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <div className="relative z-10">
                <p className="text-[var(--text)] text-lg italic font-medium leading-relaxed">"{review.review}"</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
