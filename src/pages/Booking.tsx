import React from 'react';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';

export default function Booking() {
  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[var(--text)]">
            Your <span className="text-[var(--accent)]">Bookings.</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg">Track and manage your service requests.</p>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
          {['All', 'Upcoming', 'Completed', 'Cancelled']?.map((tab, i) => (
            <button key={i} className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${i === 0 ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {[1, 2, 3]?.map((i) => (
            <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-6 md:p-8 hover:border-[var(--accent)]/20 transition-colors">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--bg)] shrink-0 border border-[var(--border)]"></div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-[var(--text)]">Master Plumber</h3>
                    <p className="text-[var(--text-muted)] text-sm">Pipe Repair & Installation</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${i === 1 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'}`}>
                  {i === 1 ? 'Upcoming' : 'Completed'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[var(--bg)] rounded-2xl p-4 flex items-center gap-3 border border-[var(--border)]">
                  <Calendar size={20} className="text-[var(--accent)]" />
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">Date</p>
                    <p className="font-medium text-sm text-[var(--text)]">Oct 24, 2023</p>
                  </div>
                </div>
                <div className="bg-[var(--bg)] rounded-2xl p-4 flex items-center gap-3 border border-[var(--border)]">
                  <Clock size={20} className="text-[var(--accent)]" />
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">Time</p>
                    <p className="font-medium text-sm text-[var(--text)]">14:00 - 16:00</p>
                  </div>
                </div>
                <div className="bg-[var(--bg)] rounded-2xl p-4 flex items-center gap-3 border border-[var(--border)]">
                  <MapPin size={20} className="text-[var(--accent)]" />
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">Location</p>
                    <p className="font-medium text-sm truncate text-[var(--text)]">Casablanca, Maarif</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-[var(--card-bg)] hover:bg-[var(--bg)] text-[var(--text)] py-4 rounded-2xl font-bold transition-colors text-sm border border-[var(--border)]">
                  View Details
                </button>
                {i === 1 && (
                  <button className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--accent-foreground)] py-4 rounded-2xl font-bold transition-colors text-sm">
                    Reschedule
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
