import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Save, Trash2, Globe, Filter, Loader2, 
  CheckCircle, AlertCircle, Languages, ChevronRight, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

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
  const { token } = useAuth();
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
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [transRes, langRes] = await Promise.all([
        fetch('/api/admin/translations', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
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
    if (!token) return;
    try {
      const res = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/translations/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
          <h2 className="text-2xl tech-header text-[var(--text)] flex items-center gap-2">
            <Languages className="text-[var(--accent)]" />
            Translation Management
          </h2>
          <p className="tech-label mt-1 opacity-70">Manage all UI text and content translations</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
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
      <div className="hynex-card p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input
            type="text"
            placeholder="Search keys or values..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all tech-value not-italic"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 appearance-none transition-all tech-label"
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
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl tech-header text-[var(--text)] mb-8">Add New Translation</h3>
              <form onSubmit={handleAdd} className="space-y-6">
                <div>
                  <label className="block tech-label mb-2 opacity-70">Translation Key</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. common.welcome"
                    value={newTranslation.key}
                    onChange={(e) => setNewTranslation({ ...newTranslation, key: e.target.value })}
                    className="w-full px-5 py-4 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all tech-value not-italic"
                  />
                </div>
                <div>
                  <label className="block tech-label mb-2 opacity-70">Language</label>
                  <select
                    value={newTranslation.language_code}
                    onChange={(e) => setNewTranslation({ ...newTranslation, language_code: e.target.value })}
                    className="w-full px-5 py-4 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all tech-label"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block tech-label mb-2 opacity-70">Value</label>
                  <textarea
                    required
                    rows={3}
                    value={newTranslation.value}
                    onChange={(e) => setNewTranslation({ ...newTranslation, value: e.target.value })}
                    className="w-full px-5 py-4 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all tech-value not-italic"
                  />
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-bold hover:bg-[var(--card-bg)] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold hover:opacity-90 transition-all active:scale-95"
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
      <div className="hynex-card">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]/50">
                <th className="px-8 py-6 tech-label">Key</th>
                <th className="px-8 py-6 tech-label">Language</th>
                <th className="px-8 py-6 tech-label">Value</th>
                <th className="px-8 py-6 tech-label text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-[var(--accent)] mx-auto mb-4" size={32} />
                    <span className="tech-label opacity-50">Loading translations...</span>
                  </td>
                </tr>
              ) : filteredTranslations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center tech-label opacity-50">
                    No translations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTranslations.map((t) => (
                  <tr key={t.id} className="hover:bg-[var(--accent)]/5 transition-all group">
                    <td className="px-8 py-6">
                      <code className="tech-value text-xs text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1.5 rounded-xl not-italic">
                        {t.key}
                      </code>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className="tech-value text-[10px] text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] px-2 py-1 rounded-lg not-italic">
                          {t.language_code}
                        </span>
                        <span className="text-sm font-bold text-[var(--text)]">
                          {languages.find(l => l.code === t.language_code)?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {editingId === t.id ? (
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 tech-value not-italic"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdate(t.id)}
                            className="p-2 bg-[var(--success)]/10 text-[var(--success)] rounded-xl hover:bg-[var(--success)]/20 transition-all"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 bg-[var(--bg)] text-[var(--text-muted)] rounded-xl hover:bg-[var(--border)] transition-all"
                          >
                            <Plus className="rotate-45" size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group/val">
                          <span className="text-sm text-[var(--text)] opacity-80 line-clamp-2">{t.value}</span>
                          <button
                            onClick={() => {
                              setEditingId(t.id);
                              setEditValue(t.value);
                            }}
                            className="opacity-0 group-hover/val:opacity-100 p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this translation?')) {
                            await fetch(`/api/admin/translations/${t.id}`, { 
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            fetchData();
                          }
                        }}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--destructive)] transition-all"
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
