import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Plus, Filter, Download, Printer, ChevronDown, Check, X, FileEdit, Trash2, Calendar, User, DollarSign } from 'lucide-react';

interface FactureDevisManagerProps {
  onAction: (msg: string) => void;
}

export default function FactureDevisManager({ onAction }: FactureDevisManagerProps) {
  const [activeTab, setActiveTab] = useState<'devis' | 'factures' | 'clients'>('factures');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-tight text-gray-900 dark:text-white">Documents</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-sans mt-1">Manage your professional invoices, quotations, and clients.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onAction('Create Devis working in progress...')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Devis
          </button>
          <button 
            onClick={() => onAction('Create Facture working in progress...')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Facture
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center border-b border-gray-200 dark:border-gray-800 p-2">
          {[
            { id: 'factures', label: 'Factures' },
            { id: 'devis', label: 'Devis' },
            { id: 'clients', label: 'Clients' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-gray-200 dark:border-gray-800">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No {activeTab} yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Create your first {activeTab === 'clients' ? 'client' : activeTab} to get started.</p>
        </div>
      </div>
    </div>
  );
}
