import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Settings, X, Save, Trash2 } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

export default function CitiesView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCities = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cities', { credentials: 'include'});
      const data = await res.json();
      setCities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [token]);

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/cities', { credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          },
        body: JSON.stringify({ name: newCityName })
      });
      if (res.ok) {
        setShowModal(false);
        setNewCityName('');
        fetchCities();
        onAction?.('City added successfully');
      }
    } catch (error) {
      onAction?.('Failed to add city');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCity = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this city?')) return;
    try {
      const res = await fetch(`/api/admin/cities/${id}`, { credentials: 'include', 
        method: 'DELETE'});
      if (res.ok) {
        fetchCities();
        onAction?.('City deleted successfully');
      }
    } catch (error) {
      onAction?.('Failed to delete city');
    }
  };

  const toggleCityStatus = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/cities/${id}/toggle-active`, { credentials: 'include', 
        method: 'POST'});
      if (res.ok) {
        fetchCities();
      }
    } catch (error) {
      console.error('Failed to toggle city status:', error);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">Cities & Coverage</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">Manage operational cities and service availability zones.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
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
                    <button 
                      onClick={() => toggleCityStatus(city.id)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 transition-all hover:opacity-80 ${
                        city.is_active ? 'text-[#22C55E]' : 'text-[#F59E0B]'
                      }`}
                    >
                      {city.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => onAction?.(`Managing settings for ${city.name}...`)}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                        title="City Settings"
                      >
                        <Settings size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCity(city.id)}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-rose-500/20 text-rose-500 transition-all"
                        title="Delete City"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add City Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Add New City</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                  <X size={20} className="text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleAddCity} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">City Name</label>
                  <input 
                    type="text" 
                    required
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-[#FFD400]/50 outline-none transition-all font-bold"
                    placeholder="e.g. Casablanca"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[#FFD400] text-black font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-[#FFD400]/10"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {submitting ? 'Adding...' : 'Add City'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
