import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, ArrowRight, Zap, Users, Star, CheckCircle } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import { useTranslation } from 'react-i18next';

const jobs = [
  {
    id: 1,
    titleToken: 'careers_job1_title',
    titleDefault: 'Senior Frontend Engineer',
    deptToken: 'careers_dept_engineering',
    deptDefault: 'Engineering',
    locToken: 'careers_loc_casa_remote',
    locDefault: 'Casablanca / Remote',
    typeToken: 'careers_type_fulltime',
    typeDefault: 'Full-time'
  },
  {
    id: 2,
    titleToken: 'careers_job2_title',
    titleDefault: 'Product Designer (UX/UI)',
    deptToken: 'careers_dept_product',
    deptDefault: 'Product',
    locToken: 'careers_loc_casa_remote',
    locDefault: 'Casablanca / Remote',
    typeToken: 'careers_type_fulltime',
    typeDefault: 'Full-time'
  },
  {
    id: 3,
    titleToken: 'careers_job3_title',
    titleDefault: 'Operations Manager',
    deptToken: 'careers_dept_operations',
    deptDefault: 'Operations',
    locToken: 'careers_loc_rabat',
    locDefault: 'Rabat',
    typeToken: 'careers_type_fulltime',
    typeDefault: 'Full-time'
  },
  {
    id: 4,
    titleToken: 'careers_job4_title',
    titleDefault: 'Customer Success Specialist',
    deptToken: 'careers_dept_support',
    deptDefault: 'Support',
    locToken: 'careers_loc_remote',
    locDefault: 'Remote',
    typeToken: 'careers_type_fulltime',
    typeDefault: 'Full-time'
  }
];

export default function Careers() {
  const { t, i18n } = useTranslation();
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-32">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[var(--text)] uppercase"
          >
            {t('careers_title_1')} <span className="text-[var(--accent)]">{t('careers_title_2')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            {t('careers_subtitle')}
          </motion.p>
        </div>

        {/* Culture Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            { title: t('careers_culture_inn'), desc: t('careers_culture_inn_desc'), icon: <Zap /> },
            { title: t('careers_culture_com'), desc: t('careers_culture_com_desc'), icon: <Users /> },
            { title: t('careers_culture_exc'), desc: t('careers_culture_exc_desc'), icon: <Star /> }
          ]?.map((item, i) => (
            <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] p-10 rounded-[40px] text-center shadow-xl">
              <div className="w-16 h-16 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl flex items-center justify-center mx-auto mb-8">
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 32 })}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">{item.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Open Positions */}
        <div className="mb-32">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16 text-center text-[var(--text)] uppercase">{t('careers_positions_1')} <span className="text-[var(--accent)]">{t('careers_positions_2')}</span></h2>
          <div className="space-y-6">
            {jobs?.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[var(--card-bg)] border border-[var(--border)] p-8 md:p-10 rounded-[40px] flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-[var(--bg)] transition-all group cursor-pointer shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--accent)]/20">
                      {t(job.deptToken, job.deptDefault)}
                    </span>
                    <span className="text-[var(--text-muted)]/40 text-xs font-bold uppercase tracking-widest">{t(job.typeToken, job.typeDefault)}</span>
                  </div>
                  <h3 className="text-3xl font-bold group-hover:text-[var(--accent)] transition-colors text-[var(--text)]">{t(job.titleToken, job.titleDefault)}</h3>
                  <div className="flex items-center gap-4 text-[var(--text-muted)]">
                    <div className="flex items-center gap-1 text-sm"><MapPin size={16} /> {t(job.locToken, job.locDefault)}</div>
                    <div className="flex items-center gap-1 text-sm"><Clock size={16} /> {t('careers_posted_ago')}</div>
                  </div>
                </div>
                <button className={`bg-[var(--bg)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group/btn border border-[var(--border)] text-[var(--text)] flex-row-reverse`}>
                  {t('careers_btn_apply')}
                  <ArrowRight size={20} className={`transform transition-transform ${i18n.dir() === 'rtl' ? 'rotate-180 group-hover/btn:-translate-x-1' : 'group-hover/btn:translate-x-1'}`} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[64px] p-12 md:p-24 text-center shadow-2xl">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12 text-[var(--text)] uppercase">{t('careers_ben_title_1')} <span className="text-[var(--accent)]">{t('careers_ben_title_2')}</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              t('careers_ben_1'),
              t('careers_ben_2'),
              t('careers_ben_3'),
              t('careers_ben_4'),
              t('careers_ben_5'),
              t('careers_ben_6'),
              t('careers_ben_7'),
              t('careers_ben_8')
            ]?.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 justify-center text-lg font-medium text-[var(--text)]">
                <CheckCircle className="text-[var(--accent)]" size={20} />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}
