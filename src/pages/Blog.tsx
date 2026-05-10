import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, User, Tag } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import { useTranslation } from 'react-i18next';

export default function Blog() {
  const { t, i18n } = useTranslation();

  const posts = [
    {
      id: 1,
      title: t('post_1_title'),
      excerpt: t('post_1_excerpt'),
      author: 'Karim Tazi',
      date: 'March 15, 2026',
      readTime: '5 min read',
      category: t('post_1_cat'),
      image: 'https://images.unsplash.com/photo-1503387762-592dee58c460?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 2,
      title: t('post_2_title'),
      excerpt: t('post_2_excerpt'),
      author: 'Sarah Mansouri',
      date: 'March 12, 2026',
      readTime: '8 min read',
      category: t('post_2_cat'),
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 3,
      title: t('post_3_title'),
      excerpt: t('post_3_excerpt'),
      author: 'Ahmed Sabiri',
      date: 'March 10, 2026',
      readTime: '6 min read',
      category: t('post_3_cat'),
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[var(--text)] uppercase"
          >
            {t('blog_title_1')} <span className="text-[var(--accent)]">{t('blog_title_2')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            {t('blog_subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {posts?.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] overflow-hidden group hover:border-[var(--accent)]/30 transition-all shadow-xl"
            >
              <div className="h-64 relative overflow-hidden">
                <img 
                  src={post.image} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={post.title}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold text-[var(--accent)] border border-[var(--border)]">
                  {post.category}
                </div>
              </div>
              <div className="p-10">
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mb-4">
                  <div className="flex items-center gap-1"><Calendar size={14} /> {post.date}</div>
                  <div className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-[var(--accent)] transition-colors leading-tight text-[var(--text)]">
                  {post.title}
                </h3>
                <p className="text-[var(--text-muted)] mb-8 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-8 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center">
                      <User size={16} className="text-[var(--text-muted)]" />
                    </div>
                    <span className="text-sm font-bold text-[var(--text)]">{post.author}</span>
                  </div>
                  <button className={`text-[var(--accent)] font-bold text-sm flex items-center gap-1 hover:underline ${i18n.dir() === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    {t('blog_read_more')} <ChevronRight size={16} className={i18n.dir() === 'rtl' ? 'rotate-180' : ''}/>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="bg-[var(--accent)] rounded-[64px] p-12 md:p-24 text-[var(--accent-foreground)] text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 uppercase">{t('blog_sub_1')} <span className="text-black">{t('blog_sub_2')}</span></h2>
            <p className="text-lg font-medium mb-12 opacity-80">
              {t('blog_sub_desc')}
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder={t('blog_sub_placeholder')}
                className="flex-1 bg-white/20 border border-black/10 rounded-2xl py-5 px-8 focus:outline-none focus:border-black/50 transition-all placeholder:text-black/40 text-lg font-bold"
              />
              <button className="bg-black text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-transform active:scale-95 shadow-2xl">
                {t('blog_sub_btn')}
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}
