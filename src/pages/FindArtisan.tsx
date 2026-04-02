import React from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import Layout from '../components/layout/Layout';

export default function FindArtisan() {
  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[var(--text)]">
            Find <span className="text-[var(--accent)]">Artisan.</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg">Discover the perfect professional for your project.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/30" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, skill or location..." 
              className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl py-5 pl-16 pr-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-lg text-[var(--text)]"
            />
          </div>
          <button className="bg-[var(--card-bg)] border border-[var(--border)] px-8 py-5 rounded-3xl flex items-center justify-center gap-3 hover:bg-[var(--bg)] transition-colors text-[var(--text)]">
            <Filter size={20} className="text-[var(--accent)]" />
            <span className="font-bold">Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6]?.map((i) => (
            <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl overflow-hidden hover:border-[var(--accent)]/30 transition-colors group">
              <div className="h-48 bg-[var(--bg)] relative">
                <div className="absolute top-4 right-4 bg-[var(--bg)]/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[var(--accent)] flex items-center gap-1 border border-[var(--border)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span> Available
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-[var(--text)]">Artisan Name</h3>
                    <p className="text-[var(--accent)] text-sm font-medium">Master Plumber</p>
                  </div>
                  <div className="bg-[var(--bg)] px-3 py-1 rounded-full text-xs font-bold text-[var(--text)] border border-[var(--border)]">
                    4.9 ★
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm mb-6">
                  <MapPin size={14} /> Casablanca, Morocco
                </div>
                <button className="w-full bg-[var(--bg)] hover:bg-[var(--bg)]/80 text-[var(--text)] py-3 rounded-2xl font-bold transition-colors border border-[var(--border)]">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
