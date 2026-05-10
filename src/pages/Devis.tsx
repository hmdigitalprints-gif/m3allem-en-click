import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Eye, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

export default function Devis() {
  const { t } = useTranslation();
  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-7xl mx-auto bg-[var(--bg)] text-[var(--text)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[var(--text)]">
              {t('devis_title_1', 'Your ')} <span className="text-[var(--accent)]">{t('devis_title_2', 'Estimates.')}</span>
            </h1>
            <p className="text-[var(--text-muted)] text-lg">{t('devis_desc', 'Manage and review your project quotes.')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/auto-devis"
              className="bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] px-8 py-4 rounded-full font-bold hover:bg-[var(--bg)] transition-colors flex items-center gap-3"
            >
              <Sparkles size={20} className="text-[var(--accent)]" /> {t('devis_btn_ai', 'AI Automatic Quote')}
            </Link>
            <button className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-full font-bold hover:opacity-90 transition-colors flex items-center gap-3 shadow-xl shadow-[var(--accent)]/20">
              <Plus size={20} /> {t('devis_btn_new', 'Request New Estimate')}
            </button>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase tracking-widest">
                  <th className="p-6 font-bold">{t('devis_tbl_id', 'ID')}</th>
                  <th className="p-6 font-bold">{t('devis_tbl_project', 'Project')}</th>
                  <th className="p-6 font-bold">{t('devis_tbl_artisan', 'Artisan')}</th>
                  <th className="p-6 font-bold">{t('devis_tbl_date', 'Date')}</th>
                  <th className="p-6 font-bold">{t('devis_tbl_amount', 'Amount')}</th>
                  <th className="p-6 font-bold">{t('devis_tbl_status', 'Status')}</th>
                  <th className="p-6 font-bold text-right">{t('devis_tbl_actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {[1, 2, 3, 4]?.map((i) => (
                  <tr key={i} className="hover:bg-[var(--bg)] transition-colors group">
                    <td className="p-6 font-mono text-sm text-[var(--text-muted)]">#EST-{1000 + i}</td>
                    <td className="p-6 font-bold text-[var(--text)]">{t('devis_sample_proj', 'Complete Bathroom Renovation')}</td>
                    <td className="p-6 text-[var(--text)]/80">{t('devis_sample_artisan', 'Master Plumber')}</td>
                    <td className="p-6 text-[var(--text-muted)] text-sm">Oct 24, 2023</td>
                    <td className="p-6 font-bold text-[var(--accent)]">15,000 MAD</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${i === 1 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'}`}>
                        {i === 1 ? t('devis_status_pending', 'Pending') : t('devis_status_accepted', 'Accepted')}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-[var(--bg)] hover:bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-[var(--text)] transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 bg-[var(--bg)] hover:bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-[var(--text)] transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
