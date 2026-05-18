import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Zap, 
  CreditCard, 
  Wallet, 
  Banknote 
} from 'lucide-react';

interface NearbyTabProps {
  nearbyBookings: any[];
  handlePropose: (job: any) => void;
  t: any;
}

export function NearbyTab({
  nearbyBookings,
  handlePropose,
  t
}: NearbyTabProps) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 text-left">
      <h3 className="text-xl font-bold mb-6 text-[var(--text)]">{t('nearby_jobs_radius', 'Nearby Jobs (5km Radius)')}</h3>
      <div className="space-y-4">
        {nearbyBookings.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-8">{t('no_nearby_jobs', 'No nearby jobs found at the moment. Stay online to receive alerts!')}</p>
        ) : (
          nearbyBookings?.map(job => (
            <div key={job.id} className="bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text)]">{job.service_name}</h4>
                  <p className="text-sm text-[var(--text-muted)]">{job.address}</p>
                  <div className="flex items-center gap-4 text-xs text-[var(--success)] mt-1 font-bold">
                    <div className="flex items-center gap-1">
                      <Zap size={12} /> {job.distance.toFixed(1)} {t('km_away', 'km away')}
                    </div>
                    <span className="flex items-center gap-1 capitalize text-[var(--text-muted)] font-normal">
                      {job.payment_method === 'card' ? <CreditCard size={12} /> : 
                       job.payment_method === 'wallet' ? <Wallet size={12} /> : 
                       <Banknote size={12} />}
                      {t(`payment_${job.payment_method || 'cash'}`)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-bold text-[var(--accent)] block">{(Number(job.price) || 0).toFixed(2)} MAD</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{new Date(job.created_at).toLocaleTimeString()}</span>
                </div>
                <button 
                  onClick={() => handlePropose(job)}
                  className="px-6 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95"
                >
                  {t('propose_price', 'Propose Price')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
