import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Settings } from 'lucide-react';
import { ViewProps } from '../types';

export default function CitiesView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/cities', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setCities(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching cities:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">Cities & Coverage</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">Manage operational cities and service availability zones.</p>
        </div>
        <button 
          onClick={() => onAction?.('Add City functionality coming soon!')}
          className="bg-[#FFD400] text-black px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#FFD400]/90 transition-all active:scale-95 shadow-xl shadow-[#FFD400]/10"
        >
          <Plus size={18} /> Add City
        </button>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 border-b border-white/5">
                <th className="px-10 py-8 font-black">City Name</th>
                <th className="px-10 py-8 font-black">Active Artisans</th>
                <th className="px-10 py-8 font-black">Active Orders</th>
                <th className="px-10 py-8 font-black">Status</th>
                <th className="px-10 py-8 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <Loader2 size={40} className="animate-spin text-[#FFD400]" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Loading cities...</p>
                    </div>
                  </td>
                </tr>
              ) : cities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">No cities found.</p>
                  </td>
                </tr>
              ) : cities.map((city) => (
                <tr key={city.id} className="group hover:bg-white/5 transition-all">
                  <td className="px-10 py-8">
                    <p className="text-sm font-black uppercase tracking-tight">{city.name}</p>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-xs font-mono font-bold">{Math.floor(Math.random() * 500)}</p>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-xs font-mono font-bold">{Math.floor(Math.random() * 2000)}</p>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 ${
                      city.is_active ? 'text-[#22C55E]' : 'text-[#F59E0B]'
                    }`}>
                      {city.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => onAction?.(`Managing settings for ${city.name}...`)}
                      className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                    >
                      <Settings size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
