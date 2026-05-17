import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, 
  HelpCircle, 
  Phone, 
  ChevronRight 
} from 'lucide-react';

interface SupportTabProps {
  onAction: (msg: string) => void;
}

export function SupportTab({ onAction }: SupportTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left">
          <h3 className="text-3xl font-black text-[var(--text)] italic uppercase tracking-tight">{t('support_center', 'Support Center')}</h3>
          <p className="text-[var(--text-muted)] mt-1 font-medium">{t('support_desc', 'Need help? Our team is available 24/7 to assist you.')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <MessageSquare size={28} />, title: t('live_chat', 'Live Chat'), desc: t('live_chat_desc', 'Chat with our support team in real-time.'), color: 'from-blue-500 to-blue-600' },
          { icon: <HelpCircle size={28} />, title: t('faq', 'Help Center'), desc: t('faq_desc', 'Browse through our extensive knowledge base.'), color: 'from-[var(--accent)] to-[var(--accent-muted)]' },
          { icon: <Phone size={28} />, title: t('call_support', 'Call Us'), desc: t('call_support_desc', 'Speak directly with a support agent.'), color: 'from-emerald-500 to-emerald-600' }
        ].map((item, idx) => (
          <div key={idx} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 glass hover:shadow-2xl transition-all group overflow-hidden relative text-left">
            <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-100 transition-opacity rounded-full`} />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--text)]/5 to-[var(--text)]/10 flex items-center justify-center text-[var(--accent)] mb-6 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h4 className="text-xl font-black text-[var(--text)] mb-3 tracking-tight">{item.title}</h4>
            <p className="text-sm text-[var(--text-muted)] font-medium mb-8 leading-relaxed">{item.desc}</p>
            <button 
              onClick={() => onAction?.(`Launching ${item.title}...`)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--accent)] hover:translate-x-2 transition-transform"
            >
              {t('contact_now', 'Explore Now')} <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[var(--text)]/5 border border-[var(--border)] rounded-[48px] p-12 glass overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 text-left">
            <h4 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight mb-4">{t('partner_success', 'Partner Success Guide')}</h4>
            <p className="text-[var(--text-muted)] font-medium mb-10 max-w-lg">{t('partner_desc', 'Download our official handbook to master the platform and maximize your monthly earnings through top-tier service delivery.')}</p>
            <button className="px-10 py-5 bg-[var(--text)] text-[var(--bg)] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-2xl">
              {t('download_guide', 'Download Guide')}
            </button>
          </div>
          <div className="md:w-1/3">
            <img src="/input_file_2.png" alt="Support" className="w-full h-auto object-contain opacity-80" />
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none" />
      </div>
    </div>
  );
}
