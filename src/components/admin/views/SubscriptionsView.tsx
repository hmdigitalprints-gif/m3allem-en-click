import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { ViewProps } from '../types';

export default function SubscriptionsView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/subscriptions', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setPlans(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching subscriptions:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
          <p className={`text-sm ${textMutedClasses} mt-1`}>Manage premium plans for artisans and companies.</p>
        </div>
        <button 
          onClick={() => onAction?.('Create Plan functionality coming soon!')}
          className="bg-[#FFD700] text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#E6C200] transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
        >
          <Plus size={16} /> Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="col-span-3 text-center py-12">No plans found.</div>
        ) : Array.isArray(plans) ? plans.map((plan, i) => (
          <div key={plan.id} className={`p-6 rounded-3xl ${cardClasses} relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-24 h-24 ${i % 3 === 0 ? 'bg-gray-500' : i % 3 === 1 ? 'bg-[#FFD700]' : 'bg-purple-500'}/10 rounded-bl-full -mr-8 -mt-8`} />
            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
            <p className="text-2xl font-black text-[#FFD700] mb-4">MAD {plan.price}/{plan.duration_days === 30 ? 'mo' : plan.duration_days + 'd'}</p>
            <div className="flex items-center gap-2 text-sm opacity-60">
              <Users size={14} />
              <span>{Math.floor(Math.random() * 1000)} Active Users</span>
            </div>
            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => onAction?.(`Editing ${plan.name} plan...`)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'} transition-all active:scale-95`}
              >
                Edit Plan
              </button>
              <button 
                onClick={() => onAction?.(`Viewing users for ${plan.name} plan...`)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'} transition-all active:scale-95`}
              >
                View Users
              </button>
            </div>
          </div>
        )) : null}
      </div>
    </div>
  );
}
