import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { ViewProps } from '../types';

export default function FraudMonitoringView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fraud Monitoring</h1>
          <p className="text-sm text-white/40 mt-1">AI-powered fraud detection and risk assessment for all platform activities.</p>
        </div>
        <button className="bg-rose-500 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-rose-600 transition-all">
          <ShieldAlert size={18} /> High Risk Alerts
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="hynex-card p-6 border-l-4 border-rose-500">
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Critical Alerts</p>
          <p className="text-3xl font-bold text-rose-500">12</p>
          <p className="text-[10px] text-white/20 mt-2">Requires immediate action</p>
        </div>
        <div className="hynex-card p-6 border-l-4 border-[#F59E0B]">
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Suspicious Users</p>
          <p className="text-3xl font-bold text-[#F59E0B]">48</p>
          <p className="text-[10px] text-white/20 mt-2">Under manual review</p>
        </div>
        <div className="hynex-card p-6 border-l-4 border-[#FFD700]">
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Risk Score Avg</p>
          <p className="text-3xl font-bold text-[#FFD700]">14%</p>
          <p className="text-[10px] text-white/20 mt-2">Platform-wide average</p>
        </div>
        <div className="hynex-card p-6 border-l-4 border-[#10B981]">
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Verified Safe</p>
          <p className="text-3xl font-bold text-[#10B981]">98.2%</p>
          <p className="text-[10px] text-white/20 mt-2">Transactions verified</p>
        </div>
      </div>

      <div className="hynex-card p-12 text-center">
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={40} className="text-rose-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">AI Risk Engine</h3>
        <p className="text-white/40 max-w-md mx-auto mb-8">The Hynex AI Risk Engine is continuously monitoring transactions. Detailed logs and risk assessment tools are being updated.</p>
        <button className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold">
          Open Risk Dashboard
        </button>
      </div>
    </div>
  );
}
