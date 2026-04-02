import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Save, Trash2, Globe, Filter, Loader2, 
  CheckCircle, AlertCircle, Languages, ChevronRight, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Translation {
  id: string;
  key: string;
  language_code: string;
  value: string;
}

interface Language {
  code: string;
  name: string;
  native_name: string;
}

export function AdminTranslationManager() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTranslation, setNewTranslation] = useState({ key: '', language_code: 'en', value: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, langRes] = await Promise.all([
        fetch('/api/admin/translations'),
        fetch('/api/languages')
      ]);
      
      if (transRes.ok && langRes.ok) {
        setTranslations(await transRes.json());
        setLanguages(await langRes.json());
      }
    } catch (error) {
      console.error('Error fetching translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTranslation)
      });
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Translation added successfully' });
        setIsAdding(false);
        setNewTranslation({ key: '', language_code: 'en', value: '' });
        fetchData();
      } else {
        const err = await res.json();
        setStatus({ type: 'error', message: err.error || 'Failed to add translation' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred' });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/translations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: editValue })
      });
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Translation updated' });
        setEditingId(null);
        fetchData();
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to update' });
    }
  };

  const filteredTranslations = translations.filter(t => {
    const matchesSearch = t.key.toLowerCase().includes(search.toLowerCase()) || 
                         t.value.toLowerCase().includes(search.toLowerCase());
    const matchesLang = selectedLang === 'all' || t.language_code === selectedLang;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Languages className="text-blue-400" />
            Translation Management
          </h2>
          <p className="text-white/60">Manage all UI text and content translations</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add Translation
        </button>
      </div>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-3 ${
            status.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {status.message}
        </motion.div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            placeholder="Search keys or values..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none"
          >
            <option value="all">All Languages</option>
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">Add New Translation</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Translation Key</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. common.welcome"
                    value={newTranslation.key}
                    onChange={(e) => setNewTranslation({ ...newTranslation, key: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Language</label>
                  <select
                    value={newTranslation.language_code}
                    onChange={(e) => setNewTranslation({ ...newTranslation, language_code: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Value</label>
                  <textarea
                    required
                    rows={3}
                    value={newTranslation.value}
                    onChange={(e) => setNewTranslation({ ...newTranslation, value: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Save Translation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Translations List */}
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-bottom border-white/10 bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold text-white/60">Key</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/60">Language</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/60">Value</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
                    <span className="text-white/40">Loading translations...</span>
                  </td>
                </tr>
              ) : filteredTranslations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/40">
                    No translations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTranslations.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                        {t.key}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white/40 uppercase bg-white/10 px-1.5 py-0.5 rounded">
                          {t.language_code}
                        </span>
                        <span className="text-sm text-white">
                          {languages.find(l => l.code === t.language_code)?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === t.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-3 py-1 bg-white/10 border border-white/20 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdate(t.id)}
                            className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-white/10 text-white/40 rounded hover:bg-white/20 transition-colors"
                          >
                            <Plus className="rotate-45" size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group/val">
                          <span className="text-sm text-white/80 line-clamp-2">{t.value}</span>
                          <button
                            onClick={() => {
                              setEditingId(t.id);
                              setEditValue(t.value);
                            }}
                            className="opacity-0 group-hover/val:opacity-100 p-1 text-white/40 hover:text-white transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this translation?')) {
                            await fetch(`/api/admin/translations/${t.id}`, { method: 'DELETE' });
                            fetchData();
                          }
                        }}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
