import React from 'react';
import { Plus } from 'lucide-react';
import { ViewProps } from '../types';

export default function MaterialSellersView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Material Sellers</h1>
          <p className="text-sm text-white/40 mt-1">Manage suppliers, inventory categories, and material pricing across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all">
            Manage Categories
          </button>
          <button className="bg-[#FFD700] text-black px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#E6C200] transition-all">
            <Plus size={18} /> Add Seller
          </button>
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold">Top Material Suppliers</h3>
          <button className="text-xs text-[#FFD700] hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-white/20 border-b border-white/5">
              <tr>
                <th className="px-8 py-4 font-medium">Supplier</th>
                <th className="px-8 py-4 font-medium">Category</th>
                <th className="px-8 py-4 font-medium">Products</th>
                <th className="px-8 py-4 font-medium">Rating</th>
                <th className="px-8 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: 'Global Steel Co.', cat: 'Construction', products: 142, rating: 4.8, status: 'Active' },
                { name: 'Eco Wood Supplies', cat: 'Carpentry', products: 89, rating: 4.9, status: 'Active' },
                { name: 'Premium Cement Ltd.', cat: 'Masonry', products: 24, rating: 4.5, status: 'Active' },
                { name: 'Modern Glass Works', cat: 'Finishing', products: 56, rating: 4.7, status: 'Active' },
              ].map((seller, i) => (
                <tr key={i} className="hover:bg-white/5 transition-all">
                  <td className="px-8 py-5 font-bold">{seller.name}</td>
                  <td className="px-8 py-5 text-white/60">{seller.cat}</td>
                  <td className="px-8 py-5">{seller.products}</td>
                  <td className="px-8 py-5 text-[#FFD700]">★ {seller.rating}</td>
                  <td className="px-8 py-5 text-right">
                    <span className="px-2 py-1 rounded-md bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold uppercase">
                      {seller.status}
                    </span>
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
