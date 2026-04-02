import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Check, X, Globe, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

interface Language {
  code: string;
  name: string;
  native_name: string;
  is_rtl: boolean;
  is_active: boolean;
}

export const AdminLanguageManager: React.FC = () => {
  const { t } = useTranslation();
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
    try {
      const res = await fetch('/api/admin/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    try {
      await fetch(`/api/admin/languages/${code}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Language Management
          </h2>
          <p className="text-sm text-slate-500">Manage platform languages and directionality.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Language
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Code (e.g. en)</label>
              <input
                type="text"
                value={newLang.code}
                onChange={e => setNewLang({ ...newLang, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
              <input
                type="text"
                value={newLang.name}
                onChange={e => setNewLang({ ...newLang, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Native Name</label>
              <input
                type="text"
                value={newLang.native_name}
                onChange={e => setNewLang({ ...newLang, native_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_rtl"
                checked={newLang.is_rtl}
                onChange={e => setNewLang({ ...newLang, is_rtl: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="is_rtl" className="text-sm font-medium text-slate-700">RTL Layout</label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddLanguage}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Language
            </button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Code</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Name</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Native Name</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Layout</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {languages.map(lang => (
              <tr key={lang.code} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-blue-600">{lang.code}</td>
                <td className="px-6 py-4 text-sm text-slate-900">{lang.name}</td>
                <td className="px-6 py-4 text-sm text-slate-900">{lang.native_name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                    lang.is_rtl ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Layout className="w-3 h-3" />
                    {lang.is_rtl ? 'RTL' : 'LTR'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleLanguageStatus(lang.code, lang.is_active)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                      lang.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {lang.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {lang.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-red-500 hover:text-red-700 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
