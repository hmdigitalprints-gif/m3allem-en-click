import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Check, X, Globe, Layout } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface Language {
  code: string;
  name: string;
  native_name: string;
  is_rtl: boolean;
  is_active: boolean;
}

export const AdminLanguageManager: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newLang, setNewLang] = useState({ code: '', name: '', native_name: '', is_rtl: false });

  const fetchLanguages = () => {
    fetch('/api/languages')
      .then(res => res.json())
      .then(setLanguages)
      .catch(err => console.error('Failed to fetch languages:', err));
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleAddLanguage = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/languages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLang),
      });
      if (res.ok) {
        setIsAdding(false);
        setNewLang({ code: '', name: '', native_name: '', is_rtl: false });
        fetchLanguages();
      }
    } catch (err) {
      console.error('Failed to add language:', err);
    }
  };

  const toggleLanguageStatus = async (code: string, currentStatus: boolean) => {
    if (!token) return;
    try {
      await fetch(`/api/admin/languages/${code}/toggle`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      fetchLanguages();
    } catch (err) {
      console.error('Failed to toggle language:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl tech-header text-[var(--text)] flex items-center gap-2">
            <Globe className="w-6 h-6 text-[var(--accent)]" />
            Language Management
          </h2>
          <p className="tech-label mt-1 opacity-70">Manage platform languages and directionality.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
        >
          <Plus className="w-5 h-5" />
          Add Language
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hynex-card p-8 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block tech-label mb-2 opacity-70">Code (e.g. en)</label>
              <input
                type="text"
                value={newLang.code}
                onChange={e => setNewLang({ ...newLang, code: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all tech-value not-italic"
              />
            </div>
            <div>
              <label className="block tech-label mb-2 opacity-70">Name</label>
              <input
                type="text"
                value={newLang.name}
                onChange={e => setNewLang({ ...newLang, name: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all tech-value not-italic"
              />
            </div>
            <div>
              <label className="block tech-label mb-2 opacity-70">Native Name</label>
              <input
                type="text"
                value={newLang.native_name}
                onChange={e => setNewLang({ ...newLang, native_name: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all tech-value not-italic"
              />
            </div>
            <div className="flex items-center gap-3 pt-8">
              <input
                type="checkbox"
                id="is_rtl"
                checked={newLang.is_rtl}
                onChange={e => setNewLang({ ...newLang, is_rtl: e.target.checked })}
                className="w-5 h-5 accent-[var(--accent)] rounded-lg"
              />
              <label htmlFor="is_rtl" className="text-sm font-bold text-[var(--text)]">RTL Layout</label>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsAdding(false)}
              className="px-6 py-3 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text)] rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAddLanguage}
              className="px-8 py-3 text-sm font-bold bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl hover:opacity-90 transition-all active:scale-95"
            >
              Save Language
            </button>
          </div>
        </motion.div>
      )}

      <div className="hynex-card">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]/50">
                <th className="px-8 py-6 tech-label">Code</th>
                <th className="px-8 py-6 tech-label">Name</th>
                <th className="px-8 py-6 tech-label">Native Name</th>
                <th className="px-8 py-6 tech-label">Layout</th>
                <th className="px-8 py-6 tech-label">Status</th>
                <th className="px-8 py-6 tech-label text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {languages.map(lang => (
                <tr key={lang.code} className="hover:bg-[var(--accent)]/5 transition-all group">
                  <td className="px-8 py-6">
                    <code className="tech-value text-xs text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1.5 rounded-xl not-italic">
                      {lang.code}
                    </code>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-[var(--text)]">{lang.name}</td>
                  <td className="px-8 py-6 text-sm text-[var(--text-muted)]">{lang.native_name}</td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                      lang.is_rtl ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    }`}>
                      <Layout className="w-3 h-3" />
                      {lang.is_rtl ? 'RTL' : 'LTR'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() => toggleLanguageStatus(lang.code, lang.is_active)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                        lang.is_active ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20 hover:bg-[var(--success)]/20' : 'bg-[var(--text-muted)]/10 text-[var(--text-muted)] border border-[var(--text-muted)]/20 hover:bg-[var(--text-muted)]/20'
                      }`}
                    >
                      {lang.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {lang.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-[var(--text-muted)] hover:text-[var(--destructive)] transition-all">
                      <Trash2 className="w-5 h-5" />
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
};
