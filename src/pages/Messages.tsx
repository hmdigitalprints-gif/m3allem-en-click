import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Search } from 'lucide-react';
import Layout from '../components/layout/Layout';

export default function Messages() {
  const { t } = useTranslation();
  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-7xl mx-auto h-[calc(100vh-160px)] flex flex-col">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[var(--text)]">
            {t('messages_title_1', 'Your ')} <span className="text-[var(--accent)]">{t('messages_title_2', 'Messages.')}</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg">{t('messages_subtitle', 'Communicate directly with your artisans.')}</p>
        </div>

        <div className="flex-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-2xl">
          <div className="w-full md:w-1/3 border-r border-[var(--border)] flex flex-col">
            <div className="p-6 border-b border-[var(--border)]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/30" size={18} />
                <input 
                  type="text" 
                  placeholder="{t('messages_placeholder_search', 'Search conversations...')}" 
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm text-[var(--text)]"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
              {[1, 2, 3]?.map((i) => (
                <div key={i} className={`p-4 rounded-2xl cursor-pointer transition-colors flex items-center gap-4 ${i === 1 ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/20' : 'hover:bg-[var(--bg)]'}`}>
                  <div className="w-12 h-12 rounded-full bg-[var(--bg)] relative shrink-0 border border-[var(--border)]">
                    {i === 1 && <div className="absolute top-0 right-0 w-3 h-3 bg-[var(--accent)] rounded-full border-2 border-[var(--bg)]"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold truncate text-[var(--text)]">{t('messages_artisan_name', 'Artisan Name')} {i}</h4>
                      <span className="text-[10px] text-[var(--text-muted)] shrink-0">10:42 AM</span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] truncate">{t('messages_sample_msg', 'Hello, I will arrive in 30 minutes.')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-[var(--text-muted)] p-8">
            <MessageSquare size={64} className="mb-6 opacity-20" />
            <h3 className="text-2xl font-bold mb-2 text-[var(--text)]/60">{t('messages_select_title', 'Select a conversation')}</h3>
            <p className="text-center max-w-sm">{t('messages_select_desc', 'Choose a message from the list to view the conversation details.')}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
