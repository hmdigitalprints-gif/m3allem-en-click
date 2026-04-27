import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Filter, Search, ChevronRight, ShoppingCart, ArrowRight, Package, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Layout from '../components/layout/Layout';

const products = [
  { id: 1, name: "Professional Tool Kit", category: "Tools", price: 1200, rating: 4.9, reviews: 45, image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=400" },
  { id: 2, name: "Premium Interior Paint", category: "Materials", price: 350, rating: 4.8, reviews: 120, image: "https://images.unsplash.com/photo-1589939705384-5185138a047a?auto=format&fit=crop&q=80&w=400" },
  { id: 3, name: "Smart Leak Detector", category: "Smart Home", price: 850, rating: 4.7, reviews: 28, image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=400" },
  { id: 4, name: "Heavy Duty Drill", category: "Tools", price: 1500, rating: 4.9, reviews: 89, image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400" },
  { id: 5, name: "Industrial AC Filter", category: "Materials", price: 120, rating: 4.5, reviews: 156, image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=400" },
  { id: 6, name: "Safety Gear Set", category: "Tools", price: 450, rating: 4.8, reviews: 34, image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400" },
];


export default function Store() {
  const { t } = useTranslation();
  const categories = [t('store_cat_all', 'All'), t('store_cat_tools', 'Tools'), t('store_cat_materials', 'Materials'), t('store_cat_smarthome', 'Smart Home'), t('store_cat_safety', 'Safety Gear')];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredProducts = products.filter(product => 
    selectedCategory === "All" || product.category === selectedCategory
  );

  return (
    <Layout>
      <div className="flex-1 bg-[var(--bg)] min-h-screen relative">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[var(--card-bg)] border border-[var(--border)] px-6 py-4 rounded-2xl shadow-2xl"
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="text-[var(--success)]" size={24} />
              ) : (
                <div className="w-2 h-2 rounded-full bg-blue-400" />
              )}
              <span className="font-medium text-[var(--text)]">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Store Hero */}
        <section className="relative h-[50vh] flex items-center px-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/60 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1530124560676-587cad321376?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-40"
            alt="Store background"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-20 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Package size={14} />
            Official M3allem En Click Supplies
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl font-display font-bold tracking-tighter leading-[0.85] mb-8 text-[var(--text)]"
          >
            {t('store_title_1', 'EQUIP YOUR')} <br />
            <span className="text-[var(--accent)]">{t('store_title_2', 'CRAFT.')}</span>
          </motion.h1>
          <p className="text-[var(--text-muted)] text-xl max-w-xl mb-8">{t('store_desc', 'Get the best tools and materials used by our top-rated artisans, delivered to your doorstep.')}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Store Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto no-scrollbar">
            {categories?.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                  selectedCategory === cat 
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]' 
                    : 'bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)]/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/30" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProducts?.map((product) => (
            <motion.div 
              key={product.id}
              whileHover={{ y: -10 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] overflow-hidden group hover:border-[var(--accent)]/30 transition-all"
            >
              <div className="h-72 relative overflow-hidden">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} referrerPolicy="no-referrer" />
                <div className="absolute top-6 right-6 bg-[var(--bg)]/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-[var(--accent)] text-sm font-bold">
                  <Star size={16} fill="currentColor" />
                  {product.rating}
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--text)]">{product.name}</h3>
                    <p className="text-[var(--text-muted)] text-sm font-medium">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--accent)] font-bold text-2xl">{product.price} MAD</p>
                    <p className="text-[10px] text-[var(--text-muted)]/30 uppercase tracking-widest font-bold">Free Shipping</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={() => showToast('Added to cart!')} className="flex-1 bg-[var(--text)]/10 text-[var(--text)] py-4 rounded-2xl font-bold text-sm hover:bg-[var(--text)]/20 transition-colors flex items-center justify-center gap-2">
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                  <button onClick={() => showToast('Proceeding to checkout...', 'info')} className="flex-1 bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold text-sm hover:bg-[var(--accent)]/90 transition-colors">
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Store Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-8 flex flex-col items-center text-center">
            <div className="p-4 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] mb-6">
              <Truck size={32} />
            </div>
            <h4 className="text-xl font-bold mb-2 text-[var(--text)]">Fast Delivery</h4>
            <p className="text-[var(--text-muted)] text-sm">Same day delivery for Casablanca and Rabat. 48h for other cities.</p>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-8 flex flex-col items-center text-center">
            <div className="p-4 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] mb-6">
              <ShieldCheck size={32} />
            </div>
            <h4 className="text-xl font-bold mb-2 text-[var(--text)]">Quality Guaranteed</h4>
            <p className="text-[var(--text-muted)] text-sm">All products are tested and approved by our master artisans.</p>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-8 flex flex-col items-center text-center">
            <div className="p-4 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] mb-6">
              <ArrowRight size={32} />
            </div>
            <h4 className="text-xl font-bold mb-2 text-[var(--text)]">Easy Returns</h4>
            <p className="text-[var(--text-muted)] text-sm">Not satisfied? Return your items within 14 days for a full refund.</p>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
}
