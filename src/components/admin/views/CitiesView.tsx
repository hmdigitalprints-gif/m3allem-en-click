import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Settings, X, Save, Trash2, MapPin } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

export default function CitiesView({ onAction }: ViewProps) {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cities', { 
        credentials: 'include'
      });
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
  }, []);

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/cities', { 
        credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
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
    if (!confirm('Are you sure you want to delete this city?')) return;
    try {
      const res = await fetch(`/api/admin/cities/${id}`, { 
        credentials: 'include', 
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCities();
        onAction?.('City deleted successfully');
      }
    } catch (error) {
      onAction?.('Failed to delete city');
    }
  };

  const toggleCityStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/cities/${id}/toggle-active`, { 
        credentials: 'include', 
        method: 'POST'
      });
      if (res.ok) {
        fetchCities();
      }
    } catch (error) {
      console.error('Failed to toggle city status:', error);
    }
  };

  return (
    <div className="space-y-8 pb-20 pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Cities & Coverage</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Manage operational cities and service availability zones.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#FFD700] text-black px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#E6C200] transition-colors active:scale-95 shadow-lg shadow-[#FFD700]/10"
        >
          <Plus size={18} strokeWidth={3} /> Add City
        </button>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/[0.01]">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">City Name</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Active Artisans</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Active Orders</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Status</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
                      <p className="text-sm font-bold text-[var(--text-muted)] tracking-wider uppercase">Loading cities...</p>
                    </div>
                  </td>
                </tr>
              ) : cities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No cities found.
                  </td>
                </tr>
              ) : cities.map((city) => (
                <tr key={city.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[#FFD700] flex items-center justify-center shrink-0 group-hover:border-[#FFD700]/30 transition-colors">
                        <MapPin size={20} strokeWidth={2} />
                      </div>
                      <p className="text-sm font-bold text-[var(--text)] uppercase tracking-tight">{city.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-bold text-[var(--text)] tracking-wider bg-[var(--border)] px-2.5 py-1 rounded-lg">
                      {Math.floor(Math.random() * 500)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-bold text-[var(--text)] tracking-wider bg-[var(--border)] px-2.5 py-1 rounded-lg">
                      {Math.floor(Math.random() * 2000)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border border-[var(--border)] ${
                      city.is_active ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      {city.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleCityStatus(city.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-transparent shadow-sm ${city.is_active ? 'hover:bg-orange-500/10 text-orange-500' : 'hover:bg-emerald-500/10 text-emerald-500'}`}
                      >
                        {city.is_active ? 'Pause' : 'Activate'}
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteCity(city.id)}
                        className="p-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors border border-transparent"
                        title="Delete City"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00]" />
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">Add New City</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--border)] rounded-xl transition-colors">
                  <X size={20} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors" />
                </button>
              </div>

              <form onSubmit={handleAddCity} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">City Name</label>
                  <input 
                    type="text" 
                    required
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="e.g. Casablanca"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text-muted)] font-black uppercase tracking-wider hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-lg bg-[#FFD700] text-black font-black uppercase tracking-wider hover:bg-[#E6C200] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#FFD700]/10 text-sm"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />}
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
